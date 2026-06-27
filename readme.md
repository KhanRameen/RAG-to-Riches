# Vector Database for Data Persistance!

uptil now I was storing all the chunks and embeddings in a variable, **now we integrate the vector DB**

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

for my learning i have chosen **pgvector** since i already have familiarity of PostgreSQL and pgvector happens to be just an extention of **vector data type** to Postgres, turning it from an SQL DB to a Vector DB.
There do exist other, more common separate vector database systems like Pinecone, Qdrant, Weaviate which i may try later but today is not the day...

okay, lets get to work!

## Step 1: Setup

Instead of locally installing PostgreSQ I'll run it on docker, Yeah, I'm just that cool (got space issues, twin)

### 1- The docker-compose.yml file

First time writing a Dockerfile? No worries, I've commented what each line does

```yaml
services:
  postgres: # service nickname
    image: pgvector/pgvector:pg17 # pulls the official pgvector image built on Postgres version 17
    container_name: rag-postgres #nickname of the container

    environment: # you write here the required startup settings
      POSTGRES_USER: postgres # master admin username - bascially the login Id
      POSTGRES_PASSWORD: postgres # login password to admin
      POSTGRES_DB: rag # empty db name on, created on startup

    ports:
      - "5432:5432" # [Your Computer Port] : [Inside Container Port]
      # PostgreSQL listens to port 5432 inside its own little bubble. This line just opens a door so code running on your actual laptop can talk to the database at localhost:5432

    volumes: # Storage for data persistance, without it internal data vanishes since containers are temporary.
      - postgres_data:/var/lib/postgresql/data # links a virtual storage folder > name:path

volumes: # registers the database you register under it as a permanent, global storage volume
  postgres_data: # name of the virtual storage folder - we just linked it above
```

### 2-Start Database

Now we start the DB with a single command

_before this step you haves to make sure docker is running on your machine_

Run

```
docker compose up
```

and verify:

```
docker ps
```

_this will give you a list of containers on your machine, check out for **output: rag-postgres**_

### 3- Connect to PostgreSQL

on the terminal, type:

```
docker exec -it rag-postgres psql -U postgres -d rag
```

it should now display

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

## Step 2: Enable pgvector

next up, on the cli

Run:

```sql
CREATE EXTENSION vector;
```

verify using:

```bash
\dx
```

You should see something similar to `vector` listed among installed extensions.

Once you install pgvector, your PostgreSQL starts to understand VECTOR datatype. First Milestone Achieved.

next up we

## Step 3: Create Our First Vector Table

_Via the CLI_

```sql
CREATE TABLE document_chunks (
    id SERIAL PRIMARY KEY,

    source_file TEXT NOT NULL,

    chunk_text TEXT NOT NULL,

    embedding VECTOR(768) --notice this 768
);
```

**Why Vector (768):** 768 is the embedding size of the model `nomic-embed-text` I'm using to create the embeddings. This varies from model to model. Always check your model's embedding length first and be sure to set the same exact size in your database configuration because you will eventually be storing every vector of that length from here onwards.

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

instead of calculating cosine similarity ourselves (like I was doing previously), we will now let Postgres do the job.

When we write:

```sql
ORDER BY embedding <=> query_vector
```

we are saying to Postgres:

`"Sort rows by how close their embeddings are to this query embedding."`

so in a normal sql query it would be as simple as writing `ORDER BY cosine_distance`,
except pgvector implements it efficiently.

## The Query Operators

pg vectors has a few core query operators to calculate how similar two vectors are based of different metrics

| Operator | Meaning                |
| -------- | ---------------------- |
| `<->`    | Euclidean distance     |
| `<#>`    | Negative inner product |
| `<=>`    | Cosine distance        |

For RAG we almost always use **<=>**
because we usually only care about the semantic similarity (cosine distance).

### Important Concept

Earlier, I was calculating the cosine similarity and was measuring it like

```
1 = very similar
0 = unrelated
-1 = opposite
```

