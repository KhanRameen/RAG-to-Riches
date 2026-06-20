import { getEmbeddings } from "./embeddings/embed.js";
import { searchChunks } from "./repositories/search-chunks.repository.js";

const question = process.argv.slice(2).join(" ");
console.log(question)

const embedding = await getEmbeddings(question);


const results = await searchChunks({embedding,limit:5});

console.log(results);