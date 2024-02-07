<h1 align="center">
  <img src="./dist/tabgod.png" width="128" height="128" />
  <br />
  tabgod
</h1>

execute _any_ javascript from _any_ browser tab on _any_ browser tabs

what you get in all devtools consoles:

```ts
async function tabgod(
  tabFilterFunc: (tab: chrome.tabs.Tab) => boolean,
  exeFunc: () => unknown
): Promise<unknown[]> {
  //
}
```

## installation

- clone repo
- goto _your-chromium-based-browser://extensions/_
  - example: _arc://extensions/_
- make sure to have 'Developer mode' enabled
- 'Load unpacked' choose path to ./dist of repo

## usage

1. choose execution targets by writing a filter function that will include/excluce tabs based on defined criteria
   - https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab
2. write any js to execute in world of targeted tabs

```js
await tabgod(
  (tab) => {
    return tab.url.includes("example.org")
  },
  () => {
    document.body.style.background = "pink"
  }
)
```
