// Simple stack-based registry for Android back button handlers.
// Modal pushes its attemptClose; ConfirmDialog pushes its onCancel.
// App.jsx calls getTopBackHandler() on back button press.

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
