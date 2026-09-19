import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CV_DATA } from '../../../assets/data/cv-data';
import { GlassCardComponent } from '../../shared/glass-card/glass-card.component';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

@Component({
  selector: 'app-certifications',
  imports: [SectionHeadingComponent, GlassCardComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certifications.component.html',
  styleUrl: './certifications.component.scss',
})
export class CertificationsComponent {
  protected readonly certs = CV_DATA.certifications;
  protected readonly awards = CV_DATA.awards;
}
