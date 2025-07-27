import { createFileRoute } from '@tanstack/react-router';
import FeaturesSection from '@/components/landing page/FeatureCard';
import { HeroTest } from '@/components/landing page/HeroTest';
import Navbar from '@/components/landing page/Navbar';
import Constellation from '@/components/landing page/Constellation';
import { BrandLogos } from '@/components/landing page/brandLogos';
import { Reviews } from '@/components/landing page/Reviews';
import Footer from '@/components/landing page/Footer';

export const Route = createFileRoute('/')({
  component: Index
});

function Index() {
  return (
    <div className=" mx-auto ">
      <Navbar />
      <HeroTest />
      <FeaturesSection />
      <BrandLogos />
      <Constellation />
      <Reviews />
      <Footer />
    </div>
  );
}
