import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
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

  /** On phones only this many achievements show at first; the rest sit behind a toggle. */
  protected readonly collapsedAfter = 4;

  private readonly openIds = signal<ReadonlySet<string>>(new Set());

  protected isOpen(id: string): boolean {
    return this.openIds().has(id);
  }

  protected toggle(id: string): void {
    this.openIds.update((ids) => {
      const next = new Set(ids);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }
}
