const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

let loaded = null

function load() {
  if (!SITE_KEY) return Promise.resolve(false)
  loaded ??= new Promise((resolve) => {
    const el = document.createElement('script')
    el.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    el.onload = () => resolve(true)
    el.onerror = () => resolve(false)
    document.head.appendChild(el)
  })
  return loaded
}

/**
 * The PHP layout ran grecaptcha.execute on page load and stuffed the token into a hidden
 * g-recaptcha-response input. Here the token is fetched at submit time and sent in the JSON body,
 * which the server verifies exactly as Login.php did (score >= 0.5).
 */
export async function recaptchaToken() {
  if (!(await load())) return ''
  const { grecaptcha } = window
  if (!grecaptcha) return ''
  return new Promise((resolve) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(SITE_KEY, { action: 'submit' }).then(resolve, () => resolve(''))
    })
  })
}
