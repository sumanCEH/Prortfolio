import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CV_DATA } from '../../../assets/data/cv-data';
import { GlassCardComponent } from '../../shared/glass-card/glass-card.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

@Component({
  selector: 'app-education',
  imports: [SectionHeadingComponent, GlassCardComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
})
export class EducationComponent {
  protected readonly items = CV_DATA.education;
}
