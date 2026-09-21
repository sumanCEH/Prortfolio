import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import type { DiagramNode } from '../../core/models/cv.models';
import { GsapService } from '../../core/services/gsap.service';

interface Box {
  x: number;
  y: number;
  /** Own height, so a box with no sub-lines is not as tall as one with three. */
  h: number;
  label: string;
  sub: string[];
}

interface Layout {
  w: number;
  h: number;
  boxes: Box[];
  path: string;
  boxW: number;
}

const BOX_W_H = 104; // horizontal layout
const BOX_W_V = 220; // vertical layout
const BOX_H = 76;
const GAP_H = 30;
const GAP_V = 22;

/** Vertical boxes are only as tall as their text: label, then one 13px line per sub-label. */
const vBoxH = (sub: readonly string[]) => (sub.length ? 44 + (sub.length - 1) * 13 + 14 : 44);

/**
 * Animated architecture / pipeline diagram drawn as inline SVG. A slow dot
 * travels the whole path on a loop to suggest a request (or a commit)
 * flowing through. Both layouts are rendered; a container query picks
 * horizontal on wide cards and vertical on narrow ones. The dot is omitted
 * entirely for users who prefer reduced motion.
 */
@Component({
  selector: 'app-flow-diagram',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flow-diagram.component.html',
  styleUrl: './flow-diagram.component.scss',
})
export class FlowDiagramComponent {
  readonly nodes = input.required<DiagramNode[]>();
  /** Text alternative describing the flow for screen readers. */
  readonly label = input.required<string>();

  /** Off during prerender/hydration; switched on client-side unless reduced motion is set. */
  protected readonly animate = signal(false);

  constructor() {
    const motion = inject(GsapService);
    afterNextRender(() => this.animate.set(!motion.prefersReducedMotion()));
  }

  protected readonly horizontal = computed<Layout>(() => {
    const n = this.nodes();
    const w = n.length * BOX_W_H + (n.length - 1) * GAP_H;
    const cy = BOX_H / 2 + 10;
    return {
      w,
      h: BOX_H + 20,
      boxW: BOX_W_H,
      boxes: n.map((node, i) => ({
        x: i * (BOX_W_H + GAP_H),
        y: 10,
        h: BOX_H,
        label: node.label,
        sub: node.sub ?? [],
      })),
      path: `M${BOX_W_H / 2},${cy} H${w - BOX_W_H / 2}`,
    };
  });

  protected readonly vertical = computed<Layout>(() => {
    const n = this.nodes();
    const heights = n.map((node) => vBoxH(node.sub ?? []));
    const h = heights.reduce((a, b) => a + b, 0) + (n.length - 1) * GAP_V;
    let y = 0;
    const boxes = n.map((node, i) => {
      const box: Box = { x: 20, y, h: heights[i], label: node.label, sub: node.sub ?? [] };
      y += heights[i] + GAP_V;
      return box;
    });
    return {
      w: BOX_W_V + 40,
      h,
      boxW: BOX_W_V,
      boxes,
      path: `M${(BOX_W_V + 40) / 2},${heights[0] / 2} V${h - heights[heights.length - 1] / 2}`,
    };
  });
}
