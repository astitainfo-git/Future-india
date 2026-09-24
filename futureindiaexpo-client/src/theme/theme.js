import { useEffect } from 'react'

// The storefront theme is the original Molla bundle, loaded from the copied asset tree in the
// order welcome/layout.php used. It is appended after React's first paint because main.js binds
// to .header, .mobile-menu-container and #scroll-top, which React has to render first.
const STOREFRONT_SCRIPTS = [
  '/assets/welcome/js/jquery.min.js',
  '/assets/welcome/js/bootstrap.bundle.min.js',
  '/assets/welcome/js/jquery.hoverIntent.min.js',
  '/assets/welcome/js/jquery.waypoints.min.js',
  '/assets/welcome/js/superfish.min.js',
  '/assets/welcome/js/bootstrap-input-spinner.js',
  '/assets/welcome/js/jquery.elevateZoom.min.js',
  '/assets/welcome/js/owl.carousel.min.js',
  '/assets/welcome/js/jquery.plugin.min.js',
  '/assets/welcome/js/jquery.magnific-popup.min.js',
  '/assets/welcome/js/jquery.countdown.min.js',
  '/assets/welcome/js/main.js',
  '/assets/welcome/js/demos/demo-7.js',
]

const ADMIN_SCRIPTS = [
  'https://code.jquery.com/jquery-3.4.1.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js',
  '/assets/admin/lib/chart/chart.min.js',
  '/assets/admin/lib/easing/easing.min.js',
  '/assets/admin/lib/waypoints/waypoints.min.js',
  '/assets/admin/lib/owlcarousel/owl.carousel.min.js',
  '/assets/admin/lib/tempusdominus/js/moment.min.js',
  '/assets/admin/lib/tempusdominus/js/moment-timezone.min.js',
  '/assets/admin/lib/tempusdominus/js/tempusdominus-bootstrap-4.min.js',
  '/assets/admin/js/main.js',
  '/assets/admin/ckeditor/ckeditor.js',
]

const loadScript = (src) =>
  new Promise((resolve) => {
    if (document.querySelector(`script[data-theme][src="${src}"]`)) return resolve()
    const el = document.createElement('script')
    el.src = src
    el.dataset.theme = ''
    // A missing plugin should not stop the rest of the bundle from loading.
    el.onload = () => resolve()
    el.onerror = () => resolve()
    document.body.appendChild(el)
  })

let loading = null

async function loadBundle(scripts) {
  for (const src of scripts) await loadScript(src)
}

// Serialised so the plugins always run in order and a second caller waits rather than racing.
export function loadTheme(area = 'storefront') {
  loading ??= loadBundle(area === 'admin' ? ADMIN_SCRIPTS : STOREFRONT_SCRIPTS)
  return loading
}

export const jq = () => window.jQuery

/**
 * Starts the theme bundle once the page has rendered, then runs `onReady` — and runs it again
 * on every later render, which is where per-page plugins get initialised.
 */
export function useTheme(onReady, deps = [], area = 'storefront') {
  useEffect(() => {
    let cancelled = false
    loadTheme(area).then(() => {
      if (!cancelled && window.jQuery) onReady?.(window.jQuery)
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * main.js turns every number input into a bootstrap-input-spinner on page load, which in an SPA
 * only reaches the first page. This repeats it, with main.js's options, for inputs under `root`.
 * The spinner replaces the visible input and writes back to the original through jQuery events
 * React never sees, so inputs passed through here must be read from the DOM, not from state.
 */
export function initSpinners(root) {
  const $ = jq()
  if (!$ || !$.fn.inputSpinner || !root) return
  $(root)
    .find("input[type='number']")
    .filter((_, el) => !$(el).next().hasClass('input-spinner'))
    .inputSpinner({
      decrementButton: '<i class="icon-minus"></i>',
      incrementButton: '<i class="icon-plus"></i>',
      groupClass: 'input-spinner',
      buttonsClass: 'btn-spinner',
      buttonsWidth: '26px',
    })
}

/**
 * Initialises every `[data-toggle="owl"]` carousel inside `root`, reading the same
 * `data-owl-options` JSON the PHP templates carried. Safe to call repeatedly: an element that is
 * already an owl instance is skipped.
 */
export function initOwl(root) {
  const $ = jq()
  if (!$ || !$.fn.owlCarousel || !root) return
  $(root)
    .find('[data-toggle="owl"]')
    .each(function initOne() {
      const $el = $(this)
      if ($el.hasClass('owl-loaded')) return
      let options = {}
      try {
        options = JSON.parse($el.attr('data-owl-options') || '{}')
      } catch {
        options = {}
      }
      $el.owlCarousel({ items: 1, nav: true, dots: true, margin: 0, loop: false, ...options })
    })
}
