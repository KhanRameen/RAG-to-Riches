# Core RAG pipeline: Understanding the Science behind

**_Here's what i learned_:**

LLM operates on vector embeddings rather than raw text strings, all our query string is converted into high-dimensional vectors. Retrieval Augmented Generation (RAG) in its basic form is just the conversion of text into embeddings (vector based numeric values). The system then calculates semantic similarity (using cosine function) to find the document embeddings closest to the query vector, retrieves the corresponding text segments, and feeds that relevant text to the LLM alongside the query for contextb ased generation.

**Vectorization** _- text to math_ > **Similarity Search** - _nearest neighbors_ > **Contextual Augmentation** - _LLM Execution_

## _Run Code:_

```bash
npx tsx src/chat.ts ./path-to/docs-folder/name-of-doc.pdf
```

### Code Architecture:

```
Documents;
↓
Embeddings
↓
Vector Search
↓
Retrieved Context
↓
LLM
```

### Embedding model

Ollama "nomic-embed-text"

### LLM Model:

Ollama "llama3"

### Cosine similarity:

Embeddings are directional meaning encoders
NOT absolute values!
The focus is on the direction rather than the length of the vectors. (if two embeddings have a closer angle i.e similar direction then they are closely related):
[Understanding Cosine Similarity and its Role in LLM Models with RAG](https://www.escape-force.com/post/understanding-cosine-similarity-and-its-role-in-llm-models-with-retrieval-augmented-generation-rag)

### Document Ingestion

**Pipeline**

```
PDF / DOCX / XLSX
        ↓
 Extract Raw Text
        ↓
     Chunking
        ↓
    Embeddings
        ↓
    Retrieval
```

Document ingestion is often harder than the AI itself. Because documents can contain:

- tables

- broken formatting

- scanned images

- headers/footers

- weird encodings

To keep things simple, I have used simple document parsing to keep the focus on RAG concepts for now

**Parsing Libraries**

| File Type | Library                                                                        |
| --------- | ------------------------------------------------------------------------------ |
| PDF       | [pdf-parse](https://www.npmjs.com/package/pdf-parse?utm_source=chatgpt.com)    |
| DOCX      | [mammoth.js](https://github.com/mwilliamson/mammoth.js?utm_source=chatgpt.com) |
| XLSX      | [SheetJS (xlsx)](https://sheetjs.com?utm_source=chatgpt.com)                   |

**Limitations**

RAG systems often struggle with spreadsheets because tables lose meaning when flattened into text

\_ _soluton (not-implemented): table-aware chunking and structured retrieval_

Some PDFs are scanned images and NOT actual text.

\_ _soluton (not-implemented): OCR, layout detection, vision models_
