<script setup>
import { reactive, ref } from 'vue'
import { forceReflow } from '@/utils/_'

// ============================================================
// Original architecture (from main HEAD), ported to NuxtPage hooks.
//
// Two paths:
//
// FAST (navigation finishes before grace timer fires):
//   - onBeforeLeave snapshots leaving rect → fromWrapperStyle
//   - onBeforeEnter clones the entering element off-screen, snapshots
//     its rect → toWrapperStyle
//   - onLeave flips leaving from its position toward toWrapperStyle
//     (i.e. toward the entering element's slot)
//   - onEnter flips entering from fromWrapperStyle (the leaving
//     element's slot) into its own position
//   - both run simultaneously (Vue Transition default mode), giving a
//     swap-in-place flip without ever showing the loader
//
// SLOW (grace timer fires before navigation finishes):
//   - 100 ms after beforeEach: enableTransition becomes false; the
//     timer "hijacks" the leaving element's transform — re-targeting
//     it from `toWrapperStyle` (entering's slot) to `_toWrapperStyle`
//     (the loader's position). Loader fades/flips in via fromAnimation
//   - onLeave / onEnter that fire after this see enableTransition=false
//     and just resolve done() (no flip of their own)
//   - afterEach schedules phase 2 at max(1300-delta, 0) ms: loader
//     flips out toward entering's slot, entering flips in from loader
// ============================================================

const enableTransition = ref(true)

const router = useRouter()
const LoadingEl = ref()

let TIMER = 0
let startLoadingTime = 0
let firstTime = true

// Phase-1/phase-2 (slow path) bounds — only set after the grace window
const _toWrapperStyle = {}
const _fromWrapperStyle = {}

// Vue-Transition path bounds (fast path)
const fromWrapperStyle = reactive({
  set: false,
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  br: 0,
  t: '',
})
const toWrapperStyle = reactive({
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  br: 0,
  t: '',
})

// Marker classes so we can locate leaving/entering wrappers by DOM
// query inside router hooks (NuxtPage hooks don't keep a slot ref).
const LEAVING_CLASS = 'rt-leaving'
const ENTERING_CLASS = 'rt-entering'

let isNested = false

function isNestedChange(to, from) {
  return to.matched[0]?.name === from.matched[0]?.name
}

function isBlogToggle(to, from) {
  return (
    (from.name === 'blog-index-slug' && to.name === 'blog-index')
    || (from.name === 'blog-index' && to.name === 'blog-index-slug')
  )
}

function shouldSkip(to, from) {
  return isBlogToggle(to, from) || isNestedChange(to, from)
}

function reducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function toggleDecoration(show) {
  if (typeof document === 'undefined') return
  document.body.classList[show ? 'remove' : 'add']('hide-extra-wrapper')
}

function getTransitionContainer(el) {
  const containerClass = 'transition-page-wrapper'
  if (!el || !el.classList) return el
  if (el.classList.contains(containerClass)) return el
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i]
    if (child.classList && child.classList.contains(containerClass)) return child
    const _child = getTransitionContainer(child)
    if (_child !== child) return _child
  }
  return el
}

function writeBound(el, boundObj) {
  const elRect = el.getBoundingClientRect()
  boundObj.x = elRect.x
  boundObj.y = elRect.y
  boundObj.w = elRect.width
  boundObj.h = elRect.height
  const _style = getComputedStyle(el)
  boundObj.br = Number.parseFloat(_style.borderRadius.replace('px', '')) || 0
  boundObj.t = _style.transform
}

function calcDelta(prevBound, nextBound, nextMatrix3dStr) {
  let nextTranslateX = 0
  let nextTranslateY = 0
  if (nextMatrix3dStr && nextMatrix3dStr.startsWith('matrix3d')) {
    const matrix3d = nextMatrix3dStr
      .replace(/matrix3d\(|\)/g, '')
      .split(',')
      .map(v => Number.parseFloat(v))
    nextTranslateX = matrix3d[12] || 0
    nextTranslateY = matrix3d[13] || 0
  }

  const scaleX = prevBound.w / nextBound.w
  const scaleY = prevBound.h / nextBound.h

  let deltaX = prevBound.x - nextBound.x + nextTranslateX
  let deltaY = prevBound.y - nextBound.y + nextTranslateY

  deltaX -= ((1 - scaleX) * nextBound.w) / 2
  deltaY -= ((1 - scaleY) * nextBound.h) / 2

  return { deltaX, deltaY, scaleX, scaleY }
}

