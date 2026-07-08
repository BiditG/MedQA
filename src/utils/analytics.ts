export function trackEvent(eventName: string, data?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  console.log('MEDQAS Event:', eventName, data)
}
