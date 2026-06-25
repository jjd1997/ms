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
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import PixiAtmosphere from "./PixiAtmosphere";
import PixiCardOverlay from "./PixiCardOverlay";

type PostCategory = "all" | "engineering" | "product" | "interview";

const profile = {
  name: "林澈",
  role: "前端工程师 / Web 产品工程候选人",
  email: "linche.dev@example.com",
  github: "github.com/linche-dev",
  city: "上海，可远程协作",
};

const navItems = [
  { label: "能力", href: "#about" },
  { label: "项目", href: "#projects" },
  { label: "文章", href: "#writing" },
  { label: "经历", href: "#experience" },
  { label: "联系", href: "#contact" },
];

const highlights = [
  { label: "经验", value: "4 年 Web 产品工程" },
  { label: "主线", value: "React / Vue / TypeScript" },
  { label: "优势", value: "复杂表单、数据看板、体验优化" },
];

const capabilities = [
  {
    icon: Target,
    title: "业务拆解",
    text: "能把模糊需求拆成角色、路径、边界、验收口径，再推动到可评审方案。",
  },
  {
    icon: Code2,
    title: "工程实现",
    text: "习惯用类型、组件边界、状态模型和测试把功能写成能长期维护的代码。",
  },
  {
    icon: Gauge,
    title: "体验治理",
    text: "关注首屏速度、交互反馈、空状态、错误态和可访问性，不让细节消耗用户信任。",
  },
];

const projects = [
  {
    index: "01",
    name: "B2B 订单履约工作台",
    result: "把客服处理时长从平均 18 分钟降到 9 分钟",
    text: "负责筛选模型、订单时间线、异常状态聚合和批量操作体验。重构后业务人员可以在一个页面完成查询、判断、备注和流转，不再跨多个后台来回切换。",
    tags: ["React", "TypeScript", "TanStack Query", "Design Review"],
  },
  {
    index: "02",
    name: "低代码表单配置平台",
    result: "支撑 30+ 个业务流程复用同一套字段与校验协议",
    text: "抽象字段模型、联动规则、异步校验和权限控制，保留关键节点定制能力。这个项目最能说明我如何在灵活性和工程约束之间做取舍。",
    tags: ["Vue 3", "Element Plus", "Schema Form", "DX"],
  },
  {
    index: "03",
    name: "数据分析看板性能治理",
    result: "首屏可交互时间减少约 42%，图表切换更稳定",
    text: "针对接口瀑布流、重复渲染、图表实例泄漏和大列表卡顿做专项优化，并补齐加载、空状态和错误恢复路径。",
    tags: ["Performance", "Charts", "Profiling", "UX"],
  },
];

const posts = [
  {
    category: "engineering" as const,
    label: "工程",
    title: "表单系统失控之前，应该先定义什么",
    excerpt: "字段协议、校验生命周期、联动边界和错误展示策略，是复杂表单能否稳定复用的核心。",
    read: "8 min",
  },
  {
    category: "product" as const,
    label: "产品",
    title: "为什么数据看板不能只堆图表",
    excerpt: "看板真正要解决的是判断路径，图表只是表达工具；首屏必须回答最重要的问题。",
    read: "6 min",
  },
  {
    category: "interview" as const,
    label: "面试",
    title: "项目复盘里，我会主动讲的五个问题",
    excerpt: "背景、约束、方案、结果、如果重做会改什么，这五件事比技术名词更能证明经验。",
    read: "5 min",
  },
  {
    category: "engineering" as const,
    label: "工程",
    title: "一次前端性能优化的完整记录",
    excerpt: "从 Lighthouse 分数到真实用户路径，记录定位、验证和防回退的全过程。",
    read: "10 min",
  },
];

const timeline = [
  {
    time: "2024 - 现在",
    title: "前端工程师，负责核心业务工作台",
    text: "承担需求评审、页面架构、复杂交互实现、性能治理和上线复盘，重点服务运营、客服和数据团队。",
  },
  {
    time: "2022 - 2024",
    title: "Web 开发工程师，参与平台化建设",
    text: "参与表单引擎、权限组件、公共请求层和设计规范落地，减少重复开发并提高交付一致性。",
  },
  {
    time: "持续进行",
    title: "技术写作与项目复盘",
    text: "把线上问题、方案比较和组件设计沉淀成文章，用于团队知识共享和面试沟通。",
  },
];

const stack = [
  "TypeScript",
  "React",
  "Vue 3",
  "Vite",
  "Node.js",
  "CSS Architecture",
  "GSAP ScrollTrigger",
  "Accessibility",
  "Performance",
  "Testing",
  "Code Review",
  "Documentation",
];

