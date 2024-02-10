const port = chrome.runtime.connect()

async function tabgod(
  tabFilterFunc: (tab: chrome.tabs.Tab) => boolean,
  exeFunc: () => void,
  exeArgs?: unknown[]
) {
  port.postMessage({
    tabFilterFunc: tabFilterFunc.toString(),
    exeFunc: exeFunc.toString(),
    exeArgs,
  })
  return new Promise((resolve) => {
    port.onMessage.addListener((msg) => {
      console.table(msg)
      return msg
    })
  })
}
