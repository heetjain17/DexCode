import Navbar from "@/components/landing/navbar";

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col bg-dex-bg text-dex-text">
      <Navbar />
      <div className="h-[72px] shrink-0" />
      {children}
    </div>
  );
}
