import React from 'react';

const reviews1 = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Computer Science Student',
    avatar: 'https://placehold.co/100x100/E91E63/FFFFFF?text=PS',
    review:
      'The company-specific problem lists were a lifesaver for my interview prep. I practiced the Amazon playlist for a month, walked in feeling confident, and landed the internship!'
  },
  {
    id: 2,
    name: 'David Chen',
    role: 'Former Marketing Manager',
    avatar: 'https://placehold.co/100x100/3F51B5/FFFFFF?text=DC',
    review:
      "Switching careers into tech felt daunting, but the structured roadmap made it possible. This platform didn't just teach me to code; it taught me how to think like an engineer."
  },
  {
    id: 3,
    name: 'Maria Garcia',
    role: 'Senior Software Engineer',
    avatar: 'https://placehold.co/100x100/4CAF50/FFFFFF?text=MG',
    review:
      'My algorithm skills were getting rusty after 8 years in the industry. DEXCODE is my go-to for sharpening my fundamentals.'
  }
];
const reviews2 = [
  {
    id: 4,
    name: 'Ben Carter',
    role: 'Product Designer',
    avatar: 'https://placehold.co/100x100/FFC107/FFFFFF?text=BC',
    review:
      'The UI is clean, fast, and beautiful. The code editor and dark mode are a joy to use. It’s amazing how a well-designed platform can make studying feel less like a chore.'
  },
  {
    id: 5,
    name: 'Aisha Khan',
    role: 'Bootcamp Graduate',
    avatar: 'https://placehold.co/100x100/9C27B0/FFFFFF?text=AK',
    review:
      'The community discussions are invaluable. Seeing how others tackled the same challenge is almost more valuable than solving the problem itself. A truly collaborative environment.'
  },
  {
    id: 6,
    name: 'Kenji Tanaka',
    role: 'Self-Taught Developer',
    avatar: 'https://placehold.co/100x100/00BCD4/FFFFFF?text=KT',
    review:
      "The 'Constellation' roadmap is genius. I used to jump around randomly on other platforms, but here I can see how topics connect. It finally clicked."
  }
];

const reviews3 = [
  {
    id: 7,
    name: 'Fatima Al-Jamil',
    role: 'Data Analyst',
    avatar: 'https://placehold.co/100x100/FF5722/FFFFFF?text=FA',
    review:
      'The detailed test cases are a game-changer. It shows you exactly which input broke your logic, which helped me debug and learn so much faster.'
  },
  {
    id: 8,
    name: 'Alex Horvat',
    role: 'Freelance Developer',
    avatar: 'https://placehold.co/100x100/795548/FFFFFF?text=AH',
    review: 'Best platform for DSA, period. Great problems, clean interface, no fluff.'
  },
  {
    id: 9,
    name: 'Chloe Lim',
    role: 'New Grad Software Engineer @ Google',
    avatar: 'https://placehold.co/100x100/607D8B/FFFFFF?text=CL',
    review:
      'I dedicated three months to this platform before my final interviews. The structured approach gave me the confidence to tackle any question they threw at me. I accepted an offer from Google. Thank you!'
  }
];

const QuoteIcon = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 8 8Z" />
    <path d="M21 21c-3 0-7-1-7-8V5c0-1.25.75-2 2-2h4c1.25 0 2 .75 2 2v6c0 7-4 8-8 8Z" />
  </svg>
);

const ReviewCard = ({ review }) => {
  return (
    <div className="relative flex flex-col gap-4 p-6 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg transition-all duration-300 hover:shadow-red-900/20 hover:-translate-y-1">
      <div className="absolute top-4 right-4 text-neutral-700">
        <QuoteIcon />
      </div>
      <div className="flex items-center gap-4">
        <img
          src={review.avatar}
          alt={review.name}
          className="w-12 h-12 rounded-full border-2 border-neutral-700"
        />
        <div>
          <div className="font-semibold text-white">{review.name}</div>
          <div className="text-sm text-neutral-400">{review.role}</div>
        </div>
      </div>
      <p className="text-neutral-300 leading-relaxed mt-2">{review.review}</p>
    </div>
  );
};

export const Reviews = () => {
  return (
    <div className="relative w-full bg-neutral-950 py-24 px-4 overflow-hidden">
      {/* Background Aurora Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-[800px] h-[800px] bg-red-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Loved by Developers Worldwide
          </h2>
          <p className="max-w-2xl text-lg text-neutral-400">
            From beginners to senior engineers, see what our users have to say about their
            journey with DEXCODE.
          </p>
        </div>

        {/* Masonry-style columns for reviews */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Column 1: Always visible */}
          <div className="flex flex-col gap-8">
            {reviews1.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          {/* Column 2: Hidden on small screens, visible on medium and up */}
          <div className="hidden md:flex flex-col gap-8 lg:mt-12">
            {reviews2.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          {/* Column 3: Hidden on small and medium screens, visible on large and up */}
          <div className="hidden lg:flex flex-col gap-8">
            {reviews3.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
