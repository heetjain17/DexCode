import React from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '../ui/button';
import { ArrowUpRight, CodeXml, List } from 'lucide-react';
const Hero = () => {
  return (
    <div className="flex flex-col gap-12 px-6 text-center max-w-7xl m-auto pt-24">
      <Link
        to="#"
        className="inline-flex items-center px-5 py-1 text-md border-red-200 border-2  text-red-200 transition-transform duration-150 ease-in-out hover:shadow-[0_0_30px_rgba(255,100,103,0.5)] active:scale-95 rounded-4xl m-auto "
      >
        Ready for a Warm-up?
        <ArrowUpRight className="h-5 w-5 ml-1.5" />
      </Link>

      <h1 className="font-family-hero text-7xl leading-tight font-semibold bg-gradient-to-r from-red-500 to-red-800 bg-clip-text text-transparent">
        From Problem to Optimal Solution,&nbsp;Faster.
      </h1>
      <p className="text-neutral-200 text-lg max-w-4xl m-auto">
        <span style={{ fontFamily: 'logo-font' }}>DEXCODE</span> is the ultimate training
        ground for improving your problem-solving speed. Our vast library of challenges
        and community solutions helps you recognize patterns, implement efficient
        algorithms, and write optimal code faster than ever.
      </p>

      <div className="flex gap-5 m-auto">
        <button
          className="
              inline-flex items-center justify-center gap-x-2 
              px-5 py-2 
              bg-red-500 text-white text-lg font-semibold
              rounded-lg 
              transition-colors hover:bg-red-600 active:bg-red-700
            "
        >
          <CodeXml />
          <span>Browse Problems</span>
        </button>
        <button
          className="
              inline-flex items-center justify-center gap-x-2 
              px-5 py-2 
              bg-neutral-950 text-white text-lg font-semibold
              rounded-lg 
              transition-colors hover:bg-neutral-900 active:bg-neutral-800
            "
        >
          <Link to="#" className="inline-flex items-center justify-center gap-x-3">
            <List />
            <span>Explore Playlists</span>
          </Link>
        </button>
      </div>
      <div></div>
    </div>
  );
};

export default Hero;
