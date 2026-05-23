### RAG Architecture:

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


**Parsing Libraries**

| File Type | Library                                                                        |
| --------- | ------------------------------------------------------------------------------ |
| PDF       | [pdf-parse](https://www.npmjs.com/package/pdf-parse?utm_source=chatgpt.com)    |
| DOCX      | [mammoth.js](https://github.com/mwilliamson/mammoth.js?utm_source=chatgpt.com) |
| XLSX      | [SheetJS (xlsx)](https://sheetjs.com?utm_source=chatgpt.com)                   |

*RAG systems often struggle with spreadsheets because tables lose meaning when flattened into text* 

soluton:
> table-aware chunking and structured retrieval
 
 