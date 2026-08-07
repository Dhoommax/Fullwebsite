import React from 'react'

export default function AuthPage(){
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold">Authentication</h2>
      <p className="mt-2 text-sm text-slate-500">Auth flows use Supabase (register, login, password reset, OAuth). Guest mode supported via client-side temporary state.</p>
    </div>
  )
}
