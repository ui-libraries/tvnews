const fs = require('fs');
const path = require('path');

// Load sponsor data
function loadSponsorPhotos() {
  const csvPath = path.join(__dirname, '..', 'dist', 'video_sponsors_updated.csv');
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const lines = csvText.split('\n').slice(1); // Skip header

  const sponsorPhotoMap = new Map();

  lines.forEach(line => {
    if (line.trim()) {
      const [componentId, sponsorName, photoUrl] = line.split(',').map(s => s.replace(/"/g, ''));
      if (componentId && photoUrl) {
        sponsorPhotoMap.set(componentId, {
          sponsorName: sponsorName,
          photoUrl: photoUrl
        });
      }
    }
  });

  return sponsorPhotoMap;
}

// Check for COMPONENT_ID mismatches
function checkComponentIdMatching() {
  console.log('🔍 CHECKING COMPONENT_ID MATCHING');

  // Load sponsor data
  const sponsorPhotoMap = loadSponsorPhotos();
  console.log(`📄 Loaded ${sponsorPhotoMap.size} sponsor entries from CSV`);

  // Load video data
  const videosPath = path.join(__dirname, '..', 'dist', 'filtered_videos_names.json');
  const videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
  console.log(`🎬 Loaded ${videos.length} video entries from JSON`);

  // Get all COMPONENT_IDs from both sources
  const csvComponentIds = new Set(Array.from(sponsorPhotoMap.keys()));
  const jsonComponentIds = new Set(videos.map(v => v.COMPONENT_ID));

  // Find matches and mismatches
  const matchedIds = new Set();
  const unmatchedCsvIds = new Set();
  const unmatchedJsonIds = new Set();

  // Check which CSV IDs have matches in JSON
  csvComponentIds.forEach(id => {
    if (jsonComponentIds.has(id)) {
      matchedIds.add(id);
    } else {
      unmatchedCsvIds.add(id);
    }
  });

  // Check which JSON IDs don't have matches in CSV
  jsonComponentIds.forEach(id => {
    if (!csvComponentIds.has(id)) {
      unmatchedJsonIds.add(id);
    }
  });

  console.log(`\n📊 MATCHING RESULTS:`);
  console.log(`   ✅ Matched COMPONENT_IDs: ${matchedIds.size}`);
  console.log(`   ❌ CSV IDs not in JSON: ${unmatchedCsvIds.size}`);
  console.log(`   ❌ JSON IDs not in CSV: ${unmatchedJsonIds.size}`);

  if (unmatchedCsvIds.size > 0) {
    console.log(`\n⚠️  CSV COMPONENT_IDs not found in video JSON:`);
    Array.from(unmatchedCsvIds).slice(0, 10).forEach(id => {
      const sponsor = sponsorPhotoMap.get(id);
      console.log(`     ${id} (${sponsor.sponsorName})`);
    });
    if (unmatchedCsvIds.size > 10) {
      console.log(`     ... and ${unmatchedCsvIds.size - 10} more`);
    }
  }

  if (unmatchedJsonIds.size > 0) {
    console.log(`\n⚠️  Video JSON COMPONENT_IDs not found in CSV:`);
    Array.from(unmatchedJsonIds).slice(0, 10).forEach(id => {
      const video = videos.find(v => v.COMPONENT_ID === id);
      console.log(`     ${id} (${video.FULL_NAME})`);
    });
    if (unmatchedJsonIds.size > 10) {
      console.log(`     ... and ${unmatchedJsonIds.size - 10} more`);
    }
  }

  // Check for potential leading zero issues
  console.log(`\n🔢 CHECKING FOR LEADING ZERO PATTERNS:`);

  // Look for IDs that might have leading zeros in one but not the other
  const csvIdsArray = Array.from(csvComponentIds);
  const jsonIdsArray = Array.from(jsonComponentIds);

  const potentialLeadingZeroIssues = [];

  csvIdsArray.forEach(csvId => {
    // Try to find a matching JSON ID with leading zeros added
    const parts = csvId.split('-');
    if (parts.length === 3 && parts[0] === 'P') {
      const withLeadingZeros = `P-${parts[1].padStart(3, '0')}-${parts[2].padStart(5, '0')}`;
      if (jsonIdsArray.includes(withLeadingZeros) && !jsonIdsArray.includes(csvId)) {
        potentialLeadingZeroIssues.push({
          csv: csvId,
          json: withLeadingZeros,
          type: 'CSV missing leading zeros'
        });
      }

      // Also check the reverse
      const withoutLeadingZeros = `P-${parseInt(parts[1], 10)}-${parseInt(parts[2], 10)}`;
      if (csvId !== withoutLeadingZeros && jsonIdsArray.includes(withoutLeadingZeros) && !jsonIdsArray.includes(csvId)) {
        potentialLeadingZeroIssues.push({
          csv: csvId,
          json: withoutLeadingZeros,
          type: 'JSON has leading zeros removed'
        });
      }
    }
  });

  if (potentialLeadingZeroIssues.length > 0) {
    console.log(`   🚨 Found ${potentialLeadingZeroIssues.length} potential leading zero issues:`);
    potentialLeadingZeroIssues.slice(0, 5).forEach(issue => {
      console.log(`     ${issue.type}: CSV=${issue.csv}, JSON=${issue.json}`);
    });
  } else {
    console.log(`   ✅ No leading zero pattern issues detected`);
  }

  // Show some successful matches
  if (matchedIds.size > 0) {
    console.log(`\n✅ SAMPLE SUCCESSFUL MATCHES:`);
    Array.from(matchedIds).slice(0, 5).forEach(id => {
      const sponsor = sponsorPhotoMap.get(id);
      const video = videos.find(v => v.COMPONENT_ID === id);
      console.log(`   ${id}: ${video.FULL_NAME} ✅`);
    });
  }

  return {
    matched: matchedIds.size,
    csvUnmatched: unmatchedCsvIds.size,
    jsonUnmatched: unmatchedJsonIds.size,
    totalCsv: csvComponentIds.size,
    totalJson: jsonComponentIds.size
  };
}

// Run the check
const results = checkComponentIdMatching();

console.log(`\n🎯 SUMMARY:`);
console.log(`   Videos in slider: ${results.totalJson}`);
console.log(`   Sponsor photos available: ${results.matched}/${results.totalCsv}`);
console.log(`   Coverage: ${((results.matched / results.totalJson) * 100).toFixed(1)}%`);

if (results.csvUnmatched > 0 || results.jsonUnmatched > 0) {
  console.log(`\n❌ ISSUES FOUND - COMPONENT_ID MISMATCHES EXIST`);
  process.exit(1);
} else {
  console.log(`\n✅ ALL COMPONENT_IDs MATCH SUCCESSFULLY`);
  process.exit(0);
}
