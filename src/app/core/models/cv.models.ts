export interface Profile {
  name: string;
  role: string;
  company: string;
  valueProposition: string;
  summary: string;
  availability: string;
  location: string;
  relocation: string;
  yearsOfExperience: string;
  domains: string[];
  /**
   * Hero portrait. Leave undefined to keep the 3D-only hero layout (Plan.md §2.5).
   * Set to e.g. 'assets/images/suman.jpg' to switch to the photo layout.
   */
  photoUrl?: string;
}

export interface Contact {
  /** Empty string means "not provided yet"; UI hides the link. */
  email: string;
  linkedin: string;
  github: string;
  /** Public phone numbers, shown as tap-to-call links. Empty array hides them. */
  phones: string[];
  /** WhatsApp number, digits only with country code (e.g. "917029711346"). Empty hides the chat button. */
  whatsapp: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  context: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface DiagramNode {
  label: string;
  /** Up to three short lines of supporting tech, shown under the label. */
  sub?: string[];
}

export interface Project {
  id: 'ghcp-accelerator' | 'healthcare-platform' | 'cmr-portal' | 'cicd-pipeline';
  title: string;
  org: string;
  description: string;
  metric?: { value: number; suffix: string; label: string };
  tags: string[];
  badge?: string;
  /** Steps of a flow, rendered as an animated diagram. */
  diagram?: DiagramNode[];
  /** How `diagram` is drawn: a request-flow with a travelling dot (default) or a CI run of steps completing. */
  visual?: 'flow' | 'pipeline';
}

export interface Certification {
  code: string;
  name: string;
  /** Public credential or post link; the card links out when set. */
  url?: string;
}

export interface Award {
  title: string;
  detail: string;
  url?: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface CvData {
  profile: Profile;
  contact: Contact;
  skills: SkillGroup[];
  /** The tech chips orbited in the skills ring. */
  orbitTech: string[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  education: Education[];
}
