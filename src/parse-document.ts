import path from "node:path";
import { parseDOCX } from "./parsers/docx.parser.js";
import { parserPDF } from "./parsers/pdf.parser.js";
import { parserXLSX } from "./parsers/xlsx.parser.js";

export async function parseDocument(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case ".pdf":
      return parserPDF(filePath);
    case ".docx":
      return parseDOCX(filePath);

    case ".xlsx":
      return parserXLSX(filePath);

    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}
