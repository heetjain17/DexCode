import { Link } from '@tanstack/react-router';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import React from 'react';

const MinimalistHeader = ({ problem }) => {
  return (
    <header className="flex items-center justify-between w-full h-10 px-4 bg-neutral-900 border-b border-neutral-800 flex-shrink-0">
      <Link
        to="/"
        className="text-2xl text-neutral-400 flex items-center"
        style={{ fontFamily: 'logo-font' }}
      >
        <ChevronLeft className="text-neutral-200 h-5 w-5" />
        <p>
          <span className="text-red-700">DEX</span>CODE
        </p>
      </Link>
      <div className="text-center">
        <h1 className="text-lg font-medium text-neutral-200">{problem.title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* User Avatar Dropdown would go here */}
        <button className="flex items-center gap-2 text-neutral-300 hover:text-white">
          <img
            src="https://placehold.co/32x32/7C3AED/FFFFFF?text=D"
            alt="User Avatar"
            className="w-8 h-8 rounded-full"
          />
        </button>
      </div>
    </header>
  );
};

export default MinimalistHeader;
