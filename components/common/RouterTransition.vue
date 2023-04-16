<script setup>
import { forceReflow } from '@/utils/_'
import { reactive, ref } from 'vue'

const toggleDecoration = show => {
  document.body.classList[show ? 'remove' : 'add']('hide-extra-wrapper')
}

const getTransitionContainer = el => {
  const containerClass = 'transition-page-wrapper'
  // 如果el不是元素，直接返回
  if (!el || !el.classList) {
    return el
  }
  // 如果el是transition-page-wrapper，直接返回
  if (el.classList.contains(containerClass)) {
    return el
  }
  // 否则，遍历el的所有层级的子元素，找到transition-page-wrapper
  for (let i = 0; i < el.children.length; i++) {
    const child = el.children[i]
    if (child.classList && child.classList.contains(containerClass)) {
      return child
    } else {
      const _child = getTransitionContainer(child)
      if (_child != child) {
        return _child
      }
    }
  }
  return el
}

const enableTransition = ref(true)

const router = useRouter()
const LoadingEl = ref()
const SlotEl = ref()

let TIMER = 0
let startLoadingTime = 0
const _toWrapperStyle = {}
const _fromWrapperStyle = {}
let firstTime = true
let _firstTime = true

router.beforeEach((to, from, next) => {
  startLoadingTime = Date.now()
  enableTransition.value = true
  clearTimeout(TIMER)
  TIMER = setTimeout(() => {
    enableTransition.value = false
    toggleDecoration(false)
    const _loadingEl = getTransitionContainer(LoadingEl.value)
    const _slotEl = getTransitionContainer(SlotEl.value)

    writeBound(_loadingEl, _toWrapperStyle)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (_slotEl && _slotEl.nodeName != '#comment') {
        writeBound(_slotEl, _fromWrapperStyle)
        _fromWrapperStyle.set = true
        toAnimationWithoutAnimation(_slotEl, _toWrapperStyle, _fromWrapperStyle)
      }
      fromAnimationWithoutAnimation(
        _loadingEl,
        _fromWrapperStyle,
        _toWrapperStyle
      )
    } else {
      if (_slotEl && _slotEl.nodeName != '#comment') {
        writeBound(_slotEl, _fromWrapperStyle)
        _fromWrapperStyle.set = true
        toAnimation(_slotEl, _toWrapperStyle, _fromWrapperStyle)
      }
      fromAnimation(_loadingEl, _fromWrapperStyle, _toWrapperStyle)
    }
  }, 100)
  next()
})

router.afterEach((to, from) => {
  clearTimeout(TIMER)
  if (!firstTime && to.path == from.path) {
    return
  }
  if (firstTime && enableTransition.value === true) {
    firstTime = false
    return
  }
  if (firstTime) {
    firstTime = false
  }
  if (!enableTransition.value) {
    const delta = Date.now() - startLoadingTime
    // 检查是否需要动画
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const _loadingEl = getTransitionContainer(LoadingEl.value)
      const _slotEl = getTransitionContainer(SlotEl.value)
      writeBound(_loadingEl, _fromWrapperStyle)
      writeBound(_slotEl, _toWrapperStyle)
      _fromWrapperStyle.set = true
      toAnimationWithoutAnimation(
        _loadingEl,
        _toWrapperStyle,
        _fromWrapperStyle,
        true
      )
      fromAnimationWithoutAnimation(
        _slotEl,
        _fromWrapperStyle,
        _toWrapperStyle,
        true
      )
    } else {
      setTimeout(() => {
        const _loadingEl = getTransitionContainer(LoadingEl.value)
        const _slotEl = getTransitionContainer(SlotEl.value)
        writeBound(_loadingEl, _fromWrapperStyle)
        writeBound(_slotEl, _toWrapperStyle)
        _fromWrapperStyle.set = true
        toAnimation(_loadingEl, _toWrapperStyle, _fromWrapperStyle, true)
        fromAnimation(_slotEl, _fromWrapperStyle, _toWrapperStyle, true)
      }, Math.max(1300 - delta, 0))
    }
  }
})

