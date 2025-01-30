const fs = require('fs')

// Import the array of objects from the JS file
const subset = require('./video_data_subset') // Adjust the file path as needed

// Debugging: Ensure the subset is imported correctly
if (!Array.isArray(subset)) {
    console.error('Error: video_data_subset.js did not export an array')
    console.error(subset)
    process.exit(1) // Exit the script if it's not an array
}

// Map the objects to a CSV string containing only the titles
const csv = subset.map(obj => obj.title).join('\n')

// Write the CSV file
fs.writeFileSync('./loop_merge_subset.csv', `title\n${csv}`)
console.log('CSV file created: loop_merge_subset.csv')
