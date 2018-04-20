/* global TrelloPowerUp, fetch */

const qs = require('qs')

const t = TrelloPowerUp.iframe()
const url = t.arg('url')

t.render(() => {
  fetch('/feed?' + qs.stringify({url}))
    .then(r => r.ok
      ? r.json()
        .then(feed => {
          t.set('board', 'shared', `${url}:updated`, feed.updatedParsed)
          return `
<main>
  <section>
    <header>
      <h1>${feed.link ? `<a href="${feed.link}">${feed.title}</a>` : feed.title}</h1>
    </header>
    <ul>
    ${feed.items.map(item => `
      <li>
        <article>
          <header>
            ${item.image ? `<img src="${item.image}">` : ''}
            <h1><a href="${item.link}" target="_blank" rel="external">${item.title}</a></h1>
            <aside>
              <time>${(item.updated || item.published || '').replace(' +000', '')}</time>
              ${item.author ? `<ul><li>${item.author.name}</li></ul>` : ''}
            </aside>
          </header>
          <div>
            ${item.description || item.content}
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

let link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://cdn.rawgit.com/fiatjaf/classless/c891758/themes/zen/theme.css'
document.head.appendChild(link)
let custom = document.createElement('style')
custom.innerHTML = `
body {
  background: transparent;
}
`
document.head.appendChild(custom)
