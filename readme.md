<h1 align="center">
  <img src="./dist/tabgod.png" width="128" height="128" />
  <br />
  tabgod
</h1>

execute _any_ javascript from _any_ browser tab on _any_ browser tabs

what you get in all devtools consoles:

```ts
tabgod(tabTitleSubstring: string, func: () => void): Promise<unknown[]>
```

![](./demo.gif)

## installation

- clone repo
- goto _your-chromium-based-browser://extensions/_
    - example: _arc://extensions/_
- make sure to have 'Developer mode' enabled
- 'Load unpacked' choose path to ./dist of repo
- edit ./dist/sw.js EXT_ID to match what chrome assigned
  - extensions > godtab > Details > ID

## usage

1. choose execution targets by substring that has to be part of tab title
2. write any js to execute in world of targeted tabs

```js
await tabgod("something", () => {
  document.body.style.background = "pink"
})
```

## how it works

uses combination of chromes scripting and external message passing apis

- on tab changes inject tabgod function into tab main world
- on call of tabgod use external message passing between main tab world and browser extension service worker
  - have to stringify function because payload will be json-serialized
- when service worker receives job details
  - query tabs and inject script
  - eval of function in tab world
  - send results back to requesting tab
