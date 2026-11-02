import { motion, useMotionValue } from "framer-motion";
import { forwardRef, useEffect, useRef, useState } from "react";
import Puck from "./Puck";

const PUCK_FRICTION = 1.35;
const PUCK_RESTITUTION = 0.82;
const PUCK_STOP_SPEED = 22;
const PUCK_MAX_SPEED = 2800;
const PUCK_MAX_STEP = 12;
const BOARD_EPSILON = 0.35;

function parsePx(value) {
  return parseFloat(value) || 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getRinkInnerBounds(rinkEl) {
  const rect = rinkEl.getBoundingClientRect();
  const style = getComputedStyle(rinkEl);
  const borderLeft = parsePx(style.borderLeftWidth);
  const borderRight = parsePx(style.borderRightWidth);
  const borderTop = parsePx(style.borderTopWidth);
  const borderBottom = parsePx(style.borderBottomWidth);
  const outerRadius = parsePx(style.borderTopLeftRadius);

  return {
    left: rect.left + borderLeft,
    right: rect.right - borderRight,
    top: rect.top + borderTop,
    bottom: rect.bottom - borderBottom,
    radius: Math.max(0, outerRadius - Math.max(borderLeft, borderTop)),
  };
}

function containCircleInRoundedRect(cx, cy, circleRadius, rink) {
  const left = rink.left + circleRadius;
  const right = rink.right - circleRadius;
  const top = rink.top + circleRadius;
  const bottom = rink.bottom - circleRadius;
  const radius = Math.max(0, rink.radius - circleRadius);

  if (right <= left || bottom <= top) {
    return {
      x: (rink.left + rink.right) / 2,
      y: (rink.top + rink.bottom) / 2,
      nx: 0,
      ny: 0,
      outside: true,
    };
  }

  const innerLeft = left + radius;
  const innerRight = right - radius;
  const innerTop = top + radius;
  const innerBottom = bottom - radius;

  if (cx >= innerLeft && cx <= innerRight) {
    const y = clamp(cy, top, bottom);
    return {
      x: cx,
      y,
      nx: 0,
      ny: cy < top ? -1 : cy > bottom ? 1 : 0,
      outside: y !== cy,
    };
  }

  if (cy >= innerTop && cy <= innerBottom) {
    const x = clamp(cx, left, right);
    return {
      x,
      y: cy,
      nx: cx < left ? -1 : cx > right ? 1 : 0,
      ny: 0,
      outside: x !== cx,
    };
  }

  const cornerX = cx < innerLeft ? innerLeft : innerRight;
  const cornerY = cy < innerTop ? innerTop : innerBottom;
  const dx = cx - cornerX;
  const dy = cy - cornerY;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = dx / dist;
  const ny = dy / dist;

  if (dist <= radius) {
    return { x: cx, y: cy, nx: 0, ny: 0, outside: false };
  }

  return {
    x: cornerX + nx * radius,
    y: cornerY + ny * radius,
    nx,
    ny,
    outside: true,
  };
}

function reflectVelocity(vx, vy, nx, ny, restitution) {
  const dot = vx * nx + vy * ny;
  if (dot <= 0) {
    return { vx, vy };
  }

  return {
    vx: vx - (1 + restitution) * dot * nx,
    vy: vy - (1 + restitution) * dot * ny,
  };
}

function capSpeed(vx, vy, maxSpeed) {
  const speed = Math.hypot(vx, vy);
  if (speed <= maxSpeed || speed === 0) {
    return { vx, vy };
  }

  const scale = maxSpeed / speed;
  return { vx: vx * scale, vy: vy * scale };
}

function ScoreWindow({ label, score }) {
  return (
    <div className="grid gap-1 p-2 text-center sm:p-3">
      <div className="text-xl font-black uppercase leading-none tracking-normal text-white sm:text-4xl">
        {label}
      </div>
      <div className="grid place-items-center border border-black bg-neutral-950 px-3 py-1 shadow-inner">
        <div className="font-mono text-4xl font-black leading-none text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.9)] sm:text-6xl">
          {score}
        </div>
      </div>
    </div>
  );
}

function Scoreboard({ score, onReset }) {
  return (
    <div className="flex justify-center px-2">
      <div className="grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-stretch overflow-hidden border-4 border-white bg-blue-950 text-white shadow-lg ring-2 ring-blue-950">
        <ScoreWindow label="Red" score={score.red} />
        <div className="grid h-full place-items-center gap-1 border-x-4 border-white px-2 py-2 text-center sm:px-4">
          <div className="grid gap-1">
            <div className="text-sm font-black uppercase leading-none text-white sm:text-2xl">
              Period
            </div>
            <div className="grid place-items-center border border-black bg-neutral-950 px-3 py-1 shadow-inner">
              <div className="font-mono text-2xl font-black leading-none text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.9)] sm:text-4xl">
                3
              </div>
            </div>
          </div>
          <button
            className="border border-white bg-blue-900 px-2 py-1 text-[10px] font-black uppercase leading-none text-white hover:bg-blue-800 sm:text-xs"
            onClick={onReset}
          >
            Reset Puck
          </button>
        </div>
        <ScoreWindow label="Blue" score={score.blue} />
      </div>
    </div>
  );
}

function GoalFlash({ side }) {
  const colorClasses =
    side === "red"
      ? {
          halo: "bg-red-600/40",
          label: "bg-red-600",
        }
      : {
          halo: "bg-blue-600/40",
          label: "bg-blue-600",
        };

  return (
    <>
      <motion.div
        className={`pointer-events-none absolute -inset-4 rounded-full ${colorClasses.halo}`}
        animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 0.45, repeat: Infinity }}
      />
      <motion.div
        className={`pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded ${colorClasses.label} px-3 py-1 text-sm font-bold text-white shadow`}
        animate={{ opacity: [1, 0.25, 1] }}
        transition={{ duration: 0.35, repeat: Infinity }}
      >
        GOAL
      </motion.div>
    </>
  );
}

