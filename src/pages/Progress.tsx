import { useEffect, useState } from 'react'
import {
    CheckCircle2,
    Clock,
    Brain,
    History,
    ChevronRight,
    Loader2,
    Target,
    Zap,
    TrendingUp,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function Progress() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [statsData, setStatsData] = useState({
        totalDecks: 0,
        totalCards: 0,
        retention: 0,
        sessions: 0,
        totalCorrect: 0,
        totalWrong: 0,
    })
    const [weekActivity, setWeekActivity] = useState<{ day: string; count: number }[]>([])
    const [deckMastery, setDeckMastery] = useState<{ name: string; perc: number; color: string }[]>([])

    useEffect(() => {
        async function fetchStats() {
            if (!user) return

            try {
                // 1. Total decks
                const { count: decksCount } = await supabase
                    .from('decks')
                    .select('*', { count: 'exact', head: true })

                // 2. Total cards
                const { count: cardsCount } = await supabase
                    .from('cards')
                    .select('*', { count: 'exact', head: true })

                // 3. All study logs
                const { data: allLogs } = await supabase
                    .from('study_logs')
                    .select('correct, studied_at, deck_id')

                const logs = allLogs || []
                const totalLogs = logs.length
                const correctLogs = logs.filter(l => l.correct).length
                const wrongLogs = totalLogs - correctLogs
                const retention = totalLogs > 0 ? Math.round((correctLogs / totalLogs) * 100) : 0

                // Count unique study days as "sessions"
                const uniqueDays = new Set(logs.map(l => new Date(l.studied_at).toDateString()))
                const sessions = uniqueDays.size

                setStatsData({
                    totalDecks: decksCount || 0,
                    totalCards: cardsCount || 0,
                    retention,
                    sessions,
                    totalCorrect: correctLogs,
                    totalWrong: wrongLogs,
                })

                // 4. Weekly activity (last 7 days)
                const now = new Date()
                const week: { day: string; count: number }[] = []
                for (let i = 6; i >= 0; i--) {
                    const d = new Date(now)
                    d.setDate(d.getDate() - i)
                    const dayStr = d.toDateString()
                    const count = logs.filter(l => new Date(l.studied_at).toDateString() === dayStr).length
                    week.push({ day: DAYS[d.getDay()], count })
                }
                setWeekActivity(week)

                // 5. Per-deck mastery
                const { data: decks } = await supabase
                    .from('decks')
                    .select('id, title, color')

                if (decks && decks.length > 0) {
                    const colors = ['#1A6BFF', '#00E5A0', '#FFD600', '#FF6B6B', '#00D4FF', '#A78BFA']
                    const mastery = decks.map((deck, idx) => {
                        const deckLogs = logs.filter(l => l.deck_id === deck.id)
                        const deckCorrect = deckLogs.filter(l => l.correct).length
                        const perc = deckLogs.length > 0 ? Math.round((deckCorrect / deckLogs.length) * 100) : 0
                        return {
                            name: deck.title,
                            perc,
                            color: deck.color || colors[idx % colors.length],
                        }
                    })
                    setDeckMastery(mastery)
                }
            } catch (error) {
                console.error('Erro ao buscar estatísticas:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [user])

    const maxWeekCount = Math.max(...weekActivity.map(w => w.count), 1)

    const stats = [
        { label: 'Decks Criados', value: statsData.totalDecks.toString(), icon: Clock, color: '#1A6BFF' },
        { label: 'Retenção', value: `${statsData.retention}%`, icon: Brain, color: '#00E5A0' },
        { label: 'Sessões', value: statsData.sessions.toString(), icon: CheckCircle2, color: '#FFD600' },
        { label: 'Cards Salvos', value: statsData.totalCards.toString(), icon: History, color: '#00D4FF' },
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#1A6BFF]" />
                <p className="text-gray-400 font-medium">Carregando seus dados...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 animate-fade-in font-dm text-white">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-syne font-bold uppercase italic tracking-tighter">Meu Progresso</h1>
                    <p className="text-gray-400 mt-1 font-medium">Veja sua evolução e absorção de conteúdo.</p>
                </div>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-[#0D1829] border-2 border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-[#1A6BFF]/30 transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-2xl bg-white/5">
                                <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                            </div>
                        </div>
                        <div className="text-3xl font-syne font-black">{stat.value}</div>
                        <div className="text-[10px] font-black text-gray-600 mt-2 uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Accuracy Overview — Acertos vs Erros */}
            {(statsData.totalCorrect + statsData.totalWrong) > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-[#0D1829] border-2 border-[#00E5A0]/20 p-6 rounded-3xl flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[#00E5A0]/10">
                            <CheckCircle2 className="h-6 w-6 text-[#00E5A0]" />
                        </div>
                        <div>
                            <div className="text-2xl font-syne font-black text-[#00E5A0]">{statsData.totalCorrect}</div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Acertos</div>
                        </div>
                    </div>
                    <div className="bg-[#0D1829] border-2 border-[#FF6B6B]/20 p-6 rounded-3xl flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[#FF6B6B]/10">
                            <Target className="h-6 w-6 text-[#FF6B6B]" />
                        </div>
                        <div>
                            <div className="text-2xl font-syne font-black text-[#FF6B6B]">{statsData.totalWrong}</div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Erros</div>
                        </div>
                    </div>
                    <div className="bg-[#0D1829] border-2 border-[#1A6BFF]/20 p-6 rounded-3xl flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[#1A6BFF]/10">
                            <TrendingUp className="h-6 w-6 text-[#1A6BFF]" />
                        </div>
                        <div>
                            <div className="text-2xl font-syne font-black text-[#1A6BFF]">{statsData.totalCorrect + statsData.totalWrong}</div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total Revisões</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Chart — Real Data */}
                <div className="lg:col-span-2 bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-syne font-bold italic uppercase tracking-tight">Atividade</h3>
                            <p className="text-[10px] text-gray-600 mt-1 font-black uppercase tracking-widest">Cards revisados nos últimos 7 dias</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-[#1A6BFF] animate-pulse" />
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Ao Vivo</span>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[220px] flex items-end justify-between gap-3">
                        {weekActivity.map((item, i) => {
                            const heightPct = maxWeekCount > 0 ? (item.count / maxWeekCount) * 100 : 0
                            const isToday = i === weekActivity.length - 1
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                    {/* Count label */}
                                    <span className={`text-xs font-black transition-all ${item.count > 0 ? 'text-white' : 'text-gray-800'}`}>
                                        {item.count > 0 ? item.count : ''}
                                    </span>
                                    {/* Bar */}
                                    <div className="relative w-full flex justify-center" style={{ height: '180px' }}>
                                        <div
                                            className={`w-full max-w-[42px] rounded-t-2xl transition-all duration-700 ${isToday ? 'shadow-[0_0_30px_rgba(26,107,255,0.4)]' : ''}`}
                                            style={{
                                                height: `${Math.max(heightPct, 3)}%`,
                                                background: item.count > 0
                                                    ? isToday
                                                        ? 'linear-gradient(to top, #1A6BFF, #00D4FF)'
                                                        : 'linear-gradient(to top, rgba(26,107,255,0.3), rgba(26,107,255,0.7))'
                                                    : 'rgba(255,255,255,0.03)',
                                                position: 'absolute',
                                                bottom: 0,
                                            }}
                                        />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isToday ? 'text-[#1A6BFF]' : 'text-gray-700'}`}>
                                        {item.day}
                                    </span>
                                </div>
                            )
                        })}
                    </div>

                    {weekActivity.every(w => w.count === 0) && (
                        <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-white/5 text-center">
                            <p className="text-sm text-gray-400 font-medium italic">Comece a estudar hoje para ver seu gráfico crescer!</p>
                        </div>
                    )}
                </div>

                {/* Deck Mastery */}
                <div className="bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 flex flex-col relative overflow-hidden">
                    <h3 className="text-xl font-syne font-bold mb-8 italic uppercase tracking-tight">Domínio</h3>

                    {deckMastery.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                            <Brain className="h-12 w-12 text-gray-700" />
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Ainda não há dados<br />para analisar</p>
                        </div>
                    ) : (
                        <div className="space-y-6 flex-1">
                            {/* Overall */}
                            <div className="space-y-3 pb-6 border-b border-white/5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                                    <span className="text-gray-400">Geral</span>
                                    <span style={{ color: '#1A6BFF' }}>{statsData.retention}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000 bg-grad-blue" style={{ width: `${statsData.retention}%` }} />
                                </div>
                            </div>

                            {/* Per deck */}
                            {deckMastery.map((area) => (
                                <div key={area.name} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">
                                        <span className="truncate max-w-[140px]">{area.name}</span>
                                        <span style={{ color: area.color }}>{area.perc}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${area.perc}%`, backgroundColor: area.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <button className="mt-8 w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95">
                        <Zap className="h-3.5 w-3.5" /> Relatório Geral <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
