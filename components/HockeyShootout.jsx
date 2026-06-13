import { motion, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import Puck from "./Puck";

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

function RinkMarkings() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[70px] border-4 border-gray-500/70 bg-white/70 shadow-[inset_0_0_28px_rgba(30,64,175,0.08)] sm:rounded-[90px]">
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
}

export default function HockeyShootout() {
  const [puckKey, setPuckKey] = useState(0);
  const [isGoalScored, setIsGoalScored] = useState(false);
  const [scoredSide, setScoredSide] = useState(null);
  const [score, setScore] = useState({ red: 0, blue: 0 });

  const puckRef = useRef();
  const redNetRef = useRef();
  const blueNetRef = useRef();
  const goalLockRef = useRef(false);
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

  function onPuckMove() {
    if (isGoalScored || goalLockRef.current) {
      return;
    }

    const scoringSide = isPuckFullyInNet(redNetRef.current)
      ? "red"
      : isPuckFullyInNet(blueNetRef.current)
        ? "blue"
        : null;

    if (scoringSide) {
      goalLockRef.current = true;
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

  function resetPuck() {
    puckX.stop();
    puckY.stop();
    puckX.set(0);
    puckY.set(0);
    setPuckKey((prev) => prev + 1);
    setIsGoalScored(false);
    setScoredSide(null);
    goalLockRef.current = false;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-4 sm:px-4">
      <Scoreboard score={score} onReset={resetPuck} />
      <div className="relative mt-8 h-[360px] sm:h-[430px] md:h-[520px]">
        <RinkMarkings />
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
                className="absolute bottom-0 z-20 h-10 w-10 text-black transition-colors duration-150 sm:h-12 sm:w-12 md:h-14 md:w-14"
                style={{ x: puckX, y: puckY }}
                width={56}
                height={56}
                drag={!isGoalScored}
                dragMomentum={!isGoalScored}
                onDrag={onPuckMove}
                onUpdate={onPuckMove}
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
