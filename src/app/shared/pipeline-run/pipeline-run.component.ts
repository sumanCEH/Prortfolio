import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { DiagramNode } from '../../core/models/cv.models';
import { IconComponent } from '../icon/icon.component';

/**
 * A CI run drawn like a GitHub Actions workflow: each step spins while it
 * "runs", then flips to a green check, one after another, and the whole run
 * loops. Pure CSS (no JS), so it is prerender-safe and costs nothing at runtime.
 * Reduced motion shows the finished run instead.
 */
@Component({
  selector: 'app-pipeline-run',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pipeline-run.component.html',
  styleUrl: './pipeline-run.component.scss',
})
export class PipelineRunComponent {
  readonly steps = input.required<DiagramNode[]>();
  /** Text alternative for screen readers. */
  readonly label = input.required<string>();
}
