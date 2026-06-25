import { useEffect, useRef } from "react";
import type {
  Application as PixiApplication,
  Container as PixiContainer,
  Graphics as PixiGraphics,
} from "pixi.js";
import type { HTMLSource as PixiHTMLSource, HTMLSourceCanvas } from "pixi.js/html-source";

type PixiRuntime = typeof import("pixi.js");

type PixiCardOverlayProps = {
  label: string;
  reducedMotion: boolean;
  tone: number;
};

type Spark = {
  node: PixiGraphics;
  baseX: number;
  baseY: number;
  phase: number;
  speed: number;
};

type PixiTickerCallback = Parameters<PixiApplication["ticker"]["add"]>[0];

const toneColors = [0xbd6b5b, 0x527659, 0xd8965f];
const toneFills = [0xfae7dc, 0xedf4e8, 0xf7e1bc];

function canUploadHTMLSource(canvas: HTMLSourceCanvas) {
  if (!canvas.requestPaint) {
    return false;
  }

  const probe = document.createElement("canvas");
  const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");

  return Boolean(gl && "texElementImage2D" in gl);
}

function createHTMLChip(label: string) {
  const element = document.createElement("div");

  element.className = "pixi-card-html-chip";
  element.innerHTML = `
    <span>${label}</span>
    <strong>HTML in Canvas</strong>
  `;

  return element;
}

function createFallbackChip(pixi: PixiRuntime, label: string, toneColor: number, toneFill: number) {
  const chip = new pixi.Container();
  const panel = new pixi.Graphics()
    .roundRect(0, 0, 118, 42, 16)
    .fill({ color: toneFill, alpha: 0.86 })
    .stroke({ width: 1, color: 0xffffff, alpha: 0.82 });
  const small = new pixi.Text({
    text: label,
    style: {
      fill: toneColor,
      fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
      fontSize: 10,
      fontWeight: "800",
    },
  });
  const title = new pixi.Text({
    text: "HTML in Canvas",
    style: {
      fill: 0x11100e,
      fontFamily: "Inter, PingFang SC, Microsoft YaHei, sans-serif",
      fontSize: 11,
      fontWeight: "900",
    },
  });

  small.position.set(12, 8);
  title.position.set(12, 22);
  chip.addChild(panel, small, title);

  return chip;
}

function positionChip(chip: PixiContainer, width: number) {
  chip.position.set(Math.max(18, width - 142), 18);
}

function safeDestroyApp(app: PixiApplication | null) {
  if (!app) {
    return;
  }

  try {
    app.ticker.stop();
    app.destroy({ removeView: true }, { children: true });
  } catch (error) {
    console.warn("Pixi card cleanup skipped after renderer disposal.", error);
  }
}

