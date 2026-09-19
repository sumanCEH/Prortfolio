import type { CvData } from '../../app/core/models/cv.models';

/**
 * Single source of truth for every CV fact on the site.
 * No component may hardcode CV facts; they read from this object.
 *
 * Sourced from Suman's résumés and Plan.md. The Capgemini client is
 * intentionally described generically and never named.
 */
export const CV_DATA: CvData = {
  profile: {
    name: 'Suman Sarkar',
    role: 'Fullstack Java Developer · Senior Associate Consultant',
    company: 'Infosys',
    valueProposition:
      'I build reliable, cloud-native backend systems for enterprise-scale products.',
    summary:
      'Senior Associate Consultant with 4 years of experience designing and developing scalable ' +
      'enterprise applications across the healthcare and automotive domains. Proficient in Java, ' +
      'Spring Boot, Microservices, REST APIs and Angular, with experience building full-stack and ' +
      'cloud-native applications. Skilled in production support, application monitoring, CI/CD and ' +
      'release management using Splunk, AppDynamics, Jenkins, uDeploy and Octopus Deploy, with a ' +
      'strong grounding in Agile methodologies, backend architecture and software engineering best practices.',
    availability: 'Available for new opportunities',
    location: 'Kolkata, India',
    relocation: 'Open to relocate – Bengaluru, Pune, Gurugram, Hyderabad, Mumbai, Kolkata',
    yearsOfExperience: '4+',
    domains: ['Healthcare', 'Automotive'],
  },

  contact: {
    email: 'sumansarkarcob043@gmail.com',
    linkedin: 'https://www.linkedin.com/in/suman-sarkar-024641191/',
    github: 'https://github.com/sumanCEH',
    phones: ['+91 7029711346', '+91 7602607017'],
    whatsapp: '917029711346',
  },

  skills: [
    { category: 'Programming Languages', items: ['Java', 'Python', 'JavaScript', 'TypeScript'] },
    {
      category: 'Frameworks',
      items: ['Spring Boot', 'Spring MVC', 'Spring Security', 'Hibernate'],
    },
    { category: 'Frontend', items: ['HTML', 'CSS', 'Angular'] },
    { category: 'Databases', items: ['PostgreSQL', 'MongoDB'] },
    {
      category: 'DevOps, Build & Monitoring Tools',
      items: [
        'Jenkins',
        'Maven',
        'Docker',
        'Kubernetes',
        'GitHub',
        'GitHub Actions',
        'CI/CD Pipelines',
        'uDeploy',
      ],
    },
    {
      category: 'Cloud & Messaging',
      items: ['AWS (EC2, S3, Lambda)', 'Microsoft Azure', 'IBM MQ', 'Kafka'],
    },
    { category: 'Project & Collaboration Tools', items: ['Jira', 'ServiceNow', 'Confluence'] },
    {
      category: 'Practices & Methodologies',
      items: [
        'Test-Driven Development',
        'Design Patterns',
        'Agile (Scrum)',
        'Microservices Architecture',
        'Distributed Systems',
        'OOP',
      ],
    },
    { category: 'Development & Testing Tools', items: ['Postman', 'SoapUI'] },
    { category: 'AI & Productivity Tools', items: ['GitHub Copilot', 'OpenAI GPT', 'Claude'] },
  ],

  orbitTech: ['Java', 'Spring Boot', 'Angular', 'AWS', 'Azure', 'Docker', 'Kafka', 'PostgreSQL'],

  experience: [
    {
      id: 'infosys',
      role: 'Senior Associate Consultant',
      company: 'Infosys',
      context: 'Fortune 10 US healthcare client',
      start: 'Nov 2024',
      end: 'Present',
      bullets: [
        'Won the Insta Award (2026) for a GitHub Copilot + Markdown solution that cut ticket delivery time by 40%.',
        'Developed and maintained microservices using Java, Spring Boot and REST for a large-scale healthcare platform serving enterprise clients.',
        'Resolved 16+ high-priority production incidents through root-cause analysis, log investigation and backend logic optimization, significantly improving system stability.',
        'Designed and implemented RESTful API enhancements following enterprise coding standards, improving service maintainability and integration reliability.',
        'Used Splunk and AppDynamics for proactive monitoring, performance tracking and anomaly detection to keep the application highly available.',
        'Managed and enhanced CI/CD pipelines using GitHub Actions, Jenkins, Maven, uDeploy and Octopus for reliable multi-environment deployments and controlled release cycles.',
        'Built a GitHub Actions agent in Python that auto-diffs master and QA branches for Java/Spring Boot methods and generates HTML comparison reports for QA sign-off.',
        'Conducted peer code reviews and mentored junior developers on Java, Spring Boot and clean coding principles.',
        'Leveraged GitHub Copilot, Claude and GPT to accelerate feature delivery, reduce debugging cycles and improve code quality.',
      ],
    },
    {
      id: 'capgemini',
      role: 'Software Engineer',
      company: 'Capgemini',
      context: 'Global luxury automotive OEM client',
      start: 'Oct 2022',
      end: 'Nov 2024',
      bullets: [
        'Built the CMR Training Portal from scratch.',
        'Designed and developed RESTful APIs across monolithic and microservice-based architectures using Java, Spring Boot, Hibernate and PostgreSQL.',
        'Developed responsive Angular frontend modules that integrate seamlessly with backend services across customer-facing automotive platforms.',
        'Optimized database interactions through query tuning, indexing and pagination to handle high-volume transactional data.',
        'Strengthened application security with Spring Security, using role-based access control and token-based authentication.',
        'Wrote unit and integration tests with JUnit and Mockito, improving reliability and ensuring high-quality releases across multiple environments.',
        'Contributed to CI/CD automation using Git, Jenkins, Maven and AWS-based deployments for stable multi-environment releases.',
        'Diagnosed and resolved production defects through log analysis and service-level debugging, improving reliability and reducing recurring issues.',
        'Took part in design discussions, sprint planning, stand-ups, retrospectives and peer code reviews, working closely with Product Owners, QA and cross-functional stakeholders.',
      ],
    },
    {
      id: 'capgemini-intern',
      role: 'Intern',
      company: 'Capgemini',
      context: 'Internship',
      start: 'Feb 2022',
      end: 'Apr 2022',
      bullets: [
        'Completed intensive training across backend, frontend, databases, cloud and DevOps.',
        'Contributed to an internal employee management tool by implementing new features and fixing bugs, following Agile and Git-based workflows under senior developer guidance.',
      ],
    },
  ],

  projects: [
    {
      id: 'ghcp-accelerator',
      title: 'GHCP + Markdown Ticket Accelerator',
      org: 'Infosys',
      description:
        'A workflow built with GitHub Copilot and Markdown that speeds up how support tickets are analysed and resolved.',
      metric: { value: 40, suffix: '%', label: 'faster ticket resolution' },
      tags: ['GitHub Copilot', 'Markdown', 'AI tooling'],
      badge: 'Insta Award winner',
    },
    {
      id: 'healthcare-platform',
      title: 'Enterprise Healthcare Microservices Platform',
      org: 'Infosys',
      description:
        'Java and Spring Boot microservices behind an API gateway, with asynchronous messaging and a relational database. I keep it healthy in production.',
      metric: { value: 16, suffix: '+', label: 'production incidents resolved' },
      tags: ['Spring Boot', 'Kafka', 'IBM MQ', 'PostgreSQL'],
      diagram: [
        { label: 'Client' },
        { label: 'API Gateway' },
        { label: 'Microservices', sub: ['Spring Boot'] },
        { label: 'Message Queue', sub: ['Kafka', 'IBM MQ'] },
        { label: 'Database', sub: ['PostgreSQL'] },
      ],
    },
    {
      id: 'cicd-pipeline',
      title: 'CI/CD & GitHub Actions',
      org: 'Infosys',
      description:
        'GitHub Actions and Jenkins pipelines that build, test and release the platform reliably across multiple environments.',
      tags: ['GitHub Actions', 'Jenkins', 'Maven', 'JUnit', 'Mockito', 'uDeploy', 'Octopus'],
      visual: 'pipeline',
      diagram: [
        { label: 'Commit', sub: ['GitHub'] },
        { label: 'Build', sub: ['Maven'] },
        { label: 'Test', sub: ['JUnit', 'Mockito'] },
        { label: 'Deploy', sub: ['Jenkins', 'uDeploy', 'Octopus'] },
        { label: 'Release', sub: ['Multiple environments'] },
      ],
    },
    {
      id: 'cmr-portal',
      title: 'CMR Training Portal',
      org: 'Capgemini',
      description:
        'A web portal built end to end as a new project, from the first commit to delivery.',
      tags: ['Java', 'Spring Boot', 'JWT', 'DevOps', 'AWS'],
    },
  ],

  certifications: [
    {
      code: 'Anthropic',
      name: 'Claude Certified Architect – Foundations',
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7505978022253015041/',
    },
    {
      code: 'GH-300',
      name: 'GitHub Copilot',
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7375108784471588864/',
    },
    {
      code: 'GH-900',
      name: 'GitHub Foundations',
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7362061040123043840/',
    },
    {
      code: 'AZ-900',
      name: 'Microsoft Azure Fundamentals',
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:7076850887209480192/',
    },
    {
      code: 'AWS',
      name: 'AWS Technical Essentials',
      url: 'https://www.linkedin.com/feed/update/urn:li:activity:6953699848885805056/',
    },
    {
      code: 'CEH v10',
      name: 'Certified Ethical Hacker',
      url: 'https://www.linkedin.com/posts/suman-sarkar-024641191_cehv10-certifiedethicalhacker-hacking-activity-6698965052562706432-4HQK/',
    },
  ],

  awards: [
    {
      title: 'Insta Award 2026',
      detail:
        'Infosys: recognised for a GitHub Copilot + Markdown solution that cut ticket delivery time by 40%.',
      url: 'https://www.linkedin.com/in/suman-sarkar-024641191/overlay/Honor/1631804228/treasury/?profileId=ACoAAC0fYtwBJOC16ebQgJw-ndQ7D-ZjfD-OWRY',
    },
    {
      title: 'Promotion to Senior Associate Consultant',
      detail:
        'Promoted from Associate Consultant at Infosys for strong technical contributions, consistent performance and project impact.',
      url: 'https://www.linkedin.com/in/suman-sarkar-024641191/overlay/Position/2966315133/treasury/?profileId=ACoAAC0fYtwBJOC16ebQgJw-ndQ7D-ZjfD-OWRY',
    },
  ],

  education: [
    {
      degree: 'Master of Computer Applications (MCA)',
      institution: 'Techno International Newtown',
      year: '2022',
    },
    {
      degree: 'Bachelor of Computer Applications (BCA)',
      institution: 'Siliguri Institute of Technology',
      year: '2020',
    },
  ],
};
