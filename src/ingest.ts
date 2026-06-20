import path from "node:path";
import { parseDocument } from "./parse-document.js";
import { textToChunks } from "./utility/text-to-chunks.js";
import { getEmbeddings } from "./embeddings/embed.js";
import { saveChunk } from "./repositories/chunk.repository.js";

const filePath = process.argv[2]; //taking file path via cli

if (!filePath) {
  console.log("Usage: node ingest.js <file>");
  process.exit(1);
}

const fileName = path.basename(filePath);
console.log(`Parsing document from file ${fileName}...`);

const text = await parseDocument(filePath);
console.log("Chunking...");

const chunks = textToChunks(text);
console.log(`Found ${chunks.length} chunks`);

for (let i = 0; i < chunks.length; i++) {
  const chunk = chunks[i];
  console.log(`Embedding chunk ${i + 1}/${chunks.length}`);
  if (!chunk) {
    console.log(`Missing: chunk on loop ${i}`);
    process.exit(1);
  }

  const embedding = await getEmbeddings(chunk!);
  await saveChunk({
    sourceFile: fileName,
    chunkText: chunk!,
    embedding,
  });
}

console.log("Done!");
