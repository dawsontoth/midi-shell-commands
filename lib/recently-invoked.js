const invocationMap = new Map();

const recently = 1000; // once per second.

export function recentlyInvoked(script, now = Date.now()) {
  if (!invocationMap.has(script)) {
    invocationMap.set(script, now);
    return false;
  }
  const lastInvocation = invocationMap.get(script);
  if (lastInvocation + recently > now) {
    return true;
  }
  invocationMap.set(script, now);
  return false;
}
