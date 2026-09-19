import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  afterNextRender,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CV_DATA } from '../assets/data/cv-data';
import { SeoService } from './core/services/seo.service';
import { AboutComponent } from './features/about/about.component';
import { CertificationsComponent } from './features/certifications/certifications.component';
import { ContactComponent } from './features/contact/contact.component';
import { EducationComponent } from './features/education/education.component';
import { ButtonComponent } from './shared/ui-button/button.component';
import { IconComponent } from './shared/icon/icon.component';
import { ExperienceComponent } from './features/experience/experience.component';
import { HeroComponent } from './features/hero/hero.component';
import { SkillsComponent } from './features/skills/skills.component';
import { WorkComponent } from './features/work/work.component';

interface NavLink {
  id: string;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    WorkComponent,
    SkillsComponent,
    CertificationsComponent,
    EducationComponent,
    ContactComponent,
    ButtonComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly toggleBtn = viewChild<ElementRef<HTMLButtonElement>>('toggleBtn');

  protected readonly cv = CV_DATA;
  protected readonly year = new Date().getFullYear();
  protected readonly menuOpen = signal(false);
  protected readonly activeId = signal('hero');

  protected readonly links: NavLink[] = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'experience', label: 'Experience' },
    { id: 'work', label: 'Work' },
    { id: 'skills', label: 'Skills' },
    { id: 'contact', label: 'Contact' },
  ];

  constructor() {
    inject(SeoService).init();

    // Highlight the nav link of the section currently in view.
    afterNextRender(() => {
      const sections = this.links
        .map((l) => document.getElementById(l.id))
        .filter((el): el is HTMLElement => el !== null);

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) this.activeId.set(entry.target.id);
          }
        },
        { rootMargin: '-45% 0px -50% 0px' },
      );
      sections.forEach((s) => observer.observe(s));
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (!this.menuOpen()) return;
    this.closeMenu();
    // The focused link is about to be hidden; hand focus back to the menu button.
    this.toggleBtn()?.nativeElement.focus();
  }
}
