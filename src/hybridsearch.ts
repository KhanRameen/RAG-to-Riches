import { getEmbeddings } from "./embeddings/embed.js";
import { keywordSearch } from "./repositories/keyword-search.repository.js";
import { fuseResults } from "./repositories/rank-fusion.repository.js";
import { vectorSearch } from "./repositories/vector-search.repository.js";

export async function hybridSearch(question: string) {
  const embedding = await getEmbeddings(question);
  const [vectorResults, keywordResults] = await Promise.all([
    vectorSearch({
      embedding,
      limit: 10,
    }),

    keywordSearch({
      query: question,
      limit: 10,
    }),
  ]);

  return fuseResults({ vectorResults, keywordResults });
}
