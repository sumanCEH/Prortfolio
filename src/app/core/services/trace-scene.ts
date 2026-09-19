/**
 * Hero "live request trace": a Canvas 2D animation of one API request travelling through
 * a Java microservice stack (Client → Gateway → Auth → Orders → Kafka → Postgres) and the
 * 201 response coming back, over a dot-grid "fabric" that lights up around the pointer,
 * the request packet and every service it touches.
 *
 * Plain Canvas 2D on purpose: it is a few KB, starts on the first frame, and needs no WebGL.
 */

export type StepListener = (step: number) => void;

interface Def {
  label: string;
  sub: string;
  color: string;
  /** Position as a fraction of the graph area on wide / narrow layouts. */
  wide: [number, number];
  narrow: [number, number];
}

const CHAIN: Def[] = [
  { label: 'Client', sub: 'browser', color: '#22d3ee', wide: [0.0, 0.8], narrow: [0.0, 0.0] },
  { label: 'API Gateway', sub: 'Spring Cloud', color: '#5b8cff', wide: [0.22, 0.42], narrow: [1, 0.0] },
  { label: 'Auth', sub: 'JWT · RBAC', color: '#9b7bff', wide: [0.42, 0.86], narrow: [1, 0.5] },
  { label: 'Orders', sub: 'Spring Boot', color: '#2dd4bf', wide: [0.62, 0.36], narrow: [0.0, 0.5] },
  { label: 'Kafka', sub: 'order.created', color: '#ffb454', wide: [0.8, 0.8], narrow: [0.0, 1.0] },
  { label: 'PostgreSQL', sub: 'commit', color: '#7aa2ff', wide: [1.0, 0.2], narrow: [1, 1.0] },
];

/** Decorative services: dim links with an occasional heartbeat, wide layout only. */
const SATELLITES: (Def & { to: number })[] = [
  { label: 'Redis', sub: 'cache', color: '#ff6b6b', wide: [0.5, 0.06], narrow: [0, 0], to: 3 },
  { label: 'Metrics', sub: 'Prometheus', color: '#9aa0b4', wide: [0.06, 0.12], narrow: [0, 0], to: 1 },
  { label: 'Notify', sub: 'email · sms', color: '#9aa0b4', wide: [1.0, 0.52], narrow: [0, 0], to: 4 },
];

interface Node {
  def: Def;
  x: number;
  y: number;
  w: number;
  h: number;
  lit: number; // stays 1 once the request has reached it, until the next request
  flash: number; // 1 at arrival, decays quickly
}

interface Edge {
  a: Node;
  b: Node;
  cx: number;
  cy: number;
  lit: number;
  satellite: boolean;
}

interface Ripple {
  x: number;
  y: number;
  age: number;
}

interface Beat {
  edge: number;
  t: number;
  dir: 1 | -1;
}

