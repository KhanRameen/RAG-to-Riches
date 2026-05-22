### Embedding model

ollama "nomic-embed-text"

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

### Cosine similarity:

Embeddings are directional meaning encoders
NOT absolute values!
The focus is on the direction rather than the length of the vectors. (if two embeddings have a closer angle i.e similar direction then they are closely related):
[Understanding Cosine Similarity and its Role in LLM Models with RAG](https://www.escape-force.com/post/understanding-cosine-similarity-and-its-role-in-llm-models-with-retrieval-augmented-generation-rag)
