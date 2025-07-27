import React, { useState, useEffect, useMemo, useId, useRef, useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

// Helper for classnames
const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- DATA & CONFIGURATION ---

// Fixed positions for the DSA topics based on your image layout
const TOPIC_DATA = [
  { name: 'Stack', pos: { x: 120, y: 250 } }, // 0
  { name: 'Arrays & Hashing', pos: { x: 280, y: 200 } }, // 1
  { name: 'Two pointer', pos: { x: 300, y: 400 } }, // 2
  { name: 'Linked List', pos: { x: 480, y: 250 } }, // 3
  { name: 'Trees', pos: { x: 550, y: 450 } }, // 4
  { name: 'Heaps', pos: { x: 680, y: 550 } }, // 5
  { name: 'Graphs', pos: { x: 780, y: 400 } }, // 6
  { name: 'Backtracking', pos: { x: 820, y: 250 } }, // 7
  { name: 'DP', pos: { x: 650, y: 100 } } // 8
];

// Defines the single, continuous red line connecting the topics
const ROADMAP_PATH = [0, 1, 2, 1, 3, 4, 5, 4, 6, 7, 8, 3];

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 600;

// --- FIXED DOT POSITIONS ---
// This ensures the background stars are the same on every page load.
const dotPositions = [
  { x: 843.2, y: 14.5, r: 1.2 },
  { x: 621.8, y: 430.1, r: 0.8 },
  { x: 234.5, y: 580.3, r: 1.4 },
  { x: 33.1, y: 345.6, r: 0.7 },
  { x: 987.6, y: 89.1, r: 1.1 },
  { x: 111.1, y: 111.1, r: 0.9 },
  { x: 555.5, y: 555.5, r: 1.3 },
  { x: 789, y: 123, r: 0.6 },
  { x: 456, y: 321, r: 1.5 },
  { x: 999, y: 400, r: 0.8 },
  { x: 250, y: 350, r: 1 },
  { x: 50, y: 500, r: 1.2 },
  { x: 150, y: 80, r: 0.9 },
  { x: 880, y: 180, r: 1.4 },
  { x: 720, y: 480, r: 0.7 },
  { x: 500, y: 50, r: 1.1 },
  { x: 300, y: 520, r: 0.8 },
  { x: 950, y: 300, r: 1.3 },
  { x: 800, y: 580, r: 0.6 },
  { x: 600, y: 200, r: 1.5 },
  { x: 400, y: 400, r: 0.8 },
  { x: 200, y: 200, r: 1 },
  { x: 100, y: 50, r: 1.2 },
  { x: 50, y: 100, r: 0.9 },
  { x: 900, y: 500, r: 1.4 },
  { x: 700, y: 300, r: 0.7 },
  { x: 500, y: 100, r: 1.1 },
  { x: 300, y: 300, r: 0.8 },
  { x: 100, y: 500, r: 1.3 },
  { x: 900, y: 100, r: 0.6 },
  { x: 700, y: 500, r: 1.5 },
  { x: 500, y: 300, r: 0.8 },
  { x: 300, y: 100, r: 1 },
  { x: 100, y: 300, r: 1.2 },
  { x: 950, y: 550, r: 0.9 },
  { x: 50, y: 250, r: 1.4 },
  { x: 850, y: 50, r: 0.7 },
  { x: 650, y: 450, r: 1.1 },
  { x: 450, y: 250, r: 0.8 },
  { x: 250, y: 450, r: 1.3 },
  { x: 150, y: 150, r: 0.6 },
  { x: 750, y: 50, r: 1.5 },
  { x: 550, y: 350, r: 0.8 },
  { x: 350, y: 150, r: 1 },
  { x: 150, y: 350, r: 1.2 },
  { x: 950, y: 250, r: 0.9 },
  { x: 50, y: 450, r: 1.4 },
  { x: 850, y: 250, r: 0.7 },
  { x: 650, y: 50, r: 1.1 },
  { x: 450, y: 450, r: 0.8 },
  { x: 250, y: 50, r: 1.3 },
  { x: 58, y: 58, r: 0.6 },
  { x: 942, y: 542, r: 1.5 },
  { x: 42, y: 42, r: 0.8 },
  { x: 500, y: 500, r: 1 },
  { x: 290, y: 490, r: 1.2 },
  { x: 710, y: 90, r: 0.9 },
  { x: 190, y: 290, r: 1.4 },
  { x: 810, y: 390, r: 0.7 },
  { x: 310, y: 190, r: 1.1 },
  { x: 690, y: 410, r: 0.8 },
  { x: 410, y: 110, r: 1.3 },
  { x: 110, y: 410, r: 0.6 },
  { x: 790, y: 210, r: 1.5 },
  { x: 210, y: 590, r: 0.8 },
  { x: 910, y: 310, r: 1 },
  { x: 390, y: 90, r: 1.2 },
  { x: 890, y: 490, r: 0.9 },
  { x: 490, y: 210, r: 1.4 },
  { x: 90, y: 390, r: 0.7 },
  { x: 610, y: 190, r: 1.1 },
  { x: 130, y: 470, r: 0.8 },
  { x: 770, y: 130, r: 1.3 },
  { x: 370, y: 530, r: 0.6 },
  { x: 970, y: 230, r: 1.5 },
  { x: 270, y: 70, r: 0.8 },
  { x: 670, y: 370, r: 1 },
  { x: 170, y: 570, r: 1.2 },
  { x: 870, y: 70, r: 0.9 },
  { x: 470, y: 430, r: 1.4 },
  { x: 70, y: 270, r: 0.7 },
  { x: 570, y: 170, r: 1.1 },
  { x: 230, y: 430, r: 0.8 },
  { x: 930, y: 170, r: 1.3 },
  { x: 330, y: 570, r: 0.6 },
  { x: 730, y: 270, r: 1.5 },
  { x: 30, y: 370, r: 0.8 },
  { x: 630, y: 70, r: 1 },
  { x: 130, y: 530, r: 1.2 },
  { x: 830, y: 130, r: 0.9 },
  { x: 430, y: 470, r: 1.4 },
  { x: 30, y: 230, r: 0.7 },
  { x: 530, y: 130, r: 1.1 },
  { x: 230, y: 30, r: 0.8 },
  { x: 930, y: 330, r: 1.3 }
];

// --- SVG GENERATION COMPONENTS ---

const Dots = ({ positions }) => (
  <g>
    {positions.map((pos, i) => (
      <circle
        key={`dot-${i}`}
        cx={pos.x}
        cy={pos.y}
        r={pos.r}
        fill="white"
        opacity="0.3"
      />
    ))}
  </g>
);

const Labels = ({ data }) => (
  <g>
    {data.map((topic, i) => (
      <text
        key={`label-${i}`}
        x={topic.pos.x}
        y={topic.pos.y}
        fill="white"
        fontSize="20"
        fontWeight="bold"
        textAnchor="middle"
        paintOrder="stroke"
        stroke="#171717"
        strokeWidth="6px"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {topic.name}
      </text>
    ))}
  </g>
);

const Roadmap = ({ data, path }) => (
  <g>
    {path.map((pointIndex, i) => {
      if (i === path.length - 1) return null;
      const startNode = data[path[i]];
      const endNode = data[path[i + 1]];
      return (
        <line
          key={`roadmap-line-${i}`}
          x1={startNode.pos.x}
          y1={startNode.pos.y}
          x2={endNode.pos.x}
          y2={endNode.pos.y}
          stroke="rgba(239, 68, 68, 0.9)" // Red color
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    })}
  </g>
);

const ConstellationSVG = ({ showLabels, showRoadmap }) => {
  const svgContent = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      style={{
        backgroundImage: 'linear-gradient(to right, #0a0a0a, #171717, #0a0a0a)'
      }}
    >
      <Dots positions={dotPositions} />
      {showRoadmap && <Roadmap data={TOPIC_DATA} path={ROADMAP_PATH} />}
      {showLabels && <Labels data={TOPIC_DATA} />}
    </svg>
  );

  const svgString = ReactDOMServer.renderToStaticMarkup(svgContent);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
};

// const SparklesCore = props => {
//   const {
//     id,
//     className,
//     background,
//     minSize,
//     maxSize,
//     speed,
//     particleColor,
//     particleDensity
//   } = props;
//   const [init, setInit] = useState(false);
//   useEffect(() => {
//     initParticlesEngine(async engine => {
//       await loadSlim(engine);
//     }).then(() => {
//       setInit(true);
//     });
//   }, []);
//   const controls = useAnimation();

//   const particlesLoaded = async container => {
//     if (container) {
//       controls.start({ opacity: 1, transition: { duration: 1 } });
//     }
//   };

//   const generatedId = useId();
//   return (
//     <motion.div animate={controls} className={cn('opacity-0', className)}>
//       {init && (
//         <Particles
//           id={id || generatedId}
//           className={cn('h-full w-full')}
//           particlesLoaded={particlesLoaded}
//           options={{
//             background: { color: { value: background || 'transparent' } },
//             fullScreen: { enable: false, zIndex: 1 },
//             fpsLimit: 120,
//             interactivity: {
//               events: { onClick: { enable: false }, onHover: { enable: false } }
//             },
//             particles: {
//               number: {
//                 density: { enable: true, width: 400, height: 400 },
//                 value: particleDensity || 120
//               },
//               color: { value: particleColor || '#ffffff' },
//               shape: { type: 'circle' },
//               opacity: {
//                 value: { min: 0.1, max: 1 },
//                 animation: {
//                   enable: true,
//                   speed: speed || 4,
//                   startValue: 'random',
//                   destroy: 'none'
//                 }
//               },
//               size: { value: { min: minSize || 1, max: maxSize || 3 } },
//               move: {
//                 enable: true,
//                 speed: { min: 0.1, max: 1 },
//                 direction: 'none',
//                 random: false,
//                 straight: false,
//                 outModes: { default: 'out' }
//               }
//             },
//             detectRetina: true
//           }}
//         />
//       )}
//     </motion.div>
//   );
// };

// --- The Main App Component ---

export default function App() {
  // "Before" image is just the background stars
  const beforeImageUrl = ConstellationSVG({
    showLabels: false,
    showRoadmap: false
  });

  // "After" image has the labels and the red roadmap line
  const afterImageUrl = ConstellationSVG({
    showLabels: true,
    showRoadmap: true
  });

  return (
    <div className="relative pt-20 flex flex-col gap-10 w-full h-screen bg-neutral-950 max-w-5xl mx-auto">
      <div className="flex flex-col gap-3 text-center justify-center items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-shadow">
          Your Roadmap Through the Code-verse.
        </h1>
        <p className="mt-4 max-w-2xl text-md md:text-lg text-neutral-200 text-shadow">
          The universe of coding problems is vast. We've charted the stars for you,
          creating a clear path from overwhelming chaos to your dream job.
        </p>
        {/* <div className="mt-8 flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
          <svg
            className="w-6 h-6 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="font-semibold">Slide to Reveal Your Roadmap</span>
        </div> */}
        <div className="mt-8 flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
          <svg
            className="w-6 h-6 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="font-semibold">Slide to Reveal Your Roadmap</span>
        </div>
      </div>

      <Compare
        firstImage={afterImageUrl}
        secondImage={beforeImageUrl}
        className="w-full h-full"
        slideMode="hover"
        autoplay={false}
        initialSliderPercentage={0}
      />

      <style>{`.text-shadow { text-shadow: 0px 2px 10px rgba(0,0,0,0.7); }`}</style>
    </div>
  );
}

// --- The Compare Component (Provided by you) ---
const IconDotsVertical = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </svg>
);

