import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { api, errorMessage } from '../api/client'

export function useApi(path) {
  const [state, setState] = useState({ path: null, data: null, error: '' })

  const load = useCallback(
    (signal) => {
      if (!path) return Promise.resolve()
      return api
        .get(path, { signal })
        .then((res) => setState({ path, data: res.data, error: '' }))
        .catch((err) => {
          if (!axios.isCancel(err)) setState({ path, data: null, error: errorMessage(err) })
        })
    },
    [path],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const setData = useCallback((data) => setState((s) => ({ ...s, data })), [])

  // Results belong to the path they were fetched for, so a path change shows loading instead of stale data.
  const current = state.path === path
  return {
    data: current ? state.data : null,
    error: current ? state.error : '',
    loading: Boolean(path) && !current,
    reload: () => load(),
    setData,
  }
}
