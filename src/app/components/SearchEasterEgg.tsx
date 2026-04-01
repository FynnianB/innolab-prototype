import { ThumbsUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type SearchEasterEggKind =
  | "hsv"
  | "fireworks"
  | "bvbTire"
  | "schalke"
  | "thumbUp";

export type SearchEasterEggSpec = {
  kind: SearchEasterEggKind;
  caption: string;
};

/** Exakte Suchstrings (Groß-/Kleinschreibung) → Effekt */
export const SEARCH_EASTER_EGG_SPECS: Record<string, SearchEasterEggSpec> = {
  Fynnian: { kind: "hsv", caption: "Nur der HSV! ⚽" },
  Robert: { kind: "fireworks", caption: "Feuer frei! 🎆" },
  Louis: { kind: "bvbTire", caption: "" },
  Golo: { kind: "schalke", caption: "Glück auf! ⛏️" },
  Inesa: { kind: "thumbUp", caption: "Daumen hoch! 👍" },
};

export function isSearchEasterEggQuery(query: string): boolean {
  return Object.prototype.hasOwnProperty.call(SEARCH_EASTER_EGG_SPECS, query);
}

export function getSearchEasterEggSpec(
  query: string,
): SearchEasterEggSpec | undefined {
  return SEARCH_EASTER_EGG_SPECS[query];
}

const CONFETTI_COLORS = [
  "#00529f",
  "#e32219",
  "#ffffff",
  "#fbbf24",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
];

const FIREWORK_COLORS = [
  "#fcd34d",
  "#f87171",
  "#60a5fa",
  "#c084fc",
  "#4ade80",
  "#ffffff",
  "#fb923c",
];

type RectParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
};

type SparkParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  r: number;
};

function resizeCanvas(canvas: HTMLCanvasElement) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h, ctx };
}

function spawnConfettiBurst(
  particles: RectParticle[],
  ox: number,
  oy: number,
  count: number,
  spread: number,
  baseAngle: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = baseAngle + (Math.random() - 0.5) * spread;
    const speed = 10 + Math.random() * 22;
    particles.push({
      x: ox + (Math.random() - 0.5) * 40,
      y: oy + (Math.random() - 0.5) * 30,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.45,
      w: 5 + Math.random() * 9,
      h: 4 + Math.random() * 7,
      color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0]!,
      life: 1,
    });
  }
}

function runConfetti(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    const particles: RectParticle[] = [];
    let raf = 0;
    const gravity = 0.42;
    const drag = 0.988;

    const burstSchedule: { t: number; fn: () => void }[] = [];
    const scheduleBursts = (w: number, h: number) => {
      burstSchedule.length = 0;
      const bottom = h + 20;
      burstSchedule.push(
        {
          t: 0,
          fn: () =>
            spawnConfettiBurst(
              particles,
              w * 0.5,
              bottom,
              90,
              2.2,
              -Math.PI / 2,
            ),
        },
        {
          t: 80,
          fn: () =>
            spawnConfettiBurst(
              particles,
              w * 0.12,
              bottom,
              55,
              1.4,
              -Math.PI / 2 + 0.35,
            ),
        },
        {
          t: 80,
          fn: () =>
            spawnConfettiBurst(
              particles,
              w * 0.88,
              bottom,
              55,
              1.4,
              -Math.PI / 2 - 0.35,
            ),
        },
        {
          t: 220,
          fn: () =>
            spawnConfettiBurst(
              particles,
              w * 0.5,
              h * 0.55,
              70,
              3.5,
              -Math.PI / 2,
            ),
        },
        {
          t: 400,
          fn: () =>
            spawnConfettiBurst(
              particles,
              w * 0.25,
              bottom,
              45,
              1.6,
              -Math.PI / 2 + 0.2,
            ),
        },
        {
          t: 400,
          fn: () =>
            spawnConfettiBurst(
              particles,
              w * 0.75,
              bottom,
              45,
              1.6,
              -Math.PI / 2 - 0.2,
            ),
        },
        {
          t: 650,
          fn: () =>
            spawnConfettiBurst(
              particles,
              w * 0.5,
              bottom,
              100,
              2.8,
              -Math.PI / 2,
            ),
        },
      );
    };

    let { w, h, ctx } = resizeCanvas(canvas);
    scheduleBursts(w, h);
    const start = performance.now();
    let nextBurst = 0;

    const onResize = () => {
      const r = resizeCanvas(canvas);
      w = r.w;
      h = r.h;
      ctx = r.ctx;
    };
    window.addEventListener("resize", onResize);

    const finish = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      resolve();
    };

    const loop = (now: number) => {
      if (signal.aborted) {
        finish();
        return;
      }
      if (!ctx) {
        raf = requestAnimationFrame(loop);
        return;
      }

      while (
        nextBurst < burstSchedule.length &&
        now - start >= burstSchedule[nextBurst]!.t
      ) {
        burstSchedule[nextBurst]!.fn();
        nextBurst++;
      }

      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.0022;

        if (p.y > h + 100 || p.life <= 0 || p.x < -80 || p.x > w + 80) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      const elapsed = now - start;
      const burstsDone = nextBurst >= burstSchedule.length;
      const keepGoing = particles.length > 0 || !burstsDone || elapsed < 3800;

      if (keepGoing) {
        raf = requestAnimationFrame(loop);
      } else {
        finish();
      }
    };

    raf = requestAnimationFrame(loop);
  });
}

