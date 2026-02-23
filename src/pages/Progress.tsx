import React from 'react'
import {
    CheckCircle2,
    Clock,
    Brain,
    History,
    ChevronRight
} from 'lucide-react'

export default function Progress() {
    const stats = [
        { label: 'Tempo Total', value: '42h 15m', icon: Clock, color: '#1A6BFF' },
        { label: 'Retenção', value: '84%', icon: Brain, color: '#00E5A0' },
        { label: 'Sessões', value: '156', icon: CheckCircle2, color: '#FFD600' },
        { label: 'Cards Salvos', value: '892', icon: History, color: '#00D4FF' },
    ]

    const weekProgress = [
        { day: 'Seg', hours: 2.5 },
        { day: 'Ter', hours: 4.0 },
        { day: 'Qua', hours: 3.2 },
        { day: 'Qui', hours: 1.5 },
        { day: 'Sex', hours: 5.0 },
        { day: 'Sáb', hours: 2.0 },
        { day: 'Dom', hours: 0 },
    ]

    return (
        <div className="space-y-10 animate-fade-in font-dm text-white">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-syne font-bold uppercase italic tracking-tighter">Meu Progresso</h1>
                    <p className="text-gray-400 mt-1 font-medium">Veja sua evolução e absorção de conteúdo.</p>
                </div>
                <div className="flex bg-[#0D1829] border-2 border-white/5 p-1 rounded-2xl">
                    <button className="bg-[#111F35] px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-sm">7 dias</button>
                    <button className="px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-all">30 dias</button>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Chart Mockup */}
                <div className="lg:col-span-2 bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 relative overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h3 className="text-xl font-syne font-bold italic uppercase tracking-tight">Atividade</h3>
                            <p className="text-[10px] text-gray-600 mt-1 font-black uppercase tracking-widest">Horas de estudo real</p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-[#1A6BFF] animate-pulse"></div>
                    </div>

                    <div className="flex-1 min-h-[250px] flex items-end justify-between gap-4">
                        {weekProgress.map((item) => (
                            <div key={item.day} className="flex-1 flex flex-col items-center gap-6 group">
                                <div className="relative w-full flex flex-col items-center">
                                    <div
                                        className="w-full max-w-[42px] bg-gradient-to-t from-[#1A6BFF]/40 to-[#1A6BFF] rounded-t-2xl transition-all group-hover:shadow-[0_0_30px_rgba(26,107,255,0.4)] relative"
                                        style={{ height: `${(item.hours / 5) * 100}%`, minHeight: item.hours > 0 ? '4px' : '0' }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-[#1A6BFF] px-2 py-1 rounded-lg text-[10px] font-black transition-all shadow-xl pointer-events-none">
                                            {item.hours}h
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">{item.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Analysis */}
                <div className="bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 flex flex-col relative overflow-hidden">
                    <h3 className="text-xl font-syne font-bold mb-10 italic uppercase tracking-tight">Domínio</h3>

                    <div className="space-y-8 flex-1">
                        {[
                            { name: 'Natureza', perc: 85, color: '#00E5A0' },
                            { name: 'Humanas', perc: 62, color: '#FFD600' },
                            { name: 'Linguagens', perc: 92, color: '#1A6BFF' },
                            { name: 'Matemática', perc: 41, color: '#FF6B6B' },
                        ].map((area) => (
                            <div key={area.name} className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">
                                    <span>{area.name}</span>
                                    <span style={{ color: area.color }}>{area.perc}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${area.perc}%`, backgroundColor: area.color }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-12 w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95">
                        Relatório Geral <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}