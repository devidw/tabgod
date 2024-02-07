chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status !== "complete" ||
    !tab.url ||
    tab.url.startsWith("chrome://")
  ) {
    return
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      world: "MAIN",
      args: [chrome.runtime.id],
      func: function (EXT_ID: string) {
        // @ts-ignore
        window.tabgod = async function (
          tabFilterFunc: (tab: chrome.tabs.Tab) => boolean,
          exeFunc: () => unknown
        ) {
          return new Promise((resolve) => {
            chrome.runtime.sendMessage(
              EXT_ID,
              {
                tabFilterFunc: tabFilterFunc.toString(),
                exeFunc: exeFunc.toString(),
              },
              function (response) {
                console.table(response)
                resolve(response)
              }
            )
          })
        }
      },
    },
    (out) => {
      console.log(out)
    }
  )
})

chrome.runtime.onMessageExternal.addListener(
  async (
    request: {
      tabFilterFunc: string
      exeFunc: string
    },
    sender,
    sendResponse
  ) => {
    console.log(request, sender)

    const allTabs: chrome.tabs.Tab[] = await new Promise((resolve) => {
      chrome.tabs.query({}, (tabs) => {
        resolve(tabs)
      })
    })

    const allCompletedTabs = allTabs.filter((tab) => tab.status === "complete")

    // we can not `eval()` or `new Function()` from the service worker (here) directlly so in order to make tab filtering
    // callback work we have to offload the filtering to an execution enviroment where we do not have csp restrictions
    // like in the browser extension itself, so we do it the world of a tab
    const targetTabIds: number[] | undefined = await new Promise((resolve) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: sender.tab?.id! },
          world: "MAIN",
          args: [allCompletedTabs, request.tabFilterFunc],
          func: function (
            tabs: chrome.tabs.Tab[],
            tabFilterFunc: string
          ): number[] {
            // console.log(tabs, tabFilterFunc)
            const theFilter = eval(tabFilterFunc)
            return tabs.filter((tab) => theFilter(tab)).map((tab) => tab.id!)
          },
        },
        (output) => {
          resolve(output[0].result)
        }
      )
    })

    if (!targetTabIds) {
      return
    }

    const outs = await Promise.all(
      targetTabIds.map((tabId) => {
        return Promise.race([
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), 1000)
          ),
          new Promise((resolve) => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                world: "MAIN",
                args: [request.exeFunc],
                func: function (theCode: string): unknown {
                  console.log("tabgod target")
                  // return eval("'hey'")
                  return eval(`(${theCode})()`)
                },
              },
              (out) => {
                console.table(out)
                resolve(out[0].result)
              }
            )
          }),
        ])
      })
    )

    sendResponse(outs)
  }
)
