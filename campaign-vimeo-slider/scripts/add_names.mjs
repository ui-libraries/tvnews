// add_names.mjs
// Usage: bun run scripts/add_names.mjs
import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filteredPath = join(__dirname, '../src/filtered_videos.json');
const sponsorsPath = join(__dirname, '../src/video_sponsors.csv');
const outputPath = join(__dirname, '../src/filtered_videos_names.json');

// Read and parse the CSV into a map
function parseCSV(csv) {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const map = new Map();
  for (const line of lines.slice(1)) { // skip header
    const [id, name] = line.split(',');
    if (id && name) map.set(id, name);
  }
  return map;
}

async function main() {
  const [filteredRaw, sponsorsRaw] = await Promise.all([
    readFile(filteredPath, 'utf8'),
    readFile(sponsorsPath, 'utf8'),
  ]);
  const filtered = JSON.parse(filteredRaw);
  const sponsorMap = parseCSV(sponsorsRaw);

  const withNames = filtered.map(obj => ({
    ...obj,
    FULL_NAME: sponsorMap.get(obj.COMPONENT_ID) || ""
  }));

  await writeFile(outputPath, JSON.stringify(withNames, null, 2));
  console.log(`Wrote ${withNames.length} objects to src/filtered_videos_names.json`);
}

main().catch(e => { console.error(e); process.exit(1); }); 