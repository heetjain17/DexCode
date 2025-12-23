import { useRunCode, useSubmitCode } from '@/hooks/useExecuteCode';
import { getLanguageId } from '@/lib/utils';
import { Editor } from '@monaco-editor/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Check,
  CheckCircle2,
  ChevronUp,
  GripHorizontal,
  Loader2,
  XCircle
} from 'lucide-react';
import { ChevronDown, Play, RefreshCw, Send, Settings } from 'lucide-react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

const WorkspacePanel = ({ problem }) => {
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('PYTHON');
  const [runResults, setRunResults] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isResultsPanelVisible, setIsResultsPanelVisible] = useState(false);

  console.log(problem);

  const [saveStatus, setSaveStatus] = useState('Saved');
  const debouncedCode = useDebounce(code, 1500);

  const isMounted = useRef(false);

  const queryClient = useQueryClient();

  const {
    mutate: runCode,
    data: runData,
    isPending: isRunning,
    reset: resetRun
  } = useRunCode();
  const { mutate: submitCode, isPending: isSubmitting } = useSubmitCode();

  useEffect(() => {
    if (!problem?.id) return;

    const snippet = problem.codeSnippets?.[selectedLanguage];

    const key = `code-draft-${problem.id}-${selectedLanguage}`;
    const savedCode = localStorage.getItem(key);

    if (savedCode) {
      setCode(savedCode);
    } else {
      const defaultCode = problem.codeSnippets?.[selectedLanguage]?.userCode || '';
      setCode(defaultCode);
    }

    setTimeout(() => {
      isMounted.current = true;
    }, 100);
  }, [problem.id, selectedLanguage, problem.codeSnippets]);

  useEffect(() => {
    if (!isMounted.current || !problem?.id) return;

    const key = `code-draft-${problem.id}-${selectedLanguage}`;
    localStorage.setItem(key, debouncedCode);
    setSaveStatus('Saved');
  }, [debouncedCode, problem.id, selectedLanguage]);

  const handleCodeChange = value => {
    setCode(value || '');
    setSaveStatus('Saving...');
  };

  const handleLanguageChange = e => {
    isMounted.current = false;
    const lang = e.target.value;
    setSelectedLanguage(lang);
  };

  useEffect(() => {
    if (isRunning || isSubmitting || runResults || submissionResult) {
      setIsResultsPanelVisible(true);
    }
  }, [isRunning, isSubmitting, runResults, submissionResult]);

  const closeResultsPanel = () => {
    setRunResults(null);
    setSubmissionResult(null);
    setIsResultsPanelVisible(false);
  };

  const getFullSourceCode = () => {
    const template = problem.codeSnippets?.[selectedLanguage]?.template;
    const userCode = code;

    if (!template) {
      toast.error('Could not find code template for this language.');
      return null;
    }

    return template.replace(
      /\/\/\s*\[USER_CODE_HERE\]|\#\s*\[USER_CODE_HERE\]/,
      userCode
    );
  };

  const onRun = () => {
    const source_code = getFullSourceCode();
    if (!source_code) return;

    resetRun();
    setRunResults(null);
    setSubmissionResult(null);
    runCode(
      {
        source_code: source_code,
        language_id: getLanguageId(selectedLanguage),
        problemId: problem.id
      },
      {
        onSuccess: data => {
          toast.success('Code Executed!');
          console.log('Data received directly in component onSuccess:', data);
          setRunResults(data);
        }
      }
    );
  };

  const onSubmit = () => {
    const source_code = getFullSourceCode();
    if (!source_code) return;

    setRunResults(null);
    setSubmissionResult(null);

    submitCode(
      {
        source_code: source_code,
        language_id: getLanguageId(selectedLanguage),
        problemId: problem.id
      },
      {
        onSuccess: data => {
          toast.success('Solution submitted successfully!');
          queryClient.invalidateQueries({ queryKey: ['submissions'] });

          // console.log('Submission successful:', data);

          setSubmissionResult(data);
        }
      }
    );
  };

  const resetCode = () => {
    if (!problem?.id) return;
    const key = `code-draft-${problem.id}-${selectedLanguage}`;
    localStorage.removeItem(key);

    const defaultCode = problem.codeSnippets?.[selectedLanguage]?.userCode || '';
    setCode(defaultCode);

    toast.info('Code has been reset to default.');
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-lg overflow-hidden">
      {/* <div className="flex flex-grow flex-col relative  min-h-0"> */}
      {/* Editor */}
      <PanelGroup direction="vertical">
        <Panel defaultSize={100} minSize={20}>
          <Editor
            height="100%"
            language={selectedLanguage.toLowerCase()}
            theme="vs-dark"
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              wordWrap: 'on'
            }}
          />
        </Panel>
        {isResultsPanelVisible && (
          <>
            {/* hover:bg-red-500/50 transition-colors data-[resize-handle-state=drag]:bg-red-500" */}
            <PanelResizeHandle className="h-4 bg-neutral-900 flex justify-center items-center">
              <GripHorizontal className="h-4 w-4" />
            </PanelResizeHandle>
            <Panel defaultSize={40} minSize={4}>
              <div className="bg-neutral-900 h-full flex mt-0 flex-col">
                <div className="flex items-center justify-between px-2 pb-3 mt-0 border-b border-neutral-800 flex-shrink-0">
                  <h3 className="font-semibold text-white">
                    {isSubmitting || submissionResult
                      ? 'Submission Result'
                      : 'Test Cases'}
                  </h3>
                  <button
                    onClick={closeResultsPanel}
                    className="text-neutral-400 hover:text-white "
                  >
                    &times;
                  </button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto text-xs space-y-2">
                  {(isRunning || isSubmitting) && (
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{isSubmitting ? 'Submitting...' : 'Running...'}</span>
                    </div>
                  )}
                  {submissionResult && (
                    <div>
                      <div
                        className={`text-lg font-bold mb-4 ${submissionResult.status === 'Accepted' ? 'text-green-500' : 'text-red-500'}`}
                      >
                        Status: {submissionResult.status}
                      </div>
                      {submissionResult.testCases?.map(result => (
                        <div key={result.testCase} className="mb-2">
                          <div className="flex items-center gap-2 font-semibold">
                            {result.passed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span>
                              Test Case {result.testCase}:{' '}
                              {result.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {runResults &&
                    !submissionResult &&
                    runResults?.detailedResults.map(result => (
                      <div key={result.testCase}>
                        <div className="flex items-center gap-2 font-semibold">
                          {result.passed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span
                            className={result.passed ? 'text-green-500' : 'text-red-500'}
                          >
                            Test Case {result.testCase}:{' '}
                            {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <div className="ml-7 mt-2 p-2 bg-neutral-800 rounded-md font-mono text-xs">
                          <p>
                            <span className="font-bold text-neutral-400">Input:</span>{' '}
                            {problem.examples[result.testCase - 1]?.input}
                          </p>
                          <p>
                            <span className="font-bold text-neutral-400">
                              Your Output:
                            </span>{' '}
                            {result.stdout || 'N/A'}
                          </p>
                          <p>
                            <span className="font-bold text-neutral-400">Expected:</span>{' '}
                            {result.expected}
                          </p>
                          {result.stderr && (
                            <p className="text-red-400">
                              <span className="font-bold">Error:</span> {result.stderr}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
      {/* Utility Bar */}
      <div className="flex items-center justify-between w-full h-14 px-4 bg-neutral-900 border-t border-neutral-800 text-sm text-neutral-300 flex-shrink-0">
        <div className="flex items-center gap-4">
          <select
            className="select select-bordered select-primary rounded-xl p-2 bg-neutral-800 w-40"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            {Object.keys(problem.codeSnippets || {}).map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          <button
            className="p-2 rounded-md hover:bg-neutral-800 transition-colors"
            title="Editor Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            className="p-2 rounded-md hover:bg-neutral-800 transition-colors"
            title="Reset to default code"
            onClick={resetCode}
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-neutral-400 text-xs">
            {saveStatus === 'Saved' && <Check className="h-4 w-4 text-green-500" />}
            <span>{saveStatus}</span>
          </div>
        </div>

        {/* run & submit */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600 font-semibold transition-colors disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>Run</span>
          </button>
          <button
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspacePanel;
