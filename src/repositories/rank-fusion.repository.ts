interface FuseResultsInterface {
  vectorResults: {
    id: string;
    chunk_text: string;
    source_file: string;
    score: number;
  }[];
  keywordResults: {
    id: string;
    chunk_text: string;
    source_file: string;
    score: number;
  }[];
}

export function fuseResults({
  vectorResults,
  keywordResults,
}: FuseResultsInterface) {
  const scores = new Map();

  const K = 60;

  vectorResults.forEach((item, index) => {
    const score = 1 / (K + index + 1);

    scores.set(item.id, (scores.get(item.id) || 0) + score);
  });

  keywordResults.forEach((item, index) => {
    const score = 1 / (K + index + 1);

    scores.set(item.id, (scores.get(item.id) || 0) + score);
  });

  return [...scores.entries()].sort((a, b) => b[1] - a[1]);
}