**But pgvector uses Cosine Distance**
| Similarity | Distance |
| ---------- | -------- |
| 1.0 | 0.0 |
| 0.9 | 0.1 |
| 0.2 | 0.8 |

**Relationship:**
`distance = 1 - similarity`

**When comparing**
we make sure to use `::vector`. This converts the retrived data into a true vector data type

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

Using traditional db indexing method fails on vectors because comparing every query vector with the stored chunks vector, which in real world exceeds to millions, even billions, can become very painful for the DB.

Additionally vectors, unlike traditional data, don't really need a similarity (vector A = vector B) search, rather the closest vectors to the query vector suffice the query vector search scenario.

This is exactly why instead of indexing every vector, we only check the vectors that are likely to be close. This method is called **Approximate Nearest Neighbor (ANN)**

### Two Major Approaches for ANN

- `IVFFlat:` Works by clustering vectors.
- `HNSW:` Organizes high-dimensional vectors into a multi-layer graph. _<- This is what we will use_

## Understanding HNSW

HNSW creates graphs of vectors, so you start searching from somewhere, jump to a closer vectors, then a closer vector... jump after jump until you find your closest answer.

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
-- prompt within the Docker container

CREATE INDEX document_chunks_embedding_hnsw
ON document_chunks
USING hnsw (
    embedding vector_cosine_ops --indexing-operation
);
```

`vector_cosine_ops` defines the search operation using cosine distance for **embedding <=> query_vector**

_Real Rag System Scale from 200 chunks to 20M chunks very fast and thus ANN indexes becomes essential!_

---

# Metadata

This is where PostgresSQL shines. In realworld we don't query the nearest neighbors all the time, For a smarter search, we almost always need a specific filter. This is whereMeta data filtering comes in

It acts as a hard limit boolean (the data is either in or out of) consstraint

_example_

```sql
Only chunks from:
- finance department
- uploaded this month
- company handbook
```

to do this we just add columns to the table

_example schema_

```sql
ALTER TABLE document_chunks
ADD COLUMN department TEXT;
```

_example usage_

```sql
WHERE department = 'finance'
```

---

# Hybrid Search

Uptil now we were working with only vectors, storing them.. retrieving them. Embedding models are trained to understand meanings only, so when embed vectors and do a vector search we are basically searching for vectors with the closest meaning. This works for cases where you want to retrieve data with meaningful context, but what about syntax and identifiers? imagine asking status for the invoice id:`INV-2024-001`. The db may have many ids following the exact pattern with changing numbers like 001,002,003 and so on, These such identifier looks very similar and even meaningless when it comes to the vector cosine similarity search. To the vectors (which focuses on the semantics and not the syntax) `INV-2024-001` and `INV-2024-002` is almost pretty much the same, so what about when we actually want to query based of the invoice Id? This is where we use keyword search

Instead of using pure vector search, we will now use two brains. A "Vector search" and a "Keyword Search", while vector is good for meaning and semantics, keyword is good for syntax, Ids, Names, Acronyms.. basically for the use of exact terms. This is called the Hybrid Search.

Instead of doing:

```
Question -> Vector Search -> Results
```

We do:

```c
1: Question -> Keyword Search -> Results
2: Question -> Vector Search -> Results

