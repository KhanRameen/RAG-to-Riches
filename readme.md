# Reranking!

The solution to our RAG's mediocre answers. A problem that neither cosin similarity nor Hybrid Search could fix completely.

And nope we are not talking about the LLM quality, we here are still talking about the ✨Retrieval quality✨

## So what exactly is Reranking..

Earlier, we embedded our chunks and questions separately, only comparing their vectors for retrieval. Reranking, however, in its unoptimized, true form, reads the questions and chunks together for a more relevant score and accurate answer