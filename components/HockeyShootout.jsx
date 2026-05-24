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
    <div className="mt-4 flex justify-center px-2">
      <div className="grid w-full max-w-xl grid-cols-[1fr_auto_1fr] items-stretch overflow-hidden border-4 border-white bg-blue-950 text-white shadow-lg ring-2 ring-blue-950">
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
  const colorClass = side === "red" ? "bg-red-600" : "bg-blue-600";

  return (
    <>
      <motion.div
        className={`pointer-events-none absolute -inset-4 rounded-full ${colorClass}/40`}
        animate={{ opacity: [0.2, 0.9, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 0.45, repeat: Infinity }}
      />
      <motion.div
        className={`pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded ${colorClass} px-3 py-1 text-sm font-bold text-white shadow`}
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
    <div className="relative h-24 w-24 sm:h-40 sm:w-40 md:h-[200px] md:w-[200px]">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        whileTap={{ scale: 0.9 }}
      />
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
    <>
      <Scoreboard score={score} onReset={resetPuck} />
      <div className="mt-4 p-2">
        <div className="flex w-full items-end justify-between gap-1 px-2 sm:justify-around sm:gap-2 sm:px-0">
          <HockeyNet
            side="red"
            isScoredOn={scoredSide === "red"}
            netRef={redNetRef}
          />
          <div className="grid justify-items-center">
            <div className="grid inset-0 relative h-12 w-12 place-content-end touch-none sm:h-16 sm:w-16 md:h-20 md:w-20">
              <Puck
                key={puckKey}
                ref={puckRef}
                className="absolute bottom-0 h-12 w-12 text-black transition-colors duration-150 dark:text-gray-400 sm:h-16 sm:w-16 md:h-20 md:w-20"
                style={{ x: puckX, y: puckY }}
                width={80}
                height={80}
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
    </>
  );
}
