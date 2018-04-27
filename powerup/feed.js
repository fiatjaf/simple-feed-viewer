/* global TrelloPowerUp, fetch */

const qs = require('qs')
const extractSummary = require('extract-summary')

const t = TrelloPowerUp.iframe()
const url = t.arg('url')

t.render(() => {
  fetch('/feed?' + qs.stringify({url}))
    .then(r => r.ok
      ? r.json()
        .then(feed => {
          t.set('member', 'shared', `${url}:viewed`, feed.updatedParsed)
          return `
<main>
  <section>
    <ul>
    ${feed.items.map(item => `
      <li>
        <article>
          <header>
            ${item.image ? `<img src="${item.image}">` : ''}
            <h1><a href="${item.link}" target="_blank" rel="external">${item.title}</a></h1>
            <aside>
              <time>${(item.updated || item.published || '').replace('00:00:000', '').replace(' +000', '')}</time>
              ${item.author ? `<ul><li>${item.author.name}</li></ul>` : ''}
            </aside>
          </header>
          <div>
            ${(item.description || item.content || '').length > 650 ? extractSummary(item.description || item.content, 'html') : item.description || item.content || ''}
          </div>
        </article>
      </li>
    `).join('')}
    </ul>
  </section>
</main>
        `
        })
      : r.text().then(text => `
<header>
  <h1>There was an error fetching this feed</h1>
  <p>${text}</p>
</header>
        `)
    )
    .catch(e => `
<header>
  <h1>An error happened</h1>
  <p>${e.message}</p>
</header>
<main>
  <article>
    <div style="white-space: pre-wrap; font-family: monospace;">
${e.stack}
    </div>
  </article>
</main>
    `)
    .then(html => {
      document.body.innerHTML = html
      t.sizeTo('html')
    })
})
