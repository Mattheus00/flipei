import React from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'


export default function Login() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = React.useState(false)
    const [formData, setFormData] = React.useState({ email: '', password: '' })

    const [loading, setLoading] = React.useState(false)
    const [googleLoading, setGoogleLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            })

            if (authError) throw authError

            navigate('/dashboard')
        } catch (err: any) {
            setError(err.message || 'E-mail ou senha incorretos.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        setError(null)
        try {
            const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            })
            if (authError) throw authError
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar com Google.')
            setGoogleLoading(false)
        }
    }


    return (
        <div className="min-h-screen bg-[#080F1E] flex flex-col md:flex-row font-dm">
            {/* Lado Esquerdo - Branding */}
            <div className="hidden md:flex flex-1 bg-grad-blue p-12 flex-col justify-between relative overflow-hidden">
                {/* Glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/30 rounded-full blur-[100px] pointer-events-none"></div>

                <Link to="/" className="relative z-10">
                    <span className="text-3xl font-bold flex items-center font-syne text-white">
                        🃏 Flip<span className="text-[#0D1829]">ei</span>
                    </span>
                </Link>

                <div className="relative z-10 max-w-md">
                    <h1 className="text-6xl font-syne font-extrabold text-white mb-6 italic leading-tight">
                        Estude com inteligência.
                    </h1>
                    <p className="text-blue-50 text-xl font-medium opacity-90 leading-relaxed">
                        A plataforma de flashcards com IA que entende o seu ritmo e maximiza o seu aprendizado.
                    </p>
                </div>

                {/* Floating Cards Mockup */}
                <div className="relative h-64 z-10">
                    <div className="absolute left-0 bottom-4 animate-float">
                        <div className="bg-[#111F35]/90 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl w-56 -rotate-6">
                            <div className="h-2 w-12 bg-[#FFD600] rounded-full mb-4"></div>
                            <div className="space-y-2">
                                <div className="h-2 w-full bg-white/20 rounded-full"></div>
                                <div className="h-2 w-2/3 bg-white/20 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute left-1/4 bottom-12 animate-float" style={{ animationDelay: '1s' }}>
                        <div className="bg-[#111F35]/90 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl w-64">
                            <div className="h-2 w-16 bg-[#1A6BFF] rounded-full mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-3 w-full bg-white/30 rounded-full"></div>
                                <div className="h-3 w-4/5 bg-white/30 rounded-full"></div>
                                <div className="h-3 w-1/2 bg-white/30 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="flex-[0.8] flex items-center justify-center p-8 bg-[#080F1E] relative">
                <div className="w-full max-w-md flex flex-col items-center">
                    <div className="mb-10 text-center md:hidden">
                        <Link to="/">
                            <span className="text-3xl font-syne font-bold">
                                🃏 Flip<span className="text-[#00D4FF]">ei</span>
                            </span>
                        </Link>
                    </div>

                    <div className="w-full">
                        <h2 className="text-3xl font-syne font-bold mb-2">Bem-vindo de volta</h2>
                        <p className="text-gray-500 mb-8 font-medium">Entre na sua conta para continuar seus estudos.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">E-mail</label>
                                <input
                                    type="email"
                                    placeholder="exemplo@email.com"
                                    required
                                    className="w-full bg-[#0D1829] border-2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#1A6BFF]/50 focus:bg-[#111F35] transition-all text-white placeholder:text-gray-700 font-bold"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Senha</label>
                                    <a href="#" className="text-xs font-bold text-[#1A6BFF] hover:underline">Esqueceu?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        className="w-full bg-[#0D1829] border-2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#1A6BFF]/50 focus:bg-[#111F35] transition-all text-white placeholder:text-gray-700 font-bold"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold animate-fade-in">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1A6BFF] hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-black text-lg transition-all hover:scale-[1.02] shadow-[0_10px_30px_rgba(26,107,255,0.2)] active:scale-95 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Entrando...
                                    </>
                                ) : 'Entrar no Flipei'}
                            </button>

                        </form>

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-[#080F1E] px-4 text-gray-600 tracking-[0.2em]">Ou entre com</span></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={googleLoading}
                            className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        >
                            {googleLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                            ) : (
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                            )}
                            {googleLoading ? 'Redirecionando...' : 'Continuar com Google'}
                        </button>

                        <div className="mt-10 text-center">
                            <span className="text-gray-500 font-medium">Não tem uma conta? </span>
                            <Link to="/cadastro" className="text-[#1A6BFF] font-bold hover:underline">Crie agora gratuitamente</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}