3: Combine Results -> Final Results
```

**How does the combined result works?**
A Hybrid search for "Apple" returns documents about the fruit and the company, but ranks a document containing the exact word "Apple" higher than one that semantically implies "technology."

## Crucial nuance with pg vector

Unlike other vector dbs that offer built-in features for hybrid search.. pg vector does not offer any such feature :'), So we to the manual combinition, the glueing of vectors and PostgreSQL's built in **Full Text Search (FTS)** in a single SQL query (guess we get more learning this way... _cope_)

## Let's alter our db for Hybrid Search!

To apply it, we need three columns in our table. One for context, one for embedding and one for FTS. Then just like we used HNSW indexing for vectors, we use **GIN** for keyword/text searches.

GIN (Generalized Inverted Text) is basically just like those indexes we get at the back of our text books.. instead of searching the entire book for the keyword, which Im pretty sure we all are too lazy to do so.. hopefully, we just look at the index and it tells us exactly what page holds that word, Simple.

Now onto the real work

### Step 1: Add the text column

we'll alter our already made table

```sql
ALTER TABLE document_chunks
ADD COLUMN search_vector tsvector; ---strongly typed
```

`tsvector` is the native PostgreSQL data type specifically for the FTS which turns the text into a sorted list of root words

_example_

```
'cat':2 'quick':5 'run':4
```

It stores searchable terms efficiently

### Step 2: Populate it.

_The filling up of this new empty column with sum data_

```sql
UPDATE document_chunks
SET search_vector = to_tsVector('english', chunk_text);
```

`to_tsvector('english', ...)` function processes the 'english' text by removing stopwords like "I" "am" "for" etc and reduces words to rootwords only (example 'purchases" becomes "purchase") and then counts the occurance/position of each word.

**Warning!**
The populate query (since it has no `WHERE` clause) will update the entire table, so working with tables having 100k+ rows can potentially take hours, locking the db for reads and writes the whole time. A safer way to populate is by doing it in batches using the `WHERE` clause

### Step 3: Create an Index using GIN

```sql
CREATE INDEX document_chunks_fts_idx
ON document_chunks
USING GIN(search_vector);
```

### Step 4: Test Keyword Search

Similar to vector indexing <=> search operator for cosine distance, **tsVector uses `@@` as the search operator for matching**

Here we can simple search using

**The Filter Method**

```sql
SELECT chunk_text
FROM document_chunks
WHERE search_vector @@ plainto_tsquery('english', 'refund');
```

but this search method can be painful, it dumps out all the resultant rows containing the words with zero information on their relevancy.

so we use a better approach instead

**The Ranker + Sorter Method**

```sql
SELECT
  chunk_text,
  ts_rank(search_vector, plainto_tsquery('english', 'refund')) AS rank
FROM document_chunks
WHERE search_vector @@ plainto_tsquery('english', 'refund')
ORDER BY rank DESC;
```

Now this query uses the exact same where clause as the Filter method but then also calculates the numerical score `rank` for each row, giving you the most relevant chunks on top. (+10 brownie points for this method)

**ts_rank calculates the score by**

1. **Frequency:** How many times does "refund" appear in this specific chunk? (More = higher score).
2. **Proximity:** (If you had multiple words, it checks how close they are to each other).
3. **Length:** If a chunk is very short (e.g., 10 words) and contains "refund" once, it gets a higher score than a huge chunk (e.g., 1,000 words) that contains "refund" once. (Basically shorter documents are considered more "about" that topic)

**What you get:** You get the text and a decimal number (e.g., 0.0601). Most importantly, like i said above because of ORDER BY rank DESC, the most relevant chunks rise to the top

## Time to Implement the Hybrid Search in our Code!

I've created two functions

- [A Vector Search Function](src/repositories/vector-search.repository.ts)

- [ Keyword Search Function](src/repositories/keyword-search.repository.ts)

The issue is both vector and keyword scores on a different scale. so if vector scales something around 0.94 0.91 0.8, keyword would maybe scale it somewhere like 0.35 0.21 0.18. adding these values together would results in irrelevant chunks in return, The vector numbers will always completely drown out the keyword number. So instead of using the score we use the ranking positions and Normalized values using the mathematical trick **Reciprocal Rank Fusion (RRF)**. It only looks at where a document ranks in each list

### Reciprocal Rank Fusion (RRF)

Conceptually:

```
High rank = more points
```

First we set

```js
const K = 60; //standard for RRF
```

and then calculate the score using

```js
vectorResults.forEach((item, index) => {
  const score = 1 / (K + (index + 1));
  scores.set(item.id, (scores.get(item.id) || 0) + score);
});

keywordResults.forEach((item, index) => {
  const score = 1 / (K + (index + 1));
  scores.set(item.id, (scores.get(item.id) || 0) + score);
});
```

The above functions uses the RRF method to calculate the scores and I have integrated them in the [FuseResultsFunction](src/repositories/rank-fusion.repository.ts).
