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
    const response = await fetch(`https://api.vimeo.com${folderUri}?page=${page}&per_page=${perPage}`, {
      headers
    })
    const data = await response.json()

    if (data && data.data && data.data.length > 0) {
      console.log(`Found ${data.data.length} videos on page ${page}`)
      videos = [...videos, ...data.data]
      page++
    } else {
      console.error('No more videos or access issue:', data)
      break
    }
  }

  return videos
}

function generateEmbedCode(video) {
  const videoId = video.uri.split('/').pop()
  return `<iframe src="https://player.vimeo.com/video/${videoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>`
}

async function generateEmbedCodesForOrganizationFolder() {
  const accessToken = '0c3acc0610fc8bb51e0a897b080073aa'

  const videos = await getOrganizationFolderVideos(accessToken)

  if (videos.length === 0) {
    console.error('No videos to generate embed codes for')
    return
  }

  const embedCodes = videos.map(video => ({
    title: video.name,
    description: video.description,
    id: video.uri.split('/').pop(),
    embedCode: generateEmbedCode(video)
  }))

  // Save to a JSON file
  fs.writeFileSync('vimeo_embed_codes_from_org_folder.json', JSON.stringify(embedCodes, null, 2), 'utf-8')

  console.log('Video embed codes saved to vimeo_embed_codes_from_org_folder.json')
}

generateEmbedCodesForOrganizationFolder()
