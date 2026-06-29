import {
  ArrowUpRight,
  BookOpenText,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Code2,
  Copy,
  Gauge,
  Github,
  Mail,
  MoveUpRight,
  Send,
  Target,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import PixiAtmosphere from "./PixiAtmosphere";
import PixiCardOverlay from "./PixiCardOverlay";
import siteContentData from "./content/site-content.json";
import type { CapabilityIconName, SiteContent } from "./content/types";

type PostCategory = string;

const siteContent = siteContentData as SiteContent;
const {
  capabilities,
  faqs,
  footer,
  hero,
  highlights,
  navItems,
  profile,
  projects,
  sections,
  seo,
  stack,
  timeline,
  ui,
  writing,
} = siteContent;

const capabilityIcons: Record<CapabilityIconName, LucideIcon> = {
  code: Code2,
  gauge: Gauge,
  target: Target,
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function App() {
  const [activeCategory, setActiveCategory] = useState<PostCategory>(writing.filters[0]?.value ?? "all");
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = usePrefersReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = seo.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", seo.description);
  }, []);

  const filteredPosts = useMemo(
    () => writing.posts.filter((post) => activeCategory === "all" || post.category === activeCategory),
    [activeCategory],
  );

  useLayoutEffect(() => {
    if (shouldReduceMotion || !pageRef.current) {
      return;
    }

    let cancelled = false;
    let cleanupScrollMotion: (() => void) | undefined;

    async function setupScrollMotion() {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled || !pageRef.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const mm = gsap.matchMedia();
      const ctx = gsap.context(() => {
        const buildScrollMotion = (isSmall: boolean) => {
          const heroTrigger = {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.85,
          };

          gsap.set(
            [
              ".hero-copy",
              ".hero-visual",
              ".hero-visual img",
              ".hero-floating-card",
              ".visual-caption",
              ".showcase-card",
              ".showcase-copy",
              ".showcase-panel",
              ".showcase-prompt",
              ".stack-section",
              ".stack-cloud span",
            ],
            { force3D: true },
          );

          gsap.to(".hero-copy", {
            y: isSmall ? 0 : -64,
            opacity: isSmall ? 1 : 0.68,
            ease: "none",
            scrollTrigger: heroTrigger,
          });

          gsap.to(".hero-visual", {
            yPercent: isSmall ? 0 : -19,
            scale: isSmall ? 1 : 1.08,
            rotate: isSmall ? 0 : 1.4,
            ease: "none",
            scrollTrigger: heroTrigger,
          });

          gsap.to(".hero-visual img", {
            yPercent: isSmall ? 6 : 13,
            scale: isSmall ? 1.08 : 1.16,
            ease: "none",
            scrollTrigger: heroTrigger,
          });

          if (!isSmall) {
            gsap.to(".hero-floating-card-left", {
              x: -42,
              y: -138,
              rotate: -5,
              ease: "none",
              scrollTrigger: heroTrigger,
            });

            gsap.to(".hero-floating-card-right", {
              x: 48,
              y: 118,
              rotate: 5,
              ease: "none",
              scrollTrigger: heroTrigger,
            });

            gsap.to(".visual-caption", {
              x: 58,
              y: -92,
              rotate: -2,
              ease: "none",
              scrollTrigger: heroTrigger,
            });
          }

          gsap.utils.toArray<HTMLElement>(".showcase-card").forEach((card, index) => {
            const copy = card.querySelector<HTMLElement>(".showcase-copy");
            const mainPanel = card.querySelector<HTMLElement>(".showcase-panel-main");
            const stackPanel = card.querySelector<HTMLElement>(".showcase-panel-stack");
            const prompt = card.querySelector<HTMLElement>(".showcase-prompt");

            if (!copy || !mainPanel || !stackPanel || !prompt) {
              return;
            }

            const direction = index % 2 === 0 ? 1 : -1;

            gsap.fromTo(
              card,
              {
                y: isSmall ? 58 : 128,
                scale: isSmall ? 0.96 : 0.9,
                rotateX: isSmall ? 0 : 7,
                opacity: 0.58,
              },
              {
                y: 0,
                scale: 1,
                rotateX: 0,
                opacity: 1,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 92%",
                  end: isSmall ? "top 50%" : "top 34%",
                  scrub: 0.75,
                },
              },
            );

            gsap.fromTo(
              copy,
              { y: isSmall ? 20 : 74 },
              {
                y: isSmall ? -16 : -58,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );

            gsap.fromTo(
              mainPanel,
              {
                x: isSmall ? 0 : 32 * direction,
                y: isSmall ? 48 : 142,
                rotate: isSmall ? 0 : -4 * direction,
                scale: 0.96,
              },
              {
                x: isSmall ? 0 : -44 * direction,
                y: isSmall ? -50 : -190,
                rotate: isSmall ? 0 : 5 * direction,
                scale: isSmall ? 1.03 : 1.1,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );

            gsap.fromTo(
              stackPanel,
              {
                x: isSmall ? -12 : -72 * direction,
                y: isSmall ? -24 : -112,
                rotate: isSmall ? -1 : -8 * direction,
              },
              {
                x: isSmall ? 18 : 82 * direction,
                y: isSmall ? 72 : 156,
                rotate: isSmall ? 2 : 7 * direction,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );

            gsap.fromTo(
              prompt,
              {
                x: isSmall ? 18 : 86 * direction,
                y: isSmall ? 56 : 130,
                rotate: isSmall ? 1 : 6 * direction,
              },
              {
                x: isSmall ? -18 : -92 * direction,
                y: isSmall ? -40 : -138,
                rotate: isSmall ? -1 : -5 * direction,
                ease: "none",
                scrollTrigger: {
                  trigger: card,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });

          const stackSection = document.querySelector<HTMLElement>(".stack-section");
          const stackItems = gsap.utils.toArray<HTMLElement>(".stack-cloud span");

          if (stackSection && stackItems.length > 0) {
            gsap.fromTo(
              stackSection,
              {
                y: isSmall ? 24 : 72,
                scale: isSmall ? 1 : 0.97,
                opacity: 0.72,
              },
              {
                y: 0,
                scale: 1,
                opacity: 1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: stackSection,
                  start: "top 92%",
                  end: isSmall ? "top 54%" : "top 42%",
                  scrub: 0.75,
                },
              },
            );

            gsap.fromTo(
              stackItems,
              {
                y: isSmall ? 18 : 44,
                opacity: 0.28,
                rotate: isSmall ? 0 : -4,
                scale: 0.94,
              },
              {
                y: 0,
                opacity: 1,
                rotate: 0,
                scale: 1,
                ease: "power2.out",
                stagger: {
                  each: 0.035,
                  from: "start",
                },
                scrollTrigger: {
                  trigger: stackSection,
                  start: "top 84%",
                  end: isSmall ? "top 48%" : "top 36%",
                  scrub: 0.85,
                },
              },
            );
          }
        };

        mm.add("(min-width: 981px)", () => buildScrollMotion(false));
        mm.add("(max-width: 980px)", () => buildScrollMotion(true));
      }, pageRef);

      cleanupScrollMotion = () => {
        mm.revert();
        ctx.revert();
      };

      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }

    setupScrollMotion();

    return () => {
      cancelled = true;
      cleanupScrollMotion?.();
    };
  }, [shouldReduceMotion]);

  async function copyEmail() {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="page-shell" ref={pageRef}>
      <a className="skip-link" href="#main">
        {ui.skipLink}
      </a>

      <header className="site-header">
        <nav className="nav-shell" aria-label={ui.navAriaLabel}>
          <a className="brand" href="#top" aria-label={ui.brandAriaLabel}>
            <span className="brand-mark">{profile.initials}</span>
            <span>{profile.name}</span>
          </a>
          <div className="nav-links">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <a className="nav-action" href="#contact">
            <Send aria-hidden="true" />
            {ui.navAction}
          </a>
        </nav>
      </header>

      <main id="main">
        <section id="top" className="hero section-shell">
          <div
            className="hero-copy"
          >
            <p className="eyebrow">
              {hero.eyebrow}
            </p>
            <h1>{hero.title}</h1>
            <p className="hero-statement">
              {hero.statement}
            </p>
            <p className="hero-role">
              {profile.role}
            </p>
            <p className="hero-lede">
              {hero.lede}
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">
                <BriefcaseBusiness aria-hidden="true" />
                {ui.primaryAction}
              </a>
              <a className="button button-secondary" href="#writing">
                <BookOpenText aria-hidden="true" />
                {ui.secondaryAction}
              </a>
            </div>
            <dl className="proof-grid" aria-label={ui.proofAriaLabel}>
              {highlights.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure
            className="hero-visual"
          >
            <img
              src={hero.image.src}
              width={hero.image.width}
              height={hero.image.height}
              loading="eager"
              decoding="async"
              alt={hero.image.alt}
            />
            <PixiAtmosphere reducedMotion={Boolean(shouldReduceMotion)} />
            {hero.floatingCards.map((card) => (
              <div className={`hero-floating-card ${card.className}`} key={card.className}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
              </div>
            ))}
            <figcaption
              className="visual-caption"
            >
              <span>{hero.caption.label}</span>
              <strong>{hero.caption.value}</strong>
            </figcaption>
          </figure>
        </section>

        <RevealSection id="about" className="soft-band">
          <div className="section-heading">
            <p className="eyebrow">{sections.about.eyebrow}</p>
            <h2>{sections.about.title}</h2>
            <p>
              {sections.about.text}
            </p>
          </div>
          <div className="capability-grid">
            {capabilities.map((item) => {
              const Icon = capabilityIcons[item.icon];
              return (
                <article className="lift-card capability-card" key={item.title}>
                  <Icon aria-hidden="true" />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </RevealSection>

        <RevealSection id="projects" className="section-shell">
          <div className="section-heading compact">
            <p className="eyebrow">{sections.projects.eyebrow}</p>
            <h2>{sections.projects.title}</h2>
          </div>
          <div className="project-showcase-list">
            {projects.map((project, index) => (
              <ProjectShowcase project={project} index={index} key={project.name} />
            ))}
          </div>
        </RevealSection>

        <RevealSection id="writing" className="writing-band">
          <div className="section-heading">
            <p className="eyebrow">{sections.writing.eyebrow}</p>
            <h2>{sections.writing.title}</h2>
            <p>{sections.writing.text}</p>
          </div>
          <div className="filter-bar" role="group" aria-label={writing.filterAriaLabel}>
            {writing.filters.map(({ value, label }) => (
              <button
                className={activeCategory === value ? "is-active" : ""}
                type="button"
                key={value}
                aria-pressed={activeCategory === value}
                onClick={() => setActiveCategory(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="post-grid" aria-live={writing.postGridAriaLive}>
              {filteredPosts.map((post, index) => (
                <article
                  className="lift-card post-card"
                  key={post.title}
                >
                  <PixiCardOverlay label={post.label} reducedMotion={Boolean(shouldReduceMotion)} tone={index} />
                  <span className="post-kicker">{post.label} · {post.read}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <a href="#contact">
                    {writing.ctaLabel}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </article>
              ))}
          </div>
        </RevealSection>

        <RevealSection id="experience" className="section-shell split-section">
          <div className="section-heading sticky-heading">
            <p className="eyebrow">{sections.experience.eyebrow}</p>
            <h2>{sections.experience.title}</h2>
            <p>{profile.city}。{sections.experience.text}</p>
          </div>
          <ol className="timeline">
            {timeline.map((item) => (
              <li className="lift-card" key={item.time}>
                <span>{item.time}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </RevealSection>

        <RevealSection className="soft-band stack-section">
          <div className="section-heading compact">
            <p className="eyebrow">{sections.stack.eyebrow}</p>
            <h2>{sections.stack.title}</h2>
          </div>
          <div className="stack-cloud" aria-label="技术栈">
            {stack.map((item) => (
              <span key={item}>
                {item}
              </span>
            ))}
          </div>
        </RevealSection>

        <RevealSection className="section-shell faq-section">
          <div className="section-heading compact">
            <p className="eyebrow">{sections.faq.eyebrow}</p>
            <h2>{sections.faq.title}</h2>
          </div>
          <div className="faq-list">
            {faqs.map((item, index) => (
              <details key={item.q} open={index === 0}>
                <summary>
                  {item.q}
                  <ChevronDown aria-hidden="true" />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </RevealSection>

        <RevealSection id="contact" className="contact-band">
          <div>
            <p className="eyebrow">{sections.contact.eyebrow}</p>
            <h2>{sections.contact.title}</h2>
            <p>{sections.contact.text}</p>
          </div>
          <div className="contact-actions">
            <a className="button button-primary" href={`mailto:${profile.email}`}>
              <Mail aria-hidden="true" />
              {profile.email}
            </a>
            <button className="button button-secondary" type="button" onClick={copyEmail}>
              <Copy aria-hidden="true" />
              {copied ? ui.copiedEmail : ui.copyEmail}
            </button>
            <a className="button button-ghost" href={`https://${profile.github}`}>
              <Github aria-hidden="true" />
              {profile.github}
            </a>
          </div>
        </RevealSection>
      </main>

      <footer className="site-footer">
        <span>{footer.copyright}</span>
        <a href="#top">
          {ui.footerBackToTop}
          <MoveUpRight aria-hidden="true" />
        </a>
      </footer>
    </div>
  );
}

function RevealSection({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      className={`${className} reveal-section${isVisible ? " is-visible" : ""}`}
      ref={sectionRef}
    >
      {children}
    </section>
  );
}

function ProjectShowcase({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  return (
    <article className={`showcase-card showcase-card-${index + 1}`}>
      <div className="showcase-copy">
        <div className="project-index">
          <span>{project.index}</span>
          <CheckCircle2 aria-hidden="true" />
        </div>
        <p className="project-name">{project.name}</p>
        <h3>{project.result}</h3>
        <p>{project.text}</p>
        <ul className="tag-list" aria-label={`${project.name} 技术标签`}>
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>

      <div className="showcase-visual" aria-hidden="true">
        <div className="showcase-panel showcase-panel-main">
          <div className="panel-bar">
            <span />
            <span />
            <span />
          </div>
          <div className="panel-title-row">
            <strong>{project.name}</strong>
            <small>case {project.index}</small>
          </div>
          <div className="panel-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="showcase-panel showcase-panel-stack">
          <span className="mini-label">Evidence</span>
          <strong>{project.visual.evidenceLabel}</strong>
          <small>{project.visual.evidenceValue}</small>
        </div>
        <div className="showcase-prompt">
          <span>@</span>
          <p>{project.visual.prompt}</p>
        </div>
      </div>
    </article>
  );
}

export default App;



