import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AnimatedDividerComponent } from '../animated-divider/animated-divider.component';
import { RevealDirective } from '../reveal.directive';

/** Eyebrow + h2 + self-drawing divider, used at the top of every section. */
@Component({
  selector: 'app-section-heading',
  imports: [AnimatedDividerComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './section-heading.component.html',
  styleUrl: './section-heading.component.scss',
  host: {
    '[class.section-heading--light]': 'tone() === "light"',
    '[class.section-heading--violet]': 'tone() === "violet"',
  },
})
export class SectionHeadingComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  /** id placed on the <h2> so the parent <section> can use aria-labelledby. */
  readonly headingId = input.required<string>();
  readonly tone = input<'dark' | 'light' | 'violet'>('dark');
}
