import * as _ from 'lodash'
import YouTubePlayer from 'youtube-player'
import {
    videoList
} from './random250'
if (!localStorage.getItem('alreadyPlayed')) {
    localStorage.setItem('alreadyPlayed', JSON.stringify([]))
}

if (!localStorage.getItem('videoIndex')) {
    localStorage.setItem('videoIndex', '0'); // Initialize at the first index
}

if (!localStorage.getItem('videoValues')) {
    localStorage.setItem('videoValues', JSON.stringify([]))
}

let alreadyPlayed = JSON.parse(localStorage.getItem('alreadyPlayed'))
let videoValues = JSON.parse(localStorage.getItem('videoValues'))
let videoIndex = parseInt(localStorage.getItem('videoIndex'));

// Check if you've reached the end of the video list and reset the index if so
if (videoIndex >= videoList.length) {
    videoIndex = 0;
}

// Get the next video to play
let nextVideo = videoList[videoIndex];

// Update the list of already played videos and the video index
alreadyPlayed.push(nextVideo);
localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed));
localStorage.setItem('videoIndex', (videoIndex + 1).toString());

let player

player = YouTubePlayer('video-container')
player.loadVideoById(nextVideo)
let userId = Math.random().toString(36).slice(2)
document.getElementById('video-title').innerText = `Video Index: ${videoIndex+1}, Video ID: ${nextVideo}`;

function getTimestamp() {
  let currentDate = new Date()
  let readableDate = currentDate.toLocaleString()
  return readableDate
}

function getLikertLabel(input) {
    const value = Number(input)
    const ranges = [
        { max: 14, label: "Strongly Disagree" },
        { max: 29, label: "Disagree" },
        { max: 39, label: "Moderately Disagree" },
        { max: 49, label: "Slightly Disagree" },
        { max: 59, label: "Neither Agree nor Disagree" },
        { max: 69, label: "Slightly Agree" },
        { max: 84, label: "Moderately Agree" },
        { max: 90, label: "Agree" },
        { max: 100, label: "Strongly Agree" }
    ]

    const range = ranges.find(range => value <= range.max)
    return range ? range.label : "Invalid input"
}


function exportToCsv() {
    // Fetch data from localStorage
    let data = JSON.parse(localStorage.getItem('videoValues'))

    if (!data) {
        console.error("No data found in localStorage under 'videoValues'")
        return
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
            let videoNum = parseInt(localStorage.getItem('videoIndex'))
            player.getCurrentTime().then(value => {
                let newValue = _.toInteger(document.getElementById('slider').value)
                // create a json object with the current time and the slider value
                let time = {
                    "Seconds": Math.trunc(value),
                    "Likert Value": newValue,
                    "Video ID": nextVideo,
                    "Video Index": videoNum,
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
        // Reset UI elements
        document.getElementById("slidecolor").style.backgroundColor = "white";
        document.getElementById('slider-value').innerHTML = 50;
        document.getElementById('slider').value = 50;
        document.getElementById('likert').innerHTML = "Neither Agree nor Disagree";

        // Fetch the current videoIndex from localStorage
        let videoIndex = parseInt(localStorage.getItem('videoIndex'));

        // If reached the end of the list, wrap to the beginning
        if (videoIndex >= videoList.length) {
            videoIndex = 0;
        }

        // Fetch the next video based on the current index
        let nextVideo = videoList[videoIndex];

        // Update alreadyPlayed and videoIndex in localStorage
        alreadyPlayed.push(nextVideo);
        localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed));
        localStorage.setItem('videoIndex', (videoIndex + 1).toString());

        // Load the next video
        player.loadVideoById(nextVideo);
        document.getElementById('video-title').innerText = `Video Index: ${videoIndex+1}, Video ID: ${nextVideo}`;
    }
});

document.getElementById('next-video').addEventListener('click', function() {
    // Resetting the UI elements
    document.getElementById("slidecolor").style.backgroundColor = "white";
    document.getElementById('slider-value').innerHTML = 50;
    document.getElementById('slider').value = 50;
    document.getElementById('likert').innerHTML = "Neither Agree nor Disagree";

    // Fetch the current videoIndex from localStorage
    let videoIndex = parseInt(localStorage.getItem('videoIndex'));

    // If reached the end of the list, wrap to the beginning
    if (videoIndex >= videoList.length) {
        videoIndex = 0;
    }

    // Fetch the next video based on the current index
    nextVideo = videoList[videoIndex];

    // Update alreadyPlayed and videoIndex in localStorage
    alreadyPlayed.push(nextVideo);
    localStorage.setItem('alreadyPlayed', JSON.stringify(alreadyPlayed));
    localStorage.setItem('videoIndex', (videoIndex + 1).toString());

    // Load the next video
    player.loadVideoById(nextVideo);
    document.getElementById('video-title').innerText = `Video Index: ${videoIndex+1}, Video ID: ${nextVideo}`;
});

// add event listener to the download button
document.getElementById('download').addEventListener('click', function() {
    exportToCsv()
})