import { db } from "../db/db.js";

interface SaveChunkArgs {
  sourceFile: string;
  chunkText: string;
  embedding: number[];
}

export async function saveChunk({
  sourceFile,
  chunkText,
  embedding,
}: SaveChunkArgs) {
  const vector = `[${embedding.join(",")}]`;

  await db.query(
    `
      INSERT INTO document_chunks
      (
        source_file,
        chunk_text,
        embedding
      )
      VALUES
      ($1, $2, $3::vector)
    `,
    [
      sourceFile,
      chunkText,
      vector,
    ]
  );
}