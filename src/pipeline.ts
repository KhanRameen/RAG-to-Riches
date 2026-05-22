import { cosineSimilarity } from "./cosine-similarity.js";
import { getEmbeddings } from "./embed.js";
import { textToChunks } from "./text-to-chunks.js";

interface embeddedChunks {
  chunk: string;
  embedding: any;
}

async function processDocument(text: string) {
  const chunks = textToChunks(text);
  const embeddedChunks = [];

  for (const chunk of chunks) {
    const embedding = await getEmbeddings(chunk);

    embeddedChunks.push({
      chunk,
      embedding,
    });
  }

  return embeddedChunks;
}

function findMostRelevantChunks(queryEmbedding: [], chunks: embeddedChunks[]) {
  let scored = [];
  for (const item of chunks) {
    //comparing the query with the chunks embeddings we get from our data
    const score = cosineSimilarity(queryEmbedding, item.embedding);
    scored.push({
      chunks: item.chunk,
      score,
    });
  }
  return scored.sort((a, b) => b.score - a.score);
}
