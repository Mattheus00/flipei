// Last update: 2026-02-23 - Force Vercel redeploy
import { useEffect, useState } from 'react'

import {
    Plus,
    Upload,
    Zap,
    Clock,
    Flame,
    Target,
    ChevronRight,
    Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface DashboardStats {
    cardsGenerated: number
    revisionsToday: number
    streak: number
    accuracy: number
}

export default function Dashboard() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [recentDecks, setRecentDecks] = useState<any[]>([])
    const [stats, setStats] = useState<DashboardStats>({
        cardsGenerated: 0,
        revisionsToday: 0,
        streak: 0,
        accuracy: 0
    })

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return

            try {
                setLoading(true)

                // Fetch recent decks
                const { data: decksData, error: decksError } = await supabase
                    .from('decks')
                    .select('*, cards(count)')
                    .order('updated_at', { ascending: false })
                    .limit(2)

                if (decksError) throw decksError

                setRecentDecks(decksData.map(d => ({
                    id: d.id,
                    name: d.title,
                    emoji: d.emoji,
                    count: d.cards[0]?.count || 0,
                    progress: 0, // Placeholder
                    color: d.color
                })))

                // Fetch total cards count
                const { count: cardCount } = await supabase
                    .from('cards')
                    .select('id', { count: 'exact', head: true })

                // Fetch study logs (gracefully handle if table doesn't exist)
                let revisionsToday = 0
                let accuracy = 0

                try {
                    const todayStart = new Date()
                    todayStart.setHours(0, 0, 0, 0)
                    const { data: logsToday } = await supabase
                        .from('study_logs')
                        .select('correct')
                        .gte('studied_at', todayStart.toISOString())

                    const { data: allLogs } = await supabase
                        .from('study_logs')
                        .select('correct')

                    revisionsToday = logsToday?.length || 0
                    const totalLogs = allLogs?.length || 0
                    const correctLogs = allLogs?.filter(l => l.correct).length || 0
                    accuracy = totalLogs > 0 ? Math.round((correctLogs / totalLogs) * 100) : 0
                } catch { /* study_logs may not exist yet */ }

                // Count unique study days as streak
                let streak = 0
                try {
                    const { data: streakLogs } = await supabase
                        .from('study_logs')
                        .select('studied_at')

                    if (streakLogs && streakLogs.length > 0) {
                        const uniqueDays = [...new Set(streakLogs.map(l => new Date(l.studied_at).toDateString()))]
                            .map(d => new Date(d))
                            .sort((a, b) => b.getTime() - a.getTime())

                        // Count consecutive days from today
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        for (let i = 0; i < uniqueDays.length; i++) {
                            const expected = new Date(today)
                            expected.setDate(expected.getDate() - i)
                            expected.setHours(0, 0, 0, 0)
                            const dayDate = new Date(uniqueDays[i])
                            dayDate.setHours(0, 0, 0, 0)
                            if (dayDate.getTime() === expected.getTime()) {
                                streak++
                            } else {
                                break
                            }
                        }
                    }
                } catch { /* ignore */ }

                setStats({
                    cardsGenerated: cardCount || 0,
                    revisionsToday,
                    streak,
                    accuracy
                })

            } catch (err) {
                console.error('Erro ao carregar dashboard:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [user])

    const statsDisplay = [
        { name: 'Cards Gerados', value: stats.cardsGenerated.toLocaleString(), icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
        { name: 'Revisões Hoje', value: stats.revisionsToday.toString(), icon: Clock, color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]/10' },
        { name: 'Sequência (Dias)', value: stats.streak.toString(), icon: Flame, color: 'text-[#FFD600]', bg: 'bg-[#FFD600]/10' },
        { name: 'Taxa de Acerto', value: `${stats.accuracy}%`, icon: Target, color: 'text-[#00E5A0]', bg: 'bg-[#00E5A0]/10' },
    ]

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Estudante'

    if (loading && recentDecks.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
                <Loader2 className="h-10 w-10 text-[#1A6BFF] animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Carregando seus dados...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in font-dm text-white">
            <header>
                <h1 className="text-3xl font-syne font-bold text-white uppercase italic tracking-tighter">Olá, {firstName}! 👋</h1>
                <p className="text-gray-400 mt-1 font-medium italic">Sua jornada de estudos está indo muito bem. Pronto para revisar?</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsDisplay.map((stat) => (
                    <div key={stat.name} className="bg-[#0D1829] border-2 border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white font-syne italic">{stat.value}</div>
                        <div className="text-[10px] font-black text-gray-600 mt-1 uppercase tracking-widest">{stat.name}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-grad-blue p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] pointer-events-none group-hover:bg-white/20 transition-all duration-700"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-syne font-bold text-white mb-4 italic uppercase tracking-tight">Gerar novos cards</h2>
                                <p className="text-blue-50/80 mb-6 max-w-sm font-medium leading-relaxed">Cole um texto ou suba um PDF e deixe nossa IA criar seu material de estudo em segundos.</p>
                                <Link
                                    to="/generate"
                                    className="inline-flex items-center gap-2 bg-white text-[#1A6BFF] px-8 py-3.5 rounded-2xl font-black hover:scale-105 transition-all shadow-xl active:scale-95"
                                >
                                    <Plus className="h-5 w-5" /> Iniciar Geração
                                </Link>
                            </div>
                            <div className="w-full md:w-64 aspect-video bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 flex flex-col items-center justify-center gap-3 border-dashed hover:border-white/40 transition-all cursor-pointer">
                                <Upload className="h-8 w-8 text-white/40" />
                                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Arraste seu PDF</span>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h3 className="text-xl font-syne font-bold text-white uppercase italic tracking-tighter">Decks Recentes</h3>
                            <Link to="/decks" className="text-[#1A6BFF] text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-1">
                                Ver todos <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {recentDecks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentDecks.map((deck) => (
                                    <Link
                                        key={deck.id}
                                        to={`/study/${deck.id}`}
                                        className="bg-[#0D1829] border-2 border-white/5 p-6 rounded-3xl hover:border-[#1A6BFF]/40 transition-all group hover:-translate-y-1 relative"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-4xl drop-shadow-xl">{deck.emoji}</div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-white group-hover:text-[#1A6BFF] transition-colors">{deck.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{deck.count} cards</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                <span>Domínio</span>
                                                <span>{deck.progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                                    style={{ width: `${deck.progress}%`, backgroundColor: deck.color }}
                                                ></div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#0D1829] border-2 border-dashed border-white/5 rounded-[2.5rem] p-12 text-center text-gray-500">
                                <p className="font-bold uppercase tracking-widest text-xs">Nenhum deck encontrado</p>
                                <Link to="/generate" className="text-[#1A6BFF] text-[10px] font-black uppercase tracking-widest mt-4 inline-block hover:underline">Crie seu primeiro deck agora</Link>
                            </div>
                        )}
                    </section>
                </div>

                <section className="bg-[#0D1829] border-2 border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-6 h-fit bg-surface-glass relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-grad-blue opacity-50"></div>
                    <div className="w-20 h-20 bg-[#1A6BFF]/10 rounded-[2rem] flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(26,107,255,0.1)] border border-[#1A6BFF]/20 group-hover:scale-110 transition-transform">
                        🧠
                    </div>
                    <div>
                        <h3 className="text-xl font-syne font-bold text-white uppercase italic tracking-tight">Dose diária</h3>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed font-medium">Melhore sua memória revisando seus cards sugeridos.</p>
                    </div>
                    <Link
                        to={recentDecks.length > 0 ? `/study/${recentDecks[0].id}` : '/decks'}
                        className="w-full bg-[#1A6BFF] hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-[0_10px_30px_rgba(26,107,255,0.3)] active:scale-95 text-center"
                    >
                        Revisar Agora
                    </Link>
                    <div className="pt-6 border-t border-white/5 w-full">
                        <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">Meta Diária</div>
                        <div className="flex justify-between text-[10px] text-white font-black mb-2 uppercase tracking-widest px-1">
                            <span>{stats.revisionsToday} / 20 cards</span>
                            <span className="text-[#FFD600]">{Math.round((stats.revisionsToday / 20) * 100)}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#FFD600] rounded-full shadow-[0_0_15px_rgba(255,214,0,0.4)]"
                                style={{ width: `${(stats.revisionsToday / 20) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}