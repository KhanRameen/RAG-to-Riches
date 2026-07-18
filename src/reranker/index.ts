import { naiveRerank } from "./naive.js";

interface rerankInterface {
  question: string;
  chunks: string;
}

export async function rerank({ question, chunks }: rerankInterface) {
  return naiveRerank({ question, chunks });
}
