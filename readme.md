# Vector Database for Data Persistance!

\*uptil now I was storing all the chunks and embeddings in a variable, **now we integrate vector db\***

## So what is a Vector Database?

A vector DB stores:

```
Chunk Text
+
Embedding Vector
+
Metadata
```

| id  | text             | embedding    |
| --- | ---------------- | ------------ |
| 1   | Refund policy... | [0.123, ...] |
| 2   | Leave policy...  | [0.456, ...] |

for my learning i have chosen **pgvector** since i already have familiarity of PostgreSQL and pgvector happens to be just an extention of **vector data type** to Postgres, turning it from an sql db to a vector db.
There do exist other, more common separate vector database systems like Pinecone, Qdrant, Weaviate etc.

# Step 1: Setup

Instead of locally installing PostgreSQ I am using Docker to use it virtually instead.

### 1- The docker-compose.yml file

```yaml
services:
  postgres: #service nickname
    image: pgvector/pgvector:pg17 # pulls the official pgvector image built on Postgres version 17
    container_name: rag-postgres #nickname of the container (you choose it, wanna write "tears-of-ai" go ahead.. name it)

    environment: # you write here the required startup settings
      POSTGRES_USER: postgresn #master administrator username
      POSTGRES_PASSWORD: postgres #login password to admin
      POSTGRES_DB: rag #empty db name on, created on startup

    ports:
      - "5432:5432" #[Your Computer Port] : [Inside Container Port]
      #[Your Computer Port] : [Inside Container Port]. PostgreSQL naturally listens to port 5432 inside its own little bubble. This line opens a door so code running on your actual laptop can talk to the database at localhost:5432

    volumes: #Storage for data persistance, without it internal data vanishes since containers are temporary.
      - postgres_data:/var/lib/postgresql/data #links a virtual storage folder > name:path

volumes: # registers the database you write under it as a permanent, global storage volume
  postgres_data: #name of out virtual storage folder
```

### 2-Start Database

run

```
docker compose up
```

Verify:

```
docker ps
```

_output: rag-postgres_

### 3-Connect to PostgreSQL

on the terminal, enter:

```
docker exec -it rag-postgres psql -U postgres -d rag
```

output:

```
rag=#
```

**The syntax break down:**

<exec:> Tells Docker to execute a brand new command inside an already running container.

<it:> Short for interactive and tty. This keeps a live connection open between your keyboard and the container so you can type live commands.

<rag-postgres:> The specific name of the container you want to enter.

<psql:> The name of the built-in terminal program inside the container used to talk to PostgreSQL.

<postgres:> -U Logs you in using the admin Username (postgres) you set up in your file.

<rag:> -d Automatically opens the specific database named rag

**The Result:** Your prompt changes to rag=#, meaning your Windows terminal is now temporarily acting as a direct hotline inside your Linux database.

# Step 2: Enable pgvector

Run:

```sql
CREATE EXTENSION vector;
```

Verify:

```bash
\dx
```

You should see something similar to `vector` listed among installed extensions.

_Concept_: once you install pgvector, your PostgreSQL starts to understand VECTOR datatype

# Step 3: Create Our First Vector Table

```sql
CREATE TABLE document_chunks (
    id SERIAL PRIMARY KEY,

    source_file TEXT NOT NULL,

    chunk_text TEXT NOT NULL,

    embedding VECTOR(768) --notice this 768
);
```

**Why Vector (768):** 768 is the embedding size of the model `nomic-embed-text`. it varies from model to model. We are to set, in our database, the length of the vector exactly as the length of the embedding our model provides.

### Inspect the Table

Run:

```
\d document_chunks
```

You should see:

```
embedding | vector(768)
```

**Now the embeddings and the chunks lives permanently in PostgreSQL**

---

# The Real Sauce!

instead of calculating cosine similarity ourselves, we will now let Postgres do the job.

When we write:

```sql
ORDER BY embedding <=> query_vector
```

it is like saying:

`"Sort rows by how close their embeddings are to this query embedding."`

so in a normal sql query way we can think of it as:
`ORDER BY cosine_distance`
except pgvector implements it efficiently.

## The Operators

| Operator | Meaning                |
| -------- | ---------------------- |
| `<->`    | Euclidean distance     |
| `<#>`    | Negative inner product |
| `<=>`    | Cosine distance        |

For RAG we almost always use **<=>**
because we care about semantic similarity.

### Important Concept

Earlier we learned:

Cosine Similarity:

```
1 = very similar
0 = unrelated
-1 = opposite
```

**But pgvector uses Cosine Distance instead**
| Similarity | Distance |
| ---------- | -------- |
| 1.0 | 0.0 |
| 0.9 | 0.1 |
| 0.2 | 0.8 |

**Relationship:**
`distance = 1 - similarity`

**When comparing**
we make sure to use `::vector`
this converts the retrived data into a true vector data type

eg:

```sql

db.query(
    `
      SELECT
        id,
        source_file,
        chunk_text,
        embedding <=> $1::vector AS distance
      FROM document_chunks
      ORDER BY distance
      LIMIT $2
    `,
    [vector, limit]
  );

```

**This is now Semantic Search using SQL**

The fundamental job of a vector DB:

```
Store vectors
+
Find nearest vectors
```

That's it. Everything else is extra features.

---
# Indexing in Vector DB
Using traditional db indexing method fails on vectors because comparing every query vector with the stored chunks vector, which in a real world use case excedea to millions and billions of vectors, can become very painful for the DB. 

Additionally vectors, unlike traditional data, don't really need a similarity (vector A = vector B) search, rather the closest vectors to the query vector suffice the query vector search scenario. 

This is why instead of indexing every vector, we only check the vectors that are likely to be close.This method is called **Approximate Nearest Neighbor (ANN)** 

### Two Major Approaches for ANN
- `IVFFlat:` Works by clustering vectors.
- `HNSW:` Newer, better approach. *<- This is what we will use*

## Understanding HNSW
HNSW creates graphs of vectors, so you start searching from somewhere, jump to the closer vectors jump after jump until you find your answer.
```js
    `A`
 ↙   ↓   ↘
B    `C`    D
 ↙   ↓   ↘
E    F    `G`
           ↓
          ...
```
HNSW indexes faster and with better accuracy compared to IVFFlat

## usage
```SQL
CREATE INDEX document_chunks_embedding_hnsw
ON document_chunks
USING hnsw (
    embedding vector_cosine_ops  /*indexing operation*/
);
```
`vector_cosine_ops` defines the search operation using cosine distance for **embedding <=> query_vector**

*Real Rag System Scale from 200 chunks to 20M chunks very fast and thus ANN indexes become essential!*

---
# Metadata
For a smarter search instead of searching all chunks real systems user Meta data filtering.

*example*
```sql
Only chunks from:
- finance department
- uploaded this month
- company handbook
```
to do this we just add columns to the table 

*example schema*
```sql
ALTER TABLE document_chunks
ADD COLUMN department TEXT;
```
*example usage*
```sql 
WHERE department = 'finance'
```