function spawnFireworkExplosion(
  particles: SparkParticle[],
  x: number,
  y: number,
) {
  const n = 52 + ((Math.random() * 36) | 0);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 2.5 + Math.pow(Math.random(), 0.55) * 13;
    particles.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: 0.92 + Math.random() * 0.28,
      color: FIREWORK_COLORS[(Math.random() * FIREWORK_COLORS.length) | 0]!,
      r: 1.2 + Math.random() * 2.2,
    });
  }
}

function runFireworks(
  canvas: HTMLCanvasElement,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    const particles: SparkParticle[] = [];
    let raf = 0;
    const gravity = 0.11;

    let { w, h, ctx } = resizeCanvas(canvas);
    const explosions: { t: number; x: number; y: number }[] = [];
    for (let i = 0; i < 12; i++) {
      explosions.push({
        t: (i * 280 + Math.random() * 220) | 0,
        x: w * (0.12 + Math.random() * 0.76),
        y: h * (0.08 + Math.random() * 0.42),
      });
    }

    const start = performance.now();
    let nextEx = 0;

    const onResize = () => {
      const r = resizeCanvas(canvas);
      w = r.w;
      h = r.h;
      ctx = r.ctx;
    };
    window.addEventListener("resize", onResize);

    const finish = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      resolve();
    };

    const loop = (now: number) => {
      if (signal.aborted) {
        finish();
        return;
      }
      if (!ctx) {
        raf = requestAnimationFrame(loop);
        return;
      }

      while (
        nextEx < explosions.length &&
        now - start >= explosions[nextEx]!.t
      ) {
        const e = explosions[nextEx]!;
        spawnFireworkExplosion(particles, e.x, e.y);
        nextEx++;
      }

      ctx.clearRect(0, 0, w, h);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.vy += gravity;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.014;

        if (p.life <= 0 || p.y > h + 40) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      const elapsed = now - start;
      const exDone = nextEx >= explosions.length;
      const keepGoing = particles.length > 0 || !exDone || elapsed < 4200;

      if (keepGoing) {
        raf = requestAnimationFrame(loop);
      } else {
        finish();
      }
    };

    raf = requestAnimationFrame(loop);
  });
}

function HsvEasterEggMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 81.395 60.237"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g transform="matrix(1.25 0 0 -1.25 0 60.237)">
        <path d="m1.531 1.417h62.055v45.354h-62.055v-45.354z" fill="#1e5cb3" />
        <g transform="translate(52.392 24.095)">
          <path
            d="M 0,0 -19.833,19.833 -39.667,0 -19.833,-19.833 0,0 Z"
            fill="#fff"
          />
        </g>
        <g transform="translate(44.837 24.095)">
          <path
            d="M 0,0 -12.279,12.281 -24.559,0 -12.279,-12.279 0,0 Z"
            fill="#231f20"
          />
        </g>
        <g transform="translate(36.808 24.095)">
          <path d="M 0,0 -4.252,4.25 -8.5,0 -4.252,-4.248 0,0 Z" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

