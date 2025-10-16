const fs = require('fs');
const path = require('path');

// Read both files
const sponsorsPath = path.join(__dirname, '..', 'video_sponsors_updated.csv');
const videosPath = path.join(__dirname, '..', 'dist', 'filtered_videos_names.json');

try {
  // Parse sponsors CSV
  const sponsorsContent = fs.readFileSync(sponsorsPath, 'utf8');
  const sponsors = sponsorsContent
    .split('\n')
    .slice(1) // Skip header
    .filter(line => line.trim())
    .map(line => {
      const [componentId, sponsorName, photoUrl] = line.split(',').map(s => s.replace(/"/g, ''));
      return { componentId, sponsorName, photoUrl };
    });

  // Parse videos JSON
  const videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

  // Create lookup maps
  const sponsorsByComponentId = new Map();
  sponsors.forEach(sponsor => {
    sponsorsByComponentId.set(sponsor.componentId, sponsor);
  });

  const videosByComponentId = new Map();
  videos.forEach(video => {
    videosByComponentId.set(video.COMPONENT_ID, video);
  });

  // Analyze overlap
  const videosWithSponsors = videos.filter(video => sponsorsByComponentId.has(video.COMPONENT_ID));
  const sponsorsWithVideos = sponsors.filter(sponsor => videosByComponentId.has(sponsor.componentId));
  const videosWithoutSponsors = videos.filter(video => !sponsorsByComponentId.has(video.COMPONENT_ID));
  const sponsorsWithoutVideos = sponsors.filter(sponsor => !videosByComponentId.has(sponsor.componentId));

  console.log('📊 SPONSOR PHOTO INTEGRATION ANALYSIS');
  console.log('=====================================');
  console.log(`Total videos in slider: ${videos.length}`);
  console.log(`Total sponsor entries: ${sponsors.length}`);
  console.log(`Videos with sponsor photos: ${videosWithSponsors.length}`);
  console.log(`Sponsor entries with matching videos: ${sponsorsWithVideos.length}`);
  console.log(`Videos missing sponsor photos: ${videosWithoutSponsors.length}`);
  console.log(`Sponsor entries without matching videos: ${sponsorsWithoutVideos.length}`);

  if (videosWithoutSponsors.length > 0) {
    console.log('\n⚠️  Videos missing sponsor photos:');
    videosWithoutSponsors.slice(0, 10).forEach(video => {
      console.log(`  - ${video.COMPONENT_ID}: ${video.FULL_NAME}`);
    });
    if (videosWithoutSponsors.length > 10) {
      console.log(`  ... and ${videosWithoutSponsors.length - 10} more`);
    }
  }

  // Show sample matches
  console.log('\n✅ Sample video-sponsor matches:');
  videosWithSponsors.slice(0, 5).forEach(video => {
    const sponsor = sponsorsByComponentId.get(video.COMPONENT_ID);
    console.log(`  - ${video.COMPONENT_ID}: ${video.FULL_NAME} → ${sponsor.photoUrl}`);
  });

  // Check for data consistency
  console.log('\n🔍 Data consistency check:');
  const nameMismatches = videosWithSponsors.filter(video => {
    const sponsor = sponsorsByComponentId.get(video.COMPONENT_ID);
    return sponsor && video.FULL_NAME !== sponsor.sponsorName;
  });

  if (nameMismatches.length > 0) {
    console.log(`⚠️  Name mismatches found: ${nameMismatches.length}`);
    nameMismatches.slice(0, 3).forEach(video => {
      const sponsor = sponsorsByComponentId.get(video.COMPONENT_ID);
      console.log(`  - Video: "${video.FULL_NAME}" vs Sponsor: "${sponsor.sponsorName}" (${video.COMPONENT_ID})`);
    });
  } else {
    console.log('✅ All names match between video data and sponsor data');
  }

} catch (error) {
  console.error('❌ Error analyzing data:', error.message);
  process.exit(1);
}
