const fs = require('fs')

// Read both JSON files
const vimeoData = JSON.parse(fs.readFileSync('vimeo_embed_codes_from_org_folder.json', 'utf8'))
const trimmedVideos = JSON.parse(fs.readFileSync('trimmed_videos.json', 'utf8'))

// Function to extract the identifier from the description
function extractIdentifier(description) {
  const match = description.match(/Identifier: (P-\d{1,5}-\d{1,6})\.?/)
  return match ? match[1] : null
}

// Loop through each vimeo object and match with corresponding trimmed video
vimeoData.forEach(vimeoEntry => {
  const identifier = extractIdentifier(vimeoEntry.description)

  if (identifier) {
    // Find the corresponding video in the trimmedVideos array
    trimmedVideos.forEach(video => {
      if (video.COMPONENT_ID === identifier) {
        // Add the VIMEO_ID field to the video object
        video.VIMEO_ID = vimeoEntry.id
      }
    })
  }
})

// Write the new file with the updated videos
fs.writeFileSync('updated_trimmed_videos.json', JSON.stringify(trimmedVideos, null, 2))

console.log('New file "updated_trimmed_videos.json" created with VIMEO_IDs added.')
