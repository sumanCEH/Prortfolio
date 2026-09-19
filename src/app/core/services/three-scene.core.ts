/**
 * The "distributed system" hero visual (Plan.md §2.5): a small cluster of
 * faceted glass nodes joined by thin lines, slowly rotating, tilting toward
 * the pointer, with a pulse of light travelling a random line every few
 * seconds to suggest an API request.
 *
 * This file is the ONLY place that imports 'three'. It is loaded through a
 * dynamic import in ThreeSceneService, so Three.js lands in a lazy chunk and
 * never in the initial bundle. Named imports keep it tree-shakeable.
 */
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

const NODE_COUNT = 8; // outer nodes; plus one central hub
const PULSE_SECONDS = 1.3;

interface Edge {
  a: number;
  b: number;
  line: Line;
}

function cssColor(name: string, fallback: string): Color {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new Color(v || fallback);
}

export class HeroSceneCore {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(42, 1, 0.1, 100);
  private readonly tilt = new Group(); // follows the pointer
  private readonly cluster = new Group(); // spins continuously
  private readonly nodes: Mesh[] = [];
  private readonly flash: number[] = [];
  private readonly edges: Edge[] = [];
  private readonly pulse: Mesh;
  private readonly pulseHalo: Mesh;
  private readonly dust: Points;

  private readonly pointer = { x: 0, y: 0 };
  private running = false;
  private last = 0;
  private elapsed = 0;
  private nextPulseAt = 1.2;
  private pulseT = -1;
  private pulseEdge = 0;
  private pulseReverse = false;
  private width = 1;
  private height = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
    // Cap device pixel ratio at 2 (1.5 on small screens): beyond that, cost grows
    // with no visible gain.
    const maxDpr = window.matchMedia('(max-width: 768px)').matches ? 1.5 : 2;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.setClearColor(0x000000, 0);

    const blue = cssColor('--brand-blue', '#2e6bff');
    const cyan = cssColor('--brand-cyan', '#22d3ee');
    const violet = cssColor('--brand-violet', '#7c5cff');

    this.camera.position.set(0, 0, 9);
    this.scene.add(this.tilt);
    this.tilt.add(this.cluster);

    // Lights: coloured points give the glassy specular sheen without an env map.
    this.scene.add(new AmbientLight(0x5a6bff, 0.6));
    const l1 = new PointLight(blue, 320, 0, 2);
    l1.position.set(5, 4, 6);
    const l2 = new PointLight(violet, 260, 0, 2);
    l2.position.set(-6, -3, 4);
    const l3 = new PointLight(cyan, 160, 0, 2);
    l3.position.set(0, 5, -4);
    this.scene.add(l1, l2, l3);

    this.buildNodes(cyan);
    this.buildEdges(cyan);

    // Travelling pulse + soft halo.
    this.pulse = new Mesh(
      new SphereGeometry(0.075, 16, 16),
      new MeshBasicMaterial({ color: 0xffffff }),
    );
    this.pulseHalo = new Mesh(
      new SphereGeometry(0.22, 16, 16),
      new MeshBasicMaterial({
        color: cyan,
        transparent: true,
        opacity: 0.5,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    this.pulse.visible = this.pulseHalo.visible = false;
    this.cluster.add(this.pulse, this.pulseHalo);

    this.dust = this.buildDust(violet);
    this.scene.add(this.dust);
  }

  // ---------- Construction ----------

  private buildNodes(edgeColor: Color): void {
    const hubGeo = new IcosahedronGeometry(0.62, 1);
    const nodeGeo = new IcosahedronGeometry(0.3, 0);

    const mat = () =>
      new MeshPhysicalMaterial({
        color: 0x22317f,
        emissive: 0x0b1553,
        emissiveIntensity: 0.9,
        metalness: 0.3,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        flatShading: true,
      });
    const edgeMat = () =>
      new LineBasicMaterial({ color: edgeColor, transparent: true, opacity: 0.55 });

    const positions = this.fibonacciSphere(NODE_COUNT, 2.5);
    const all = [new Vector3(0, 0, 0), ...positions];

    all.forEach((p, i) => {
      const hub = i === 0;
      const geo = hub ? hubGeo : nodeGeo;
      const mesh = new Mesh(geo, mat());
      mesh.position.copy(p);
      // Wireframe overlay gives the circuit-board look.
      mesh.add(new LineSegments(new EdgesGeometry(geo), edgeMat()));
      this.cluster.add(mesh);
      this.nodes.push(mesh);
      this.flash.push(0);
    });
  }

  /** Evenly spread points on a sphere so the cluster looks intentional, not random. */
  private fibonacciSphere(count: number, radius: number): Vector3[] {
    const pts: Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      pts.push(new Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius));
    }
    return pts;
  }

