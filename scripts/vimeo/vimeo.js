const fs = require('fs')

async function getOrganizationFolderVideos(accessToken) {
  const organizationId = '222240762'  // Replace with the organization user ID
  const folderId = '21613069'          // Replace with the correct folder ID
  const folderUri = `/users/${organizationId}/projects/${folderId}/videos`

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.vimeo.*+json;version=3.4'
  }

  let videos = []
  let page = 1
  let perPage = 100  // Vimeo API allows up to 100 videos per request

  while (true) {
    try {
      console.log(`Fetching page ${page}...`)
      const response = await fetch(`https://api.vimeo.com${folderUri}?page=${page}&per_page=${perPage}`, {
        headers
      })

      // Log response status for debugging
      if (!response.ok) {
        console.error(`Failed request on page ${page}: ${response.status} - ${response.statusText}`)
        page++ // Skip this page and move to the next
        continue
      }

      const responseText = await response.text()
      let data
      try {
        data = JSON.parse(responseText)
      } catch (error) {
        console.error(`Error parsing JSON on page ${page}:`, error)
        console.log('Skipping page due to invalid JSON:', responseText)
        page++ // Skip this page and move to the next
        continue
      }

      if (data && data.data && data.data.length > 0) {
        console.log(`Found ${data.data.length} videos on page ${page}`)
        videos = [...videos, ...data.data]
        page++
      } else {
        console.log('No more videos to fetch.')
        break
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error)
      page++ // Skip this page and move to the next
    }
  }

  return videos
}

function generateEmbedCode(video) {
  try {
    const videoId = video.uri.split('/').pop()
    return `<iframe src="https://player.vimeo.com/video/${videoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
  } catch (error) {
    console.error(`Error generating embed code for video: ${video.uri}`, error)
    return null
  }
}

async function generateEmbedCodesForOrganizationFolder() {
  const accessToken = '0c3acc0610fc8bb51e0a897b080073aa'

  console.log('Starting to fetch videos from Vimeo...')
  const videos = await getOrganizationFolderVideos(accessToken)

  if (videos.length === 0) {
    console.error('No videos to generate embed codes for')
    return
  }

  console.log(`Generating embed codes for ${videos.length} videos...`)
  const embedCodes = videos.map(video => {
    const embedCode = generateEmbedCode(video)
    if (embedCode) {
      return {
        title: video.name,
        description: video.description,
        id: video.uri.split('/').pop(),
        embedCode
      }
    } else {
      console.warn(`Skipping video: ${video.name}`)
      return null
    }
  }).filter(embed => embed !== null) // Remove null entries

  try {
    // Save to a JSON file
    fs.writeFileSync('vimeo_embed_codes_from_org_folder.json', JSON.stringify(embedCodes, null, 2), 'utf-8')
    console.log('Video embed codes saved to vimeo_embed_codes_from_org_folder.json')
  } catch (error) {
    console.error('Error writing embed codes to file:', error)
  }
}

generateEmbedCodesForOrganizationFolder()
