import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação básica para evitar crash com placeholders
const isValidUrl = (url: string) => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl)) {
    if (!supabaseUrl || supabaseUrl.includes('your_supabase_url')) {
        console.warn('⚠️ Supabase URL pendente. Configure o arquivo .env para conectar o backend.')
    } else {
        console.error('❌ Supabase URL inválida no .env:', supabaseUrl)
    }
}

export const supabase = createClient(
    isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-url.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)

