import * as _ from 'lodash'
import YouTubePlayer from 'youtube-player'
import {
    videoList
} from './videolist'
let alreadyPlayed = []
let randomVideo = _.sample(videoList)
alreadyPlayed.push(randomVideo)
let player

player = YouTubePlayer('video-container')
player.loadVideoById(randomVideo)
let videoValues = []
let userId = Math.random().toString(36).slice(2)

//player.getVideoData().title

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

let slider = document.getElementById('slider')
let isSliderReleased = false

slider.addEventListener('input', function() {
    let sliderValue = document.getElementById('slider').value
    sliderValue = _.toNumber(sliderValue)
    document.getElementById('slider-value').innerHTML = sliderValue
    document.getElementById('likert').innerHTML = getLikertLabel(sliderValue)
    const red = sliderValue < 50 ? 255 : Math.round(255 - ((sliderValue - 50) * 5.1))
    const green = sliderValue > 50 ? 255 : Math.round((sliderValue * 5.1))
    const blue = 0
    document.getElementById('slidecolor').style.backgroundColor = `rgb(${red}, ${green}, ${blue})`
    isSliderReleased = false
    slider.addEventListener('change', function() {
        if (!isSliderReleased) {
            player.getCurrentTime().then(value => {
                let newValue = _.toInteger(document.getElementById('slider').value)
                // create a json object with the current time and the slider value
                let time = {
                    currentTime: Math.trunc(value),
                    sliderValue: newValue,
                    videoId: randomVideo,
                    userId: userId
                }
                // push the json object to the videoValues array
                videoValues.push(time)
                console.log(videoValues)
            })
            isSliderReleased = true
        }
    })
})

player.on('stateChange', event => {
    if (event.data === 0) {
        // pick a random video from videoList that isn't in alredyPlayed
        randomVideo = _.sample(_.difference(videoList, alreadyPlayed))
        alreadyPlayed.push(randomVideo)
        player.loadVideoById(randomVideo)
    }
})

// add event listener to the next-video button
document.getElementById('next-video').addEventListener('click', function() {
    randomVideo = _.sample(_.difference(videoList, alreadyPlayed))
    alreadyPlayed.push(randomVideo)
    player.loadVideoById(randomVideo)
})