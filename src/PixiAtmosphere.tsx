import { useEffect, useRef } from "react";
import type {
  Application as PixiApplication,
  Container as PixiContainer,
  Graphics as PixiGraphics,
} from "pixi.js";
import type { HTMLSource as PixiHTMLSource, HTMLSourceCanvas } from "pixi.js/html-source";

type PixiRuntime = typeof import("pixi.js");

type PixiAtmosphereProps = {
  reducedMotion: boolean;
};

type DriftNode = {
  node: PixiGraphics;
  baseX: number;
  baseY: number;
  radius: number;
  speed: number;
  phase: number;
};

type CanvasCardEffects = {
  sheen: PixiGraphics;
  accents: PixiGraphics[];
  dots: PixiGraphics[];
};

type PixiTickerCallback = Parameters<PixiApplication["ticker"]["add"]>[0];

const palette = [0xe8f0e5, 0xf5cda2, 0xbdd8c0, 0xd6e5e8];
const flowPalette = [0x527659, 0xbd6b5b, 0xd8965f];
const cardWidth = 250;
const cardHeight = 116;

function canUploadHTMLSource(canvas: HTMLSourceCanvas) {
  if (!canvas.requestPaint) {
    return false;
  }

  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");

  return Boolean(gl && "texElementImage2D" in gl);
}

function drawSoftPanel(GraphicsClass: PixiRuntime["Graphics"], width: number, height: number) {
  return new GraphicsClass()
    .roundRect(0, 0, width, height, 20)
    .fill({ color: 0xfffcf5, alpha: 0.86 })
    .stroke({ width: 1, color: 0xffffff, alpha: 0.92 });
}

function createPixiFallbackCard(pixi: PixiRuntime) {
  const card = new pixi.Container();
  const panel = drawSoftPanel(pixi.Graphics, cardWidth, cardHeight);
  const innerGlow = new pixi.Graphics()
    .roundRect(10, 10, cardWidth - 20, cardHeight - 20, 16)
    .stroke({ width: 1, color: 0xf5cda2, alpha: 0.32 });
  const gridLine = new pixi.Graphics();
  const sheen = new pixi.Graphics()
    .roundRect(0, 0, 44, 142, 18)
    .fill({ color: 0xffffff, alpha: 0.28 });
  const accentA = new pixi.Graphics().roundRect(0, 0, 52, 4, 2).fill({ color: 0x527659, alpha: 0.46 });
  const accentB = new pixi.Graphics().roundRect(0, 0, 72, 4, 2).fill({ color: 0xbd6b5b, alpha: 0.42 });
  const dots = [0x527659, 0xbd6b5b, 0xd8965f].map((color, index) => {
    const dot = new pixi.Graphics()
      .circle(0, 0, 4.5)
      .fill({ color, alpha: 0.92 })
      .circle(0, 0, 9)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.5 });

    dot.position.set(156 + index * 22, 89);
    return dot;
  });
  const label = new pixi.Text({
    text: "HTMLSource card",
    style: {
      fill: 0xbd6b5b,
      fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
      fontSize: 12,
      fontWeight: "800",
    },
  });
  const title = new pixi.Text({
    text: "把 DOM 卡片送进 Pixi",
    style: {
      fill: 0x11100e,
      fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
      fontSize: 16,
      fontWeight: "800",
    },
  });
  const note = new pixi.Text({
    text: "原生支持时就是 HTML-in-Canvas",
    style: {
      fill: 0x74706a,
      fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
      fontSize: 11,
      fontWeight: "700",
    },
  });
  const metric = new pixi.Text({
    text: "live texture / scroll reactive",
    style: {
      fill: 0x527659,
      fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
      fontSize: 11,
      fontWeight: "800",
    },
  });

  for (let index = 0; index < 5; index += 1) {
    gridLine
      .moveTo(18 + index * 43, 78)
      .lineTo(34 + index * 43, 102)
      .stroke({ width: 1, color: 0xffffff, alpha: 0.28 });
  }

  label.position.set(16, 13);
  title.position.set(16, 34);
  note.position.set(16, 58);
  metric.position.set(16, 84);
  accentA.position.set(16, 101);
  accentB.position.set(76, 101);
  sheen.position.set(-62, -18);
  sheen.rotation = -0.42;
  card.addChild(panel, innerGlow, gridLine, sheen, label, title, note, metric, accentA, accentB, ...dots);

  return {
    card,
    effects: {
      sheen,
      accents: [accentA, accentB],
      dots,
    },
  };
}

