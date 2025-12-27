import { useSubmission } from '@/hooks/useSubmissions';
import clsx from 'clsx';
import {
  BookOpen,
  BrainCircuit,
  History,
  Icon,
  Lightbulb,
  Loader2,
  MessageSquare
} from 'lucide-react';
import React, { useState } from 'react';

const Description = ({ problem }) => (
  <div className="space-y-4 prose prose-invert prose-sm max-w-none">
    <div className="flex items-center gap-4">
      <span className="text-xl font-semibold text-white">{problem.title}</span>
      <span className="px-2 py-1 text- font-medium text-green-300 bg-green-900/50 rounded">
        {problem.difficulty}
      </span>
    </div>
    <div className="flex gap-2 flex-wrap">
      {problem.tags.map(tag => (
        <span key={tag} className="bg-neutral-800 py-1 px-2 rounded-md font-medium">
          {tag}
        </span>
      ))}
    </div>
    <div className="text-sm">{problem.description}</div>
    <p className="font-semibold text-neutral-200 text-base">Examples: </p>
    {problem.examples.map((ex, i) => (
      <div
        key={i}
        className="flex flex-col gap-1 bg-neutral-800/50 p-3 text-sm rounded-lg"
      >
        <p>
          <span className="font-bold">Input:</span> {ex.display.input}
        </p>
        <p>
          <span className="font-bold">Output:</span> {ex.display.output}
        </p>
        {ex.explanation && (
          <div>
            <span className="font-bold">Explanation:</span>
            <div className="whitespace-pre-wrap">{ex.explanation}</div>
          </div>
        )}
      </div>
    ))}

    <div className="flex flex-col gap-2 bg-neutral-800/50 p-3 rounded-lg">
      <p className="font-semibold text-neutral-200 text-base">Constraints:</p>
      <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
        {problem.constraints.map((c, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: c }} />
        ))}
      </ul>
    </div>
  </div>
);

const Submission = ({ problemId }) => {
  const { data: submissions, isLoading, isError } = useSubmission(problemId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-neutral-400 mt-8">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading Submissions...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 mt-8">Error fetching submissions.</div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return <div className="text-center text-neutral-500 mt-8">No submissions yet.</div>;
  }

  return (
    <div className="space-y-3">
      {submissions.map(submission => (
        <div
          key={submission.id}
          className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <div className="flex flex-col">
            <span
              className={clsx('font-semibold text-sm', {
                'text-green-500': submission.status === 'Accepted',
                'text-red-500': submission.status !== 'Accepted'
              })}
            >
              {submission.status}
            </span>
            <span className="text-neutral-400 text-xs mt-1">{submission.language}</span>
          </div>
          <div className="text-right text-xs text-neutral-400">
            {new Date(submission.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

const DisplayPanel = ({ problem }) => {
  const [activeTab, setActiveTab] = useState('description');

  const TabBtn = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        activeTab === id
          ? 'text-white border-red-500'
          : 'text-neutral-400 border-transparent hover:text-white hover:bg-neutral-800/50'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-lg text-xs">
      <div className="flex items-center border-b border-neutral-800 px-2 flex-shrink-0">
        <TabBtn id="description" label="Description" icon={BookOpen} />
        <TabBtn id="hints" label="Hints" icon={Lightbulb} />
        <TabBtn id="submissions" label="Submissions" icon={History} />
        <TabBtn id="ai" label="AI Tutor" icon={BrainCircuit} />
        <TabBtn id="discussions" label="Discussions" icon={MessageSquare} />
      </div>

      <div className="flex-grow overflow-y-auto p-4 min-h-0">
        {activeTab === 'description' && <Description problem={problem} />}
        {activeTab == 'hints' && (
          <div>{problem.hints || 'No Hints available for this problem'}</div>
        )}
        {activeTab == 'submissions' && <Submission problemId={problem.id} />}
        {activeTab == 'ai' && <div>Coming soon...</div>}
        {activeTab == 'discussions' && <div>Coming soon...</div>}
      </div>
    </div>
  );
};

export default DisplayPanel;
