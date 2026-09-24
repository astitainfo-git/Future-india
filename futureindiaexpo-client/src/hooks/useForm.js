import { useState } from 'react'

export function useForm(initial) {
  const [form, setForm] = useState(initial)
  const bind = (name) => ({
    name,
    value: form[name] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
  })
  return [form, bind, setForm]
}