/** Stilisierte Fan-Hommage (Blau/Weiß), kein offizielles Vereinslogo */
function SchalkeEasterMark({ className }: { className?: string }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="50 40 80 80"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g
        id="Logo_Schalke04_527498304"
        stroke="none"
        stroke-width="1px"
        fill="none"
        fill-rule="evenodd"
        transform="translate(50.000000, 40.000000)"
      >
        <path
          d="M40,80 C62.0914997,80 80,62.0912184 80,40.0001812 C80,17.9084191 62.0914997,0 40,0 C17.9085003,0 0,17.9084191 0,40.0001812 C0,62.0912184 17.9085003,80 40,80"
          id="Fill-1_1247046660"
          fill="#ffffff"
          stroke="none"
          stroke-width="1px"
        ></path>
        <path
          d="M40,78.5185185 L40,78.5185185 C18.7269244,78.5185185 1.48148148,61.2730756 1.48148148,40 C1.48148148,18.7269244 18.7269244,1.48148148 40,1.48148148 C61.2730756,1.48148148 78.5185185,18.7269244 78.5185185,40 C78.5185185,61.2730756 61.2730756,78.5185185 40,78.5185185"
          id="Fill-3_857620085"
          fill="#004b9c"
          stroke="none"
          stroke-width="1px"
        ></path>
        <path
          d="M40,5.92592593 L40,5.92592593 C54.6932084,5.92592593 67.2142734,15.2261651 71.997915,28.2606982 C71.997915,28.2606982 69.3233932,28.260336 69.3233932,28.2599738 L54.9782638,28.2599738 L54.9775394,19.7909863 C54.9775394,17.2240667 54.9775394,8.42547613 40,8.42547613 C34.5274445,8.42547613 29.3801491,9.81741518 24.8927913,12.2666194 L24.8927913,67.737727 C29.3801491,70.1869312 34.5274445,71.5788703 40,71.5788703 C54.9775394,71.5788703 54.9775394,62.7802797 54.9775394,60.2129979 L54.9775394,52.7244889 L51.2040876,52.7244889 L51.2033632,40.0228187 L74.0740741,40.0228187 C74.0613969,58.8308383 58.810755,74.0740741 40,74.0740741 C21.1812765,74.0740741 5.92592593,58.8185234 5.92592593,40 C5.92592593,21.1814766 21.1812765,5.92592593 40,5.92592593"
          id="Fill-5_553616903"
          fill="#ffffff"
          stroke="none"
          stroke-width="1px"
        ></path>
        <path
          d="M40.855492,15.3676639 C41.7631334,15.1171576 42.4996383,15.1711742 43.3658582,15.502524 C45.5862733,16.3055216 46.003396,19.2894824 46.1661756,21.1789738 L48.6075058,21.1789738 L48.6031457,10.8549261 L47.1047015,10.8549261 C47.1047015,10.8549261 46.3598397,11.9599088 46.1483715,12.2753074 C44.9031805,11.4719473 43.4407077,10.9517208 41.9796884,10.5743301 C38.5140822,9.96057165 35.265031,10.7635693 32.7201468,12.5584411 C29.4616485,14.8666514 27.6074874,20.146134 29.8864015,23.652859 C32.1653155,27.159584 38.675045,36.6088537 38.675045,36.6088537 C38.675045,36.6088537 39.1306825,37.2421886 39.1172387,37.9690555 C39.0972546,39.1284173 38.622723,39.8766733 37.7016377,40.5284971 C36.7801891,41.1803209 35.8343961,41.322069 34.5612273,41.0472734 C31.5494419,40.4063254 31.7401992,36.6012406 31.7401992,34.6744089 L28.1481481,34.6744089 L28.1481481,45.5567484 L30.4499531,45.5567484 L31.1839145,44.154131 C32.0839257,44.5590738 33.7487829,45.3939738 35.1563902,45.6310665 C38.9468288,46.385848 43.0083245,45.724236 45.769037,43.2677521 C48.7477579,40.8105432 50.2603725,36.0230099 47.2442269,31.9420419 C44.0609415,27.14037 39.2720246,20.7145766 38.6830387,19.2597552 C38.5017284,18.8123967 37.9585242,16.3889028 40.855492,15.3676639"
          id="Fill-7_854969787"
          fill="#ffffff"
          stroke="none"
          stroke-width="1px"
        ></path>
        <path
          d="M28.1481481,51.8881298 L28.1481481,65.1485423 C28.1481481,67.623396 30.1379764,69.6296296 32.5922306,69.6296296 C35.0468468,69.6296296 37.037037,67.623396 37.037037,65.1485423 L37.037037,51.8881298 C37.037037,49.4136411 35.0468468,47.4074074 32.5922306,47.4074074 C30.1379764,47.4074074 28.1481481,49.4136411 28.1481481,51.8881298"
          id="Fill-9_613752881"
          fill="#ffffff"
          stroke="none"
          stroke-width="1px"
        ></path>
        <path
          d="M47.0886593,59.9416103 L47.0872801,56.6570271 L44.2747016,56.6570271 L44.2747016,59.9444219 L42.3772369,59.9444219 C42.3772369,59.9444219 45.3080837,47.4636382 45.3325649,47.4074074 L42.2041446,47.4074074 C42.2041446,47.4074074 38.5185185,63.0993227 38.5185185,63.009002 L44.1329866,63.0079476 L44.1322969,68.1481481 L47.0886593,68.1481481 L47.0872801,63.0079476 L48.8888889,63.009002 L48.8888889,59.9416103 L47.0886593,59.9416103 Z"
          id="Fill-11_1232255691"
          fill="#ffffff"
          stroke="none"
          stroke-width="1px"
        ></path>
        <path
          d="M34.0740741,51.849918 L34.0740741,65.1874858 C34.0740741,66.004648 33.4108228,66.6666667 32.5929598,66.6666667 C31.7743624,66.6666667 31.1111111,66.004648 31.1111111,65.1874858 L31.1111111,51.849918 C31.1111111,51.0323891 31.7743624,50.3703704 32.5929598,50.3703704 C33.4108228,50.3703704 34.0740741,51.0323891 34.0740741,51.849918"
          id="Fill-13_392256374"
          fill="#004b9c"
          stroke="none"
          stroke-width="1px"
        ></path>
      </g>
    </svg>
  );
}

