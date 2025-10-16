const fs = require('fs');
const path = require('path');

// Load current data
const csvPath = path.join(__dirname, '..', 'dist', 'video_sponsors_updated.csv');
const jsonPath = path.join(__dirname, '..', 'dist', 'filtered_videos_names.json');

const csvContent = fs.readFileSync(csvPath, 'utf8');
const videos = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Parse CSV into array format for easier manipulation
const csvLines = csvContent.split('\n').filter(line => line.trim());
const csvHeader = csvLines[0];
const csvData = csvLines.slice(1).map(line => {
  const [componentId, sponsorName, photoUrl] = line.split(',').map(s => s.replace(/"/g, ''));
  return { componentId, sponsorName, photoUrl, originalLine: line };
});

// Find videos without sponsor photos
const csvComponentIds = new Set(csvData.map(entry => entry.componentId));
const unmatchedVideos = videos.filter(video => !csvComponentIds.has(video.COMPONENT_ID));

console.log('🔧 FIXING COMPONENT_ID MATCHES');
console.log(`Found ${unmatchedVideos.length} videos without sponsor photos`);

// For each unmatched video, try to find the correct sponsor data
const fixes = [];
unmatchedVideos.forEach(video => {
  // For P-13-211 (Barry Goldwater), we know it should match Barry Goldwater's photo
  if (video.COMPONENT_ID === 'P-13-211' && video.FULL_NAME === '') {
    // Find Barry Goldwater in the CSV
    const goldwaterEntry = csvData.find(entry => entry.sponsorName === 'Barry Goldwater');
    if (goldwaterEntry) {
      fixes.push({
        componentId: 'P-13-211',
        sponsorName: 'Barry Goldwater',
        photoUrl: goldwaterEntry.photoUrl,
        reason: 'Missing Barry Goldwater entry - using existing Goldwater photo URL'
      });
    }
  }
});

if (fixes.length > 0) {
  console.log(`\n📝 Adding ${fixes.length} missing entries to CSV:`);
  fixes.forEach(fix => {
    console.log(`   + ${fix.componentId}: ${fix.sponsorName}`);
  });

  // Add the fixes to the CSV data
  fixes.forEach(fix => {
    csvData.push({
      componentId: fix.componentId,
      sponsorName: fix.sponsorName,
      photoUrl: fix.photoUrl,
      originalLine: `"${fix.componentId}","${fix.sponsorName}","${fix.photoUrl}"`
    });
  });

  // Rebuild CSV content
  const newCsvContent = [csvHeader, ...csvData.map(entry => entry.originalLine)].join('\n') + '\n';

  // Write back to file
  fs.writeFileSync(csvPath, newCsvContent, 'utf8');

  console.log(`\n✅ Updated CSV saved to ${csvPath}`);
  console.log(`   New total entries: ${csvData.length}`);

  // Verify the fix worked
  const updatedCsvComponentIds = new Set(csvData.map(entry => entry.componentId));
  const stillUnmatched = videos.filter(video => !updatedCsvComponentIds.has(video.COMPONENT_ID));

  console.log(`\n🔍 Verification:`);
  console.log(`   Videos now with sponsor photos: ${videos.length - stillUnmatched.length}/${videos.length}`);
  if (stillUnmatched.length > 0) {
    console.log(`   Still unmatched: ${stillUnmatched.length}`);
    stillUnmatched.forEach(video => {
      console.log(`     - ${video.COMPONENT_ID}: ${video.FULL_NAME || 'No name'}`);
    });
  } else {
    console.log(`   ✅ All videos now have sponsor photos!`);
  }

} else {
  console.log('\nℹ️  No automatic fixes available. Manual intervention may be needed.');
}
