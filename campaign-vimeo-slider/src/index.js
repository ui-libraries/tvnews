import "regenerator-runtime/runtime";
import * as _ from 'lodash'
import Player from '@vimeo/player'

// Add: Load filtered_videos_names.json and sponsor photos
let videoList = [];
let videoMap = new Map();
let sponsorPhotoMap = new Map();

async function loadSponsorPhotos() {
  const response = await fetch('video_sponsors_updated.csv');
  const csvText = await response.text();
  const lines = csvText.split('\n').slice(1); // Skip header

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
}

async function loadVideos() {
  // Load both video data and sponsor photos in parallel
  await Promise.all([
    loadSponsorPhotos(),
    (async () => {
      const response = await fetch('filtered_videos_names.json');
      videoList = await response.json();
      videoMap = new Map(videoList.map(v => [v.VIMEO_ID, v]));
    })()
  ]);
  startApp();
}

function getSponsorName(videoId) {
  const video = videoMap.get(videoId);
  return video ? video.FULL_NAME : '';
}

function getSponsorPhoto(componentId) {
  return sponsorPhotoMap.get(componentId);
}

function updateVideoTitle(videoIndex, videoId) {
  document.getElementById('video-title').innerHTML =
    `Video Index: ${videoIndex + 1} &nbsp;|&nbsp; Video ID: ${videoId}`;
}

function updateSponsorPhoto(componentId) {
  const sponsorPhotoDiv = document.getElementById('sponsor-photo');
  const sponsorData = getSponsorPhoto(componentId);

  if (sponsorData && sponsorData.photoUrl) {
    sponsorPhotoDiv.innerHTML = `
      <div style="text-align: center; margin: 10px 0;">
        <h4 style="margin-bottom: 8px; color: #333; font-size: 1.1em;">AD Sponsor: ${sponsorData.sponsorName}</h4>
        <img src="${sponsorData.photoUrl}"
             alt="${sponsorData.sponsorName}"
             style="max-width: 150px; max-height: 150px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div style="display: none; color: #666; font-style: italic; margin-top: 5px; font-size: 0.9em;">
          Photo not available for ${sponsorData.sponsorName}
        </div>
        <div style="margin-top: 8px; font-size: 0.9em; color: #555;">
          Press R when you see the sponsor on screen
        </div>
      </div>
    `;
  } else {
    sponsorPhotoDiv.innerHTML = `
      <div style="text-align: center; margin: 10px 0;">
        <h4 style="margin-bottom: 8px; color: #333; font-size: 1.1em;">AD Sponsor</h4>
        <div style="color: #666; font-style: italic; font-size: 0.9em;">
          Sponsor photo not available
        </div>
        <div style="margin-top: 8px; font-size: 0.9em; color: #555;">
          Press R when you see the sponsor on screen
        </div>
      </div>
    `;
  }
}