/** Stilisierte Fan-Hommage (Schwarz/Gelb), kein offizielles Vereinslogo */
function BvbEasterMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="50" cy="50" r="48" fill="#0a0a0a" />
      <path
        d="M50 12 L88 50 L50 88 L12 50 Z"
        fill="#fde100"
        stroke="#0a0a0a"
        strokeWidth="3"
      />
      <path d="M50 28 L72 50 L50 72 L28 50 Z" fill="#0a0a0a" />
      <circle cx="50" cy="50" r="9" fill="#fde100" />
    </svg>
  );
}

function TireMark({ className }: { className?: string }) {
  const treads = Array.from({ length: 18 }, (_, i) => i);
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="louis-tire-tread" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#3d3d3d" />
          <stop offset="100%" stopColor="#0d0d0d" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#louis-tire-tread)" />
      {treads.map((i) => (
        <rect
          key={i}
          x="47"
          y="3"
          width="6"
          height="14"
          rx="1.5"
          fill="#141414"
          transform={`rotate(${i * 20} 50 50)`}
        />
      ))}
      <circle
        cx="50"
        cy="50"
        r="26"
        fill="#52525b"
        stroke="#3f3f46"
        strokeWidth="5"
      />
      <circle cx="50" cy="50" r="12" fill="#27272a" />
    </svg>
  );
}

type BvbTireStage = "wait" | "fall" | "roll";

