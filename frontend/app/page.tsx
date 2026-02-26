import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import TrustedBy from "@/components/landing/trusted-by";
import Features from "@/components/landing/features";
import Roadmap from "@/components/landing/roadmap";
import Reviews from "@/components/landing/reviews";
import FinalCta from "@/components/landing/final-cta";
import Footer from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-dex-bg text-dex-text">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Features />
      <Roadmap />
      <Reviews />
      <FinalCta />
      <Footer />
    </main>
  );
}
