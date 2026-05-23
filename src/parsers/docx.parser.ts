import mammoth from "mammoth";

export async function parseDOCX(path: string) {
  const result = await mammoth.extractRawText({ path });
  return result.value;
}
