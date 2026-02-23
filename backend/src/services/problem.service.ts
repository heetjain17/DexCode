import { CreateProblemDTO, ProblemIdDTO } from '@/validators/problem.schema';

export const createProblemService = async (_data: CreateProblemDTO, _userId: string) => {};

export const getProblemService = async (_id: ProblemIdDTO) => {};
export const deleteProblemService = async (_id: ProblemIdDTO) => {};
