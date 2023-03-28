/* eslint-disable */
;(function () {
  if (!addEventListener.toString().includes('[native code]')) {
    return
  }
  document.cookie = 'PHPSESSID=233;'
  document.cookie = 'i_like_gogits=233;'
  let _addEventListener = addEventListener
  let _postMessage = postMessage
  let isWapPayloadEnabled = false
  let enableWapPayload = () => {
    isWapPayloadEnabled = true
  }
  postMessage = (...args) => {
    if (args && args[0] && args[0].wappalyzer) {
      if (isWapPayloadEnabled) {
        isWapPayloadEnabled = false
        _postMessage(...args)
      }
    } else {
      _postMessage(...args)
    }
  }
  addEventListener = (name, func, opt) => {
    if (
      name === 'message' &&
      func &&
      func.toString().includes('wappalyzer.technologies') !== -1
    ) {
      cheat()
      _addEventListener(name, func, opt)
    } else {
      _addEventListener(name, func, opt)
    }
  }

  let _innerPostMessage = (...args) => {
    enableWapPayload()
    _postMessage(...args)
  }

  const cheat = () => {
    _innerPostMessage({
      wappalyzer: {
        dom: [
          {
            name: 'Preact',
            property: '__k',
            selector:
              '#app, .app, #root, .root, body, body > *, body > * > *, body > * > * > *',
            value: true,
          },
          {
            name: 'React',
            property: '_reactRootContainer',
            selector: 'body > div',
            value: true,
          },
        ],
      },
    })

    _innerPostMessage({
      wappalyzer: {
        js: [
          {
            name: '2B Advice',
            chain: 'BBCookieControler',
            value: true,
          },
          {
            name: '33Across',
            chain: 'Tynt',
            value: true,
          },
          {
            name: '4-Tell',
            chain: '_4TellBoost',
            value: true,
          },
          {
            name: 'Svelte',
            selector: "[class*='svelte-']",
            value: true,
          },
          {
            name: 'SvelteKit',
            selector: '#svelte-announcer',
            value: true,
          },
          {
            name: '@sulu/web',
            chain: 'web.startComponents',
            value: true,
          },
          {
            name: 'Bulma',
            chain: 'Bulma.VERSION',
            value: '233',
          },
          {
            name: 'A-Frame',
            chain: 'AFRAME.version',
            value: '233',
          },
          {
            name: 'Bootstrap',
            chain: 'bootstrap.Alert.VERSION',
            value: '233',
          },
          {
            name: 'Paddle',
            chain: 'Paddle.Checkout',
            value: true,
          },
          {
            name: 'jQuery',
            chain: 'jQuery.fn.jquery',
            value: '233',
          },
          {
            name: 'A8.net',
            chain: 'A8salesCookieRepository',
            value: true,
          },
          {
            name: 'GeneXus',
            chain: 'gx.gxVersion',
            value: '23',
          },
          {
            name: 'Shapecss',
            chain: 'Shapecss',
            value: true,
          },
        ],
      },
    })
  }
})()
