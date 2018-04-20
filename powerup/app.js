/* global TrelloPowerUp */

window.Promise = TrelloPowerUp.Promise
require('isomorphic-fetch')

if (location.pathname.match(/main.html/)) {
  require('./main.js')
} else if (location.pathname.match(/feed.html/)) {
  require('./feed.js')
}
