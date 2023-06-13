import * as _ from 'lodash'
import YouTubePlayer from 'youtube-player'
import {
    videoList
} from './videolist'
if (!localStorage.getItem('alreadyPlayed')) {
    localStorage.setItem('alreadyPlayed', JSON.stringify([]))
}

if (!localStorage.getItem('videoValues')) {
    localStorage.setItem('videoValues', JSON.stringify([]))
}

let alreadyPlayed = JSON.parse(localStorage.getItem('alreadyPlayed'))
let videoValues = JSON.parse(localStorage.getItem('videoValues'))

let randomVideo = _.sample(videoList)
alreadyPlayed.push(randomVideo)
localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed))
let player

player = YouTubePlayer('video-container')
player.loadVideoById(randomVideo)
let userId = Math.random().toString(36).slice(2)

function getTimestamp() {
  let currentDate = new Date()
  let readableDate = currentDate.toLocaleString()
  return readableDate
}

function getLikertLabel(input) {
    const value = Number(input)
    switch (true) {
        case value <= 14:
            return "Strongly Disagree"
        case value <= 29:
            return "Disagree"
        case value <= 39:
            return "Moderately Disagree"
        case value <= 49:
            return "Slightly Disagree"
        case value <= 59:
            return "Neither Agree nor Disagree"
        case value <= 69:
            return "Slightly Agree"
        case value <= 84:
            return "Moderately Agree"
        case value <= 90:
            return "Agree"
        case value <= 100:
            return "Strongly Agree"
        default:
            return "Invalid input"
    }
}

function exportToCsv() {
    // Fetch data from localStorage
    let data = JSON.parse(localStorage.getItem('videoValues'));

    if (!data) {
        console.error("No data found in localStorage under 'videoValues'");
        return;
    }

    // Create CSV content
    const replacer = (key, value) => value === null ? '' : value
    const header = Object.keys(data[0])
    let csv = data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    csv.unshift(header.join(','))
    csv = csv.join('\r\n')

    // Create a downloadable link
    let blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    })
    let link = document.createElement("a")
    let url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "videoValues.csv")
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}


function changeBgColor(sliderValue) {
    let red, green, blue;

    if (sliderValue <= 50) {
        // We are going from Red to White
        red = 255
        green = blue = Math.round((sliderValue / 50) * 255)
    } else {
        // We are going from White to Green
        red = Math.round((1 - (sliderValue - 50) / 50) * 255)
        green = 255
        blue = red // decrease blue in the same way as red
    }

    // Change the background color of the div
    document.getElementById("slidecolor").style.backgroundColor =
        "rgb(" + red + "," + green + "," + blue + ")"
}

let slider = document.getElementById('slider')
let isSliderReleased = false

slider.addEventListener('input', function() {
    let sliderValue = document.getElementById('slider').value
    sliderValue = _.toNumber(sliderValue)
    document.getElementById('slider-value').innerHTML = sliderValue
    document.getElementById('likert').innerHTML = getLikertLabel(sliderValue)
    changeBgColor(sliderValue)
    isSliderReleased = false
    slider.addEventListener('change', function() {
        if (!isSliderReleased) {
            player.getCurrentTime().then(value => {
                let newValue = _.toInteger(document.getElementById('slider').value)
                // create a json object with the current time and the slider value
                let time = {
                    "Seconds": Math.trunc(value),
                    "Likert Value": newValue,
                    "Video ID": randomVideo,
                    "User ID": userId,
                    "Timestamp": getTimestamp()
                }
                // push the json object to the videoValues array
                videoValues.push(time)
                // save the videoValues array to local storage
                localStorage.setItem('videoValues', JSON.stringify(videoValues))
                console.log(videoValues)
            })
            isSliderReleased = true
        }
    })
})

player.on('stateChange', event => {
    if (event.data === 0) {
        document.getElementById("slidecolor").style.backgroundColor = "white"
        document.getElementById('slider-value').innerHTML = 50
        document.getElementById('slider').value = 50
        document.getElementById('likert').innerHTML = "Neither Agree nor Disagree"
        // pick a random video from videoList that isn't in alredyPlayed
        randomVideo = _.sample(_.difference(videoList, alreadyPlayed))
        alreadyPlayed.push(randomVideo)
        localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed))
        player.loadVideoById(randomVideo)
    }
})

// add event listener to the next-video button
document.getElementById('next-video').addEventListener('click', function() {
    document.getElementById("slidecolor").style.backgroundColor = "white"
    document.getElementById('slider-value').innerHTML = 50
    document.getElementById('slider').value = 50
    document.getElementById('likert').innerHTML = "Neither Agree nor Disagree"
    randomVideo = _.sample(_.difference(videoList, alreadyPlayed))
    alreadyPlayed.push(randomVideo)
    localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed))
    player.loadVideoById(randomVideo)
})

// add event listener to the download button
document.getElementById('download').addEventListener('click', function() {
    exportToCsv()
})