import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language];
};

export const submitBatch = async (submissions) => {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    {
      submissions,
    }
  );

  return data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while (true) {
    const { data } = await axios.get(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(','),
          base64_encoded: false,
          // fields:
        },
      }
    );

    // extracting data from obj
    const results = data.submissions;

    // 1 - in queue
    // 2 - processing
    // 3 - accepted
    // 4 - incorrect
    // 5 - time limit exceeded
    // .... errors in code

    // make sures that program is run completely for each result
    const isAllDone = results.every(
      // r => r.status.id !== 1 && r.status.id !== 2
      (r) => r.status.id > 2
    );

    if (isAllDone) return results;

    await sleep(1000);
  }
};

export const getLanguageName = (languageId) => {
  const LANGUAGE_NAMES = {
    74: 'TypeScript',
    63: 'JavaScript',
    71: 'Python',
    62: 'Java',
  };

  return LANGUAGE_NAMES[languageId] || 'Unknown';
};
