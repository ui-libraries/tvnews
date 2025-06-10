import * as _ from 'lodash'
import Player from '@vimeo/player'
import { videoList } from './videolist'

if (!localStorage.getItem('alreadyPlayed')) {
  localStorage.setItem('alreadyPlayed', JSON.stringify([]))
}

if (!localStorage.getItem('videoValues')) {
  localStorage.setItem('videoValues', JSON.stringify([]))
}

let alreadyPlayed = JSON.parse(localStorage.getItem('alreadyPlayed'))
let videoValues = JSON.parse(localStorage.getItem('videoValues'))

let videoIndex = Number(localStorage.getItem('videoIndex')) || 1
let randomVideo = videoList[videoIndex - 1]
document.getElementById('next-video').style.display = 'none'

document.getElementById('video-title').innerHTML =
  `Video Index: ${videoIndex + 1} &nbsp;|&nbsp; Video ID: ${randomVideo}`

alreadyPlayed.push(randomVideo)
localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed))

let player = new Player('video-container', {
  id: randomVideo,
  width: 640
})

let userId = Math.random().toString(36).slice(2)

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
  let data = JSON.parse(localStorage.getItem('videoValues'))
  if (!data || !data.length) {
    console.error("No data to export")
    return
  }

  const replacer = (key, value) => value === null ? '' : value
  const header = Object.keys(data[0])
  let csv = data.map(row => header.map(field => JSON.stringify(row[field], replacer)).join(','))
  csv.unshift(header.join(','))
  csv = csv.join('\r\n')

  let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  let link = document.createElement("a")
  let url = URL.createObjectURL(blob)
  link.setAttribute("href", url)

  let indexForFilename = Number(localStorage.getItem('videoIndex')) + 1 || 1
  let idForFilename = randomVideo

  link.setAttribute("download", `video_index_${indexForFilename}_video_id_${idForFilename}.csv`)
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
          "Video ID": randomVideo,
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

// Download button
document.getElementById('download').addEventListener('click', exportToCsv)

// Next video button
document.getElementById('next-video').addEventListener('click', () => {
  document.getElementById("slidecolor").style.backgroundColor = "white"
  document.getElementById('slider-value').innerHTML = 50
  document.getElementById('slider').value = 50
  document.getElementById('likert').innerHTML = "Neither Agree nor Disagree"

  randomVideo = _.sample(_.difference(videoList, alreadyPlayed))
  alreadyPlayed.push(randomVideo)
  localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed))
  player.loadVideo(randomVideo)
})
