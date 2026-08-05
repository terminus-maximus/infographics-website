#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [outputDirectory, ...inputFiles] = process.argv.slice(2);

if (!outputDirectory || inputFiles.length === 0) {
  console.error('Usage: node split-query-output.mjs OUTPUT_DIR RESULT.json [RESULT.json ...]');
  process.exit(1);
}

const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  const rendered = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(rendered) ? `"${rendered.replaceAll('"', '""')}"` : rendered;
};

await mkdir(outputDirectory, { recursive: true });

for (const inputFile of inputFiles) {
  const wrapperRows = JSON.parse(await readFile(inputFile, 'utf8'));

  for (const { output_name: outputName, rows_json: rowsJson } of wrapperRows) {
    const rows = rowsJson && rowsJson !== 'null' ? JSON.parse(rowsJson) : [];
    const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    const csvRows = headers.length
      ? [headers.map(csvCell).join(','), ...rows.map((row) => headers.map((key) => csvCell(row[key])).join(','))]
      : [];
    const outputPath = path.join(outputDirectory, `${outputName}.csv`);
    await writeFile(outputPath, csvRows.length ? `${csvRows.join('\n')}\n` : '', 'utf8');
    console.log(`${outputName}.csv: ${rows.length} row(s)`);
  }
}