function PixiCardOverlay({ label, reducedMotion, tone }: PixiCardOverlayProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host || reducedMotion || window.matchMedia("(max-width: 760px)").matches) {
      return;
    }

    const hostElement = host;
    let disposed = false;
    let app: PixiApplication | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let htmlElement: HTMLDivElement | null = null;
    let htmlSource: PixiHTMLSource | null = null;
    let chip: PixiContainer | null = null;
    let tickerCallback: PixiTickerCallback | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    let hasStarted = false;

    const card = hostElement.closest<HTMLElement>(".post-card") ?? hostElement;
    const toneColor = toneColors[tone % toneColors.length];
    const toneFill = toneFills[tone % toneFills.length];
    const pointer = {
      x: 0.72,
      y: 0.22,
      targetX: 0.72,
      targetY: 0.22,
      intensity: 0,
      targetIntensity: 0,
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = card.getBoundingClientRect();

      pointer.targetX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      pointer.targetY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      pointer.targetIntensity = 1;
    };
    const handlePointerEnter = () => {
      pointer.targetIntensity = 1;
    };
    const handlePointerLeave = () => {
      pointer.targetIntensity = 0;
    };

    async function setup() {
      const [pixi, htmlSourceModule] = await Promise.all([
        import("pixi.js"),
        import("pixi.js/html-source"),
      ]);
      const pixiApp = new pixi.Application();

      await pixiApp.init({
        width: Math.max(1, hostElement.clientWidth),
        height: Math.max(1, hostElement.clientHeight),
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
      pixiApp.canvas.className = "pixi-card-canvas";
      pixiApp.canvas.setAttribute("aria-hidden", "true");
      hostElement.appendChild(pixiApp.canvas);

      const frame = new pixi.Graphics();
      const glow = new pixi.Graphics();
      const scan = new pixi.Graphics();
      const beams = new pixi.Graphics();
      const sparks: Spark[] = Array.from({ length: 8 }, (_, index) => {
        const node = new pixi.Graphics()
          .circle(0, 0, 2.4 + (index % 3) * 0.8)
          .fill({ color: toneColor, alpha: 0.54 })
          .circle(0, 0, 8)
          .stroke({ width: 1, color: 0xffffff, alpha: 0.34 });

        return {
          node,
          baseX: 0,
          baseY: 0,
          phase: index * 1.31,
          speed: 0.0011 + index * 0.0001,
        };
      });

      pixiApp.stage.addChild(glow, beams, ...sparks.map((spark) => spark.node), scan, frame);

      const canvas = pixiApp.canvas as HTMLSourceCanvas;
      let htmlSourceAvailable = false;

      if (canUploadHTMLSource(canvas)) {
        htmlElement = createHTMLChip(label);
        canvas.appendChild(htmlElement);
        htmlSource = new htmlSourceModule.HTMLSource({
          resource: htmlElement,
          canvas,
          autoRequestPaint: false,
        });
        chip = pixi.Sprite.from(htmlSource);
        chip.alpha = 0.88;
        htmlSourceAvailable = true;
      } else {
        chip = createFallbackChip(pixi, label, toneColor, toneFill);
      }

      pixiApp.stage.addChild(chip);
      hostElement.dataset.pixiCardReady = "true";
      hostElement.dataset.htmlSource = htmlSourceAvailable ? "native" : "fallback";

      const resize = () => {
        const width = Math.max(1, hostElement.clientWidth);
        const height = Math.max(1, hostElement.clientHeight);

        pixiApp.renderer.resize(width, height);
        frame.clear().roundRect(1, 1, width - 2, height - 2, 14).stroke({
          width: 1,
          color: toneColor,
          alpha: 0.18,
        });
        scan.clear().roundRect(-36, 0, 34, height + 18, 16).fill({
          color: 0xffffff,
          alpha: 0.22,
        });
        scan.rotation = -0.16;
        sparks.forEach((spark, index) => {
          spark.baseX = width * (0.18 + ((index * 0.173) % 0.64));
          spark.baseY = height * (0.22 + ((index * 0.219) % 0.58));
        });
        if (chip) {
          positionChip(chip, width);
        }
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(hostElement);
      resize();

      card.addEventListener("pointermove", handlePointerMove);
      card.addEventListener("pointerenter", handlePointerEnter);
      card.addEventListener("pointerleave", handlePointerLeave);

      tickerCallback = () => {
        const width = pixiApp.screen.width;
        const height = pixiApp.screen.height;
        const time = performance.now();

        pointer.x += (pointer.targetX - pointer.x) * 0.12;
        pointer.y += (pointer.targetY - pointer.y) * 0.12;
        pointer.intensity += (pointer.targetIntensity - pointer.intensity) * 0.1;

        const activeX = pointer.x * width;
        const activeY = pointer.y * height;

        glow.clear();
        glow
          .circle(activeX, activeY, 72 + pointer.intensity * 36)
          .fill({ color: toneColor, alpha: 0.035 + pointer.intensity * 0.09 });

        beams.clear();
        beams
          .moveTo(width * 0.14, height * 0.8)
          .quadraticCurveTo(activeX, activeY, width * 0.88, height * 0.18)
          .stroke({ width: 1, color: toneColor, alpha: 0.1 + pointer.intensity * 0.18 });
        beams
          .moveTo(width * 0.08, height * 0.28)
          .quadraticCurveTo(activeX, activeY, width * 0.72, height * 0.94)
          .stroke({ width: 1, color: 0xffffff, alpha: 0.1 + pointer.intensity * 0.16 });

        scan.x = ((time * 0.047) % (width + 100)) - 52;
        scan.alpha = 0.36 + pointer.intensity * 0.28;

        sparks.forEach((spark, index) => {
          const sway = Math.sin(time * spark.speed + spark.phase);
          const drift = Math.cos(time * spark.speed * 0.72 + spark.phase);

          spark.node.position.set(
            spark.baseX + sway * (10 + pointer.intensity * 10),
            spark.baseY + drift * (8 + pointer.intensity * 8),
          );
          spark.node.alpha = 0.22 + Math.abs(sway) * 0.2 + pointer.intensity * 0.22;
          spark.node.scale.set(0.86 + pointer.intensity * 0.28 + Math.abs(drift) * 0.08);
        });

        if (chip) {
          chip.x += (Math.max(18, width - 142) + pointer.intensity * -8 - chip.x) * 0.08;
          chip.y += (18 + pointer.intensity * 6 - chip.y) * 0.08;
          chip.rotation = Math.sin(time * 0.0012) * 0.018 + pointer.intensity * (pointer.x - 0.5) * 0.045;
        }

        if (htmlElement) {
          htmlElement.style.setProperty("--chip-pulse", `${0.72 + pointer.intensity * 0.22 + Math.sin(time * 0.003) * 0.08}`);
          htmlSource?.requestPaint();
        }
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
    }

    const startSetup = () => {
      if (hasStarted) {
        return;
      }

      hasStarted = true;
      setup().catch((error) => {
        if (!disposed) {
          console.warn("Pixi card setup failed.", error);
        }
      });
    };

    if ("IntersectionObserver" in window) {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            intersectionObserver?.disconnect();
            startSetup();
          }
        },
        { rootMargin: "220px" },
      );
      intersectionObserver.observe(hostElement);
    } else {
      startSetup();
    }

    return () => {
      disposed = true;
      intersectionObserver?.disconnect();
      visibilityObserver?.disconnect();
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerenter", handlePointerEnter);
      card.removeEventListener("pointerleave", handlePointerLeave);
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
      delete hostElement.dataset.pixiCardReady;
      delete hostElement.dataset.htmlSource;
      safeDestroyApp(app);
    };
  }, [label, reducedMotion, tone]);

  return <div className="pixi-card-fx" ref={hostRef} aria-hidden="true" />;
}

export default PixiCardOverlay;
