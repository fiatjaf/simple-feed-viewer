/* global TrelloPowerUp */

TrelloPowerUp.initialize({
  'attachment-sections': function (t, options) {
    return options.entries
      .filter(att =>
        att.url.match(/\bfeed/) ||
        att.url.indexOf(/\brss\b/) ||
        att.url.indexOf(/\batom\b/) ||
        att.name.indexOf(/\bfeed\b/)
      )
      .map(att => {
        console.log(att)
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
  }
})
