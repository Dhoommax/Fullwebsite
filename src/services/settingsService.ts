import { supabase } from '../lib/supabaseClient'

export type AppSetting = {
  id: string
  key: string
  value: string
  type: string
  updated_at: string
}

export async function getAllSettings(){
  const { data, error } = await supabase.from('app_settings').select('*')
  if (error) throw error
  return data as AppSetting[]
}

export async function getSetting(key: string){
  const { data, error } = await supabase.from('app_settings').select('*').eq('key', key).maybeSingle()
  if (error) throw error
  return data as AppSetting | null
}
