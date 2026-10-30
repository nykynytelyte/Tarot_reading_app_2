// Static site: every request is served from the built assets in dist/.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request)
  },
}
