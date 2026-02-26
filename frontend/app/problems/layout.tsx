import Navbar from "@/components/landing/navbar";

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dex-bg text-dex-text">
      <Navbar />
      {children}
    </div>
  );
}
