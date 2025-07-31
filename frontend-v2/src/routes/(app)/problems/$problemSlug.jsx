import MinimalistHeader from '@/components/problem_solving/MinimalistHeader';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DisplayPanel from '@/components/problem_solving/DescriptionPanel';
import WorkspacePanel from '@/components/problem_solving/WorkspacePanel';
import { useProblem } from '@/hooks/useProblems';
import { GripVertical, Loader2, TriangleAlert } from 'lucide-react';
import { useSubmission } from '@/hooks/useSubmissions';

export const Route = createFileRoute('/(app)/problems/$problemSlug')({
  component: RouteComponent
});

function RouteComponent() {
  const { problemSlug } = Route.useParams();
  // console.log(problemSlug);

  const {
    data: problem,
    isLoading: isProblemLoading,
    isError: isProblemError
  } = useProblem(problemSlug);

  if (isProblemLoading) {
    return (
      <div className="flex text-xl flex-col gap-5 items-center justify-center h-screen bg-neutral-950 text-white">
        <Loader2 className="h-10 w-10 animate-spin" />
        Loading Problem...
      </div>
    );
  }
  if (isProblemError) {
    return (
      <div className="flex text-xl flex-col text-red-600 gap-5 items-center justify-center h-screen bg-neutral-950 ">
        <TriangleAlert className="h-10 w-10 animate-spin " />
        Error Loading Problem...
      </div>
    );
  }
  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950 text-white">
        Problem not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white overflow-hidden">
      <MinimalistHeader problem={problem} />
      <main className="flex-grow p-2 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full overflow-hidden">
          <Panel defaultSize={50} minSize={30}>
            <DisplayPanel problem={problem} />
          </Panel>
          {/* <PanelResizeHandle className="w-2 bg-transparent hover:bg-red-500/50 transition-colors duration-200" /> */}
          <PanelResizeHandle className="w-4 bg-neutral-950 flex justify-center items-center h-screen">
            <GripVertical className="h-4 w-4" />
          </PanelResizeHandle>
          <Panel defaultSize={50} minSize={30}>
            <WorkspacePanel problem={problem} />
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}
