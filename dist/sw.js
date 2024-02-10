"use strict";
/*
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
*/
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener(async (request, port) => {
        // console.log(request, port)
        const allTabs = await new Promise((resolve) => {
            chrome.tabs.query({}, (tabs) => {
                resolve(tabs);
            });
        });
        const allCompletedTabs = allTabs.filter((tab) => tab.status === "complete");
        if (allCompletedTabs.length === 0) {
            port.postMessage({ error: "no tabs" });
            return;
        }
        const tmpTab = await chrome.tabs.create({
            url: "https://example.org",
            active: false,
        });
        // we can not `eval()` or `new Function()` from the service worker (here) directlly so in order to make tab filtering
        // callback work we have to offload the filtering to an execution enviroment where we do not have csp restrictions
        // like in the browser extension itself, so we do it the world of a tab
        const targetTabIds = await new Promise((resolve) => {
            chrome.scripting.executeScript({
                target: { tabId: tmpTab.id },
                world: "MAIN",
                args: [allCompletedTabs, request.tabFilterFunc],
                func: function (tabs, tabFilterFunc) {
                    // console.log(tabs, tabFilterFunc)
                    const theFilter = eval(tabFilterFunc);
                    return tabs
                        .filter((tab) => theFilter(tab))
                        .map((tab) => tab.id);
                },
            }, (output) => {
                // console.log(output)
                if (Array.isArray(output) && output.length > 0) {
                    resolve(output[0].result);
                    return;
                }
                resolve(undefined);
            });
        });
        chrome.tabs.remove(tmpTab.id);
        if (!targetTabIds) {
            port.postMessage({ error: "no tab ids" });
            return;
        }
        const outs = await Promise.all(targetTabIds.map((tabId) => {
            return new Promise((resolve) => {
                chrome.scripting.executeScript({
                    target: { tabId },
                    world: "MAIN",
                    args: [request.exeFunc, request.exeArgs ?? []],
                    func: function (theCode, theArgs) {
                        console.log("tabgod target");
                        // return eval("'hey'")
                        return eval(`(${theCode})(...${JSON.stringify(theArgs)})`);
                    },
                }, (out) => {
                    resolve({ tabId, result: out[0].result });
                });
            });
        }));
        port.postMessage(outs);
    });
});
