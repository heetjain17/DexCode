import React from 'react';
import { FlaskConical, Search, Sparkles, ChartColumnIncreasing } from 'lucide-react';

// Data for the features
export const features = [
  {
    icon: Search,
    title: 'Explore Challenges',
    description:
      'Browse curated problems categorized by topics, difficulty, and playlists.',
    borderColor: 'border-red-400',
    shadowColor: 'hover:shadow-[0_0_30px_rgba(255,100,103,0.5)]'
  },
  {
    icon: Sparkles,
    title: 'Solve with Feedback',
    description:
      'Write code in our editor and get real-time results with detailed test cases.',
    borderColor: 'border-red-500',
    shadowColor: 'hover:shadow-[0_0_30px_rgba(251,44,54,0.5)]'
  },
  {
    icon: FlaskConical,
    title: 'Track Your Progress',
    description:
      'Visualize your growth with streaks, solved history, and topic-wise mastery.',
    borderColor: 'border-red-600',
    shadowColor: 'hover:shadow-[0_0_30px_rgba(231,0,11,0.5)]'
  },
  {
    icon: ChartColumnIncreasing,
    title: 'Prepare Company-Wise',
    description:
      'Target your dream company with problem sets based on real interview questions.',
    borderColor: 'border-red-700',
    shadowColor: 'hover:shadow-[0_0_30px_rgba(193,0,7,0.5)]'
  }
];

// CORRECTED FeatureCard Component
function FeatureCard({ icon: Icon, title, description, borderColor, shadowColor }) {
  return (
    // This outer div is the static grid cell. It gets the border and padding.
    // This ensures it respects the divider lines.
    <div className="p-8 border-t border-r border-neutral-800">
      {/* This inner div contains all the content and handles the hover scaling effect. */}{' '}
      <div
        className="
        flex flex-col items-center text-center
        transition-transform duration-300 ease-in-out
        hover:scale-105 
        "
      >
        {/* The Circular Element */}{' '}
        <div
          className={`relative flex h-48 w-48 items-center justify-center rounded-full p-4 
            transition-shadow duration-300 ${shadowColor}
`}
        >
          {' '}
          <div
            className={`absolute inset-0 rounded-full border-8 ${borderColor}`}
          ></div>{' '}
          <div className="relative flex flex-col gap-1 h-40 w-40 items-center justify-center rounded-full bg-neutral-800">
            {Icon && <Icon className="h-8 w-8 text-neutral-100" />}{' '}
            <h3 className="max-w-[12ch] text-lg font-bold text-neutral-100">
              {title}
            </h3>{' '}
          </div>{' '}
        </div>
        <p className="mt-6 max-w-[30ch] text-neutral-400">{description}</p>{' '}
      </div>{' '}
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <div
      className="flex flex-col gap-10 justify-center items-center 
      bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950
    py-10"
    >
      {/* The container gets the left and bottom border to complete the box. */}
      {/* We have removed all `divide-*` classes. */}
      <div className="text-4xl md:text-5xl font-bold text-white">
        Your path to{' '}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-800 ">
          Mastery
        </span>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-b border-neutral-800">
        {features.map(feature => (
          <FeatureCard
            icon={feature.icon}
            key={feature.title}
            title={feature.title}
            description={feature.description}
            borderColor={feature.borderColor}
            shadowColor={feature.shadowColor}
          />
        ))}
      </div>
    </div>
  );
}
