import React from 'react'

export default function Admin(){
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Admin</h2>
      <p className="mt-2 text-sm text-slate-500">Admin dashboard — role protected. Implement server-side checks before rendering sensitive data.</p>
    </div>
  )
}
