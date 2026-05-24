import { parseDocument } from "./parse-document.js";
import { retrieveRelevantChunks } from "./retrieval/retrieve.js";
import { generateAnswers } from "./llm.service/llm.service.js";
import {buildVectorStore} from "./store/vectorStore.js"
import readline from "readline";


const filePath = process.argv[2]

if(!filePath){
    console.log("Please provide a document path.");
    process.exit(1);
}

console.log("Parsing Document")
const text = await parseDocument(filePath)

console.log ("Chunking and Embeddings Document")
const vectorStore = await buildVectorStore(text)
console.log(vectorStore[1])

console.log("Document Ready!")
const rl = readline.createInterface({ //reads input from the user and writes output to the terminal
    input: process.stdin,
    output: process.stdout,
})

async function askQuestion(){
    rl.question("\nEnter your query: ", async (question) => {
        console.log("\nRetrieve context..\n")

        console.log("Your Question:", question)
        const relevantChunks = await retrieveRelevantChunks(question, vectorStore)

        const context  = relevantChunks.map((item) => item.chunk).join("\n\n")

        const prompt = `You are an assitant that helps people with their queries.
                        Answer *Only* from the provided context
                        context: ${context}
                        query: ${question}`

        console.log("Generating response...\n")
        const answer = await generateAnswers(prompt)
        console.log("Response:\n")
        console.log(answer)
        askQuestion();
    })
}
askQuestion();