function HockeyNet({ side, isScoredOn, netRef }) {
  const isBlue = side === "blue";

  return (
    <div
      className={`relative h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 ${
        isBlue ? "translate-x-6 sm:translate-x-10" : "-translate-x-6 sm:-translate-x-10"
      }`}
    >
      {isScoredOn && <GoalFlash side={side} />}
      <motion.img
        ref={netRef}
        className="relative z-10 h-full w-full"
        style={
          isBlue
            ? {
                filter:
                  "hue-rotate(220deg) saturate(2.8) brightness(0.55) contrast(1.35)",
                scaleX: -1,
              }
            : undefined
        }
        src="/Hockey-Net.svg"
        alt={`${isBlue ? "Blue" : "Red"} hockey net`}
        width="200"
        height="200"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        whileTap={{ scale: 0.9 }}
      />
    </div>
  );
}

function FaceoffCircle({ className = "", blue = false }) {
  return (
    <div
      className={`absolute h-24 w-24 rounded-full border-2 bg-transparent sm:h-32 sm:w-32 md:h-40 md:w-40 ${
        blue ? "border-blue-500/80" : "border-red-500/70"
      } ${className}`}
    >
      <span
        className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${
          blue ? "bg-blue-500/80" : "bg-red-500/70"
        }`}
      />
      <span className={`absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 -translate-y-1/2 ${blue ? "bg-blue-500/80" : "bg-red-500/70"}`} />
      <span className={`absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 ${blue ? "bg-blue-500/80" : "bg-red-500/70"}`} />
    </div>
  );
}

const RinkMarkings = forwardRef(function RinkMarkings(_, ref) {
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[70px] border-4 border-gray-500/70 bg-white/70 shadow-[inset_0_0_28px_rgba(30,64,175,0.08)] sm:rounded-[90px]"
    >
      <div className="absolute inset-y-0 left-1/2 w-2 -translate-x-1/2 bg-red-500/85">
        <div className="h-full border-x-2 border-dashed border-white/90" />
      </div>
      <div className="absolute inset-y-0 left-[34%] w-2 -translate-x-1/2 bg-blue-600/75" />
      <div className="absolute inset-y-0 left-[66%] w-2 -translate-x-1/2 bg-blue-600/75" />
      <div className="absolute inset-y-0 left-[9%] w-1 bg-red-500/65" />
      <div className="absolute inset-y-0 right-[9%] w-1 bg-red-500/65" />

      <FaceoffCircle className="left-[13%] top-[10%]" />
      <FaceoffCircle className="bottom-[8%] left-[13%]" />
      <FaceoffCircle className="right-[13%] top-[10%]" />
      <FaceoffCircle className="bottom-[8%] right-[13%]" />
      <FaceoffCircle blue className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <span className="absolute left-[38%] top-[24%] h-4 w-4 rounded-full bg-red-500/70" />
      <span className="absolute bottom-[24%] left-[38%] h-4 w-4 rounded-full bg-red-500/70" />
      <span className="absolute right-[38%] top-[24%] h-4 w-4 rounded-full bg-red-500/70" />
      <span className="absolute bottom-[24%] right-[38%] h-4 w-4 rounded-full bg-red-500/70" />

      <span className="absolute left-[9%] top-1/2 h-28 w-14 -translate-x-full -translate-y-1/2 rounded-l-full border-2 border-red-500/60 bg-sky-100/70" />
      <span className="absolute right-[9%] top-1/2 h-28 w-14 -translate-y-1/2 translate-x-full rounded-r-full border-2 border-red-500/60 bg-sky-100/70" />
    </div>
  );
});

export default function HockeyShootout() {
  const [puckKey, setPuckKey] = useState(0);
  const [isGoalScored, setIsGoalScored] = useState(false);
  const [scoredSide, setScoredSide] = useState(null);
  const [score, setScore] = useState({ red: 0, blue: 0 });

  const puckRef = useRef();
  const rinkRef = useRef();
  const redNetRef = useRef();
  const blueNetRef = useRef();
  const goalLockRef = useRef(false);
  const draggingRef = useRef(false);
  const grabOffsetRef = useRef({ x: 0, y: 0 });
  const samplesRef = useRef([]);
  const unbindDragRef = useRef(() => {});
  const physicsRef = useRef({ raf: 0, vx: 0, vy: 0, last: 0, running: false });
  const layoutRef = useRef({
    originX: 0,
    originY: 0,
    centerX: 0,
    centerY: 0,
    radius: 20,
  });
  const puckX = useMotionValue(0);
  const puckY = useMotionValue(0);

  function isPuckFullyInNet(net) {
    const puck = puckRef.current;

    if (!puck || !net) {
      return false;
    }

    const puckRect = puck.getBoundingClientRect();
    const netRect = net.getBoundingClientRect();

    return (
      puckRect.left >= netRect.left &&
      puckRect.right <= netRect.right &&
      puckRect.top >= netRect.top &&
      puckRect.bottom <= netRect.bottom
    );
  }

  function capturePuckLayout() {
    const puck = puckRef.current;
    if (!puck) {
      return false;
    }

    const rect = puck.getBoundingClientRect();
    layoutRef.current = {
      originX: puckX.get(),
      originY: puckY.get(),
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      radius: Math.min(puck.offsetWidth || rect.width, puck.offsetHeight || rect.height) / 2,
    };
    return true;
  }

  function puckCenter() {
    const layout = layoutRef.current;
    return {
      cx: layout.centerX + (puckX.get() - layout.originX),
      cy: layout.centerY + (puckY.get() - layout.originY),
      radius: layout.radius,
    };
  }

  function setPuckCenter(cx, cy) {
    const layout = layoutRef.current;
    puckX.set(layout.originX + (cx - layout.centerX));
    puckY.set(layout.originY + (cy - layout.centerY));
  }

  function resolvePuckAgainstBoards(vx = 0, vy = 0, { bounce = false } = {}) {
    const rink = rinkRef.current;
    if (!rink || !puckRef.current) {
      return { vx, vy };
    }

    const { cx, cy, radius } = puckCenter();
    const hit = containCircleInRoundedRect(
      cx,
      cy,
      radius,
      getRinkInnerBounds(rink)
    );

    if (!hit.outside) {
      return { vx, vy };
    }

    setPuckCenter(
      hit.x - hit.nx * BOARD_EPSILON,
      hit.y - hit.ny * BOARD_EPSILON
    );

    if (!bounce || (hit.nx === 0 && hit.ny === 0)) {
      return { vx, vy };
    }

    return reflectVelocity(vx, vy, hit.nx, hit.ny, PUCK_RESTITUTION);
  }

  function stopPhysics() {
    const physics = physicsRef.current;
    if (physics.raf) {
      cancelAnimationFrame(physics.raf);
    }
    physics.running = false;
    physics.raf = 0;
    physics.vx = 0;
    physics.vy = 0;
  }

  function onPuckMove() {
    if (goalLockRef.current) {
      return;
    }

    const scoringSide = isPuckFullyInNet(redNetRef.current)
      ? "red"
      : isPuckFullyInNet(blueNetRef.current)
        ? "blue"
        : null;

    if (scoringSide) {
      goalLockRef.current = true;
      stopPhysics();
      puckX.stop();
      puckY.stop();

      const scoringTeam = scoringSide === "red" ? "blue" : "red";

      setScore((prev) => ({
        ...prev,
        [scoringTeam]: prev[scoringTeam] + 1,
      }));
      setScoredSide(scoringSide);
      setIsGoalScored(true);
    }
  }

  function startPhysics(rawVx, rawVy) {
    stopPhysics();
    capturePuckLayout();
    const capped = capSpeed(rawVx, rawVy, PUCK_MAX_SPEED);
    const physics = physicsRef.current;
    physics.vx = capped.vx;
    physics.vy = capped.vy;
    physics.last = performance.now();
    physics.running = true;

    const tick = (now) => {
      if (!physics.running || goalLockRef.current) {
        stopPhysics();
        return;
      }

      const rink = rinkRef.current;
      if (!rink) {
        stopPhysics();
        return;
      }

      const dt = Math.min(0.032, (now - physics.last) / 1000);
      physics.last = now;
      physics.vx *= Math.exp(-PUCK_FRICTION * dt);
      physics.vy *= Math.exp(-PUCK_FRICTION * dt);

      if (Math.hypot(physics.vx, physics.vy) < PUCK_STOP_SPEED) {
        stopPhysics();
        resolvePuckAgainstBoards(0, 0);
        return;
      }

      const travel = Math.hypot(physics.vx, physics.vy) * dt;
      const steps = Math.max(1, Math.ceil(travel / PUCK_MAX_STEP));
      const stepDt = dt / steps;
      const bounds = getRinkInnerBounds(rink);
      let { cx, cy, radius } = puckCenter();

      for (let i = 0; i < steps; i += 1) {
        cx += physics.vx * stepDt;
        cy += physics.vy * stepDt;
        const hit = containCircleInRoundedRect(cx, cy, radius, bounds);
        if (hit.outside) {
          cx = hit.x - hit.nx * BOARD_EPSILON;
          cy = hit.y - hit.ny * BOARD_EPSILON;
          const bounced = reflectVelocity(
            physics.vx,
            physics.vy,
            hit.nx,
            hit.ny,
            PUCK_RESTITUTION
          );
          physics.vx = bounced.vx;
          physics.vy = bounced.vy;
        }
      }

      setPuckCenter(cx, cy);
      onPuckMove();
      physics.raf = requestAnimationFrame(tick);
    };

    physics.raf = requestAnimationFrame(tick);
  }

  function recordDragSample(point) {
    if (!point) {
      return;
    }

    const now = performance.now();
    const samples = samplesRef.current;
    samples.push({ x: point.x, y: point.y, t: now });
    while (samples.length > 1 && now - samples[0].t > 80) {
      samples.shift();
    }
  }

  function sampledVelocity() {
    const samples = samplesRef.current;
    if (samples.length < 2) {
      return { x: 0, y: 0 };
    }

    const first = samples[0];
    const last = samples[samples.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt <= 0) {
      return { x: 0, y: 0 };
    }

    return {
      x: (last.x - first.x) / dt,
      y: (last.y - first.y) / dt,
    };
  }

  function movePuckTowardPoint(clientX, clientY) {
    const rink = rinkRef.current;
    if (!rink || !puckRef.current) {
      return;
    }

    const { radius } = puckCenter();
    const hit = containCircleInRoundedRect(
      clientX - grabOffsetRef.current.x,
      clientY - grabOffsetRef.current.y,
      radius,
      getRinkInnerBounds(rink)
    );

    setPuckCenter(
      hit.x - hit.nx * BOARD_EPSILON,
      hit.y - hit.ny * BOARD_EPSILON
    );
  }

  function onPuckPointerMove(event) {
    if (!draggingRef.current) {
      return;
    }

    event.preventDefault();
    recordDragSample({ x: event.clientX, y: event.clientY });
    movePuckTowardPoint(event.clientX, event.clientY);
    onPuckMove();
  }

  function stopDragging(event) {
    if (!draggingRef.current) {
      return;
    }

    draggingRef.current = false;
    unbindDragRef.current();
    unbindDragRef.current = () => {};

    if (event?.currentTarget?.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (event) {
      movePuckTowardPoint(event.clientX, event.clientY);
    } else {
      resolvePuckAgainstBoards(0, 0);
    }

    onPuckMove();
    const velocity = sampledVelocity();
    if (Math.hypot(velocity.x, velocity.y) >= PUCK_STOP_SPEED) {
      startPhysics(velocity.x, velocity.y);
    } else {
      resolvePuckAgainstBoards(0, 0);
    }
  }

  function onPuckPointerDown(event) {
    if (goalLockRef.current || event.button) {
      return;
    }

    const puck = puckRef.current;
    if (!puck) {
      return;
    }

    event.preventDefault();
    stopPhysics();
    capturePuckLayout();
    draggingRef.current = true;

    const puckRect = puck.getBoundingClientRect();
    grabOffsetRef.current = {
      x: event.clientX - (puckRect.left + puckRect.width / 2),
      y: event.clientY - (puckRect.top + puckRect.height / 2),
    };
    samplesRef.current = [];
    recordDragSample({ x: event.clientX, y: event.clientY });

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const move = (moveEvent) => onPuckPointerMove(moveEvent);
    const up = (upEvent) => stopDragging(upEvent);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    unbindDragRef.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }

  function resetPuck() {
    draggingRef.current = false;
    unbindDragRef.current();
    unbindDragRef.current = () => {};
    stopPhysics();
    puckX.stop();
    puckY.stop();
    puckX.set(0);
    puckY.set(0);
    setPuckKey((prev) => prev + 1);
    setIsGoalScored(false);
    setScoredSide(null);
    goalLockRef.current = false;
  }

  useEffect(() => {
    function onResize() {
      capturePuckLayout();
      resolvePuckAgainstBoards(0, 0);
    }

    capturePuckLayout();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      unbindDragRef.current();
      stopPhysics();
    };
    // Motion values and refs are stable for the life of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puckKey]);

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-4 sm:px-4">
      <Scoreboard score={score} onReset={resetPuck} />
      <div className="relative mt-8 h-[360px] sm:h-[430px] md:h-[520px]">
        <RinkMarkings ref={rinkRef} />
        <div className="relative z-10 flex h-full w-full items-center justify-between gap-1 px-4 sm:gap-2 sm:px-8">
          <HockeyNet
            side="red"
            isScoredOn={scoredSide === "red"}
            netRef={redNetRef}
          />
          <div className="relative z-20 grid justify-items-center self-center">
            <div className="relative inset-0 z-20 grid h-10 w-10 place-content-end touch-none sm:h-12 sm:w-12 md:h-14 md:w-14">
              <Puck
                key={puckKey}
                ref={puckRef}
                className="absolute bottom-0 z-20 h-10 w-10 select-none text-black transition-colors duration-150 sm:h-12 sm:w-12 md:h-14 md:w-14"
                style={{ x: puckX, y: puckY }}
                width={56}
                height={56}
                drag={false}
                onPointerDown={onPuckPointerDown}
                onContextMenu={(event) => event.preventDefault()}
                onUpdate={() => {
                  if (!physicsRef.current.running && !draggingRef.current) {
                    resolvePuckAgainstBoards(0, 0);
                  }
                  onPuckMove();
                }}
              />
            </div>
          </div>
          <HockeyNet
            side="blue"
            isScoredOn={scoredSide === "blue"}
            netRef={blueNetRef}
          />
        </div>
      </div>
    </div>
  );
}
