// Simple stack-based registry for Android back button handlers.
let stack = []

export function pushBackHandler(handler) {
  stack.push(handler)
}

export function popBackHandler() {
  return stack.pop() || null
}

export function getTopBackHandler() {
  return stack.length > 0 ? stack[stack.length - 1] : null
}

export function clearBackStack() {
  stack = []
}