function startApp() {
  if (!localStorage.getItem('alreadyPlayed')) {
    localStorage.setItem('alreadyPlayed', JSON.stringify([]))
  }
  if (!localStorage.getItem('videoValues')) {
    localStorage.setItem('videoValues', JSON.stringify([]))
  }
  let alreadyPlayed = JSON.parse(localStorage.getItem('alreadyPlayed'))
  let videoValues = JSON.parse(localStorage.getItem('videoValues'))
  let videoIndex = Number(localStorage.getItem('videoIndex')) || 1
  let currentVideoIndex = videoIndex - 1
  let currentVideo = videoList[currentVideoIndex]
  document.getElementById('next-video').style.display = 'none'
  updateVideoTitle(currentVideoIndex, currentVideo.VIMEO_ID)
  updateSponsorPhoto(currentVideo.COMPONENT_ID)
  alreadyPlayed.push(currentVideo.VIMEO_ID)
  localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed))
  let player = new Player('video-container', {
    id: currentVideo.VIMEO_ID,
    width: 640
  })

  let userId = localStorage.getItem('userId') || ''

  function getTimestamp() {
    return new Date().toLocaleString()
  }

  function getLikertLabel(input) {
    const value = Number(input)
    const ranges = [
      { max: 14, label: "Very Cold" },
      { max: 29, label: "Cold" },
      { max: 44, label: "Somewhat Cold" },
      { max: 55, label: "Neither Cold Nor Warm" },
      { max: 70, label: "Somewhat Warm" },
      { max: 85, label: "Warm" },
      { max: 100, label: "Very Warm" }
    ]
    const range = ranges.find(r => value <= r.max)
    return range ? range.label : "Invalid input"
  }


  function exportToCsv() {
    console.log('📄 Starting CSV export...');
    let data = JSON.parse(localStorage.getItem('videoValues'))
    console.log('📊 Raw data from localStorage:', data);

    if (!data || !data.length) {
      console.error("❌ No data to export")
      alert("No data to export")
      return
    }

    // Filter for current user and current ad only
    const userId = localStorage.getItem('userId') || ''
    const currentAdId = currentVideo.VIMEO_ID
    console.log('🔍 Filtering for user:', userId, 'and video:', currentAdId);

    const originalCount = data.length;
    data = data.filter(row => row["User ID"] === userId && row["Video ID"] === currentAdId)
    console.log(`📊 Filtered ${originalCount} events down to ${data.length} matching events`);

    // Debug: Show what events were filtered
    const allEvents = JSON.parse(localStorage.getItem('videoValues'));
    const rKeyEvents = allEvents.filter(row => row["Event Type"] === "SPONSOR_IDENTIFIED");
    const sliderEvents = allEvents.filter(row => !row["Event Type"] || row["Event Type"] !== "SPONSOR_IDENTIFIED");

    console.log(`📊 Total R key events in storage: ${rKeyEvents.length}`);
    console.log(`📊 Total slider events in storage: ${sliderEvents.length}`);

    if (!data.length) {
      console.error("❌ No data matches current user/video filter")
      alert("No data for this user and ad.")
      return
    }

    // Define standard columns for CSV export
    const columns = ["Seconds", "Event Type", "Likert Value", "Video ID", "User ID", "Timestamp"]

    const replacer = (key, value) => value === null ? '' : value

    // Create CSV rows with consistent column structure
    let csv = data.map(row => {
      return columns.map(field => {
        const value = row[field]
        return value !== undefined ? JSON.stringify(value, replacer) : ''
      }).join(',')
    })

    // Add header
    csv.unshift(columns.join(','))
    csv = csv.join('\r\n')

    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    let link = document.createElement("a")
    let url = URL.createObjectURL(blob)
    link.setAttribute("href", url)

    let idForFilename = currentAdId

    link.setAttribute("download", `video_id_${idForFilename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    document.getElementById('next-video').style.display = 'inline-block'
  }

  function changeBgColor(sliderValue) {
    let color

    if (sliderValue <= 14) {
      color = 'blue' // Very Cold
    } else if (sliderValue <= 29) {
      color = 'cyan' // Cold
    } else if (sliderValue <= 44) {
      color = 'green' // Somewhat Cold
    } else if (sliderValue <= 55) {
      color = 'white' // Neither Cold Nor Warm
    } else if (sliderValue <= 70) {
      color = 'yellow' // Somewhat Warm
    } else if (sliderValue <= 85) {
      color = 'orange' // Warm
    } else {
      color = 'red' // Very Warm
    }

    document.getElementById("slidecolor").style.backgroundColor = color
  }


  let slider = document.getElementById('slider')
  let isSliderReleased = false

  slider.addEventListener('input', () => {
    let sliderValue = _.toNumber(slider.value)
    document.getElementById('slider-value').innerHTML = sliderValue
    document.getElementById('likert').innerHTML = getLikertLabel(sliderValue)
    changeBgColor(sliderValue)
    isSliderReleased = false

    slider.addEventListener('change', () => {
      if (!isSliderReleased) {
        player.getCurrentTime().then(value => {
          let newValue = _.toInteger(slider.value)
          let time = {
            "Seconds": Math.trunc(value),
            "Likert Value": newValue,
            "Video ID": currentVideo.VIMEO_ID,
            "User ID": userId,
            "Timestamp": getTimestamp()
          }
          videoValues.push(time)
          localStorage.setItem('videoValues', JSON.stringify(videoValues))
          console.log(videoValues)
        })
        isSliderReleased = true
      }
    })
  })

  // R key event listener for sponsor recognition
  document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyR' || event.key === 'r' || event.key === 'R') {
      event.preventDefault(); // Prevent any default behavior
      console.log('R key pressed! Event:', event.code, event.key);

      if (player && currentVideo) {
        player.getCurrentTime().then(value => {
          const sponsorEvent = {
            "Seconds": Math.trunc(value),
            "Event Type": "SPONSOR_IDENTIFIED",
            "Video ID": currentVideo.VIMEO_ID,
            "User ID": userId,
            "Timestamp": getTimestamp()
          };
          videoValues.push(sponsorEvent);
          localStorage.setItem('videoValues', JSON.stringify(videoValues));
          console.log('✅ Sponsor identified at:', Math.trunc(value), 'seconds');
          console.log('📊 Current videoValues:', videoValues);
          console.log('🎯 Latest event:', sponsorEvent);
        }).catch(error => {
          console.error('❌ Error getting current time:', error);
        });
      } else {
        console.error('❌ Player or currentVideo not available');
      }
    }
  });

  // Download button
  document.getElementById('download').addEventListener('click', exportToCsv)

  // Next video button
  document.getElementById('next-video').addEventListener('click', () => {
    // Hide the Next Video button until export is clicked again
    document.getElementById('next-video').style.display = 'none'
    document.getElementById("slidecolor").style.backgroundColor = "white"
    document.getElementById('slider-value').innerHTML = 50
    document.getElementById('slider').value = 50
    document.getElementById('likert').innerHTML = "Neither Agree nor Disagree"

    // Increment video index and save
    currentVideoIndex++
    if (currentVideoIndex >= videoList.length) {
      alert('No more videos left!')
      return
    }
    localStorage.setItem('videoIndex', currentVideoIndex)
    currentVideo = videoList[currentVideoIndex]
    alreadyPlayed.push(currentVideo.VIMEO_ID)
    localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed))
    player.loadVideo(currentVideo.VIMEO_ID)
    // Update the video title/details at the top
    updateVideoTitle(currentVideoIndex, currentVideo.VIMEO_ID)
    updateSponsorPhoto(currentVideo.COMPONENT_ID)
  })
}

// At the end of the file, start loading videos
loadVideos();
