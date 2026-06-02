import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const CTA_INTERCEPT = `<script>
(function () {
  // Intercept Framer's client-side pushState navigation to /contact → /onboarding
  var _push = history.pushState.bind(history);
  history.pushState = function (state, title, url) {
    if (typeof url === 'string' && /\\/contact/.test(url)) {
      window.location.href = '/onboarding';
      return;
    }
    return _push(state, title, url);
  };
  // Also catch plain anchor clicks before Framer handles them
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (a) {
      var href = a.getAttribute('href') || '';
      if (href === './contact' || href === '/contact') {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/onboarding';
      }
    }
  }, true);
})();
</script>`

export async function GET() {
  let html = readFileSync(join(process.cwd(), 'public/framer.html'), 'utf-8')
  html = html.replace('</body>', CTA_INTERCEPT + '\n</body>')
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
