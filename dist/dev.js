"use strict";
const port = chrome.runtime.connect();
async function tabgod(tabFilterFunc, exeFunc, exeArgs) {
    port.postMessage({
        tabFilterFunc: tabFilterFunc.toString(),
        exeFunc: exeFunc.toString(),
        exeArgs,
    });
    return new Promise((resolve) => {
        port.onMessage.addListener((msg) => {
            console.table(msg);
            return msg;
        });
    });
}
