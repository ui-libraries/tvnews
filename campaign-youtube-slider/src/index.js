import * as _ from 'lodash'
import {videoList} from './videolist'
const randomVideo = _.sample(videoList)
let videofragment = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${randomVideo}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
document.getElementsByClassName('video-container')[0].innerHTML = videofragment

