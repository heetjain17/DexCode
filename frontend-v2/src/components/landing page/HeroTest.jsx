import React from 'react';
import { cn } from '@/lib/utils';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import { ArrowUpRight, CodeXml, List } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function HeroTest() {
  return (
    <div className="relative flex h-[40rem] w-full items-center justify-center bg-white dark:bg-neutral-950">
      <div
        className={cn(
          'absolute inset-0',
          '[background-size:40px_40px]',
          '[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]',
          'dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]',

          '[mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_70%)]'
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="flex pointer-events-none absolute inset-0 items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_5%,black)] dark:bg-neutral-950"></div>
      <div className="flex z-20 flex-col justify-center items-center gap-5 max-w-7xl m-auto">
        <HoverBorderGradient
          as={Link}
          to="#"
          className={
            'flex cursor-pointer justify-center items-center gap-1 bg-neutral-950'
          }
        >
          <span>Ready for a Warm-up?</span>
          <ArrowUpRight className="h-5 w-5" />
        </HoverBorderGradient>
        <p className="relative text-center z-20 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text py-4 text-4xl font-bold text-transparent sm:text-7xl">
          From Problem to Optimal Solution,&nbsp;Faster.
        </p>
        <p className="text-neutral-200 relative z-20 text-md max-w-4xl m-auto text-center">
          <span style={{ fontFamily: 'logo-font' }}>DEXCODE</span> is the ultimate
          training ground for improving your problem-solving speed. Our vast library of
          challenges and community solutions helps you recognize patterns, implement
          efficient algorithms, and write optimal code faster than ever.
        </p>
        <div className="flex gap-5">
          <Link
            to="#"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white font-semibold focus:ring-2 focus:ring-red-400 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <CodeXml />
            Browse Problems
          </Link>
          <Link
            to="#"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-neutral-800 text-white font-semibold border-2 border-neutral-700 hover:scale-105 focus:ring-2 focus:ring-neutral-500 hover:bg-neutral-700 hover:border-neutral-600 transition-all duration-300 ease-in-out"
          >
            <List />
            Explore Playlists
          </Link>
        </div>
      </div>
    </div>
  );
}
