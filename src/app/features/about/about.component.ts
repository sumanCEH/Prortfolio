import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CV_DATA } from '../../../assets/data/cv-data';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

interface Fact {
  value: string;
  label: string;
}

@Component({
  selector: 'app-about',
  imports: [SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  protected readonly profile = CV_DATA.profile;

  /** Quick-facts strip, all derived from cv-data.ts. */
  protected readonly facts: Fact[] = [
    { value: `${this.profile.yearsOfExperience} years`, label: 'Experience' },
    { value: this.profile.location, label: 'Based in' },
    { value: this.profile.domains.join(' & '), label: 'Domains' },
    { value: this.profile.relocation, label: 'Relocation' },
  ];
}