function createHTMLSourceElement() {
  const element = document.createElement("div");
  element.className = "html-source-card";
  element.innerHTML = `
    <i class="html-source-card__grid"></i>
    <i class="html-source-card__sheen"></i>
    <span>HTMLSource card</span>
    <strong>把 DOM 卡片送进 Pixi</strong>
    <small>原生支持时就是 HTML-in-Canvas</small>
    <em>live texture / scroll reactive</em>
    <b class="html-source-card__dots"><i></i><i></i><i></i></b>
  `;

  return element;
}

function getQuadraticPoint(
  start: { x: number; y: number },
  control: { x: number; y: number },
  end: { x: number; y: number },
  progress: number,
) {
  const inverse = 1 - progress;

  return {
    x: inverse * inverse * start.x + 2 * inverse * progress * control.x + progress * progress * end.x,
    y: inverse * inverse * start.y + 2 * inverse * progress * control.y + progress * progress * end.y,
  };
}

function safeDestroyApp(app: PixiApplication | null) {
  if (!app) {
    return;
  }

  try {
    app.ticker.stop();
    app.destroy({ removeView: true }, { children: true });
  } catch (error) {
    console.warn("Pixi atmosphere cleanup skipped after renderer disposal.", error);
  }
}

function layoutScene(
  app: PixiApplication,
  particles: DriftNode[],
  card: PixiContainer,
  scrollProgress: number,
) {
  const width = app.screen.width;
  const height = app.screen.height;
  const diagonal = Math.hypot(width, height);

  particles.forEach((particle, index) => {
    particle.baseX = width * (0.14 + ((index * 0.137) % 0.74));
    particle.baseY = height * (0.2 + ((index * 0.223) % 0.58));
    particle.radius = Math.max(18, diagonal * (0.018 + (index % 4) * 0.005));
    particle.node.width = particle.radius * 2.6;
    particle.node.height = particle.radius * 1.35;
  });

  card.position.set(Math.max(24, width * 0.06), Math.max(22, height * 0.13 - scrollProgress * 16));
  card.scale.set(width < 520 ? 0.76 : 1);
  card.alpha = width < 520 ? 0.66 : 0.92;
}

