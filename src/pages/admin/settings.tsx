import React from 'react'

export default function AdminSettings(){
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold">Admin Settings</h2>
      <p className="mt-2 text-sm text-slate-500">Website configuration, feature toggles, AI defaults and system settings will be managed here. All changes must be performed via server endpoints and stored in the app_settings table.</p>
    </div>
  )
}
