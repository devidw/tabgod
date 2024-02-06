"use strict";
/**
 * extension id needs to be changed when loading loacally
 * once we are in chrome web store we can make this the one chrome assigns to us
 */
// const EXT_ID = "onodejnkejiipcgcmopcfekcihihmank"
const EXT_ID = "hllgifenolhiihoihflfghkfaefpjdbg"; // webstore item
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            world: "MAIN",
            args: [EXT_ID],
            func: function (EXT_ID) {
                // @ts-ignore
                window.tabgod = async function (tabTitleSubstring, func) {
                    return new Promise((resolve) => {
                        chrome.runtime.sendMessage(EXT_ID, { tabTitleSubstring, func: func.toString() }, function (response) {
                            console.table(response);
                            resolve(response);
                        });
                    });
                };
            },
        }, (out) => {
            console.log(out);
        });
    }
});
chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    console.log(request);
    chrome.tabs.query({}, async function (tabs) {
        tabs = tabs.filter((tab) => tab.status === "complete" &&
            tab.title?.includes(request.tabTitleSubstring));
        const outs = await Promise.all(tabs.map((tab) => {
            return Promise.race([
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1000)),
                new Promise((resolve) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        world: "MAIN",
                        args: [request.func],
                        func: function (theCode) {
                            console.log("tabgod target");
                            // return eval("'hey'")
                            return eval(`(${theCode})()`);
                        },
                    }, (out) => {
                        console.table(out);
                        resolve(out[0].result);
                    });
                }),
            ]);
        }));
        sendResponse(outs);
    });
});
