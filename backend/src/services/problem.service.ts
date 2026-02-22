import { CreateProblemDTO, ProblemIdDTO } from '@/validators/problem.schema';

export const createProblemService = async (
  data: CreateProblemDTO,
  userId: string
) => {
  const {
    title,
    description,
    difficulty,
    tags,
    companies,
    examples,
    constraints,
    testcases,
    codeSnippets,
    referenceSolutions,
    hints,
    editorial,
  } = data;
};

export const getProblemService = async (id: ProblemIdDTO) => {};
export const deleteProblemService = async (id: ProblemIdDTO) => {};
