export default {
  logEvent (category, action, label, sessionId) {
    window.dataLayer.push({
      'appEventCategory': category,
      'appEventAction': action,
      'appEventLabel': label,
      'sessionID': sessionId
    })
    window.dataLayer.push({ 'event': 'appEvent' })
  },

  logPage (path, name, sessionId) {
    console.log(window.dataLayer)
    window.dataLayer.push({
      'screenPath': path,
      'screenName': name,
      'sessionID': sessionId
    })
    console.log(window.dataLayer)
    window.dataLayer.push({ 'event': 'appScreenView' })
    console.warn('pushing data...')
    console.log(window.dataLayer)
  }
}
