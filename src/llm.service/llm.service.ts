import axios from "axios";

export async function generateAnswers(prompt: string) {
  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3",
    prompt,
    stream: false,
  });

  return res.data.response;
}
