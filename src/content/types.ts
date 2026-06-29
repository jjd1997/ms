export type CapabilityIconName = "target" | "code" | "gauge";

interface ContentLink {
  href: string;
  label: string;
}

export interface SiteContent {
  seo: {
    title: string;
    description: string;
  };
  profile: {
    name: string;
    initials: string;
    role: string;
    email: string;
    github: string;
    city: string;
  };
  ui: {
    skipLink: string;
    navAriaLabel: string;
    brandAriaLabel: string;
    navAction: string;
    primaryAction: string;
    secondaryAction: string;
    proofAriaLabel: string;
    copyEmail: string;
    copiedEmail: string;
    footerBackToTop: string;
  };
  navItems: Array<{
    label: string;
    href: string;
  }>;
  hero: {
    eyebrow: string;
    title: string;
    statement: string;
    lede: string;
    image: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
    floatingCards: Array<{
      className: "hero-floating-card-left" | "hero-floating-card-right";
      label: string;
      value: string;
    }>;
    caption: {
      label: string;
      value: string;
    };
  };
  highlights: Array<{
    label: string;
    value: string;
  }>;
  sections: {
    about: SectionCopy;
    projects: Pick<SectionCopy, "eyebrow" | "title">;
    lab: SectionCopy;
    writing: SectionCopy;
    experience: SectionCopy;
    stack: Pick<SectionCopy, "eyebrow" | "title">;
    faq: Pick<SectionCopy, "eyebrow" | "title">;
    contact: SectionCopy;
  };
  capabilities: Array<{
    icon: CapabilityIconName;
    title: string;
    text: string;
  }>;
  projects: Array<{
    index: string;
    name: string;
    result: string;
    text: string;
    tags: string[];
    links: ContentLink[];
    visual: {
      evidenceLabel: string;
      evidenceValue: string;
      prompt: string;
    };
  }>;
  lab: {
    items: Array<{
      title: string;
      status: string;
      text: string;
      href: string;
      tags: string[];
    }>;
  };
  writing: {
    filterAriaLabel: string;
    postGridAriaLive: "off" | "polite" | "assertive";
    ctaLabel: string;
    filters: Array<{
      value: string;
      label: string;
    }>;
    posts: Array<{
      category: string;
      label: string;
      title: string;
      excerpt: string;
      read: string;
    }>;
  };
  timeline: Array<{
    time: string;
    title: string;
    text: string;
  }>;
  stack: string[];
  faqs: Array<{
    q: string;
    a: string;
  }>;
  footer: {
    copyright: string;
  };
}

interface SectionCopy {
  eyebrow: string;
  title: string;
  text: string;
}
