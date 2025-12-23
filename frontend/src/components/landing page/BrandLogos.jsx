import React from 'react';
import { InfiniteMovingCards } from '../ui/infinite-moving-cards';

export function BrandLogos() {
  return (
    <div className="pt-20 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white">
        Trusted by Developers at Top Companies
      </h2>
      <p className="mt-4 text-lg text-neutral-400">
        Our platform is the training ground for engineers at these innovative companies
        and many more.
      </p>

      <div className="h-auto rounded-md flex pt-10 flex-col antialiased dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          images={images}
          pauseOnHover={false}
          direction="right"
          speed="normal"
        />
      </div>
    </div>
  );
}

const images = [
  { id: 'google', src: '/logos/google.png', alt: '' },
  { id: 'amazon', src: '/logos/amazon.png', alt: '' },
  { id: 'of', src: '/logos/of.png', alt: '' },
  { id: 'meta', src: '/logos/meta.png', alt: '' },
  { id: 'ycomb', src: '/logos/ycomb.png', alt: '' },
  { id: 'microsoft', src: '/logos/micro.png', alt: '' }
];
