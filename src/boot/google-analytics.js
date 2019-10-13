import ga from './analytics.js'
export default ({ router, Vue }) => {
  router.afterEach((to, from) => {
    ga.logPage(to.path, to.name, window.address)
  })
  function callEvent (category, action, label) {
    ga.logEvent(category, action, label, window.address)
    // console.log('New Event...')
  }
  Vue.prototype.$eventReg = callEvent
}