function clearTransformProps(el) {
  el.style.setProperty('--un-rotate-x', '')
  el.style.setProperty('--un-rotate-z', '')
  el.style.setProperty('--un-translate-x', '')
  el.style.setProperty('--un-translate-y', '')
  el.style.setProperty('--un-scale-x', '')
  el.style.setProperty('--un-scale-y', '')
}

// Slow-path "phase 1" piece — flips an element TO some target bounds.
function toAnimation(el, toBound, selfBound, clear) {
  el.style.opacity = '1'
  el.classList.add('transition-router')
  el.style.transitionDuration = '1300ms'
  el.style.willChange = 'transform, border-radius, opacity'
  const d = calcDelta(toBound, selfBound, selfBound.t)
  el.style.setProperty('--un-rotate-x', '180deg')
  el.style.setProperty('--un-rotate-z', '-180deg')
  el.style.setProperty('--un-translate-x', `${d.deltaX}px`)
  el.style.setProperty('--un-translate-y', `${d.deltaY}px`)
  el.style.setProperty('--un-scale-x', `${d.scaleX}`)
  el.style.setProperty('--un-scale-y', `${d.scaleY}`)
  const scale = (d.scaleX + d.scaleY) / 2
  el.style.borderRadius = `${toBound.br / scale}px`
  el.style.opacity = '0'
  if (clear) {
    let _event = null
    el.addEventListener(
      'transitionend',
      (_event = (ev) => {
        if (ev.target !== el || ev.propertyName !== 'transform') return
        el.removeEventListener('transitionend', _event)
        el.classList.remove('transition-router')
        el.style.transitionDuration = ''
        el.style.willChange = ''
        el.style.borderRadius = ''
        el.style.opacity = ''
        clearTransformProps(el)
      }),
    )
  }
}

// Slow-path "phase 2" piece — flips an element FROM some source bounds
// back into its own slot.
function fromAnimation(el, fromBound, selfBound, clear) {
  if (!fromBound.set) {
    el.style.opacity = '1'
    return
  }
  el.style.transitionDuration = '0s'

  const d = calcDelta(fromBound, selfBound, selfBound.t)
  el.style.setProperty('--un-rotate-x', '-180deg')
  el.style.setProperty('--un-rotate-z', '-180deg')
  el.style.setProperty('--un-translate-x', `${d.deltaX}px`)
  el.style.setProperty('--un-translate-y', `${d.deltaY}px`)
  el.style.setProperty('--un-scale-x', `${d.scaleX}`)
  el.style.setProperty('--un-scale-y', `${d.scaleY}`)
  el.style.opacity = '0'
  const scale = (d.scaleX + d.scaleY) / 2
  el.style.borderRadius = `${fromBound.br / scale}px`
  el.style.willChange = 'transform, border-radius, opacity'

  forceReflow()

  el.classList.add('transition-router')
  el.style.transitionDuration = '1300ms'

  el.style.borderRadius = ''
  el.style.opacity = '1'
  clearTransformProps(el)

  if (clear) {
    let _event = null
    el.addEventListener(
      'transitionend',
      (_event = (ev) => {
        if (ev.target !== el || ev.propertyName !== 'transform') return
        el.removeEventListener('transitionend', _event)
        el.classList.remove('transition-router')
        el.classList.remove(ENTERING_CLASS)
        el.style.transitionDuration = ''
        el.style.willChange = ''
        el.style.opacity = ''
        toggleDecoration(true)
        enableTransition.value = true
      }),
    )
  }
}

// ============== NuxtPage transition hooks ==============

function onBeforeLeave(el) {
  if (reducedMotion()) return
  if (isNested) return
  // .transition-page-wrapper is usually a descendant of the page root,
  // not the root itself — that's the element flip operates on, so the
  // marker class needs to live there too.
  const _el = getTransitionContainer(el)
  if (!_el || !_el.classList) return
  _el.classList.add(LEAVING_CLASS)
  writeBound(_el, fromWrapperStyle)
  fromWrapperStyle.set = true
}

function onBeforeEnter(el) {
  if (reducedMotion()) return
  if (isNested) return
  if (enableTransition.value) toggleDecoration(false)
  if (firstTime) firstTime = false
  const _el = getTransitionContainer(el)
  if (_el && _el.classList) _el.classList.add(ENTERING_CLASS)
  // Clone off-screen to measure where the entering element will land
  if (!el || !el.cloneNode) return
  const toWrapper = el.cloneNode(true)
  toWrapper.style.transitionDuration = '0s'
  toWrapper.style.opacity = '0'
  document.body.appendChild(toWrapper)
  const _toWrapper = getTransitionContainer(toWrapper)
  writeBound(_toWrapper, toWrapperStyle)
  toWrapper.remove()
}

