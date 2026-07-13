// Back button handler registry
let stack = []
let listeners = new Set()
function notify() { listeners.forEach((fn) => fn()) }
export function pushBackHandler(handler) { stack.push(handler); notify() }
export function popBackHandler() { stack.pop(); notify() }
export function getTopBackHandler() { return stack.length > 0 ? stack[stack.length - 1] : null }
export function clearBackStack() { stack = []; notify() }
export function subscribeBackStack(fn) { listeners.add(fn); return () => listeners.delete(fn) }