function LouisBvbTireScene({
  reduced,
  launchY,
}: {
  reduced: boolean;
  launchY: number;
}) {
  const [stage, setStage] = useState<BvbTireStage>("wait");
  const [logoSquashed, setLogoSquashed] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const tFall = window.setTimeout(() => setStage("fall"), 2000);
    return () => window.clearTimeout(tFall);
  }, [reduced]);

  useEffect(() => {
    if (reduced || stage !== "fall") return;
    const tSquash = window.setTimeout(() => setLogoSquashed(true), 380);
    const tRoll = window.setTimeout(() => setStage("roll"), 540);
    return () => {
      window.clearTimeout(tSquash);
      window.clearTimeout(tRoll);
    };
  }, [reduced, stage]);

  if (reduced) {
    return (
      <motion.div
        className="relative z-[1] drop-shadow-[0_24px_48px_rgba(0,0,0,0.45)]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <BvbEasterMark className="block w-[min(52vw,220px)] h-auto max-h-[40vh] aspect-square select-none" />
      </motion.div>
    );
  }

  const logoCrushed = logoSquashed || stage === "roll";

  return (
    <div className="relative z-[1] flex min-h-[min(44vh,320px)] w-[min(92vw,420px)] items-center justify-center overflow-visible">
      <motion.div
        className="relative z-[1] drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        initial={{
          y: launchY,
          scale: 0.2,
          rotate: -14,
          opacity: 1,
        }}
        animate={
          logoCrushed
            ? {
                y: 0,
                scaleX: 1.38,
                scaleY: 0.1,
                rotate: 5,
                opacity: 0.38,
                filter: "blur(1.5px)",
              }
            : {
                y: 0,
                scale: 1,
                rotate: 0,
                opacity: 1,
                filter: "blur(0px)",
              }
        }
        transition={
          logoCrushed
            ? { type: "spring", stiffness: 520, damping: 26, mass: 0.4 }
            : {
                type: "spring",
                stiffness: 200,
                damping: 16,
                mass: 0.88,
              }
        }
      >
        <motion.div
          animate={
            logoCrushed
              ? {}
              : {
                  y: [0, -6, 0, -4, 0],
                  rotate: [0, 1.2, -1, 0.6, 0],
                }
          }
          transition={{
            duration: 2.8,
            delay: 0.65,
            repeat: logoCrushed ? 0 : Infinity,
            ease: "easeInOut",
          }}
        >
          <BvbEasterMark className="block w-[min(52vw,220px)] h-auto max-h-[40vh] aspect-square select-none" />
        </motion.div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 z-[3] h-[min(26vw,112px)] w-[min(26vw,112px)] -translate-x-1/2 -translate-y-1/2"
        initial={false}
        animate={
          stage === "wait"
            ? {
                y: "-125vh",
                x: 0,
                rotate: 0,
                opacity: 0,
              }
            : stage === "fall"
              ? {
                  y: 0,
                  x: 0,
                  rotate: 220,
                  opacity: 1,
                  transition: {
                    duration: 0.52,
                    ease: [0.52, 0, 0.74, 1],
                  },
                }
              : {
                  y: 8,
                  x: 230,
                  rotate: 220 + 520,
                  opacity: 1,
                  transition: {
                    duration: 1.05,
                    ease: "linear",
                  },
                }
        }
      >
        <TireMark className="h-full w-full drop-shadow-[0_18px_28px_rgba(0,0,0,0.65)]" />
      </motion.div>
    </div>
  );
}

