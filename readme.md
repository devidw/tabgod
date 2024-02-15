<h1 align="center">
  <a href="https://chromewebstore.google.com/detail/hllgifenolhiihoihflfghkfaefpjdbg">
    <img src="https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png" width="128">
    <br />
    <img src="./tabgod.png" width="128" height="128" />
    <br />
    tabgod
  </a>
</h1>

execute _any_ javascript on _any_ chromium tabs

- adds options page with `tabgod()` function

```ts
async function tabgod(
  tabFilterFunc: (tab: chrome.tabs.Tab, ...args: unknown[]) => boolean,
  exeFunc: (...args: unknown[]) => unknown,
  options?: {
    tabFilterArgs?: unknown[];
    exeArgs?: unknown[];
    evalAdd?: string;
  },
): Promise<{ tabId: number; result: unknown }[]> {
  //
}
```

## examples

having chatgpt and pi talk to each other

https://github.com/devidw/tabgod/assets/68775926/d103bf67-5ed6-4e34-bb96-7b35d42f9d2d

searching same query on multiple search engines

![](./examples/search/demo.gif)

## usage

1. open extensions options page
2. open devtools console
3. use provided `tabgod()` function
   1. choose execution targets by writing a filter function that will
      include/excluce tabs based on defined criteria
      - https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab
   2. write any js to execute in world of targeted tabs

```js
tabgod(
  (tab) => tab.url.includes("example.org"),
  () => document.body.style.background = "pink",
);
```

## notes on first release

- initial idea was to make tabgod function available in all devtools consoles
  for easy and direct access for developers right from every console
- the implementation added tabgod to the global window object
- however this introduced a serious security issue, since this has made the
  function available to websites also, allowing them to interact with other tabs,
  destroying the idea of secure tab origins
- thanks to
  [danielsmc pointing it out](https://github.com/devidw/tabgod/issues/1#issue-2124285330)
- this has been immediately addressed by moving the function only to the options
  page of the extension, and not accepting external connections in the service
  worker
