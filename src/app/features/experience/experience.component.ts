import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CV_DATA } from '../../../assets/data/cv-data';
import { GlassCardComponent } from '../../shared/glass-card/glass-card.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

@Component({
  selector: 'app-experience',
  imports: [SectionHeadingComponent, GlassCardComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
})
export class ExperienceComponent {
  protected readonly jobs = CV_DATA.experience;
}
