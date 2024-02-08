if (chrome.devtools) {
  chrome.devtools.panels.create(
    "tabgod",
    "tabgod.png",
    "dev.html",
    function (panel) {
      //
    }
  )
}

const tabFilterFuncTextarea = document.querySelector(
  "#tabFilterFunc"
) as HTMLTextAreaElement
const exeFuncTextarea = document.querySelector(
  "#exeFunc"
) as HTMLTextAreaElement
const resultsTextarea = document.querySelector(
  "#results"
) as HTMLTextAreaElement
const goButton = document.querySelector("#go") as HTMLButtonElement

// console.log(tabFilterFuncTextarea, exeFuncTextarea, resultsTextarea, goButton)

tabFilterFuncTextarea.value = `
(tab) => {
  return tab.url.includes("example.org")
}
`.trim()

exeFuncTextarea.value = `
() => {
  return 1 + 1
}
`.trim()

const port = chrome.runtime.connect()

port.onMessage.addListener((msg) => {
  resultsTextarea.value = JSON.stringify(msg, null, 4)
})

goButton.addEventListener("click", () => {
  const tabFilterFunc = tabFilterFuncTextarea.value
  const exeFunc = exeFuncTextarea.value

  port.postMessage({
    tabFilterFunc: tabFilterFunc.toString(),
    exeFunc: exeFunc.toString(),
  })
})