const fromAnimationWithoutAnimation = (el, fromBound) => {
  if (!fromBound.set) {
    el.style.opacity = '1'
    return
  }
  el.style.opacity = ''
  SlotEl.value.classList.remove('transition-router')
  SlotEl.value.style.transitionDuration = ''
  SlotEl.value.style.willChange = ''
  enableTransition.value = true
  toggleDecoration(true)
}

const toAnimationWithoutAnimation = el => {
  el.style.opacity = 1
  SlotEl.value.classList.remove('transition-router')
  SlotEl.value.style.transitionDuration = ''
  SlotEl.value.style.willChange = ''
  enableTransition.value = true
  toggleDecoration(true)
}

const fromAnimation = (el, fromBound, selfBound, clear) => {
  if (!fromBound.set) {
    el.style.opacity = '1'
    return
  }
  el.style.transitionDuration = '0s'

  const d = calcDelta(fromBound, selfBound, selfBound.t)
  el.style.setProperty('--tw-rotate-x', '-180deg')
  el.style.setProperty('--tw-rotate-z', '-180deg')
  el.style.setProperty('--tw-translate-x', `${d.deltaX}px`)
  el.style.setProperty('--tw-translate-y', `${d.deltaY}px`)
  el.style.setProperty('--tw-scale-x', `${d.scaleX}`)
  el.style.setProperty('--tw-scale-y', `${d.scaleY}`)
  el.style.opacity = '0'
  const scale = (d.scaleX + d.scaleY) / 2
  el.style.borderRadius = fromBound.br / scale + 'px'
  el.style.willChange = 'transform, border-radius, opacity'

  forceReflow()

  el.classList.add('transition-router')
  el.style.transitionDuration = '1300ms'

  // 重置全部属性
  el.style.borderRadius = ''
  el.style.opacity = '1'
  el.style.setProperty('--tw-rotate-x', '')
  el.style.setProperty('--tw-rotate-z', '')
  el.style.setProperty('--tw-translate-x', '')
  el.style.setProperty('--tw-translate-y', '')
  el.style.setProperty('--tw-scale-x', '')
  el.style.setProperty('--tw-scale-y', '')

  if (clear) {
    // 监听动画结束
    let _event = null
    el.addEventListener(
      'transitionend',
      (_event = ev => {
        if (ev.target != el || ev.propertyName !== 'transform') return
        el.removeEventListener('transitionend', _event)
        // 重置 style
        el.style.opacity = ''
        SlotEl.value.classList.remove('transition-router')
        SlotEl.value.style.transitionDuration = ''
        SlotEl.value.style.willChange = ''
        enableTransition.value = true
        toggleDecoration(true)
      })
    )
  }
}

const toAnimation = (el, toBound, selfBound, clear) => {
  el.style.opacity = 1
  el.classList.add('transition-router')
  el.style.transitionDuration = '1300ms'
  el.style.willChange = 'transform, border-radius, opacity'
  const d = calcDelta(toBound, selfBound, selfBound.t)
  el.style.setProperty('--tw-rotate-x', '180deg')
  el.style.setProperty('--tw-rotate-z', '-180deg')
  el.style.setProperty('--tw-translate-x', `${d.deltaX}px`)
  el.style.setProperty('--tw-translate-y', `${d.deltaY}px`)
  el.style.setProperty('--tw-scale-x', `${d.scaleX}`)
  el.style.setProperty('--tw-scale-y', `${d.scaleY}`)
  const scale = (d.scaleX + d.scaleY) / 2
  el.style.borderRadius = toBound.br / scale + 'px'
  el.style.opacity = 0
  if (clear) {
    // 监听动画结束
    let _event = null
    el.addEventListener(
      'transitionend',
      (_event = ev => {
        if (ev.target != el || ev.propertyName !== 'transform') return
        // 移除监听
        el.removeEventListener('transitionend', _event)
        // 重置 style
        el.classList.remove('transition-router')
        el.style.transitionDuration = ''
        el.style.willChange = ''
        el.style.borderRadius = ''
        el.style.opacity = ''
        el.style.setProperty('--tw-rotate-x', '')
        el.style.setProperty('--tw-rotate-z', '')
        el.style.setProperty('--tw-translate-x', '')
        el.style.setProperty('--tw-translate-y', '')
        el.style.setProperty('--tw-scale-x', '')
        el.style.setProperty('--tw-scale-y', '')
      })
    )
  }
}

