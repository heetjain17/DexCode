const COMPANIES = [
  { name: "Google", className: "font-normal tracking-tight" },
  { name: "Amazon", className: "font-bold tracking-tight" },
  { name: "Microsoft", className: "font-semibold tracking-wide" },
  { name: "Meta", className: "font-black" },
  { name: "Netflix", className: "font-black tracking-tighter" },
  { name: "Stripe", className: "font-semibold" },
];

export default function TrustedBy() {
  return (
    <section className="border-y border-dex-border py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-xs font-semibold tracking-widest text-dex-muted uppercase">
          Trusted by engineers at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {COMPANIES.map((company) => (
            <span
              key={company.name}
              className={`cursor-default text-2xl text-dex-muted transition-colors duration-200 select-none hover:text-dex-text-secondary ${company.className}`}
            >
              {company.name}
            </span>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-dex-muted">
          Engineers preparing for interviews at top companies use DexCode daily.
        </p>
      </div>
    </section>
  );
}
