/* global TrelloPowerUp, URLSearchParams, fetch */

const t = TrelloPowerUp.iframe()
const url = t.arg('url')

let qs = new URLSearchParams()
qs.append('url', url)

t.render(() => {
  fetch('/feed?' + qs.toString())
    .then(r => r.json())
    .then(feed => {
      let html = `<main><section>
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
          <time>${item.updated || item.published || ''}</time>
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
</section></main>`
      document.body.innerHTML = html
      t.sizeTo('html')
    })
    .catch(e => {
      console.log('error getting rss content', e)
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
