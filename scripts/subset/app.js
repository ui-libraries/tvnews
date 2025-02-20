const fs = require('fs')
const path = require('path')

// 1. Read raw CSV content
const csvData = fs.readFileSync(path.join(__dirname, './only_these_ads.csv'), 'utf8')

// 2. Parse CSV: Split lines, remove header, clean titles
const lines = csvData.trim().split('\n').slice(1)
const titles = lines.map(line => line.replace(/"/g, '').trim().toLowerCase()) // Normalize case

console.log("Titles loaded from CSV:", titles)

// 3. Load video_data
const { video_data } = require('./index.js')

// 4. Convert titles array to a Set for fast lookup
const titleSet = new Set(titles)

// 5. Filter video_data to keep only NON-matching titles (case insensitive)
const subset = video_data.filter(obj => !titleSet.has(obj.title.trim().toLowerCase()))

// Debugging: Print count and some matched titles for verification
console.log(`Kept ${subset.length} items out of ${video_data.length} total items`)
const matched = titles.filter(t => video_data.some(v => v.title.trim().toLowerCase() === t))
console.log("Excluded Titles:", matched)

// 6. Write result to subset.json
fs.writeFileSync(path.join(__dirname, 'subset-larger.json'), JSON.stringify(subset, null, 2))