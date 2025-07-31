import MinimalistHeader from '@/components/problem_solving/MinimalistHeader';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DescriptionPanel from '@/components/problem_solving/DescriptionPanel';
import WorkspacePanel from '@/components/problem_solving/WorkspacePanel';
import { useProblem } from '@/hooks/useProblems';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/(app)/problems/')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <div>
      <div></div>
    </div>
  );
}
