// filter_videos.js
// Usage: node scripts/filter_videos.js

import { createReadStream, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream';
import pkg from 'stream-json';
const { parser } = pkg;
import streamArrayPkg from 'stream-json/streamers/StreamArray.js';
const { streamArray } = streamArrayPkg;
import { Writable } from 'stream';
import videoListPkg from '../src/videolist.js';
const { videoList } = videoListPkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputPath = join(__dirname, '../src/updated_trimmed_videos.json');
const outputPath = join(__dirname, '../src/filtered_videos.json');

const videoSet = new Set(videoList);
const filtered = [];

const writable = new Writable({
  objectMode: true,
  write({ value }, encoding, callback) {
    if (videoSet.has(value.VIMEO_ID)) {
      filtered.push(value);
    }
    callback();
  }
});

pipeline(
  createReadStream(inputPath),
  parser(),
  streamArray(),
  writable,
  (err) => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      writeFileSync(outputPath, JSON.stringify(filtered, null, 2));
      console.log(`Filtered ${filtered.length} videos. Output written to src/filtered_videos.json`);
    }
  }
); 