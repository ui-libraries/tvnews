const fs = require('fs');
const path = require('path');

// Read the JSON file that's actually loaded by the application
const jsonFilePath = path.join(__dirname, '..', 'dist', 'filtered_videos_names.json');
const csvOutputPath = path.join(__dirname, '..', 'component_video_mapping.csv');

try {
  // Read and parse the JSON file
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

  // Create CSV header
  let csvContent = 'component_id,video_id\n';

  // Extract COMPONENT_ID and VIMEO_ID from each entry
  jsonData.forEach(entry => {
    if (entry.COMPONENT_ID && entry.VIMEO_ID) {
      csvContent += `"${entry.COMPONENT_ID}","${entry.VIMEO_ID}"\n`;
    }
  });

  // Write the CSV file
  fs.writeFileSync(csvOutputPath, csvContent, 'utf8');

  console.log(`✅ CSV file created successfully: ${csvOutputPath}`);
  console.log(`📊 Total entries processed: ${jsonData.length}`);

  // Show a sample of the output
  const lines = csvContent.split('\n').slice(0, 6);
  console.log('\n📋 Sample output:');
  lines.forEach(line => console.log(line));

} catch (error) {
  console.error('❌ Error processing files:', error.message);
  process.exit(1);
}
