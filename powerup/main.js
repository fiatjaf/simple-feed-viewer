/* global TrelloPowerUp, fetch */

const qs = require('qs')

TrelloPowerUp.initialize({
  'attachment-sections': function (t, options) {
    return options.entries
      .filter(matches)
      .map(att => {
        return {
          claimed: [att],
          id: t.url,
          title: () =>
            fetch('/feed/title?' + qs.stringify({url: att.url}))
              .then(r => r.text())
              .catch(() => att.name),
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
        let feeds = attachments.filter(matches)
        if (feeds.length === 0) return []

        return Promise.all([
          Promise.all(
            feeds
              .map(att =>
                fetch('/feed/updated?' + qs.stringify({url: att.url}))
                  .then(r => r.json())
              )
          ),
          Promise.all(
            feeds
              .map(att => t.get('member', 'shared', `${att.url}:viewed`, '0000-00-00'))
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

function matches (att) {
  return (
    att.url.match(/\bfeed/) ||
    att.url.match(/\brss\b/) ||
    att.url.match(/\batom\b/) ||
    att.name.match(/\bfeed\b/)
  )
}
