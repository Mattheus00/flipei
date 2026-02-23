import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Loader2, Trophy, Star, RotateCcw, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Card {
    id: string
    question: string
    answer: string
    tags: string[]
}

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
}

export default function Study() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [cards, setCards] = useState<Card[]>([])
    const [deckTitle, setDeckTitle] = useState('Resumo')
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [answered, setAnswered] = useState(false)
    const [sessionFinished, setSessionFinished] = useState(false)
    const [correct, setCorrect] = useState(0)
    const [wrong, setWrong] = useState(0)

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true)
                const { data: deck } = await supabase.from('decks').select('title').eq('id', id).single()
                if (deck) setDeckTitle(deck.title)
                const { data: cardsData } = await supabase.from('cards').select('*').eq('deck_id', id).order('created_at')
                setCards(shuffle(cardsData || []))
            } catch {
                navigate('/decks')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetch()
    }, [id, navigate])

    const options = useMemo(() => {
        if (cards.length === 0) return []
        const current = cards[currentIndex]
        const others = cards.filter((_, i) => i !== currentIndex)
        const wrongs = shuffle(others).slice(0, 3).map(c => c.answer)
        return shuffle([current.answer, ...wrongs])
    }, [cards, currentIndex])

    const handleSelect = async (option: string) => {
        if (answered) return
        setSelected(option)
        setAnswered(true)

        const isCorrect = option === cards[currentIndex].answer
        if (isCorrect) setCorrect(c => c + 1)
        else setWrong(w => w + 1)

        // Log silently - ignore errors if table doesn't exist yet
        if (user) {
            supabase.from('study_logs').insert([{
                user_id: user.id,
                deck_id: id,
                card_id: cards[currentIndex].id,
                correct: isCorrect,
            }]).then(() => { })
        }
    }

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(i => i + 1)
            setSelected(null)
            setAnswered(false)
        } else {
            setSessionFinished(true)
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#080F1E] z-[100] flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-[#1A6BFF] animate-spin mb-4" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-xs italic">Preparando...</p>
            </div>
        )
    }

    if (cards.length === 0 && !sessionFinished) {
        return (
            <div className="fixed inset-0 bg-[#080F1E] z-[100] flex flex-col items-center justify-center p-8 text-center">
                <X className="h-16 w-16 text-gray-700 mb-6" />
                <h2 className="text-2xl font-syne font-bold mb-4 text-white">Deck vazio.</h2>
                <p className="text-gray-500 mb-8 max-w-xs">Gere flashcards com IA para começar.</p>
                <button onClick={() => navigate('/generate')} className="bg-[#1A6BFF] text-white px-8 py-4 rounded-2xl font-black">Gerar Cards</button>
            </div>
        )
    }

    // ---- FINISHED ----
    if (sessionFinished) {
        const total = correct + wrong
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
        return (
            <div className="fixed inset-0 bg-[#080F1E] z-[100] flex flex-col items-center justify-center p-6 text-center animate-fade-in overflow-y-auto">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="absolute w-2 h-2 rounded-full animate-bounce opacity-60"
                            style={{
                                left: `${5 + (i * 6)}%`, top: `${20 + (i % 4) * 15}%`,
                                backgroundColor: ['#1A6BFF', '#00E5A0', '#FFD600', '#FF6B6B'][i % 4],
                                animationDelay: `${(i * 0.15)}s`, animationDuration: `${1.2 + (i % 3) * 0.3}s`
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
                    <div className="w-24 h-24 bg-grad-blue rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(26,107,255,0.4)] border-2 border-white/20">
                        <Trophy className="h-12 w-12 text-[#FFD600]" />
                    </div>
                    <h2 className="text-4xl font-syne font-bold mb-2 italic uppercase tracking-tight text-white">Parabéns! 🎉</h2>
                    <p className="text-gray-400 mb-8 text-base font-medium">
                        Você concluiu <span className="text-white font-bold">"{deckTitle}"</span>!
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-8 w-full">
                        <div className="bg-[#0D1829] border-2 border-white/5 rounded-3xl p-4 text-center">
                            <div className="text-3xl font-syne font-black text-[#00E5A0]">{correct}</div>
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Acertos</div>
                        </div>
                        <div className="bg-[#0D1829] border-2 border-white/5 rounded-3xl p-4 text-center">
                            <div className="text-3xl font-syne font-black text-[#FF6B6B]">{wrong}</div>
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Erros</div>
                        </div>
                        <div className="bg-[#0D1829] border-2 border-[#1A6BFF]/30 rounded-3xl p-4 text-center">
                            <div className="text-3xl font-syne font-black text-[#1A6BFF]">{accuracy}%</div>
                            <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">Precisão</div>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3].map(star => (
                            <Star key={star} className={`h-9 w-9 transition-all ${accuracy >= star * 33 ? 'text-[#FFD600] fill-[#FFD600]' : 'text-gray-700'}`} />
                        ))}
                    </div>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => {
                                setCurrentIndex(0); setCorrect(0); setWrong(0)
                                setSelected(null); setAnswered(false); setSessionFinished(false)
                                setCards(prev => shuffle(prev))
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black transition-all border border-white/5"
                        >
                            <RotateCcw className="h-4 w-4" /> Repetir
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 bg-[#1A6BFF] hover:bg-indigo-500 text-white py-4 rounded-2xl font-black transition-all shadow-xl"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const currentCard = cards[currentIndex]
    const progress = ((currentIndex + 1) / cards.length) * 100

    return (
        <div className="fixed inset-0 bg-[#080F1E] z-[60] flex flex-col font-dm text-white select-none animate-fade-in">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A6BFF]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4FF]/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header — compact */}
            <div className="shrink-0 h-14 border-b border-white/5 px-4 flex items-center justify-between bg-[#080F1E]/50 backdrop-blur-xl relative z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/decks')} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <X className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="text-[10px] font-black text-[#1A6BFF] uppercase tracking-widest truncate max-w-[160px]">{deckTitle}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="h-1 w-28 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-grad-blue transition-all duration-700" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[9px] font-black text-gray-600">{currentIndex + 1}/{cards.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] font-black text-[#00E5A0]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {correct}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-black text-[#FF6B6B]">
                        <XCircle className="h-3.5 w-3.5" /> {wrong}
                    </span>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto relative z-10">
                <div className="flex flex-col items-center px-4 py-6 gap-4 min-h-full">

                    {/* Question Card — compact */}
                    <div className="w-full max-w-xl bg-[#0D1829] border-2 border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-4 left-4 text-gray-700 font-syne font-black text-4xl italic opacity-20 select-none">Q</div>

                        {(currentCard.tags || []).length > 0 && (
                            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                                {currentCard.tags.map(tag => (
                                    <span key={tag} className="text-[9px] bg-[#1A6BFF]/10 text-[#1A6BFF] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-[#1A6BFF]/20">{tag}</span>
                                ))}
                            </div>
                        )}

                        <p className="text-base md:text-xl font-syne font-bold leading-snug text-white">
                            {currentCard.question}
                        </p>

                        <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-4">
                            Escolha a resposta correta
                        </p>
                    </div>

                    {/* Options Grid — 2x2 on mobile */}
                    <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {options.map((option, idx) => {
                            const isCorrectAnswer = option === currentCard.answer
                            const isSelected = selected === option

                            let cls = 'bg-[#0D1829] border-2 border-white/5 text-gray-200 hover:border-[#1A6BFF]/40 hover:bg-[#1A6BFF]/5 cursor-pointer'
                            if (answered) {
                                if (isCorrectAnswer) cls = 'bg-[#00E5A0]/10 border-2 border-[#00E5A0]/60 text-[#00E5A0]'
                                else if (isSelected) cls = 'bg-[#FF6B6B]/10 border-2 border-[#FF6B6B]/60 text-[#FF6B6B]'
                                else cls = 'bg-[#0D1829] border-2 border-white/5 text-gray-600 opacity-40'
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(option)}
                                    disabled={answered}
                                    className={`${cls} rounded-2xl p-4 text-left text-sm leading-snug transition-all flex items-center gap-3`}
                                >
                                    <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] border transition-all ${answered && isCorrectAnswer ? 'bg-[#00E5A0] border-[#00E5A0] text-[#080F1E]'
                                            : answered && isSelected ? 'bg-[#FF6B6B] border-[#FF6B6B] text-white'
                                                : 'bg-white/5 border-white/10 text-gray-500'
                                        }`}>
                                        {['A', 'B', 'C', 'D'][idx]}
                                    </span>
                                    <span className="flex-1 font-medium">{option}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Next Button */}
                    {answered && (
                        <button
                            onClick={handleNext}
                            className="w-full max-w-xl bg-[#1A6BFF] hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-base transition-all shadow-xl active:scale-95 animate-fade-in"
                        >
                            {currentIndex < cards.length - 1 ? 'Próxima Pergunta →' : '🏆 Ver Resultado'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}