const Compare = ({
  firstImage = '',
  secondImage = '',
  className,
  initialSliderPercentage = 0,
  slideMode = 'drag', // Default to drag
  showHandlebar = true
}) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  const handleMove = useCallback(
    clientX => {
      if (!sliderRef.current) return;
      if (slideMode === 'hover' || (slideMode === 'drag' && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        setSliderXPercent(Math.max(0, Math.min(100, percent)));
      }
    },
    [slideMode, isDragging]
  );

  const handleStart = useCallback(
    clientX => {
      if (slideMode === 'drag') {
        setIsDragging(true);
        handleMove(clientX); // Immediately update position on click
      }
    },
    [slideMode, handleMove]
  );

  const handleEnd = useCallback(() => {
    if (slideMode === 'drag') {
      setIsDragging(false);
    }
  }, [slideMode]);

  const handleTouchStart = useCallback(
    e => handleStart(e.touches[0].clientX),
    [handleStart]
  );
  const handleTouchEnd = useCallback(() => handleEnd(), [handleEnd]);
  const handleTouchMove = useCallback(
    e => handleMove(e.touches[0].clientX),
    [handleMove]
  );
  const handleMouseDown = useCallback(e => handleStart(e.clientX), [handleStart]);
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd]);
  const handleMouseMove = useCallback(e => handleMove(e.clientX), [handleMove]);

  return (
    <div
      ref={sliderRef}
      className={cn('w-full h-full overflow-hidden', className)}
      style={{
        position: 'relative',
        cursor: slideMode === 'drag' ? (isDragging ? 'grabbing' : 'grab') : 'col-resize'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleEnd} // Stop dragging if mouse leaves the container
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {' '}
      <AnimatePresence initial={false}>
        {' '}
        <motion.div
          className="h-full w-px absolute top-0 m-auto z-30 bg-gradient-to-b from-transparent from-[5%] to-[95%] via-white to-transparent"
          style={{ left: `${sliderXPercent}%` }}
          transition={{ duration: 0 }}
        >
          {/* Sparkles are now part of the slider handle */}
          {/* <div className="w-40 h-full absolute top-1/2 -translate-y-1/2 -left-20 pointer-events-none">
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1.5}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
          </div>{' '} */}
          {showHandlebar && (
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-2xl z-30 -left-5 top-1/2 -translate-y-1/2 absolute">
              <IconDotsVertical />{' '}
            </div>
          )}{' '}
        </motion.div>{' '}
      </AnimatePresence>{' '}
      <div className="overflow-hidden w-full h-full relative z-10 pointer-events-none">
        {' '}
        <motion.div
          className={cn(
            'absolute inset-0 z-20 w-full h-full select-none overflow-hidden'
          )}
          style={{ clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)` }}
          transition={{ duration: 0 }}
        >
          {' '}
          <img
            alt="first image"
            src={firstImage}
            className={cn(
              'absolute inset-0 z-20 w-full h-full object-contain select-none'
            )}
            draggable={false}
          />{' '}
        </motion.div>{' '}
      </div>{' '}
      <motion.img
        className={cn(
          'absolute top-0 left-0 z-0 w-full h-full object-contain select-none'
        )}
        alt="second image"
        src={secondImage}
        draggable={false}
      />{' '}
    </div>
  );
};
