import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Trash2, LayoutGrid, List as ListIcon, Layers, Loader2, X, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Deck {
    id: string
    title: string
    emoji: string
    color: string
    card_count?: number
    last_review?: string
    progress?: number
}

export default function Decks() {
    const { user } = useAuth()
    const [decks, setDecks] = useState<Deck[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newDeck, setNewDeck] = useState({ title: '', emoji: '🃏', color: '#1A6BFF' })
    const [creating, setCreating] = useState(false)

    // Delete modal state
    const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null)
    const [deleting, setDeleting] = useState(false)

    const fetchDecks = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('decks')
                .select('*, cards (count)')
                .order('created_at', { ascending: false })

            if (error) throw error

            const formattedDecks = data.map((d: any) => ({
                id: d.id,
                title: d.title,
                emoji: d.emoji,
                color: d.color,
                card_count: d.cards && d.cards[0] ? (d.cards[0] as any).count : 0,
                last_review: 'Nunca',
                progress: 0
            }))
            setDecks(formattedDecks)
        } catch (err) {
            console.error('Erro ao buscar decks:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) fetchDecks()
    }, [user])

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setCreating(true)
        try {
            const { error } = await supabase
                .from('decks')
                .insert([{ user_id: user.id, title: newDeck.title, emoji: newDeck.emoji, color: newDeck.color }])
                .select()
            if (error) throw error
            setIsCreateModalOpen(false)
            setNewDeck({ title: '', emoji: '🃏', color: '#1A6BFF' })
            fetchDecks()
        } catch (err) {
            console.error('Erro ao criar deck:', err)
            alert('Erro ao criar deck. Tente novamente.')
        } finally {
            setCreating(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!deckToDelete) return
        setDeleting(true)
        try {
            const { error } = await supabase.from('decks').delete().eq('id', deckToDelete.id)
            if (error) throw error
            setDecks(decks.filter(d => d.id !== deckToDelete.id))
            setDeckToDelete(null)
        } catch (err) {
            console.error('Erro ao deletar deck:', err)
            alert('Não foi possível excluir o deck. Tente novamente.')
        } finally {
            setDeleting(false)
        }
    }

    if (loading && decks.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
                <Loader2 className="h-10 w-10 text-[#1A6BFF] animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sincronizando seus decks...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in font-dm text-white relative">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-syne font-bold text-white uppercase italic tracking-tighter">Meus Decks</h1>
                    <p className="text-gray-400 mt-1 font-medium">Você tem {decks.length} decks ativos na sua biblioteca.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#1A6BFF] hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 text-lg"
                >
                    <Plus className="h-5 w-5" /> Novo Deck
                </button>
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
                    <input type="text" placeholder="Pesquisar decks..." className="w-full bg-[#0D1829] border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-[#1A6BFF]/40 text-white placeholder:text-gray-700 transition-all font-bold" />
                </div>
                <div className="flex gap-2">
                    <button className="bg-[#0D1829] border-2 border-white/5 p-4 rounded-2xl text-gray-500 hover:text-white transition-colors"><Filter className="h-5 w-5" /></button>
                    <div className="bg-[#0D1829] border-2 border-white/5 p-1 rounded-2xl flex gap-1">
                        <button className="bg-[#111F35] text-white p-3 rounded-xl shadow-sm"><LayoutGrid className="h-5 w-5" /></button>
                        <button className="text-gray-600 p-3 rounded-xl hover:text-white transition-colors"><ListIcon className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>

            {/* Decks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                    <div key={deck.id} className="group bg-[#0D1829] border-2 border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#1A6BFF]/40 transition-all hover:-translate-y-2 relative">
                        <div className="h-3 w-full opacity-80" style={{ backgroundColor: deck.color }} />
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="text-5xl drop-shadow-2xl">{deck.emoji}</div>
                                <button
                                    onClick={() => setDeckToDelete(deck)}
                                    className="text-gray-700 hover:text-red-500 p-2 transition-colors rounded-xl hover:bg-red-500/10"
                                    title="Excluir Deck"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <Link to={`/study/${deck.id}`} className="block group">
                                <h3 className="text-xl font-syne font-bold text-white group-hover:text-[#1A6BFF] transition-colors mb-2 uppercase tracking-tight italic">{deck.title}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-gray-600 mb-8 uppercase">
                                    <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> {deck.card_count} cards</span>
                                    <span>•</span>
                                    <span>Rev: {deck.last_review}</span>
                                </div>
                            </Link>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                                    <span>Domínio</span>
                                    <span style={{ color: deck.color }}>{deck.progress}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${deck.progress}%`, backgroundColor: deck.color }} />
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <Link to={`/study/${deck.id}`} className="flex-1 bg-[#1A6BFF] text-white hover:bg-indigo-500 py-3.5 rounded-2xl font-black text-sm text-center transition-all shadow-lg active:scale-95">
                                    Estudar Agora
                                </Link>
                                <button className="p-3.5 bg-white/5 text-gray-500 hover:text-white rounded-2xl transition-all border border-transparent hover:border-white/10">
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create Deck Card */}
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center gap-6 hover:border-[#1A6BFF]/40 hover:bg-[#1A6BFF]/5 transition-all min-h-[380px]"
                >
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                        <Plus className="h-10 w-10 text-gray-700 group-hover:text-[#1A6BFF] transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-xl font-syne font-bold text-white mb-2 italic uppercase">Novo Deck</h3>
                        <p className="text-gray-500 text-sm font-medium max-w-[180px]">Crie manualmente um novo conjunto de cards do zero.</p>
                    </div>
                </button>
            </div>

            {/* ===================== DELETE MODAL ===================== */}
            {deckToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !deleting && setDeckToDelete(null)} />
                    <div className="relative bg-[#0D1829] border-2 border-red-500/20 w-full max-w-md rounded-[3rem] p-10 shadow-2xl overflow-hidden scale-up text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />

                        <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-red-500/20">
                            <AlertTriangle className="h-10 w-10 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-syne font-bold italic uppercase tracking-tight text-white mb-3">Excluir Deck?</h2>
                        <p className="text-gray-400 font-medium mb-2">
                            Você está prestes a excluir <span className="text-white font-bold">"{deckToDelete.title}"</span>.
                        </p>
                        <p className="text-red-400 text-sm font-black uppercase tracking-widest mb-10">
                            ⚠️ Todos os cards serão apagados permanentemente.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeckToDelete(null)}
                                disabled={deleting}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black transition-all border border-white/5"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-500 hover:bg-red-400 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {deleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                {deleting ? 'Excluindo...' : 'Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================== CREATE MODAL ===================== */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative bg-[#0D1829] border-2 border-white/5 w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl overflow-hidden scale-up">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A6BFF]/10 blur-3xl rounded-full" />
                        <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-8 right-8 z-[110] text-gray-500 hover:text-white hover:bg-white/10 p-3 rounded-2xl transition-all" type="button">
                            <X className="h-6 w-6" />
                        </button>

                        <h2 className="text-2xl font-syne font-bold italic uppercase tracking-tight mb-8">Criar novo Deck</h2>

                        <form onSubmit={handleCreateDeck} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Título do Deck</label>
                                <input
                                    type="text" required placeholder="Ex: Anatomia, Direito Civil..."
                                    className="w-full bg-[#111F35] border-2 border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-[#1A6BFF]/40 text-white font-bold"
                                    value={newDeck.title}
                                    onChange={e => setNewDeck({ ...newDeck, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Emoji</label>
                                    <input type="text" className="w-full bg-[#111F35] border-2 border-white/5 rounded-2xl px-6 py-4 outline-none text-2xl text-center" value={newDeck.emoji} onChange={e => setNewDeck({ ...newDeck, emoji: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Cor</label>
                                    <input type="color" className="w-full h-[64px] bg-[#111F35] border-2 border-white/5 rounded-2xl p-2 cursor-pointer" value={newDeck.color} onChange={e => setNewDeck({ ...newDeck, color: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" disabled={creating} className="w-full bg-[#1A6BFF] hover:bg-indigo-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                                {creating ? <Loader2 className="animate-spin" /> : 'Confirmar e Criar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `.scale-up { animation: scaleUp 0.25s ease-out forwards; } @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }` }} />
        </div>
    )
}