import { getEmbeddings } from "../embeddings/embed.js";
import { textToChunks } from "../utility/text-to-chunks.js";

export async function buildVectorStore(text: string) {
  const chunks = textToChunks(text);
  const store = []; //non-persistent
  for (const chunk of chunks) {
    const embeddings = await getEmbeddings(chunk);
    store.push({
      chunk,
      embeddings,
    });
  }
  return store;
}
