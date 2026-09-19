import { ChangeDetectionStrategy, Component } from '@angular/core';

/** 1px-bordered, softly frosted card used on dark sections (Plan.md §2.1). */
@Component({
  selector: 'app-glass-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  styleUrl: './glass-card.component.scss',
})
export class GlassCardComponent {}
