import React, { useEffect, useState } from 'react'
import {
    User,
    Bell,
    Lock,
    CreditCard,
    Save,
    Loader2,
    CheckCircle2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function Settings() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('perfil')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [profile, setProfile] = useState({
        full_name: '',
        study_focus: '',
        email: user?.email || ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data && !error) {
                setProfile({
                    full_name: data.full_name || '',
                    study_focus: data.study_focus || '',
                    email: user.email || ''
                })
            }
        }

        fetchProfile()
    }, [user])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    study_focus: profile.study_focus,
                    updated_at: new Date()
                })
                .eq('id', user.id)

            if (error) throw error

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error('Erro ao salvar perfil:', err)
            alert('Erro ao salvar alterações.')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'perfil', label: 'Perfil', icon: User },
        { id: 'notificacoes', label: 'Notificações', icon: Bell },
        { id: 'seguranca', label: 'Segurança', icon: Lock },
        { id: 'assinatura', label: 'Assinatura', icon: CreditCard },
    ]

    return (
        <div className="space-y-10 animate-fade-in font-dm text-white">
            <header>
                <h1 className="text-3xl font-syne font-bold uppercase italic tracking-tighter">Configurações</h1>
                <p className="text-gray-400 mt-1">Gerencie sua conta, preferências e plano de estudos.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navigation Sidebar */}
                <nav className="space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-[#1A6BFF] text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1A6BFF]/5 blur-3xl rounded-full"></div>

                        {activeTab === 'perfil' && (
                            <form onSubmit={handleSave} className="space-y-8 relative z-10">
                                <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-8 border-b border-white/5">
                                    <div className="w-24 h-24 rounded-[2rem] bg-grad-blue flex items-center justify-center font-black text-3xl shadow-xl italic border-2 border-white/10">
                                        {profile.full_name?.substring(0, 2).toUpperCase() || '??'}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-xl font-bold mb-1">{profile.full_name || 'Nome do Usuário'}</h3>
                                        <p className="text-gray-500 text-sm font-medium">{profile.email}</p>
                                        <button type="button" className="text-[#1A6BFF] text-[10px] font-black uppercase tracking-widest mt-4 hover:underline transition-all">Alterar Avatar</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[#111F35] border-2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#1A6BFF]/40 text-white font-bold transition-all"
                                            value={profile.full_name}
                                            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">E-mail</label>
                                        <input
                                            type="email"
                                            disabled
                                            className="w-full bg-[#111F35] border-2 border-white/5 rounded-2xl px-6 py-4 outline-none text-gray-500 font-bold opacity-60"
                                            value={profile.email}
                                        />
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Foco de Estudo</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Medicina, Concursos, Programação..."
                                            className="w-full bg-[#111F35] border-2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#1A6BFF]/40 text-white font-bold transition-all"
                                            value={profile.study_focus}
                                            onChange={e => setProfile({ ...profile, study_focus: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 flex items-center justify-end border-t border-white/5 gap-4">
                                    {success && (
                                        <div className="flex items-center gap-2 text-[#00E5A0] font-bold text-xs animate-fade-in">
                                            <CheckCircle2 className="h-4 w-4" /> Atualizado com sucesso!
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#1A6BFF] hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab !== 'perfil' && (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <Lock className="h-8 w-8 text-gray-700" />
                                </div>
                                <h3 className="text-xl font-bold font-syne italic">Em breve</h3>
                                <p className="text-gray-500 text-sm max-w-xs mx-auto">Esta seção está sendo finalizada e estará disponível na próxima atualização.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}