  private buildEdges(color: Color): void {
    const pairs = new Set<string>();
    const add = (a: number, b: number) => pairs.add(a < b ? `${a}-${b}` : `${b}-${a}`);

    // Hub connects to every outer node; each outer node links to its 2 nearest neighbours.
    for (let i = 1; i <= NODE_COUNT; i++) {
      add(0, i);
      const nearest = this.nodes
        .map((n, j) => ({ j, d: n.position.distanceTo(this.nodes[i].position) }))
        .filter((o) => o.j !== 0 && o.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2);
      nearest.forEach((o) => add(i, o.j));
    }

    for (const key of pairs) {
      const [a, b] = key.split('-').map(Number);
      const geo = new BufferGeometry().setFromPoints([
        this.nodes[a].position,
        this.nodes[b].position,
      ]);
      const line = new Line(
        geo,
        new LineBasicMaterial({ color, transparent: true, opacity: 0.32 }),
      );
      this.cluster.add(line);
      this.edges.push({ a, b, line });
    }
  }

  private buildDust(color: Color): Points {
    const n = 140;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // Shell of faint points around the cluster for depth.
      const r = 4 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi) - 2;
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(arr, 3));
    return new Points(
      geo,
      new PointsMaterial({
        color,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    );
  }

  // ---------- Public API ----------

  /** Normalised pointer position, -1..1 on both axes. */
  setPointer(nx: number, ny: number): void {
    this.pointer.x = nx;
    this.pointer.y = ny;
  }

  resize(width: number, height: number): void {
    if (width === 0 || height === 0) return;
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    this.camera.aspect = aspect;
    // Wide screens: push the cluster to the right so text can own the left.
    // Narrow screens: pull the camera back so the whole cluster still fits.
    this.camera.position.z = aspect >= 1 ? 9 : 9 + (1 - aspect) * 7;
    this.cluster.position.x = 0;
    this.tilt.position.x = aspect >= 1.15 ? Math.min(aspect, 2.2) * 1.45 : 0;
    this.camera.updateProjectionMatrix();
    this.renderOnce();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.renderer.setAnimationLoop((t) => this.frame(t));
  }

  /** Stops the render loop (canvas offscreen or tab hidden). */
  pause(): void {
    if (!this.running) return;
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  renderOnce(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.pause();
    const materials = new Set<Material>();
    this.scene.traverse((obj) => {
      const o = obj as Mesh;
      o.geometry?.dispose();
      const m = o.material as Material | Material[] | undefined;
      if (Array.isArray(m)) m.forEach((x) => materials.add(x));
      else if (m) materials.add(m);
    });
    materials.forEach((m) => m.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.scene.clear();
  }

  // ---------- Frame ----------

  private frame(now: number): void {
    // Clamp dt so a resumed tab doesn't cause a huge jump.
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    this.elapsed += dt;

    this.cluster.rotation.y += dt * 0.18;
    this.cluster.rotation.x = Math.sin(this.elapsed * 0.3) * 0.08;

    // Ease toward the pointer (gentle parallax tilt).
    const k = 1 - Math.pow(0.001, dt);
    this.tilt.rotation.y += (this.pointer.x * 0.35 - this.tilt.rotation.y) * k;
    this.tilt.rotation.x += (this.pointer.y * 0.22 - this.tilt.rotation.x) * k;

    this.dust.rotation.y -= dt * 0.02;

    this.updatePulse(dt);
    this.updateFlash(dt);
    this.renderer.render(this.scene, this.camera);
  }

  private updatePulse(dt: number): void {
    if (this.pulseT < 0) {
      if (this.elapsed >= this.nextPulseAt) {
        this.pulseEdge = Math.floor(Math.random() * this.edges.length);
        this.pulseReverse = Math.random() < 0.5;
        this.pulseT = 0;
        this.pulse.visible = this.pulseHalo.visible = true;
      }
      return;
    }

    this.pulseT += dt / PULSE_SECONDS;
    const e = this.edges[this.pulseEdge];
    const from = this.nodes[this.pulseReverse ? e.b : e.a].position;
    const to = this.nodes[this.pulseReverse ? e.a : e.b].position;
    const t = Math.min(this.pulseT, 1);
    const eased = t * t * (3 - 2 * t);
    this.pulse.position.lerpVectors(from, to, eased);
    this.pulseHalo.position.copy(this.pulse.position);
    (e.line.material as LineBasicMaterial).opacity = 0.32 + 0.5 * Math.sin(t * Math.PI);

    if (this.pulseT >= 1) {
      (e.line.material as LineBasicMaterial).opacity = 0.32;
      this.flash[this.pulseReverse ? e.a : e.b] = 1; // arrival "ping"
      this.pulseT = -1;
      this.pulse.visible = this.pulseHalo.visible = false;
      this.nextPulseAt = this.elapsed + 2 + Math.random() * 2.5;
    }
  }

  private updateFlash(dt: number): void {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.flash[i] > 0) this.flash[i] = Math.max(0, this.flash[i] - dt * 2.2);
      this.nodes[i].scale.setScalar(1 + this.flash[i] * 0.3);
    }
  }
}
