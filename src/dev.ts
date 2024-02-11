const port = chrome.runtime.connect()

function generateUniqueId() {
  return (
    "id-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
  )
}

async function tabgod(
  tabFilterFunc: (tab: chrome.tabs.Tab, ...args: unknown[]) => boolean,
  exeFunc: (...args: unknown[]) => unknown,
  options?: {
    tabFilterArgs?: unknown[]
    exeArgs?: unknown[]
    evalAdd?: string
  }
): Promise<{ tabId: number; result: unknown }[]> {
  const id = generateUniqueId()

  port.postMessage({
    id,
    tabFilterFunc: tabFilterFunc.toString(),
    exeFunc: exeFunc.toString(),
    options,
  })

  return new Promise((resolve, reject) => {
    port.onMessage.addListener(
      (msg: {
        id: string
        error?: string
        data?: { tabId: number; result: unknown }[]
      }) => {
        console.log(msg)

        if (msg.id !== id) {
          return
        }

        if (msg.error) {
          reject(msg.error)
          return
        }

        if (msg.data) {
          // console.table(msg.data)
          resolve(msg.data)
          return
        }

        reject(new Error("got bad response from service worker"))
      }
    )
  })
}
