import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CV_DATA } from '../../../assets/data/cv-data';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeadingComponent } from '../../shared/section-heading/section-heading.component';

interface OrbitItem {
  name: string;
  src: string;
  /** Position on the ring, in degrees. */
  angle: number;
}

/** Brand logos live in assets/icons/tech (Devicon, MIT licensed). */
const TECH_ICONS: Readonly<Record<string, string>> = {
  Java: 'java',
  'Spring Boot': 'spring-boot',
  Angular: 'angular',
  AWS: 'aws',
  Azure: 'azure',
  Docker: 'docker',
  Kafka: 'kafka',
  PostgreSQL: 'postgresql',
};

/** Spreads items evenly around a ring, starting `offset` degrees in. */
function place(names: string[], offset: number): OrbitItem[] {
  return names
    .filter((name) => name in TECH_ICONS)
    .map((name, i, all) => ({
      name,
      src: `assets/icons/tech/${TECH_ICONS[name]}.svg`,
      angle: offset + (360 / all.length) * i,
    }));
}

@Component({
  selector: 'app-skills',
  imports: [SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  protected readonly groups = CV_DATA.skills;
  protected readonly coreTech = CV_DATA.orbitTech.join(', ');
  protected readonly techCount = CV_DATA.skills.reduce((n, g) => n + g.items.length, 0);

  // Alternate the featured tech between two rings so the orbit stays balanced.
  // The outer ring is offset by half a step so icons never line up radially.
  protected readonly innerRing = place(
    CV_DATA.orbitTech.filter((_, i) => i % 2 === 0),
    0,
  );
  protected readonly outerRing = place(
    CV_DATA.orbitTech.filter((_, i) => i % 2 === 1),
    45,
  );
}