const faqs = [
  {
    q: "林澈最适合什么样的岗位？",
    a: "适合需要兼顾产品理解、复杂前端实现和交付质量的岗位，尤其是中后台、数据产品、流程平台和增长工具。",
  },
  {
    q: "面试时最值得展开聊什么？",
    a: "建议从 B2B 订单履约工作台和低代码表单平台展开，这两个项目最能体现需求拆解、工程取舍和协作方式。",
  },
  {
    q: "他如何和设计、后端、业务协作？",
    a: "先把目标、限制和验收口径写清楚，再用可评审原型或技术方案推进。上线后会关注真实使用路径和问题回收。",
  },
];

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
  const [activeCategory, setActiveCategory] = useState<PostCategory>("all");
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = usePrefersReducedMotion();
  const pageRef = useRef<HTMLDivElement>(null);

  const filteredPosts = useMemo(
    () => posts.filter((post) => activeCategory === "all" || post.category === activeCategory),
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
        跳到主要内容
      </a>

      <header className="site-header">
        <nav className="nav-shell" aria-label="主导航">
          <a className="brand" href="#top" aria-label="回到首页">
            <span className="brand-mark">LC</span>
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
            约面试
          </a>
        </nav>
      </header>

      <main id="main">
        <section id="top" className="hero section-shell">
          <div
            className="hero-copy"
          >
            <p className="eyebrow">
              Interview-ready personal blog
            </p>
            <h1>林澈</h1>
            <p className="hero-statement">
              把复杂业务做成清爽、稳定、可持续迭代的 Web 产品。
            </p>
            <p className="hero-role">
              前端工程师 / Web 产品工程候选人
            </p>
            <p className="hero-lede">
              我做过订单履约、低代码表单、数据分析看板，也写技术复盘。比起只展示技术栈，我更希望面试官看到我如何理解问题、做取舍、交付结果。
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">
                <BriefcaseBusiness aria-hidden="true" />
                看项目证据
              </a>
              <a className="button button-secondary" href="#writing">
                <BookOpenText aria-hidden="true" />
                看文章思路
              </a>
            </div>
            <dl className="proof-grid" aria-label="候选人摘要">
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
              src="/assets/hero-workspace.png"
              width="1536"
              height="864"
              loading="eager"
              decoding="async"
              alt="明亮桌面上的笔记本电脑、键盘、笔记本和书写工具"
            />
            <PixiAtmosphere reducedMotion={Boolean(shouldReduceMotion)} />
            <div
              className="hero-floating-card hero-floating-card-left"
            >
              <span>Context</span>
              <strong>需求背景 / 异常流转 / 复盘结论</strong>
            </div>
            <div
              className="hero-floating-card hero-floating-card-right"
            >
              <span>Signal</span>
              <strong>42% faster interaction</strong>
            </div>
            <figcaption
              className="visual-caption"
            >
              <span>Latest note</span>
              <strong>订单履约工作台复盘：从 18 分钟到 9 分钟</strong>
            </figcaption>
          </figure>
        </section>

        <RevealSection id="about" className="soft-band">
          <div className="section-heading">
            <p className="eyebrow">How I work</p>
            <h2>不是堆素材，而是让面试官更快判断匹配度。</h2>
            <p>
              这个页面按「能力线索 - 项目证据 - 文章沉淀 - 协作方式」组织，所有内容都服务于一次高质量面试沟通。
            </p>
          </div>
          <div className="capability-grid">
            {capabilities.map((item) => {
              const Icon = item.icon;
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
            <p className="eyebrow">Selected work</p>
            <h2>三个项目，覆盖业务、平台和性能。</h2>
          </div>
          <div className="project-showcase-list">
            {projects.map((project, index) => (
              <ProjectShowcase project={project} index={index} key={project.name} />
            ))}
          </div>
        </RevealSection>

        <RevealSection id="writing" className="writing-band">
          <div className="section-heading">
            <p className="eyebrow">Writing</p>
            <h2>文章展示的是判断过程，不只是笔记。</h2>
            <p>分类切换、卡片入场和悬停反馈都做成了可感知动画，页面不再只是静态排版。</p>
          </div>
          <div className="filter-bar" role="group" aria-label="文章分类筛选">
            {[
              ["all", "全部"],
              ["engineering", "工程"],
              ["product", "产品"],
              ["interview", "面试"],
            ].map(([value, label]) => (
              <button
                className={activeCategory === value ? "is-active" : ""}
                type="button"
                key={value}
                aria-pressed={activeCategory === value}
                onClick={() => setActiveCategory(value as PostCategory)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="post-grid" aria-live="polite">
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
                    讨论这篇
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </article>
              ))}
          </div>
        </RevealSection>

        <RevealSection id="experience" className="section-shell split-section">
          <div className="section-heading sticky-heading">
            <p className="eyebrow">Experience</p>
            <h2>经历按能力成长组织，方便面试深入追问。</h2>
            <p>{profile.city}。我希望下一段工作能继续靠近复杂业务、高质量工程和可靠团队协作。</p>
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
            <p className="eyebrow">Stack</p>
            <h2>技术栈和协作习惯</h2>
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
            <p className="eyebrow">FAQ</p>
            <h2>面试前最常被问到的事</h2>
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
            <p className="eyebrow">Contact</p>
            <h2>如果岗位需要一个能把产品、工程和体验串起来的人，可以约林澈聊聊。</h2>
            <p>欢迎把 JD、团队背景或希望重点讨论的问题发到邮箱。我会用项目证据和复盘过程回答。</p>
          </div>
          <div className="contact-actions">
            <a className="button button-primary" href={`mailto:${profile.email}`}>
              <Mail aria-hidden="true" />
              {profile.email}
            </a>
            <button className="button button-secondary" type="button" onClick={copyEmail}>
              <Copy aria-hidden="true" />
              {copied ? "已复制" : "复制邮箱"}
            </button>
            <a className="button button-ghost" href={`https://${profile.github}`}>
              <Github aria-hidden="true" />
              {profile.github}
            </a>
          </div>
        </RevealSection>
      </main>

      <footer className="site-footer">
        <span>© 2026 林澈</span>
        <a href="#top">
          回到顶部
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
          <strong>{index === 0 ? "流程时间线" : index === 1 ? "字段协议" : "性能快照"}</strong>
          <small>{index === 0 ? "9 min avg" : index === 1 ? "30+ flows" : "-42% TTI"}</small>
        </div>
        <div className="showcase-prompt">
          <span>@</span>
          <p>{index === 0 ? "把异常订单和处理建议放在同一上下文" : index === 1 ? "先定义字段，再允许配置自由度" : "先定位真实瓶颈，再谈优化手段"}</p>
        </div>
      </div>
    </article>
  );
}

export default App;