const REQ_SECONDS = 0.8;
const HOLD_SECONDS = 0.18;
const RES_SECONDS = 0.26;
const REST_SECONDS = 1.6;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export class TraceScene {
  private readonly ctx: CanvasRenderingContext2D;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private narrow = false;

  private nodes: Node[] = [];
  private edges: Edge[] = []; // 0..4 = the request chain, the rest are satellite links
  private ripples: Ripple[] = [];
  private beats: Beat[] = [];
  private beatTimer = 1;

  private phase: 'wait' | 'req' | 'res' = 'wait';
  private phaseT = -0.6;
  private edgeIdx = 0;
  private success = 0;

  private pointer: { x: number; y: number } | null = null;
  private raf = 0;
  private last = 0;
  private running = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onStep: StepListener,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available');
    this.ctx = ctx;
  }

  // ---------- lifecycle ----------

  resize(width: number, height: number): void {
    if (width < 2 || height < 2) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = width;
    this.h = height;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.layout();
    if (!this.running) this.renderStatic();
  }

  /** Recompute node sizes, e.g. once the web fonts have loaded and text metrics change. */
  relayout(): void {
    if (!this.w) return;
    this.layout();
    if (!this.running) this.renderStatic();
  }

  setPointer(x: number | null, y = 0): void {
    this.pointer = x === null ? null : { x, y };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.raf = requestAnimationFrame(this.frame);
  }

  pause(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** One finished frame with everything lit: used for reduced motion and while paused. */
  renderStatic(): void {
    for (const n of this.nodes) n.lit = 0.7;
    for (const e of this.edges) e.lit = e.satellite ? 0 : 0.6;
    this.success = 0;
    this.draw(null);
  }

  dispose(): void {
    this.pause();
    this.nodes = [];
    this.edges = [];
  }

  // ---------- layout ----------

  private layout(): void {
    const { ctx, w, h } = this;
    this.narrow = w < 820 || w / h < 1.05;
    const narrow = this.narrow;

    const fs = narrow ? 11 : 13;
    const fsSub = narrow ? 9.5 : 10.5;
    const chipH = narrow ? 38 : 46;
    const pad = 12;

    const defs: (Def & { to?: number })[] = narrow ? CHAIN : [...CHAIN, ...SATELLITES];
    const nodes: Node[] = defs.map((def) => {
      ctx.font = `600 ${fs}px "JetBrains Mono", ui-monospace, monospace`;
      const a = ctx.measureText(def.label).width;
      ctx.font = `400 ${fsSub}px "JetBrains Mono", ui-monospace, monospace`;
      const b = ctx.measureText(def.sub).width;
      return { def, x: 0, y: 0, w: Math.ceil(Math.max(a, b) + pad * 2 + 12), h: chipH, lit: 0, flash: 0 };
    });

    const halfW = Math.max(...nodes.map((n) => n.w)) / 2;
    const box = narrow
      ? { x0: w * 0.04, x1: w * 0.96, y0: h * 0.06, y1: h * 0.94 }
      : { x0: w * (w >= 1300 ? 0.5 : 0.55), x1: w * 0.97, y0: h * 0.1, y1: h >= 640 && w >= 900 ? h - 300 : h * 0.9 };
    const xL = box.x0 + halfW;
    const xR = box.x1 - halfW;
    const yT = box.y0 + chipH / 2;
    const yB = box.y1 - chipH / 2;

    nodes.forEach((n) => {
      const [u, v] = narrow ? n.def.narrow : n.def.wide;
      n.x = xL + u * (xR - xL);
      n.y = yT + v * (yB - yT);
    });

    const edges: Edge[] = [];
    const link = (a: Node, b: Node, i: number, satellite: boolean) => {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const bend = (i % 2 === 0 ? 1 : -1) * len * (satellite ? 0.1 : 0.16);
      edges.push({ a, b, cx: mx - (dy / len) * bend, cy: my + (dx / len) * bend, lit: 0, satellite });
    };
    for (let i = 0; i < CHAIN.length - 1; i++) link(nodes[i], nodes[i + 1], i, false);
    if (!narrow) SATELLITES.forEach((s, i) => link(nodes[CHAIN.length + i], nodes[s.to], i + 1, true));

    this.nodes = nodes;
    this.edges = edges;
    this.ripples = [];
    this.beats = [];
  }

  // ---------- simulation ----------

  private readonly frame = (now: number): void => {
    if (!this.running) return;
    const dt = this.last ? Math.min((now - this.last) / 1000, 0.05) : 0.016;
    this.last = now;
    this.update(dt);
    this.draw(this.packet());
    this.raf = requestAnimationFrame(this.frame);
  };

  private update(dt: number): void {
    this.phaseT += dt;

    if (this.phase === 'wait' && this.phaseT >= 0) {
      for (const n of this.nodes) n.lit = 0;
      for (const e of this.edges) e.lit = 0;
      this.success = 0;
      this.phase = 'req';
      this.edgeIdx = 0;
      this.phaseT = 0;
      this.nodes[0].lit = 1;
      this.nodes[0].flash = 1;
      this.onStep(0);
    } else if (this.phase === 'req' && this.phaseT >= REQ_SECONDS + HOLD_SECONDS) {
      const arrived = this.nodes[this.edgeIdx + 1];
      arrived.lit = 1;
      arrived.flash = 1;
      this.edges[this.edgeIdx].lit = 1;
      this.ripples.push({ x: arrived.x, y: arrived.y, age: 0 });
      this.onStep(this.edgeIdx + 1);
      this.phaseT = 0;
      if (this.edgeIdx + 1 >= CHAIN.length - 1) {
        this.phase = 'res';
        this.edgeIdx = CHAIN.length - 2;
        this.onStep(CHAIN.length); // "201 Created" line
      } else {
        this.edgeIdx++;
      }
    } else if (this.phase === 'res') {
      this.success = Math.min(1, this.success + dt * 4);
      if (this.phaseT >= RES_SECONDS) {
        this.phaseT = 0;
        if (this.edgeIdx === 0) {
          this.phase = 'wait';
          this.phaseT = -REST_SECONDS;
        } else this.edgeIdx--;
      }
    }

    for (const n of this.nodes) n.flash = Math.max(0, n.flash - dt * 1.6);
    for (const r of this.ripples) r.age += dt;
    this.ripples = this.ripples.filter((r) => r.age < 1.1);

    // Heartbeats along the decorative links keep the graph alive between requests.
    const sat = this.edges.length - (CHAIN.length - 1);
    if (sat > 0) {
      this.beatTimer -= dt;
      if (this.beatTimer <= 0) {
        this.beatTimer = 0.9 + Math.random() * 1.4;
        this.beats.push({ edge: CHAIN.length - 1 + Math.floor(Math.random() * sat), t: 0, dir: Math.random() < 0.5 ? 1 : -1 });
      }
      for (const b of this.beats) b.t += dt / 1.1;
      this.beats = this.beats.filter((b) => b.t < 1);
    }
  }

  /** Where the request/response packet is right now, or null while resting. */
  private packet(): { x: number; y: number; edge: number; t: number; res: boolean } | null {
    if (this.phase === 'wait') return null;
    if (this.phase === 'req') {
      const t = ease(clamp(this.phaseT / REQ_SECONDS, 0, 1));
      const p = this.pointOn(this.edges[this.edgeIdx], t);
      return { ...p, edge: this.edgeIdx, t, res: false };
    }
    const t = 1 - clamp(this.phaseT / RES_SECONDS, 0, 1);
    const p = this.pointOn(this.edges[this.edgeIdx], t);
    return { ...p, edge: this.edgeIdx, t, res: true };
  }

  private pointOn(e: Edge, t: number): { x: number; y: number } {
    const u = 1 - t;
    return {
      x: u * u * e.a.x + 2 * u * t * e.cx + t * t * e.b.x,
      y: u * u * e.a.y + 2 * u * t * e.cy + t * t * e.b.y,
    };
  }

  // ---------- drawing ----------

  private draw(pk: ReturnType<TraceScene['packet']>): void {
    const { ctx, w, h, dpr } = this;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    this.drawGrid(pk);
    this.drawEdges(pk);
    this.drawBeats();
    for (const n of this.nodes) this.drawChip(n);
    this.drawRipples();
    if (pk) this.drawPacket(pk);
  }

  private drawGrid(pk: ReturnType<TraceScene['packet']>): void {
    const { ctx, w, h, pointer } = this;
    const step = this.narrow ? 22 : 30;
    const ox = (w % step) / 2;
    const oy = (h % step) / 2;
    const ptrR = 150;
    const pkR = 120;

    for (let y = oy; y < h; y += step) {
      for (let x = ox; x < w; x += step) {
        // Keep the left (where the headline sits) calmer than the right on wide layouts.
        const fade = this.narrow ? 1 : 0.3 + 0.7 * clamp((x / w - 0.15) / 0.45, 0, 1);
        let boost = 0;
        if (pointer) {
          const d = Math.hypot(x - pointer.x, y - pointer.y);
          if (d < ptrR) boost += 0.5 * (1 - d / ptrR) ** 2;
        }
        if (pk) {
          const d = Math.hypot(x - pk.x, y - pk.y);
          if (d < pkR) boost += 0.65 * (1 - d / pkR) ** 2;
        }
        for (const r of this.ripples) {
          const radius = r.age * 150;
          const d = Math.abs(Math.hypot(x - r.x, y - r.y) - radius);
          if (d < 26) boost += 0.5 * (1 - d / 26) * (1 - r.age / 1.1);
        }
        const a = (0.13 + boost) * fade;
        ctx.fillStyle = `rgba(150,195,255,${a.toFixed(3)})`;
        const s = 1.1 + boost * 1.6;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }
  }

  private curveTo(e: Edge, t0: number, t1: number): void {
    const { ctx } = this;
    const steps = Math.max(2, Math.ceil((t1 - t0) * 28));
    const p0 = this.pointOn(e, t0);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i <= steps; i++) {
      const p = this.pointOn(e, t0 + ((t1 - t0) * i) / steps);
      ctx.lineTo(p.x, p.y);
    }
  }

  private drawEdges(pk: ReturnType<TraceScene['packet']>): void {
    const { ctx } = this;
    ctx.lineCap = 'round';
    this.edges.forEach((e, i) => {
      // Base link.
      ctx.beginPath();
      ctx.moveTo(e.a.x, e.a.y);
      ctx.quadraticCurveTo(e.cx, e.cy, e.b.x, e.b.y);
      ctx.strokeStyle = e.satellite ? 'rgba(154,160,180,0.16)' : 'rgba(120,160,255,0.2)';
      ctx.lineWidth = 1;
      if (e.satellite) ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (e.satellite) return;

      // Portion the request has already travelled.
      let lit = e.lit;
      let upto = 1;
      if (pk && !pk.res && pk.edge === i) {
        upto = pk.t;
        lit = 1;
      }
      if (lit > 0 && upto > 0.01) {
        const g = this.success;
        ctx.beginPath();
        this.curveTo(e, 0, upto);
        ctx.strokeStyle = g > 0 ? `rgba(63,185,80,${0.75 * lit})` : `rgba(34,211,238,${0.7 * lit})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
    });
  }

  private drawBeats(): void {
    const { ctx } = this;
    for (const b of this.beats) {
      const e = this.edges[b.edge];
      const t = b.dir === 1 ? b.t : 1 - b.t;
      const p = this.pointOn(e, t);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190,205,255,${0.8 * Math.sin(b.t * Math.PI)})`;
      ctx.fill();
    }
  }

  private roundRect(x: number, y: number, w: number, h: number, r: number): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private drawChip(n: Node): void {
    const { ctx } = this;
    const x = n.x - n.w / 2;
    const y = n.y - n.h / 2;
    const fs = this.narrow ? 11 : 13;
    const fsSub = this.narrow ? 9.5 : 10.5;
    const active = Math.max(n.lit, n.flash);
    const satellite = !CHAIN.includes(n.def);
    const dim = satellite ? 0.55 : 1;

    ctx.save();
    if (n.flash > 0) {
      ctx.shadowColor = n.def.color;
      ctx.shadowBlur = 26 * n.flash;
    }
    this.roundRect(x, y, n.w, n.h, 12);
    ctx.fillStyle = `rgba(10,13,30,${0.92 * dim + 0.06})`;
    ctx.fill();
    ctx.restore();

    this.roundRect(x, y, n.w, n.h, 12);
    ctx.strokeStyle = this.withAlpha(n.def.color, (0.22 + 0.6 * active) * dim);
    ctx.lineWidth = 1 + n.flash * 0.8;
    ctx.stroke();

    // Status dot.
    ctx.beginPath();
    ctx.arc(x + 14, n.y, 3.4, 0, Math.PI * 2);
    ctx.fillStyle = this.withAlpha(n.def.color, (0.5 + 0.5 * active) * dim);
    ctx.fill();

    ctx.textBaseline = 'alphabetic';
    ctx.font = `600 ${fs}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillStyle = `rgba(237,239,247,${(0.62 + 0.38 * active) * dim})`;
    ctx.fillText(n.def.label, x + 26, n.y - 2);
    ctx.font = `400 ${fsSub}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillStyle = `rgba(154,160,180,${0.9 * dim})`;
    ctx.fillText(n.def.sub, x + 26, n.y + fsSub + 1);
  }

  private drawRipples(): void {
    const { ctx } = this;
    for (const r of this.ripples) {
      const k = r.age / 1.1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 20 + k * 70, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34,211,238,${0.45 * (1 - k)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  private drawPacket(pk: NonNullable<ReturnType<TraceScene['packet']>>): void {
    const { ctx } = this;
    const e = this.edges[pk.edge];
    const rgb = pk.res ? '63,185,80' : '34,211,238';
    const tail = 0.32;
    const N = 12;
    ctx.lineCap = 'round';
    for (let i = 0; i < N; i++) {
      const a = pk.res ? Math.min(1, pk.t + (tail * i) / N) : Math.max(0, pk.t - tail + (tail * i) / N);
      const b = pk.res ? Math.min(1, pk.t + (tail * (i + 1)) / N) : Math.max(0, pk.t - tail + (tail * (i + 1)) / N);
      if (a === b) continue;
      const k = pk.res ? 1 - i / N : (i + 1) / N;
      ctx.beginPath();
      this.curveTo(e, Math.min(a, b), Math.max(a, b));
      ctx.strokeStyle = `rgba(${rgb},${0.9 * k * k})`;
      ctx.lineWidth = 1.5 + 2.2 * k;
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(pk.x, pk.y, 0, pk.x, pk.y, 20);
    g.addColorStop(0, `rgba(${rgb},0.9)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(pk.x, pk.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pk.x, pk.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }

  private withAlpha(hex: string, alpha: number): string {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(alpha, 0, 1).toFixed(3)})`;
  }
}
