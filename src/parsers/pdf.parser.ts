
import { readFileSync } from 'node:fs'
import { PDFParse } from 'pdf-parse'

export async function parserPDF(path:string){
    const buffer = readFileSync(path)
    const data = new PDFParse({data: buffer})
    const result = await data.getText();
    return result
}