const calcDelta = (prevBound, nextBound, nextMatrix3dStr) => {
  const matrix3d = nextMatrix3dStr
    .replace(/matrix3d\(|\)/g, '')
    .split(',')
    .map(v => parseFloat(v))
  // 转换为 translate
  const nextTranslateX = matrix3d[12]
  const nextTranslateY = matrix3d[13]

  // 计算 scale
  const scaleX = prevBound.w / nextBound.w
  const scaleY = prevBound.h / nextBound.h

  // 计算 delta
  let deltaX = prevBound.x - nextBound.x + nextTranslateX
  let deltaY = prevBound.y - nextBound.y + nextTranslateY

  // 因为进行了 scale，所以需要根据 scale 修正 delta
  deltaX -= ((1 - scaleX) * nextBound.w) / 2
  deltaY -= ((1 - scaleY) * nextBound.h) / 2

  return {
    deltaX,
    deltaY,
    scaleX,
    scaleY,
  }
}

const writeBound = (el, boundObj) => {
  const elRect = el.getBoundingClientRect()
  boundObj.x = elRect.x
  boundObj.y = elRect.y
  boundObj.w = elRect.width
  boundObj.h = elRect.height
  const _style = getComputedStyle(el)
  boundObj.br = parseFloat(_style.borderRadius.replace('px', ''))
  boundObj.t = _style.transform
}

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

const onBeforeEnter = el => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }
  if (enableTransition.value) {
    toggleDecoration(false)
  }
  if (_firstTime) {
    _firstTime = false
  }
  // 克隆
  const toWrapper = el.cloneNode(true)
  toWrapper.style.transitionDuration = '0s'
  // 设置 opacity 为 0
  toWrapper.style.opacity = 0
  // 插入到 body
  document.body.appendChild(toWrapper)

  const _toWrapper = getTransitionContainer(toWrapper)
  writeBound(_toWrapper, toWrapperStyle)
  // 移除
  toWrapper.remove()
}

const onEnter = (el, done) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    done()
    return
  }
  el = getTransitionContainer(el)
  if (!fromWrapperStyle.set) {
    done()
    return
  }

  if (!enableTransition.value) {
    done()
    return
  }

  el.style.transitionDuration = '0s'

  const d = calcDelta(fromWrapperStyle, toWrapperStyle, toWrapperStyle.t)
  el.style.setProperty('--tw-rotate-x', '-180deg')
  el.style.setProperty('--tw-rotate-z', '-180deg')
  el.style.setProperty('--tw-translate-x', `${d.deltaX}px`)
  el.style.setProperty('--tw-translate-y', `${d.deltaY}px`)
  el.style.setProperty('--tw-scale-x', `${d.scaleX}`)
  el.style.setProperty('--tw-scale-y', `${d.scaleY}`)
  el.style.opacity = '0'
  const scale = (d.scaleX + d.scaleY) / 2
  el.style.borderRadius = fromWrapperStyle.br / scale + 'px'
  el.style.willChange = 'transform, border-radius, opacity'

  forceReflow()

  requestAnimationFrame(() => {
    el.classList.add('transition-router')
    el.style.transitionDuration = '1300ms'

    // 重置全部属性
    el.style.borderRadius = ''
    el.style.opacity = ''
    el.style.setProperty('--tw-rotate-x', '')
    el.style.setProperty('--tw-rotate-z', '')
    el.style.setProperty('--tw-translate-x', '')
    el.style.setProperty('--tw-translate-y', '')
    el.style.setProperty('--tw-scale-x', '')
    el.style.setProperty('--tw-scale-y', '')
  })

  let _event = null
  el.addEventListener(
    'transitionend',
    (_event = ev => {
      if (ev.target === el && ev.propertyName === 'transform') {
        el.removeEventListener('transitionend', _event)
        done()
      }
    })
  )
}

