import z from 'zod';

const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);
const languageEnum = z.enum(['PYTHON', 'JAVA', 'JAVASCRIPT', 'CPP']);

const exampleSchema = z.array(
  z.object({
    input: z.string().min(1),
    output: z.string().min(1),
    explanation: z.string().optional(),
    order: z.number().int().min(0),
  })
);

const constraintSchema = z.array(
  z.object({
    description: z.string().min(1),
    order: z.number().int().min(0),
  })
);

const testcaseSchema = z
  .array(
    z.object({
      input: z.string().min(1),
      output: z.string().min(1),
      isHidden: z.boolean().default(false),
      order: z.number().int().min(0),
    })
  )
  .min(1);

const codeSnippetSchema = z
  .array(
    z.object({
      language: languageEnum,
      template: z.string(),
      userCode: z.string(),
    })
  )
  .min(1);

const referenceSolutionSchema = z
  .array(
    z.object({
      language: languageEnum,
      solution: z.string().min(1),
    })
  )
  .min(1);

export const createProblemSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  difficulty: difficultyEnum,
  tags: z.array(z.string().min(1)),
  examples: exampleSchema,
  constraints: constraintSchema,
  testcases: testcaseSchema,
  codeSnippets: codeSnippetSchema,
  referenceSolutions: referenceSolutionSchema,
  hints: z.array(z.string().min(1)).optional().default([]),
  companies: z.array(z.string().min(1)).optional().default([]),
  editorial: z.string().optional(),
});

export const updateProblemSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  difficulty: difficultyEnum.optional(),
  editorial: z.string().optional(),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string().min(1)).optional(),
  companies: z.array(z.string().min(1)).optional(),
  hints: z.array(z.string().min(1)).optional(),
  examples: exampleSchema.optional(),
  constraints: constraintSchema.optional(),
  testcases: testcaseSchema.optional(),
  codeSnippets: codeSnippetSchema.optional(),
  referenceSolutions: referenceSolutionSchema.optional(),
});

export const problemQuerySchema = z.object({
  difficulty: difficultyEnum.optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const problemIdParamSchema = z.object({
  id: z.string().min(1),
});

export type CreateProblemDTO = z.infer<typeof createProblemSchema>;
export type UpdateProblemDTO = z.infer<typeof updateProblemSchema>;
export type ProblemQueryDTO = z.infer<typeof problemQuerySchema>;
export type ProblemIdParamDTO = z.infer<typeof problemIdParamSchema>;
