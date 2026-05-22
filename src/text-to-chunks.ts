export function textToChunks(text: string, chunkSize = 300, overlap = 80) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    const chunk = text.slice(start, end);
    chunks.push(chunk);
    start = end - overlap;
  }
  return chunks;
}
