// Make every redirect permanent (301) so search engines move their index to
// the canonical URL: http -> https, and the trailing-slash redirects that the
// static assets layer issues as 307 become 301.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    const res = await env.ASSETS.fetch(request);
    if (res.status === 307 || res.status === 308) {
      const loc = res.headers.get('Location');
      if (loc) return Response.redirect(new URL(loc, url).toString(), 301);
    }
    return res;
  },
};
