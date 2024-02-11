declare async function tabgod(
  tabFilterFunc: (tab: chrome.tabs.Tab, ...args: unknown[]) => boolean,
  exeFunc: (...args: unknown[]) => unknown,
  options?: {
    tabFilterArgs?: unknown[]
    exeArgs?: unknown[]
    evalAdd?: string
  }
): Promise<{ tabId: number; result: unknown }[]>
