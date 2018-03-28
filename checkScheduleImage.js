// var request = require('request')
const https = require('https')
var today = new Date()
var dt = today.toISOString().substring(0,10)
var env_URL = 'https://staging.cinemax.com/services/hbo/cinemax/schedule.json/date=' // staging environment
// var env_URL = 'https://www.cinemax.com/services/hbo/cinemax/schedule.json/date=' // PROD environment


const env = {
  'https://staging.cinemax.com/services/hbo/cinemax/schedule.json/date=': 'stage',
  'https://www.cinemax.com/services/hbo/cinemax/schedule.json/date=': 'prod'
}

const url = env_URL + dt + '&programming=east&.json'

// async function getJSONURL() {
//     const str = '/services/hbo/cinemax/schedule.json'
//     https.get(siteURL, res => {
//         res.setEncoding('utf8')
//         let body = ''
//         res.on('data', data => {
//             body += data
//         })
//         res.on('end', () => {
//             if (res.statusCode < 400) {
//               if ()
//                 console.log('failed')
//             } else {
//                 console.log('the site is failed to load')
//             }
//         })
//     })
// }


https.get(url, res => {
  res.setEncoding('utf8')
  let body = ''
  const executedCards = []
  res.on('data', data => {
    body += data
  })
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        // get json data
        let passCount = 0
        var failCount = 0
        const scheduleCards = []
        var schedule = JSON.parse(body)['json']['data']['schedule']
        for (let channel of schedule) {
          for (let scheduleCard of channel['programAirings']) {
            for (let imageURL of scheduleCard['program']['images']) {
              // console.log(scheduleCard['program']['focusId'], scheduleCard['program']['title'])
              const baseImageURL = 'https://images.cinemax.com/images/'
              let url = imageURL['url']
              if (url.indexOf(baseImageURL) !== -1) {
                // console.log(scheduleCard['program']['focusId'], scheduleCard['program']['title'], url)
                scheduleCards.push({
                  focusId: scheduleCard['program']['focusId'],
                  title: scheduleCard['program']['title'],
                  imgURL: url
                })
              // } else {
              //     console.log(scheduleCard['program']['focusId'], scheduleCard['program']['title'], 'NULL')
              }
            }
          }
        }
        // console.log(scheduleCards)

        // get url for images
        var imageURLs = scheduleCards.map(function (card) {
          return card.imgURL
        })
        // console.log(imageURLs)

        var responses = []
        for (let i = 0; i < scheduleCards.length; i++) {
          https.get(imageURLs[i], function(res) {
            if (res.statusCode >= 400) {
              console.log('[Fail]', res.statusCode, scheduleCards[i].focusId, scheduleCards[i].title, scheduleCards[i].imgURL)
              failCount++
            } else {
              console.log('[Pass]', res.statusCode, scheduleCards[i].focusId, scheduleCards[i].title, scheduleCards[i].imgURL)
              passCount = passCount + 1
              // console.log(passCount)
            }
          })
        }
        // console.log('Pass: ' + passCount + '/' + scheduleCards.length)
        // console.log('Fail: ' + failCount + '/' + scheduleCards.length)
        // return scheduleCards
      } catch (err) {
        console.log('Unable to get json:', url, err)
      }
    }
  })
})


