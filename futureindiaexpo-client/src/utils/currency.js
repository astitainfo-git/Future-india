// Mirrors the switch on session('mycurr') that every PHP view repeated, including its
// fall-through to INR. The PHP templates printed HTML entities (&#8377;, &#163;, &euro;);
// the characters below are what those entities render as.
const CURRENCIES = {
  inr: { column: 'inr_price', symbol: '₹' },
  usd: { column: 'usd_price', symbol: '$' },
  gbp: { column: 'gbp_price', symbol: '£' },
  aud: { column: 'aud_price', symbol: '$' },
  euro: { column: 'euro_price', symbol: '€' },
}

export const currencyFor = (code) => CURRENCIES[code] ?? CURRENCIES.inr

export function priceOf(product, code) {
  const { column, symbol } = currencyFor(code)
  return { price: product?.[column], symbol }
}

// carts.curr_symbol and orders.curn_symbol hold the entity strings PHP wrote, so rows created by
// either application display the same way.
const ENTITIES = {
  '&#8377;': '₹',
  '&#163;': '£',
  '&#36;': '$',
  '&euro;': '€',
  $: '$',
}

export const decodeSymbol = (value) => ENTITIES[value] ?? value ?? ''

// date("d-m-Y", strtotime(...)) in the PHP views.
export function formatDate(value) {
  if (!value) return ''
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return String(value)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`
}