function onLeave(el, done) {
  if (isNested) {
    done()
    return
  }
  if (reducedMotion()) {
    done()
    return
  }
  const _el = getTransitionContainer(el)
  if (!_el) {
    done()
    return
  }
  if (!enableTransition.value) {
    // Slow path took over (the 100 ms timer flipped this element
    // toward the loader). Just hold until phase 1 visually finishes.
    setTimeout(
      () => done(),
      Math.max(0, 1310 - (Date.now() - startLoadingTime)),
    )
    return
  }

  _el.classList.add('transition-router')
  _el.style.transitionDuration = '1300ms'
  _el.style.willChange = 'transform, border-radius, opacity'
  requestAnimationFrame(() => {
    const d = calcDelta(toWrapperStyle, fromWrapperStyle, fromWrapperStyle.t)
    _el.style.setProperty('--un-rotate-x', '180deg')
    _el.style.setProperty('--un-rotate-z', '-180deg')
    _el.style.setProperty('--un-translate-x', `${d.deltaX}px`)
    _el.style.setProperty('--un-translate-y', `${d.deltaY}px`)
    _el.style.setProperty('--un-scale-x', `${d.scaleX}`)
    _el.style.setProperty('--un-scale-y', `${d.scaleY}`)
    const scale = (d.scaleX + d.scaleY) / 2
    _el.style.borderRadius = `${toWrapperStyle.br / scale}px`
    _el.style.opacity = '0'
  })

  let _event = null
  _el.addEventListener(
    'transitionend',
    (_event = (ev) => {
      if (ev.target !== _el || ev.propertyName !== 'transform') return
      _el.removeEventListener('transitionend', _event)
      done()
    }),
  )
}

function onEnter(el, done) {
  if (isNested) {
    done()
    return
  }
  if (reducedMotion()) {
    done()
    return
  }
  const _el = getTransitionContainer(el)
  if (!_el) {
    done()
    return
  }
  if (!fromWrapperStyle.set) {
    done()
    return
  }
  if (!enableTransition.value) {
    // Slow path: phase 2 (router.afterEach) will drive this element
    // into place; we just resolve.
    done()
    return
  }

  _el.style.transitionDuration = '0s'

  const d = calcDelta(fromWrapperStyle, toWrapperStyle, toWrapperStyle.t)
  _el.style.setProperty('--un-rotate-x', '-180deg')
  _el.style.setProperty('--un-rotate-z', '-180deg')
  _el.style.setProperty('--un-translate-x', `${d.deltaX}px`)
  _el.style.setProperty('--un-translate-y', `${d.deltaY}px`)
  _el.style.setProperty('--un-scale-x', `${d.scaleX}`)
  _el.style.setProperty('--un-scale-y', `${d.scaleY}`)
  _el.style.opacity = '0'
  const scale = (d.scaleX + d.scaleY) / 2
  _el.style.borderRadius = `${fromWrapperStyle.br / scale}px`
  _el.style.willChange = 'transform, border-radius, opacity'

  forceReflow()

  requestAnimationFrame(() => {
    _el.classList.add('transition-router')
    _el.style.transitionDuration = '1300ms'

    _el.style.borderRadius = ''
    _el.style.opacity = ''
    clearTransformProps(_el)
  })

  let _event = null
  _el.addEventListener(
    'transitionend',
    (_event = (ev) => {
      if (ev.target !== _el || ev.propertyName !== 'transform') return
      _el.removeEventListener('transitionend', _event)
      done()
    }),
  )
}

function onAfterEnter(el) {
  if (reducedMotion()) return
  const _el = getTransitionContainer(el)
  if (!_el) return
  // Fast-path cleanup. Slow path leaves the marker class on so phase 2
  // can find this element via querySelector; phase 2's own transitionend
  // handler clears it.
  if (enableTransition.value) {
    _el.classList.remove('transition-router')
    _el.classList.remove(ENTERING_CLASS)
    _el.style.transitionDuration = ''
    _el.style.willChange = ''
    if (!enableTransition.value) {
      _el.style.opacity = '0'
    }
  }
}

function onAfterLeave() {
  if (reducedMotion()) return
  if (enableTransition.value) toggleDecoration(true)
}

// ============== Router-level state machine (slow path) ==============

