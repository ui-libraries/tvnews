const fs = require('fs');
const path = require('path');

// Simulate the CSV loading logic from our JavaScript
function loadSponsorPhotos() {
  const csvPath = path.join(__dirname, '..', 'dist', 'video_sponsors_updated.csv');
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const lines = csvText.split('\n').slice(1); // Skip header

  const sponsorPhotoMap = new Map();

  lines.forEach(line => {
    if (line.trim()) {
      const [componentId, sponsorName, photoUrl] = line.split(',').map(s => s.replace(/"/g, '').trim());
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

// Test the integration
function testIntegration() {
  console.log('🧪 TESTING SPONSOR PHOTO INTEGRATION');

  // Load sponsor data
  const sponsorPhotoMap = loadSponsorPhotos();
  console.log(`✅ Loaded ${sponsorPhotoMap.size} sponsor photo entries`);

  // Load video data
  const videosPath = path.join(__dirname, '..', 'dist', 'filtered_videos_names.json');
  const videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));
  console.log(`✅ Loaded ${videos.length} video entries`);

  // Test matching
  let matched = 0;
  let unmatched = 0;
  const testResults = [];

  videos.forEach((video, index) => {
    const sponsorData = sponsorPhotoMap.get(video.COMPONENT_ID);
    if (sponsorData) {
      matched++;
      // Test first few matches
      if (index < 3) {
        testResults.push({
          componentId: video.COMPONENT_ID,
          videoName: video.FULL_NAME,
          sponsorName: sponsorData.sponsorName,
          photoUrl: sponsorData.photoUrl,
          namesMatch: video.FULL_NAME === sponsorData.sponsorName
        });
      }
    } else {
      unmatched++;
    }
  });

  console.log(`📊 Matching Results:`);
  console.log(`   ✅ Videos with sponsor photos: ${matched}`);
  console.log(`   ❌ Videos without sponsor photos: ${unmatched}`);

  console.log('\n🔍 Sample Matches:');
  testResults.forEach(result => {
    console.log(`   ${result.componentId}:`);
    console.log(`     Video: "${result.videoName}"`);
    console.log(`     Sponsor: "${result.sponsorName}"`);
    console.log(`     Photo URL: ${result.photoUrl}`);
    console.log(`     Names match: ${result.namesMatch ? '✅' : '⚠️'}`);
    console.log('');
  });

  // Test photo URL format
  console.log('🌐 Photo URL Validation:');
  const sampleUrls = testResults.map(r => r.photoUrl);
  sampleUrls.forEach(url => {
    const isValid = url.startsWith('https://campaigntvads.org/prez_photos/') && url.endsWith('.jpg');
    console.log(`   ${isValid ? '✅' : '❌'} ${url}`);
  });

  return matched === 248 && unmatched === 0; // All videos now have sponsor photos
}

// Run the test
const success = testIntegration();
console.log(`\n${success ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED'}`);

process.exit(success ? 0 : 1);
