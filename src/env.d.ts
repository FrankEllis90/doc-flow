/// <reference types="vite/client" />

// Vue 3 type definitions to fix import issues
declare module 'vue' {
  export {
    ref,
    reactive,
    computed,
    watch,
    watchEffect,
    onMounted,
    onUnmounted,
    onBeforeMount,
    onBeforeUnmount,
    onUpdated,
    onBeforeUpdate,
    nextTick,
    defineComponent,
    defineProps,
    defineEmits,
    defineExpose,
    shallowRef,
    shallowReactive,
    triggerRef,
    toRef,
    toRefs,
    unref,
    isRef,
    isReactive,
    isReadonly,
    isProxy,
    markRaw,
    effectScope,
    getCurrentScope,
    onScopeDispose,
    inject,
    provide,
    getCurrentInstance,
    createApp,
    useAttrs,
    useSlots,
    App,
    VNode,
    Component,
    ComponentInternalInstance,
    Ref,
    ComputedRef,
    WritableComputedRef,
    UnwrapRef,
    ToRefs,
    DeepReadonly,
    ShallowRef,
    WatchStopHandle,
    InjectionKey,
    PropType,
    ExtractPropTypes,
    ComponentPublicInstance
  } from '@vue/runtime-core'
  
  export {
    createRenderer,
    createSSRApp,
    hydrate,
    render,
    Transition,
    TransitionGroup,
    KeepAlive,
    Suspense,
    Teleport
  } from '@vue/runtime-dom'
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_URL?: string
  readonly VITE_ENVIRONMENT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Performance API extension
interface Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

// Global type augmentations
declare global {
  interface Window {
    pdfjsLib?: any
    webkitRequestFileSystem?: any
    mozRequestFileSystem?: any
  }
  
  // Fix for setTimeout/setInterval return types
  function setTimeout(callback: () => void, ms?: number): number
  function setInterval(callback: () => void, ms?: number): number
  function clearTimeout(id: number): void
  function clearInterval(id: number): void
}

