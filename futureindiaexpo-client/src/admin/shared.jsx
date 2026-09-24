import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../api/client'
import { useTheme } from '../theme/theme'

const useAdminTheme = (fn, deps) => useTheme(fn, deps, 'admin')

// Flashdata → router state. Store.php set a message and redirected; the page it landed on
// printed it once. `useFlash` reads it on the target page; `go` is the redirect.
export function useFlash() {
  const location = useLocation()
  const navigate = useNavigate()
  const [flash, setFlash] = useState(location.state?.feedback ?? null)

  const go = (to, feedback) => navigate(to, { state: { feedback } })
  return { flash, setFlash, go }
}

// The DASHMIN flash alert: `<div class="alert <class> alert-dismissible fade show">` + btn-close.
export function Flash({ flash, onClose }) {
  if (!flash?.message) return null
  return (
    <div className={`alert ${flash.type} alert-dismissible fade show`} role="alert">
      {flash.message}
      <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
    </div>
  )
}

export const ok = (message) => ({ type: 'alert-success', message })
export const fail = (err) => ({ type: 'alert-danger', message: errorMessage(err) })

/**
 * `<table id="datatable">` which adlayout.php turned into a DataTable on load. DataTables moves
 * the table into its own wrapper, so the instance is destroyed (restoring the DOM) before React
 * removes it, and `version` remounts the table whenever the rows are reloaded.
 */
export function DataTable({ version, children }) {
  const ref = useRef(null)

  useAdminTheme(($) => {
    if (ref.current && $.fn.DataTable && !$.fn.DataTable.isDataTable(ref.current)) $(ref.current).DataTable()
  }, [version])

  useLayoutEffect(() => {
    const table = ref.current
    return () => {
      const $ = window.jQuery
      if ($?.fn.DataTable?.isDataTable(table)) $(table).DataTable().destroy()
    }
  }, [version])

  return (
    <table id="datatable" key={version} ref={ref} className="table text-start align-middle table-bordered table-hover mb-0">
      {children}
    </table>
  )
}

/**
 * `<textarea class="form-control ckeditor">`. ckeditor.js replaced these on page load only; here
 * each one is replaced after it mounts. Call `syncEditors()` before reading the form.
 */
export function CkTextarea({ id, name, defaultValue, required }) {
  useAdminTheme(() => {
    const { CKEDITOR } = window
    if (!CKEDITOR || CKEDITOR.instances[id]) return
    CKEDITOR.replace(id)
  }, [id])

  useLayoutEffect(
    () => () => {
      window.CKEDITOR?.instances[id]?.destroy()
    },
    [id],
  )

  return <textarea className="form-control ckeditor" id={id} name={name} defaultValue={defaultValue ?? ''} required={required}></textarea>
}

export function syncEditors() {
  const instances = window.CKEDITOR?.instances ?? {}
  Object.values(instances).forEach((editor) => editor.updateElement())
}

// Reads a form (including CKEditor fields) into what the API expects: JSON when there is no
// file, multipart when a file input has something in it.
export function formPayload(form) {
  syncEditors()
  const data = new FormData(form)
  const hasFile = [...data.values()].some((v) => v instanceof File && v.size > 0)
  if (hasFile) return data
  const json = {}
  for (const [key, value] of data.entries()) {
    if (!(value instanceof File)) json[key] = value
  }
  return json
}

export const save = (method, path, form) => api[method](path, formPayload(form))

// adlayout.php's confirmDialog()
export const confirmDialog = () => window.confirm('Are you sure you want to delete this ?')

// The "Blank" list page shell every show-*.php used.
export function ListPage({ title, centered = true, action, children, flash, setFlash }) {
  return (
    <>
      <div className="container-fluid pt-4 px-4">
        <div className={centered ? 'bg-light text-center rounded p-4' : 'bg-light rounded p-4'}>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h6 className="mb-0 text-primary">{title}</h6>
            {action}
          </div>
          {setFlash && <Flash flash={flash} onClose={() => setFlash(null)} />}
          {children}
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
    </>
  )
}

// The "Form" page shell of the addedit-*.php / edit-*.php views.
export function FormPage({ title, flash, setFlash, children }) {
  return (
    <>
      <div className="container-fluid pt-4 px-4">
        <div className="row g-4">
          <div className="col-xl-12">
            <div className="bg-light rounded h-100 p-4">
              <h6 className="mb-4 text-primary">{title}</h6>
              <Flash flash={flash} onClose={() => setFlash(null)} />
              {children}
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
    </>
  )
}

export function StatusSelect({ value }) {
  return (
    <div className="mb-3">
      <label htmlFor="status" className="form-label">Status</label>
      <select className="form-control" id="status" name="status" defaultValue={value} required>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>
  )
}

export function Buttons({ label = 'Submit' }) {
  const navigate = useNavigate()
  return (
    <>
      <button type="submit" className="btn btn-primary">{label}</button>{' '}
      <a href="/admin/dashboard" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); navigate('/admin/dashboard') }}>Cancel</a>
    </>
  )
}

export { useAdminTheme }
