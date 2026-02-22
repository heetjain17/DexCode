import z from 'zod';

const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'ARRAY']);
const stringArray = z.array(z.string().min(1));
const jsonSchema = z.unknown();

export const createProblemSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  difficulty: difficultyEnum,
  tags: stringArray,
  examples: jsonSchema,
  constraints: jsonSchema,
  testcases: jsonSchema,
  codeSnippets: jsonSchema,
  referenceSolutions: jsonSchema,
  hints: stringArray.optional().default([]),
  companies: stringArray.optional().default([]),
  editorial: z.string().optional(),
});

export const updateProblemSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  difficulty: difficultyEnum.optional(),
  tags: stringArray.optional(),
  companies: stringArray.optional(),
  examples: jsonSchema.optional(),
  constraints: jsonSchema.optional(),
  testcases: jsonSchema.optional(),
  codeSnippets: jsonSchema.optional(),
  referenceSolutions: jsonSchema.optional(),
  hints: stringArray.optional(),
  editorial: z.string().optional(),
});

export const problemIdParamSchema = z.object({
  problemId: z.uuid(),
});

export type CreateProblemDTO = z.infer<typeof createProblemSchema>;
export type UpdateProblemDTO = z.infer<typeof updateProblemSchema>;
export type ProblemIdDTO = z.infer<typeof problemIdParamSchema>;
