import { z } from 'zod';

export const supportedLanguages = ['PYTHON', 'JAVA', 'JAVASCRIPT', 'CPP'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export type LanguageId = number;

export const testcaseSchema = z.object({
  input: z.string(),
  output: z.string(),
});

export const testcasesSchema = z.array(testcaseSchema);

export type Testcase = z.infer<typeof testcaseSchema>;

export interface Judge0Submission {
  source_code: string;
  language_id: LanguageId;
  stdin: string;
}

export interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  status: {
    id: number;
    description: string;
  };
}

export interface ExecutionResult {
  testCase: number;
  passed: boolean;
  stdout: string | null;
  expected: string;
  status: string;
  memory?: string;
  time?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
}

export interface ExecutionResponse {
  detailedResults: ExecutionResult[];
  allPassed: boolean;
}

export const runCodeSchema = z.object({
  source_code: z.string().min(1),
  language: z.enum(supportedLanguages),
  problemId: z.uuid(),
});

export const problemExampleSchema = z.object({
  compiler: z.object({
    input: z.string(),
    output: z.string(),
  }),
  display: z
    .object({
      input: z.string(),
      output: z.string(),
    })
    .optional(),
  explanation: z.string().optional(),
});

export const problemExamplesSchema = z.array(problemExampleSchema);

export type RunCodeDTO = z.infer<typeof runCodeSchema>;

export type SubmitCodeDTO = RunCodeDTO;
