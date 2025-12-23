import React, { useState, useMemo } from 'react';
import { useProblems } from '@/hooks/useProblems';
import { Link } from '@tanstack/react-router';
import { Loader2, Search } from 'lucide-react';
import { clsx } from 'clsx';

// Constants for pagination
const PROBLEMS_PER_PAGE = 20;

const ProblemListPage = () => {
  // 1. State management for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Fetch all problems once
  const { data: allProblems, isLoading, isError } = useProblems();
  console.log('Data received in component from useProblems hook:', allProblems);
  // 3. Memoized filtering logic
  const filteredProblems = useMemo(() => {
    if (!allProblems) return [];

    let problems = allProblems;

    // Apply difficulty filter
    if (difficulty !== 'All') {
      problems = problems.filter(p => p.difficulty === difficulty);
    }

    // Apply search query filter (checks title and tags)
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      problems = problems.filter(
        p =>
          p.title.toLowerCase().includes(lowerCaseQuery) ||
          p.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
      );
    }

    return problems;
  }, [allProblems, difficulty, searchQuery]); // Re-run only when these change

  // 4. Memoized pagination logic
  const { paginatedProblems, totalPages } = useMemo(() => {
    const total = Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE);
    const start = (currentPage - 1) * PROBLEMS_PER_PAGE;
    const end = start + PROBLEMS_PER_PAGE;
    const paginated = filteredProblems.slice(start, end);
    return { paginatedProblems: paginated, totalPages: total };
  }, [filteredProblems, currentPage]); // Re-run only when these change

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }
  if (isError) {
    return <div className="text-center p-8 text-red-500">Error loading problems.</div>;
  }

  return (
    <div className=" text-white max-w-7xl mx-auto p-4 md:p-8 h-full overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Problems</h1>

      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by title or tag..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={difficulty}
          onChange={e => {
            setDifficulty(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="All">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      {/* Problem List / Table */}
      <div className="bg-neutral-950/50 rounded-lg overflow-hidden border border-neutral-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral-800 text-neutral-400 uppercase">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Difficulty</th>
              <th className="px-6 py-3">Tags</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProblems.map(problem => (
              <tr
                key={problem.id}
                className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium">
                  <Link to={`/problems/${problem.id}`} className="hover:text-red-500">
                    {problem.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={clsx('px-2 py-1 rounded-full text-xs font-semibold', {
                      'bg-green-900/50 text-green-400': problem.difficulty === 'EASY',
                      'bg-yellow-900/50 text-yellow-400': problem.difficulty === 'MEDIUM',
                      'bg-red-900/50 text-red-400': problem.difficulty === 'HARD'
                    })}
                  >
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 flex flex-wrap gap-2">
                  {problem.tags.map(tag => (
                    <span key={tag} className="bg-neutral-700 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-neutral-800 rounded-lg disabled:opacity-50 cursor-pointerfg"
        >
          Previous
        </button>
        <span className="text-neutral-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-neutral-800 rounded-lg disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProblemListPage;
