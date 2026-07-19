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

    // scores.set(item.id, (scores.get(item.id) || 0) + score);
    scores.set(item.id, { ...item, score });
  });

  keywordResults.forEach((item, index) => {
    const score = 1 / (K + index + 1);

    // scores.set(item.id, (scores.get(item.id) || 0) + score);
    if (scores.has(item.id)) {
      scores.get(item.id).score += score;
    } else {
      scores.set(item.id, { ...item, score });
    }
  });

  // return [...scores.entries()].sort((a, b) => b[1] - a[1]);
  return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, 5);
}
