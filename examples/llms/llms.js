/**
 * @typedef {import("../../src/global")}
 */

function reactEventDispatch(E, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set
  nativeInputValueSetter.call(E, value)
  const event = new Event("input", { bubbles: true })
  E.dispatchEvent(event)
}

async function getLastResponseHelper(filterString, selector) {
  try {
    let text = ""
    while (true) {
      // debugger
      const outs = await tabgod(
        (tab, id) => tab.url.includes(id),
        /** @param s {string} @returns {string} */
        (s) => {
          // scroll to bottom
          const V = document.querySelector(
            'div[class*="react-scroll-to-bottom--css"] > div[class*="react-scroll-to-bottom--css"]'
          )
          if (V) {
            V.scrollTo(0, V.scrollHeight)
          }

          const els = document.querySelectorAll(s)
          const T = [...els].at(-1)
          return T.innerText
        },
        {
          tabFilterArgs: [filterString],
          exeArgs: [selector],
        }
      )

      const newText = String(outs[0].result)

      if (text.length > 0 && text.length === newText.length) {
        return text
      }

      text = newText

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } catch (e) {
    console.warn(e)
  }
}

class ChatGPT {
  ID = "chat.openai.com/c/fa"

  chat(q) {
    return tabgod(
      (tab, id) => tab.url.includes(id),
      (q) => {
        const T = document.querySelector(`#prompt-textarea`)
        reactEventDispatch(T, q)
        document.querySelector(`button[data-testid="send-button"]`).click()
      },
      {
        tabFilterArgs: [this.ID],
        exeArgs: [q],
        evalAdd: reactEventDispatch.toString(),
      }
    )
  }

  async getLastResponse() {
    return getLastResponseHelper(this.ID, "div[data-message-id]")
  }
}

class Pi {
  ID = "pi.ai"

  chat(q) {
    return tabgod(
      (tab, id) => tab.url.includes(id),
      (q) => {
        const T = document.querySelector(`textarea[placeholder="Talk with Pi"]`)
        reactEventDispatch(T, q)
        document.querySelector(`button[aria-label="Submit text"]`).click()
      },
      {
        exeArgs: [q],
        tabFilterArgs: [this.ID],
        evalAdd: reactEventDispatch.toString(),
      }
    )
  }

  async getLastResponse() {
    return getLastResponseHelper(this.ID, ".break-anywhere:last-of-type")
  }
}

// console.log(await new Pi().getLastResponse())

let turns = 0
let lastRespond = "hey"
let role = "gpt"

const thePi = new Pi()
const gpt = new ChatGPT()

while (true) {
  // if (turns === 4) break

  // debugger

  if (role === "pi") {
    await thePi.chat(lastRespond)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    lastRespond = await thePi.getLastResponse()

    role = "gpt"
  } else if (role === "gpt") {
    await gpt.chat(lastRespond)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    lastRespond = await gpt.getLastResponse()

    role = "pi"
  }

  turns++
}