function PulseRings({ reduced }: { reduced: boolean }) {
  if (reduced) return null;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#38bdf8]/40"
          style={{ width: 120 + i * 48, height: 120 + i * 48 }}
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{
            scale: [0.2, 1.6 + i * 0.2],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.4 + i * 0.15,
            delay: 0.15 + i * 0.12,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

function FlyInCenter({
  reduced,
  launchY,
  children,
}: {
  reduced: boolean;
  launchY: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="relative z-[1] drop-shadow-[0_24px_48px_rgba(0,40,80,0.55)]"
      initial={
        reduced
          ? { opacity: 0, scale: 0.92 }
          : {
              y: launchY,
              scale: 0.22,
              rotate: -18,
              opacity: 1,
            }
      }
      animate={
        reduced
          ? { opacity: 1, scale: 1, y: 0, rotate: 0 }
          : { y: 0, scale: 1, rotate: 0, opacity: 1 }
      }
      transition={
        reduced
          ? { duration: 0.25 }
          : {
              type: "spring",
              stiffness: 200,
              damping: 16,
              mass: 0.88,
            }
      }
    >
      <motion.div
        animate={
          reduced
            ? {}
            : {
                y: [0, -8, 0, -5, 0],
                rotate: [0, 1, -1, 0.5, 0],
              }
        }
        transition={{
          duration: 3,
          delay: 0.72,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ThumbFlyIn({
  reduced,
  launchY,
}: {
  reduced: boolean;
  launchY: number;
}) {
  const rotateEnd = 10;

  return (
    <motion.div
      className="relative z-[1]"
      initial={
        reduced
          ? { opacity: 0, scale: 0.85 }
          : {
              y: launchY,
              x: 0,
              scale: 0.28,
              rotate: 32,
              opacity: 1,
            }
      }
      animate={
        reduced
          ? { opacity: 1, scale: 1, y: 0, x: 0, rotate: rotateEnd }
          : {
              y: 0,
              x: 0,
              scale: 1,
              rotate: rotateEnd,
              opacity: 1,
            }
      }
      transition={
        reduced
          ? { duration: 0.28 }
          : {
              type: "spring",
              stiffness: 175,
              damping: 15,
              mass: 0.95,
            }
      }
    >
      <motion.div
        animate={
          reduced
            ? {}
            : {
                rotate: [rotateEnd, rotateEnd + 6, rotateEnd - 5, rotateEnd],
              }
        }
        transition={{
          duration: 2.4,
          delay: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ThumbsUp
          className="text-emerald-400 w-[min(28vw,140px)] h-[min(28vw,140px)] sm:w-40 sm:h-40 drop-shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
          strokeWidth={2.25}
          aria-hidden
        />
      </motion.div>
    </motion.div>
  );
}

export function SearchEasterEgg({
  searchQuery,
  onClose,
}: {
  searchQuery: string;
  onClose: () => void;
}) {
  const spec = useMemo(
    () => getSearchEasterEggSpec(searchQuery),
    [searchQuery],
  );
  const active = spec !== undefined;
  const kind = spec?.kind;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const reduced = reduceMotion === true;

  useEffect(() => {
    if (!active || reduced || !kind) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const useConfetti = kind === "hsv";
    const useFireworks = kind === "fireworks";
    if (!useConfetti && !useFireworks) return;

    const ac = new AbortController();
    if (useConfetti) void runConfetti(canvas, ac.signal);
    else void runFireworks(canvas, ac.signal);

    return () => {
      ac.abort();
    };
  }, [active, reduced, kind]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!active) return;
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, onKeyDown]);

  if (typeof document === "undefined") return null;

  const launchY =
    typeof window !== "undefined" ? window.innerHeight * 1.2 + 80 : 900;

  const showCanvas =
    active && !reduced && (kind === "hsv" || kind === "fireworks");
  const fireworksDim =
    kind === "fireworks" ? "bg-[#0b1220]/85" : "bg-[#0f172a]/72";

  const centerContent =
    spec &&
    (() => {
      switch (spec.kind) {
        case "hsv":
          return (
            <FlyInCenter reduced={reduced} launchY={launchY}>
              <HsvEasterEggMark className="block w-[min(52vw,220px)] h-auto max-h-[40vh] select-none" />
            </FlyInCenter>
          );
        case "schalke":
          return (
            <FlyInCenter reduced={reduced} launchY={launchY}>
              <SchalkeEasterMark className="block w-[min(52vw,220px)] h-auto max-h-[40vh] select-none" />
            </FlyInCenter>
          );
        case "thumbUp":
          return <ThumbFlyIn reduced={reduced} launchY={launchY} />;
        case "bvbTire":
          return <LouisBvbTireScene reduced={reduced} launchY={launchY} />;
        case "fireworks":
          return null;
        default:
          return null;
      }
    })();

  return createPortal(
    <AnimatePresence>
      {active && spec ? (
        <motion.div
          key={searchQuery}
          role="presentation"
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.2 : 0.35 }}
        >
          <motion.div
            className={`absolute inset-0 backdrop-blur-[2px] ${fireworksDim}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />

          {!reduced && kind === "hsv" ? (
            <motion.div
              className="pointer-events-none absolute inset-0 z-[1] bg-white"
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            />
          ) : null}

          {showCanvas ? (
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 z-[1]"
              aria-hidden
            />
          ) : null}

          <div className="relative z-[2] flex min-h-[min(280px,40vh)] min-w-[200px] flex-col items-center justify-center pointer-events-none px-6">
            {kind === "hsv" ? <PulseRings reduced={reduced} /> : null}
            {centerContent}
            {spec.caption ? (
              <motion.p
                className="mt-8 text-center text-[13px] text-white/90 font-medium tracking-wide"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.45 }}
              >
                {spec.caption}
              </motion.p>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
