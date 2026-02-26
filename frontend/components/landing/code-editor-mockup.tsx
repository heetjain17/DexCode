// Static, always-dark Monaco-style code editor preview for the hero section.
// Uses hardcoded GitHub Dark colors – intentionally NOT themed.

const LINE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

function CodeLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 leading-6 hover:bg-[#161b22] px-1 rounded transition-colors duration-100">
      {children}
    </div>
  );
}

function LineNumber({ n }: { n: number }) {
  return (
    <span className="w-5 shrink-0 select-none text-right text-[#6e7681] text-[13px]">
      {n}
    </span>
  );
}

// Syntax token components
const K = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#ff7b72]">{children}</span>
); // keyword
const F = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#d2a8ff]">{children}</span>
); // function name
const B = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#79c0ff]">{children}</span>
); // built-in / number
const S = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#a5d6ff]">{children}</span>
); // string
const C = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#8b949e] italic">{children}</span>
); // comment
const P = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#e6edf3]">{children}</span>
); // plain / punctuation

const CODE_LINES = [
  <CodeLine key={1}>
    <LineNumber n={1} />
    <span>
      <K>def </K><F>twoSum</F><P>(</P><P>nums</P><P>, </P><P>target</P><P>):</P>
    </span>
  </CodeLine>,
  <CodeLine key={2}>
    <LineNumber n={2} />
    <span>
      <P>    seen </P><K>= </K><P>{"{"}</P><P>{"}"}</P>
      <C>  # hash map: value → index</C>
    </span>
  </CodeLine>,
  <CodeLine key={3}>
    <LineNumber n={3} />
    <span>
      <P>    </P><K>for </K><P>i, num </P><K>in </K>
      <B>enumerate</B><P>(</P><P>nums</P><P>):</P>
    </span>
  </CodeLine>,
  <CodeLine key={4}>
    <LineNumber n={4} />
    <span>
      <P>        complement </P><K>= </K>
      <P>target </P><K>- </K><P>num</P>
    </span>
  </CodeLine>,
  <CodeLine key={5}>
    <LineNumber n={5} />
    <span>
      <P>        </P><K>if </K>
      <P>complement </P><K>in </K><P>seen:</P>
    </span>
  </CodeLine>,
  <CodeLine key={6}>
    <LineNumber n={6} />
    <span>
      <P>            </P><K>return </K>
      <P>[</P><P>seen</P><P>[</P><P>complement</P><P>], </P><P>i</P><P>]</P>
    </span>
  </CodeLine>,
  <CodeLine key={7}>
    <LineNumber n={7} />
    <span>
      <P>        seen</P><P>[</P><P>num</P><P>] </P><K>= </K><P>i</P>
    </span>
  </CodeLine>,
  <CodeLine key={8}>
    <LineNumber n={8} />
    <span>
      <P>    </P><K>return </K><P>[]</P>
    </span>
  </CodeLine>,
];

export default function CodeEditorMockup() {
  return (
    <div className="w-full max-w-lg rounded-xl overflow-hidden border border-[#30363d] shadow-2xl shadow-black/60 font-mono text-sm select-none">

      {/* Window chrome */}
      <div className="flex items-center gap-2 bg-[#161b22] px-4 py-3 border-b border-[#21262d]">
        {/* Traffic lights */}
        <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <div className="h-3 w-3 rounded-full bg-[#27c93f]" />

        {/* File tabs */}
        <div className="ml-4 flex items-end gap-0">
          <span className="rounded-t-md px-3 py-1 text-xs bg-[#0d1117] text-[#e6edf3] border-t border-l border-r border-[#30363d]">
            solution.py
          </span>
          <span className="px-3 py-1 text-xs text-[#6e7681] hover:text-[#8b949e] cursor-pointer">
            problem.md
          </span>
        </div>

        {/* Right: language indicator */}
        <div className="ml-auto flex items-center gap-3 text-xs text-[#6e7681]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#3fb950]" />
            Python 3.11
          </span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Problem info bar */}
      <div className="flex items-center justify-between bg-[#0d1117] px-4 py-2 border-b border-[#21262d]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[#e6edf3]">1. Two Sum</span>
          <span className="rounded-full bg-[#3fb950]/15 px-2 py-0.5 text-[10px] font-medium text-[#3fb950]">
            Easy
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-[#238636] px-3 py-1 text-xs font-medium text-white hover:bg-[#2ea043] transition-colors">
            Run
          </button>
          <button className="rounded-md bg-[#1f6feb] px-3 py-1 text-xs font-medium text-white hover:bg-[#388bfd] transition-colors">
            Submit
          </button>
        </div>
      </div>

      {/* Code area */}
      <div className="bg-[#0d1117] px-3 py-3 space-y-0">
        {CODE_LINES}
      </div>

      {/* Console output */}
      <div className="bg-[#0d1117] border-t border-[#21262d] px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6e7681]">
            Console
          </span>
          <span className="rounded-full bg-[#3fb950]/15 px-2 py-0.5 text-[10px] font-medium text-[#3fb950]">
            3 / 3 passed
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#3fb950]">✓</span>
            <span className="text-[#8b949e]">Test 1</span>
            <span className="text-[#e6edf3]">nums=[2,7,11,15], target=9</span>
            <span className="ml-auto text-[#6e7681]">1ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#3fb950]">✓</span>
            <span className="text-[#8b949e]">Test 2</span>
            <span className="text-[#e6edf3]">nums=[3,2,4], target=6</span>
            <span className="ml-auto text-[#6e7681]">0ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#3fb950]">✓</span>
            <span className="text-[#8b949e]">Test 3</span>
            <span className="text-[#e6edf3]">nums=[3,3], target=6</span>
            <span className="ml-auto text-[#6e7681]">0ms</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-[#6e7681]">
          Runtime: 1ms · Memory: 14.2 MB · O(n) time complexity
        </div>
      </div>

    </div>
  );
}
