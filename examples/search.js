function google(q) {
  return tabgod(
    (tab) => tab.url.includes("google.com/search"),
    (q) => {
      document.querySelector(`textarea[maxlength="2048"]`).value = q
      document.querySelector(`button[aria-label="Search"]`).click()
    },
    [q]
  )
}

function duck(q) {
  return tabgod(
    (tab) => tab.url.includes("duckduckgo.com"),
    (q) => {
      document.querySelector(`input[name="q"]`).value = q
      document.querySelector(`#search_button`).click()
    },
    [q]
  )
}

function meta(q) {
  return Promise.all([google(q), duck(q)])
}

await meta("tabgod")