const onAfterEnter = el => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }
  el = getTransitionContainer(el)
  el.classList.remove('transition-router')
  el.style.transitionDuration = ''
  el.style.willChange = ''
  if (!enableTransition.value) {
    el.style.opacity = '0'
  }
}

const onBeforeLeave = el => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }
  // 克隆
  const fromWrapper = el

  const _fromWrapper = getTransitionContainer(fromWrapper)
  writeBound(_fromWrapper, fromWrapperStyle)
  fromWrapperStyle.set = true
}

const onLeave = (el, done) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    done()
    return
  }
  el = getTransitionContainer(el)
  if (!enableTransition.value) {
    setTimeout(() => {
      done()
    }, Math.max(0, 1310 - (Date.now() - startLoadingTime)))
    return
  }

  el.classList.add('transition-router')
  el.style.transitionDuration = '1300ms'
  el.style.willChange = 'transform, border-radius, opacity'
  requestAnimationFrame(() => {
    const d = calcDelta(toWrapperStyle, fromWrapperStyle, fromWrapperStyle.t)
    el.style.setProperty('--tw-rotate-x', '180deg')
    el.style.setProperty('--tw-rotate-z', '-180deg')
    el.style.setProperty('--tw-translate-x', `${d.deltaX}px`)
    el.style.setProperty('--tw-translate-y', `${d.deltaY}px`)
    el.style.setProperty('--tw-scale-x', `${d.scaleX}`)
    el.style.setProperty('--tw-scale-y', `${d.scaleY}`)
    const scale = (d.scaleX + d.scaleY) / 2
    el.style.borderRadius = toWrapperStyle.br / scale + 'px'
    el.style.opacity = '0'
  })

  let _event = null
  el.addEventListener(
    'transitionend',
    (_event = ev => {
      if (ev.target === el && ev.propertyName === 'transform') {
        el.removeEventListener('transitionend', _event)
        done()
      }
    })
  )
}

const onAfterLeave = el => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }
  if (enableTransition.value) {
    toggleDecoration(true)
  }

  // TODO: 不实现也没啥问题，因为动画结束后元素已经被移除了
}
</script>

<template>
  <Transition
    ref="SlotEl"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
  >
    <slot />
  </Transition>
  <div ref="LoadingEl" class="loading">
    <div class="loading-container">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading {
  @apply "w-100px h-100px rounded-100px";
  @apply "bg-white";
  @apply "fixed top-1/2 left-1/2";
  @apply "transform-gpu -translate-x-1/2 -translate-y-1/2 translate-z-200vh";
  @apply "shadow-2xl shadow-primary/30";
  @apply "opacity-0";
  @apply "pointer-events-none";
  @apply flex items-center justify-center;
  @apply backface-hidden;

  .loading-container {
    @apply w-12 h-12 relative;

    div:nth-child(1) {
      @apply absolute top-1/2 left-1/2 z-1;
      @apply w-8 h-8 rounded-full;
      @apply bg-primary-light;
      @apply shadow-xl shadow-primary/20;
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
      animation: ball-atom-position 1.5s 0s infinite ease-in-out,
        ball-atom-size 1.5s 0s infinite ease-in-out;
    }

    div:nth-child(2) {
      animation-delay: 0.75s;
    }

    div:nth-child(2):before {
      animation-delay: 0s, -1.125s;
    }

    div:nth-child(3) {
      transform: rotate(120deg);
      animation-delay: -0.25s;
    }

    div:nth-child(3):before {
      animation-delay: -1s, -0.75s;
    }

    div:nth-child(4) {
      transform: rotate(240deg);
      animation-delay: 0.25s;
    }

    div:nth-child(4):before {
      animation-delay: -0.5s, -0.125s;
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
