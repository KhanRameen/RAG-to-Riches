import xlsx from "xlsx";

export async function parserXLSX(path: string) {
  const workbook = xlsx.readFile(path);
  let fullText = "";

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet!, {
      header: 1,
    }) as unknown[][];

    fullText += `\nSheet: ${sheetName}\n`;
    jsonData.forEach((row) => {
      fullText += row.join(" ") + "\n";
    });
  });

  return fullText;
}
