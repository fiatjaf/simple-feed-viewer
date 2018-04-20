/* global TrelloPowerUp, fetch */

const qs = require('qs')

TrelloPowerUp.initialize({
  'attachment-sections': function (t, options) {
    return options.entries
      .filter(match)
      .map(att => {
        return {
          claimed: [att],
          title: att.name,
          icon: './icon.svg',
          content: {
            type: 'iframe',
            url: t.signUrl('./feed.html', {
              url: att.url
            })
          }
        }
      })
  },
  'card-badges': function (t) {
    return t.card('attachments')
      .then(({attachments}) => {
        attachments = attachments.filter(match)

        return Promise.all([
          Promise.all(
            attachments
              .map(att =>
                fetch('/feed/updated?' + qs.stringify({url: att.url}))
                  .then(r => r.json())
              )
          ),
          Promise.all(
            attachments
              .map(att => t.get('board', 'shared', `${att.url}:updated`, '0000-00-00'))
          )
        ])
      })
      .then(([current, cached]) => {
        var isUpdated = 0
        for (let i = 0; i < current.length; i++) {
          if (current[i] > cached[i]) {
            isUpdated += 1
          }
        }

        return [{
          text: `${isUpdated}/${current.length}`,
          icon: './icon.svg',
          color: isUpdated ? 'orange' : null
        }]
      })
      .catch(e => {
        console.log(e)
        return []
      })
  }
})

function match (att) {
  return (
    att.url.match(/\bfeed/) ||
    att.url.indexOf(/\brss\b/) ||
    att.url.indexOf(/\batom\b/) ||
    att.name.indexOf(/\bfeed\b/)
  )
}
