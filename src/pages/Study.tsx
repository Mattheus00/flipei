import { useEffect, useState } from 'react'

import { useParams, useNavigate } from 'react-router-dom'
import {
    X,
    RotateCcw,
    Keyboard,
    Loader2,
    Trophy
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Card {
    id: string
    question: string
    answer: string
    tags: string[]
}

export default function Study() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [isFlipped, setIsFlipped] = useState(false)
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [cards, setCards] = useState<Card[]>([])
    const [deckTitle, setDeckTitle] = useState('Resumo')
    const [loading, setLoading] = useState(true)
    const [sessionFinished, setSessionFinished] = useState(false)

    useEffect(() => {
        const fetchDeckAndCards = async () => {
            try {
                setLoading(true)
                // Fetch deck info
                const { data: deckData, error: deckError } = await supabase
                    .from('decks')
                    .select('title')
                    .eq('id', id)
                    .single()

                if (deckError) throw deckError
                setDeckTitle(deckData.title)

                // Fetch cards
                const { data: cardsData, error: cardsError } = await supabase
                    .from('cards')
                    .select('*')
                    .eq('deck_id', id)
                    .order('created_at', { ascending: true })

                if (cardsError) throw cardsError
                setCards(cardsData || [])

            } catch (err) {
                console.error('Erro ao buscar dados de estudo:', err)
                alert('Erro ao carregar o deck.')
                navigate('/decks')
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchDeckAndCards()
    }, [id, navigate])

    const handleFlip = () => setIsFlipped(!isFlipped)

    const handleScore = () => {
        setIsFlipped(false)
        if (currentCardIndex < cards.length - 1) {
            setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150)
        } else {
            setSessionFinished(true)
        }
    }

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault()
                handleFlip()
            } else if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
                if (isFlipped) handleScore()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isFlipped, currentCardIndex, cards.length])

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#080F1E] z-[100] flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-[#1A6BFF] animate-spin mb-4" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs italic">Preparando seu material...</p>
            </div>
        )
    }

    if (cards.length === 0 && !sessionFinished) {
        return (
            <div className="fixed inset-0 bg-[#080F1E] z-[100] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 border border-white/5">
                    <X className="h-10 w-10 text-gray-700" />
                </div>
                <h2 className="text-2xl font-syne font-bold mb-4">Este deck está vazio.</h2>
                <p className="text-gray-500 mb-8 max-w-xs">Gere novos flashcards com IA ou adicione manualmente para começar a estudar.</p>
                <button onClick={() => navigate('/generate')} className="bg-[#1A6BFF] text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95">Gerar Cards</button>
            </div>
        )
    }

    if (sessionFinished) {
        return (
            <div className="fixed inset-0 bg-[#080F1E] z-[100] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-24 h-24 bg-grad-blue rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(26,107,255,0.3)] border-2 border-white/20">
                    <Trophy className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl font-syne font-bold mb-4 italic uppercase tracking-tight">Sessão Finalizada!</h2>
                <p className="text-gray-400 mb-12 max-w-md text-lg">Incrível! Você revisou todos os cards deste deck por hoje. Sua retenção agradece.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-white text-[#1A6BFF] px-12 py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                    Voltar ao Dashboard
                </button>
            </div>
        )
    }

    const currentCard = cards[currentCardIndex]

    return (
        <div className="fixed inset-0 bg-[#080F1E] z-[60] flex flex-col font-dm text-white select-none overflow-hidden animate-fade-in">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1A6BFF]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00D4FF]/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header */}
            <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-[#080F1E]/50 backdrop-blur-xl relative z-10">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/decks')} className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                        <X className="h-6 w-6" />
                    </button>
                    <div className="hidden md:flex flex-col">
                        <h2 className="text-sm font-syne font-black text-[#1A6BFF] uppercase tracking-[0.2em]">{deckTitle}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-grad-blue transition-all duration-700 ease-out"
                                    style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{currentCardIndex + 1} / {cards.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 italic">
                        <Keyboard className="h-4 w-4" />
                        <span>Dica: Use ESPAÇO e Teclas 1-3</span>
                    </div>
                </div>
            </div>

            {/* Main Study Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                {/* Mobile Header (replicated) */}
                <div className="md:hidden text-center mb-10">
                    <h2 className="text-xs font-syne font-black text-[#1A6BFF] uppercase tracking-[0.2em] mb-3">{deckTitle}</h2>
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-grad-blue transition-all" style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-gray-600 uppercase">{currentCardIndex + 1} / {cards.length}</span>
                    </div>
                </div>

                {/* The Card Container */}
                <div
                    className="relative w-full max-w-2xl aspect-[4/3] md:aspect-[16/10] perspective-1000 cursor-pointer group"
                    onClick={handleFlip}
                >
                    <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        {/* Front */}
                        <div className="absolute inset-0 backface-hidden bg-[#0D1829] border-2 border-white/5 rounded-[3.5rem] p-8 md:p-16 flex flex-col items-center justify-center text-center shadow-2xl group-hover:border-[#1A6BFF]/30 transition-all bg-surface-glass">
                            <div className="absolute top-10 left-10 text-gray-700 font-syne font-black text-6xl italic opacity-20 select-none">Q</div>

                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                {(currentCard.tags || []).map(tag => (
                                    <span key={tag} className="text-[10px] bg-[#1A6BFF]/10 text-[#1A6BFF] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-[#1A6BFF]/20">{tag}</span>
                                ))}
                            </div>

                            <p className="text-2xl md:text-3xl font-syne font-bold leading-tight max-w-lg text-white">
                                {currentCard.question}
                            </p>

                            <div className="absolute bottom-12 flex flex-col items-center gap-2 text-gray-600 animate-pulse">
                                <RotateCcw className="h-5 w-5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Clique para virar</span>
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden bg-[#111F35] border-2 border-[#1A6BFF]/40 rounded-[3.5rem] p-8 md:p-16 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180 relative overflow-hidden">
                            <div className="absolute top-10 left-10 text-[#1A6BFF]/20 font-syne font-black text-6xl italic select-none">A</div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1A6BFF]/10 blur-3xl rounded-full"></div>

                            <p className="text-xl md:text-2xl leading-relaxed text-gray-100 font-medium max-w-lg">
                                {currentCard.answer}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Evaluation Buttons */}
                <div className={`mt-16 flex flex-wrap justify-center gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
                    {[
                        { label: 'Difícil', color: '#FF6B6B', key: '1' },
                        { label: 'Médio', color: '#FFD600', key: '2' },
                        { label: 'Fácil', color: '#00E5A0', key: '3' },
                    ].map((btn) => (
                        <button
                            key={btn.key}
                            onClick={(e) => { e.stopPropagation(); handleScore() }}
                            className="group flex flex-col items-center gap-2"
                        >
                            <div
                                className="w-24 md:w-36 py-5 rounded-[2rem] font-black text-sm transition-all shadow-xl text-center border-2"
                                style={{
                                    backgroundColor: `${btn.color}10`,
                                    borderColor: `${btn.color}20`,
                                    color: btn.color
                                }}
                            >
                                <div className="group-hover:scale-110 transition-transform">{btn.label}</div>
                                <span className="block text-[9px] mt-2 opacity-50 uppercase tracking-widest">Tecla {btn.key}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </main>

            {/* Tailwind helper for 3D flip */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
        </div>
    )
}