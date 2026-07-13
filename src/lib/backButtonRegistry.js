// Back button handler registry
// Allows nested components (date picker, modals, forms) to register
// handlers that take priority over the root-level exit dialog.

let stack = []
let listeners = new Set()

function notify() {
  listeners.forEach((fn) => fn())
}

export function pushBackHandler(handler) {
  stack.push(handler)
  notify()
}

export function popBackHandler() {
  stack.pop()
  notify()
}

export function getTopBackHandler() {
  return stack.length > 0 ? stack[stack.length - 1] : null
}

export function clearBackStack() {
  stack = []
  notify()
}

export function subscribeBackStack(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
