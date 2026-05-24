import { readFileSync } from "node:fs";
import { PDFParse } from "pdf-parse";

export async function parserPDF(path: string) {
  const buffer = readFileSync(path);
  const data = new PDFParse({ data: buffer });
  const result = await data.getText();
  const fullText = result.pages.map((page) => page.text).join("\n");

  return fullText;
}
