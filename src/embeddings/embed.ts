import axios from "axios";

export async function getEmbeddings(text: string) {
  const res = await axios.post("http://localhost:11434/api/embeddings", {
    model: "nomic-embed-text",
    prompt: text,
  });

  if (!res.data) {
    throw new Error("No response from the model");
  }

  return res.data.embedding;
}