router.beforeEach((to, from) => {
  if (typeof window === 'undefined') return

  // Skip flag drives the NuxtPage hooks (they bail out when true).
  if (isBlogToggle(to, from) || isNestedChange(to, from)) {
    isNested = true
    return
  }
  isNested = false

  startLoadingTime = Date.now()
  enableTransition.value = true
  fromWrapperStyle.set = false
  _fromWrapperStyle.set = false

  clearTimeout(TIMER)
  TIMER = window.setTimeout(() => {
    enableTransition.value = false
    toggleDecoration(false)
    const _loadingEl = getTransitionContainer(LoadingEl.value)
    // At this moment navigation hasn't finished, so the entering page
    // hasn't mounted yet — the only `.transition-page-wrapper` in the
    // DOM belongs to the leaving page.
    const _slotEl = document.querySelector('.transition-page-wrapper')
    if (!_loadingEl) return

    writeBound(_loadingEl, _toWrapperStyle)
    if (_slotEl) {
      writeBound(_slotEl, _fromWrapperStyle)
      _fromWrapperStyle.set = true
      toAnimation(_slotEl, _toWrapperStyle, _fromWrapperStyle)
    }
    fromAnimation(_loadingEl, _fromWrapperStyle, _toWrapperStyle)
  }, 100)
})

router.afterEach((to, from) => {
  if (typeof window === 'undefined') return
  if (shouldSkip(to, from)) return

  clearTimeout(TIMER)
  if (firstTime && enableTransition.value) {
    firstTime = false
    return
  }
  if (firstTime) firstTime = false

  if (!enableTransition.value) {
    const delta = Date.now() - startLoadingTime
    setTimeout(
      () => {
        const _loadingEl = getTransitionContainer(LoadingEl.value)
        const _slotEl = document.querySelector(`.transition-page-wrapper.${ENTERING_CLASS}`)
        if (!_loadingEl || !_slotEl) return
        writeBound(_loadingEl, _fromWrapperStyle)
        writeBound(_slotEl, _toWrapperStyle)
        _fromWrapperStyle.set = true
        toAnimation(_loadingEl, _toWrapperStyle, _fromWrapperStyle, true)
        fromAnimation(_slotEl, _fromWrapperStyle, _toWrapperStyle, true)
      },
      Math.max(1300 - delta, 0),
    )
  }
})

router.onError(() => {
  clearTimeout(TIMER)
  enableTransition.value = true
  toggleDecoration(true)
})

defineExpose({
  onBeforeLeave,
  onBeforeEnter,
  onLeave,
  onEnter,
  onAfterEnter,
  onAfterLeave,
  LoadingEl,
})
</script>

<template>
  <div ref="LoadingEl" class="loading">
    <div class="loading-container">
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading {
  @apply w-100px h-100px rounded-100px;
  @apply bg-light dark-bg-dark;
  @apply fixed top-1/2 left-1/2;
  @apply transform-gpu -translate-x-1/2 -translate-y-1/2 translate-z-200vh;
  @apply shadow-2xl general-shadow;
  @apply opacity-0;
  @apply pointer-events-none;
  @apply flex items-center justify-center;
  @apply backface-hidden;

  .loading-container {
    @apply w-12 h-12 relative;

    div:nth-child(1) {
      @apply absolute top-1/2 left-1/2 z-1;
      @apply w-8 h-8 rounded-full;
      @apply bg-primary-2 dark-bg-primary-6;
      @apply shadow-xl general-shadow;
      @apply transform-gpu -translate-x-1/2 -translate-y-1/2;
    }

    div:not(:nth-child(1)) {
      @apply absolute left-0;
      @apply w-full h-full;
    }

    div:not(:nth-child(1)):before {
      @apply absolute top-0 left-0;
      @apply w-5 h-5;
      @apply -mt-5px -ml-5px;
      @apply opacity-70;
      @apply bg-primary rounded-full;
      content: '';
      animation:
        ball-atom-position 1.5s 0s infinite ease-in-out,
        ball-atom-size 1.5s 0s infinite ease-in-out;
    }

    div:nth-child(2) {
      animation-delay: 0.75s;
    }

    div:nth-child(2):before {
      animation-delay:
        0s,
        -1.125s;
    }

    div:nth-child(3) {
      transform: rotate(120deg);
      animation-delay: -0.25s;
    }

    div:nth-child(3):before {
      animation-delay:
        -1s,
        -0.75s;
    }

    div:nth-child(4) {
      transform: rotate(240deg);
      animation-delay: 0.25s;
    }

    div:nth-child(4):before {
      animation-delay:
        -0.5s,
        -0.125s;
    }
  }
}

@keyframes ball-atom-position {
  50% {
    top: 100%;
    left: 100%;
  }
}

@keyframes ball-atom-size {
  0%,
  100% {
    transform: scale(0.6);
  }

  50% {
    transform: scale(1.1);
  }
}
</style>
