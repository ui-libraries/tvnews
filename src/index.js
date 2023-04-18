import * as _ from 'lodash'
import {videoList} from './videolist'
const randomVideo = _.sample(videoList)
let videofragment = `<iframe width="853" height="505" src="https://www.youtube.com/embed/${randomVideo}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
document.getElementsByClassName('class-details-container')[0].innerHTML = videofragment




