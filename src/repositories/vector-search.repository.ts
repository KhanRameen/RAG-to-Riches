import { db } from "../db/db.js";

interface VectorSearchInterface {
  embedding: number[];
  limit: number;
}

export async function vectorSearch({
  embedding,
  limit = 10,
}: VectorSearchInterface) {
  const vector = `[${embedding.join(",")}]`;

  const result = await db.query(
    `
    SELECT
      id,
      chunk_text,
      source_file,
      (1 - (embedding <=> $1::vector))
      AS score

    FROM document_chunks

    ORDER BY embedding <=> $1::vector

    LIMIT $2
    `,
    [vector, limit],
  );

  return result.rows;
}