function PixiAtmosphere({ reducedMotion }: PixiAtmosphereProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host || reducedMotion || window.matchMedia("(max-width: 640px)").matches) {
      return;
    }

    let disposed = false;
    let app: PixiApplication | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let htmlElement: HTMLDivElement | null = null;
    let htmlSource: PixiHTMLSource | null = null;
    let tickerCallback: PixiTickerCallback | null = null;
    let idleCallbackId: number | null = null;
    let fallbackTimerId: number | null = null;
    let visibilityObserver: IntersectionObserver | null = null;

    const hostElement = host;

    async function setup() {
      const [pixi, htmlSourceModule] = await Promise.all([
        import("pixi.js"),
        import("pixi.js/html-source"),
      ]);
      const width = Math.max(1, hostElement.clientWidth);
      const height = Math.max(1, hostElement.clientHeight);
      const pixiApp = new pixi.Application();

      await pixiApp.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        preference: "webgl",
        powerPreference: "low-power",
      });

      if (disposed) {
        safeDestroyApp(pixiApp);
        return;
      }

      app = pixiApp;
      pixiApp.canvas.className = "pixi-canvas";
      pixiApp.canvas.setAttribute("aria-hidden", "true");
      hostElement.appendChild(pixiApp.canvas);

      const atmosphere = new pixi.Container();
      const flow = new pixi.Graphics();
      const particles: DriftNode[] = [];

      for (let index = 0; index < 20; index += 1) {
        const particle = new pixi.Graphics()
          .roundRect(-30, -4, 60, 8, 4)
          .fill({ color: palette[index % palette.length], alpha: 0.34 + (index % 3) * 0.055 })
          .roundRect(-10, -2, 20, 4, 2)
          .fill({ color: 0xffffff, alpha: 0.42 });

        particle.rotation = (index % 5) * 0.12;
        atmosphere.addChild(particle);
        particles.push({
          node: particle,
          baseX: 0,
          baseY: 0,
          radius: 38,
          speed: 0.00038 + index * 0.000018,
          phase: index * 1.7,
        });
      }

      const grid = new pixi.Graphics();
      grid.alpha = 0.34;
      atmosphere.addChild(grid);
      atmosphere.addChild(flow);
      pixiApp.stage.addChild(atmosphere);

      const canvas = pixiApp.canvas as HTMLSourceCanvas;
      const fallbackCard = createPixiFallbackCard(pixi);
      let card: PixiContainer = fallbackCard.card;
      let cardEffects: CanvasCardEffects | null = fallbackCard.effects;
      let htmlSourceAvailable = false;

      if (canUploadHTMLSource(canvas)) {
        const element = createHTMLSourceElement();

        htmlElement = element;
        canvas.appendChild(element);
        htmlSource = new htmlSourceModule.HTMLSource({
          resource: element,
          canvas,
          autoRequestPaint: false,
        });
        const sprite = pixi.Sprite.from(htmlSource);

        sprite.alpha = 0.82;
        card = sprite;
        cardEffects = null;
        htmlSourceAvailable = true;
      }

      hostElement.dataset.htmlSource = htmlSourceAvailable ? "native" : "fallback";
      hostElement.dataset.pixiReady = "true";
      pixiApp.stage.addChild(card);

      const scrollProgress = 0;

      const drawGrid = () => {
        const widthNow = pixiApp.screen.width;
        const heightNow = pixiApp.screen.height;

        grid.clear();
        for (let x = -80; x < widthNow + 110; x += 92) {
          grid
            .moveTo(x, heightNow * 0.08)
            .lineTo(x + heightNow * 0.3, heightNow * 0.92)
            .stroke({ width: 1, color: 0xfffcf5, alpha: 0.18 });
        }
      };

      const drawFlow = (time: number) => {
        const widthNow = pixiApp.screen.width;
        const heightNow = pixiApp.screen.height;

        flow.clear();

        for (let index = 0; index < 3; index += 1) {
          const start = { x: widthNow * 0.16, y: heightNow * (0.28 + index * 0.18) - scrollProgress * 16 };
          const control = {
            x: widthNow * (0.42 + index * 0.07),
            y: heightNow * (0.16 + index * 0.18) + Math.sin(time * 0.00055 + index) * 16,
          };
          const end = { x: widthNow * 0.86, y: heightNow * (0.34 + index * 0.15) - scrollProgress * 34 };
          const progress = (time * 0.00013 + index * 0.32 + scrollProgress * 0.16) % 1;
          const marker = getQuadraticPoint(start, control, end, progress);
          const color = flowPalette[index % flowPalette.length];

          flow
            .moveTo(start.x, start.y)
            .quadraticCurveTo(control.x, control.y, end.x, end.y)
            .stroke({ width: 1.6, color, alpha: 0.35 });
          flow.circle(marker.x, marker.y, 4.8).fill({ color, alpha: 0.82 });
          flow.circle(marker.x, marker.y, 10 + Math.sin(time * 0.002 + index) * 2).stroke({
            width: 1,
            color: 0xffffff,
            alpha: 0.48,
          });
        }
      };

      const resize = () => {
        const nextWidth = Math.max(1, hostElement.clientWidth);
        const nextHeight = Math.max(1, hostElement.clientHeight);

        pixiApp.renderer.resize(nextWidth, nextHeight);
        drawGrid();
        layoutScene(pixiApp, particles, card, scrollProgress);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(hostElement);
      resize();

      tickerCallback = (ticker) => {
        const time = performance.now();

        particles.forEach((particle, index) => {
          const sway = Math.sin(time * particle.speed + particle.phase);
          const lift = Math.cos(time * (particle.speed * 0.74) + particle.phase);

          particle.node.position.set(
            particle.baseX + sway * (22 + index * 0.65),
            particle.baseY + lift * 15 - scrollProgress * (24 + index * 0.9),
          );
          particle.node.rotation += 0.0019 * ticker.deltaTime * (index % 2 ? 1 : -1);
          particle.node.alpha = 0.24 + Math.abs(sway) * 0.24;
        });

        drawFlow(time);

        if (cardEffects) {
          const sweep = ((time * 0.055) % (cardWidth + 130)) - 84;

          cardEffects.sheen.x = sweep;
          cardEffects.sheen.alpha = 0.1 + Math.sin(time * 0.003) * 0.05;
          cardEffects.accents.forEach((accent, index) => {
            accent.scale.x = 0.82 + Math.sin(time * 0.0022 + index * 1.8) * 0.18;
          });
          cardEffects.dots.forEach((dot, index) => {
            const pulse = 1 + Math.sin(time * 0.003 + index * 1.35) * 0.22;

            dot.scale.set(pulse);
            dot.alpha = 0.72 + Math.sin(time * 0.0025 + index) * 0.22;
          });
        } else if (htmlElement) {
          htmlElement.style.setProperty("--card-sweep", `${((time * 0.055) % (cardWidth + 130)) - 84}px`);
          htmlElement.style.setProperty("--card-pulse", `${0.74 + Math.sin(time * 0.003) * 0.18}`);
        }

        card.y += (Math.max(22, pixiApp.screen.height * 0.13 - scrollProgress * 24) - card.y) * 0.08;
        card.x += (Math.max(24, pixiApp.screen.width * 0.06 + scrollProgress * 16) - card.x) * 0.08;
        card.rotation = Math.sin(time * 0.00035) * 0.018;
        htmlSource?.requestPaint();
      };
      pixiApp.ticker.maxFPS = 30;
      pixiApp.ticker.add(tickerCallback);

      if ("IntersectionObserver" in window) {
        visibilityObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              pixiApp.ticker.start();
            } else {
              pixiApp.ticker.stop();
            }
          },
          { threshold: 0.02 },
        );
        visibilityObserver.observe(hostElement);
      }

      return undefined;
    }

    let removeScrollListener: (() => void) | undefined;

    const startSetup = () => {
      setup()
        .then((cleanup) => {
          removeScrollListener = cleanup;
        })
        .catch((error) => {
          if (!disposed) {
            console.warn("Pixi atmosphere setup failed.", error);
          }
        });
    };

    if ("requestIdleCallback" in window) {
      idleCallbackId = window.requestIdleCallback(startSetup, { timeout: 1200 });
    } else {
      fallbackTimerId = globalThis.setTimeout(startSetup, 180);
    }

    return () => {
      disposed = true;
      if (idleCallbackId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleCallbackId);
      }
      if (fallbackTimerId !== null) {
        window.clearTimeout(fallbackTimerId);
      }
      visibilityObserver?.disconnect();
      removeScrollListener?.();
      resizeObserver?.disconnect();
      if (app && tickerCallback) {
        app.ticker.remove(tickerCallback);
      }
      try {
        htmlSource?.destroy();
      } catch (error) {
        console.warn("Pixi HTMLSource cleanup skipped.", error);
      }
      htmlElement?.remove();
      delete hostElement.dataset.htmlSource;
      delete hostElement.dataset.pixiReady;
      safeDestroyApp(app);
    };
  }, [reducedMotion]);

  return <div className="pixi-layer" ref={hostRef} aria-hidden="true" />;
}

export default PixiAtmosphere;
