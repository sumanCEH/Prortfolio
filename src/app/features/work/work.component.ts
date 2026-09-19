import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { DiagramNode } from '../../core/models/cv.models';
import { CV_DATA } from '../../../assets/data/cv-data';
import { CountUpComponent } from '../../shared/count-up/count-up.component';
import { FlowDiagramComponent } from '../../shared/flow-diagram/flow-diagram.component';
import { GlassCardComponent } from '../../shared/glass-card/glass-card.component';
import { PipelineRunComponent } from '../../shared/pipeline-run/pipeline-run.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

@Component({
  selector: 'app-work',
  imports: [
    SectionHeadingComponent,
    GlassCardComponent,
    CountUpComponent,
    FlowDiagramComponent,
    PipelineRunComponent,
    RevealDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss',
})
export class WorkComponent {
  protected readonly projects = CV_DATA.projects;

  /** Screen-reader description of a diagram: "Client, then API Gateway, then ...". */
  protected flowLabel(title: string, nodes: DiagramNode[]): string {
    return `${title} flow: ${nodes.map((n) => n.label).join(', then ')}.`;
  }
}
