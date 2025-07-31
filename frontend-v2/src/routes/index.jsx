import { createFileRoute } from '@tanstack/react-router';
import FeaturesSection from '@/components/landing page/FeatureCard';
import { HeroTest } from '@/components/landing page/HeroTest';
import Navbar from '@/components/landing page/Navbar';
import Constellation from '@/components/landing page/Constellation';
import { BrandLogos } from '@/components/landing page/brandLogos';
import { Reviews } from '@/components/landing page/Reviews';
import Footer from '@/components/landing page/Footer';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authKeys } from '@/api/authService';

export const Route = createFileRoute('/')({
  validateSearch: search => {
    // Use Zod or a simple check to validate
    return {
      login: search.login === 'success' ? true : undefined,
      error: search.error ? String(search.error) : undefined
    };
  },
  component: Index
});

function Index() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // 2. Use the useSearch hook to get the validated parameters
  const { login, error } = Route.useSearch();

  useEffect(() => {
    const isLoginSuccess = localStorage.getItem('oauth_login_success') === 'true';

    if (isLoginSuccess) {
      localStorage.removeItem('oauth_login_success');

      toast.success('Welcome!', {
        description: 'You have been successfully logged in.'
      });

      queryClient.invalidateQueries({ queryKey: authKeys.user() });

      // navigate({ to: '/dashboard' });
    }
  }, [navigate, queryClient]);

  return (
    <div className=" mx-auto ">
      <Navbar />
      <CursorGlow className="border border-neutral-800">
        <HeroTest />
      </CursorGlow>
      <FeaturesSection />
      <Constellation />
      <BrandLogos />
      <Reviews />
      <Footer />
    </div>
  );
}

export const CursorGlow = ({ children, className }) => {
  const containerRef = useRef(null);
  const [opacity, setOpacity] = useState(0);
  const [glowStyle, setGlowStyle] = useState({});

  const handleMouseMove = event => {
    if (!containerRef.current) return;

    // Get the position of the mouse relative to the container element
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setGlowStyle({
      background: `radial-gradient(300px at ${x}px ${y}px, rgba(239, 68, 68, 0.25), transparent 80%)`
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      {/* Render the children first */}
      {children}

      {/* The Glow Effect is now an overlay on top, but won't block mouse events */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ ...glowStyle, opacity }}
      />
    </div>
  );
};
