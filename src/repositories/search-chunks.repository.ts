import { db } from "../db/db.js";

interface SearchChunksInterface {
  embedding: number[];
  limit: number;
}

export async function searchChunks({
  embedding,
  limit = 5,
}: SearchChunksInterface) {
  const vector = `[${embedding.join(",")}]`;

  const result = await db.query(
    `
        SELECT
        source_file,
        chunk_text,
        ROUND(
            CAST(
            (1 - (embedding <=> $1::vector))
            AS numeric
            ),
            4
        ) AS similarity
        FROM document_chunks
        ORDER BY embedding <=> $1::vector
        LIMIT $2;
    `,
    [vector, limit],
  );

  return result.rows;
}


