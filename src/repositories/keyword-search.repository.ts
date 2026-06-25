import { db } from "../db/db.js";

interface KeywordSearchInterface {
  query: string;
  limit: number;
}

export async function keywordSearch({
  query,
  limit = 10,
}: KeywordSearchInterface) {
  const result = await db.query(
    `
    SELECT
      id,
      chunk_text,
      source_file,

      ts_rank(
        search_vector,
        plainto_tsquery(
          'english',
          $1
        )
      ) AS score

    FROM document_chunks

    WHERE search_vector @@
          plainto_tsquery(
            'english',
            $1
          )

    ORDER BY score DESC

    LIMIT $2
    `,
    [query, limit],
  );

  return result.rows;
}
