import { getEmbeddings } from "../embeddings/embed.js";
import { cosineSimilarity } from "./cosine-similarity.js";

interface store {
  chunk: any;
  embeddings: any;
}

export async function retrieveRelevantChunks(
  questions: string,
  vectorStore: store[],
  topK = 3,
) {
  const queryEmbedding = await getEmbeddings(questions); //chunks
  const scored = vectorStore.map((item) => ({
    chunk: item.chunk,
    score: cosineSimilarity(queryEmbedding, item.embeddings),
  }));
  scored.sort((a, b) => b.score - a.score);

  // console.log("Relavant Chunks:", scored);

  return scored.slice(0, topK);
}
