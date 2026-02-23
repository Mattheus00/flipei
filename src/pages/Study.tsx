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
            } catch (err) {
                navigate('/decks')
            } finally {
                setLoading(false)
            }
        }
        if (id) fetch()
    }, [id, navigate])

    // Build 3 wrong options + 1 correct for current card
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

        // Save to study_logs
        if (user) {
            await supabase.from('study_logs').insert([{
                user_id: user.id,
                deck_id: id,
                card_id: cards[currentIndex].id,
                correct: isCorrect,
            }]).then(({ error }) => {
                if (error) console.error('Erro ao salvar log:', error)
            })
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
                <h2 className="text-2xl font-syne font-bold mb-4 text-white">Este deck está vazio.</h2>
                <p className="text-gray-500 mb-8 max-w-xs">Gere novos flashcards com IA para começar a estudar.</p>
                <button onClick={() => navigate('/generate')} className="bg-[#1A6BFF] text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95">Gerar Cards</button>
            </div>
        )
    }

    // ---- FINISHED SCREEN ----
    if (sessionFinished) {
        const total = correct + wrong
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
        return (
            <div className="fixed inset-0 bg-[#080F1E] z-[100] flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                {/* Confetti-like decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: ['#1A6BFF', '#00E5A0', '#FFD600', '#FF6B6B', '#00D4FF'][i % 5],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${1 + Math.random()}s`,
                                opacity: 0.6,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-28 h-28 bg-grad-blue rounded-[2.5rem] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(26,107,255,0.4)] border-2 border-white/20 animate-bounce">
                        <Trophy className="h-14 w-14 text-[#FFD600]" />
                    </div>

                    <h2 className="text-5xl font-syne font-bold mb-3 italic uppercase tracking-tight text-white">Parabéns! 🎉</h2>
                    <p className="text-gray-400 mb-12 max-w-md text-lg font-medium">
                        Você concluiu <span className="text-white font-bold">"{deckTitle}"</span> com sucesso!
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-12 w-full max-w-sm">
                        <div className="bg-[#0D1829] border-2 border-white/5 rounded-3xl p-5 text-center">
                            <div className="text-3xl font-syne font-black text-[#00E5A0]">{correct}</div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Acertos</div>
                        </div>
                        <div className="bg-[#0D1829] border-2 border-white/5 rounded-3xl p-5 text-center">
                            <div className="text-3xl font-syne font-black text-[#FF6B6B]">{wrong}</div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Erros</div>
                        </div>
                        <div className="bg-[#0D1829] border-2 border-[#1A6BFF]/30 rounded-3xl p-5 text-center">
                            <div className="text-3xl font-syne font-black text-[#1A6BFF]">{accuracy}%</div>
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">Precisão</div>
                        </div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-2 mb-10">
                        {[1, 2, 3].map(star => (
                            <Star
                                key={star}
                                className={`h-10 w-10 transition-all ${accuracy >= star * 33
                                        ? 'text-[#FFD600] fill-[#FFD600] scale-110'
                                        : 'text-gray-700'
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setCurrentIndex(0)
                                setCorrect(0)
                                setWrong(0)
                                setSelected(null)
                                setAnswered(false)
                                setSessionFinished(false)
                                setCards(prev => shuffle(prev))
                            }}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black transition-all border border-white/5"
                        >
                            <RotateCcw className="h-5 w-5" /> Repetir
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-[#1A6BFF] hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95"
                        >
                            Ver Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const currentCard = cards[currentIndex]
    const progress = ((currentIndex + 1) / cards.length) * 100

    return (
        <div className="fixed inset-0 bg-[#080F1E] z-[60] flex flex-col font-dm text-white select-none overflow-hidden animate-fade-in">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1A6BFF]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00D4FF]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="h-20 border-b border-white/5 px-6 flex items-center justify-between bg-[#080F1E]/50 backdrop-blur-xl relative z-10">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/decks')} className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                        <X className="h-6 w-6" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-syne font-black text-[#1A6BFF] uppercase tracking-[0.2em]">{deckTitle}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-48 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-grad-blue transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{currentIndex + 1} / {cards.length}</span>
                        </div>
                    </div>
                </div>

                {/* Live score */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#00E5A0] uppercase tracking-widest">
                        <CheckCircle2 className="h-4 w-4" /> {correct}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#FF6B6B] uppercase tracking-widest">
                        <XCircle className="h-4 w-4" /> {wrong}
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 relative z-10 overflow-y-auto">
                {/* Question Card */}
                <div className="w-full max-w-2xl bg-[#0D1829] border-2 border-white/5 rounded-[3.5rem] p-8 md:p-14 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden min-h-[200px]">
                    <div className="absolute top-8 left-8 text-gray-700 font-syne font-black text-6xl italic opacity-20 select-none">Q</div>

                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {(currentCard.tags || []).map(tag => (
                            <span key={tag} className="text-[10px] bg-[#1A6BFF]/10 text-[#1A6BFF] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-[#1A6BFF]/20">{tag}</span>
                        ))}
                    </div>

                    <p className="text-xl md:text-2xl font-syne font-bold leading-tight text-white max-w-lg">
                        {currentCard.question}
                    </p>

                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-8">
                        Escolha a resposta correta
                    </p>
                </div>

                {/* Answer Options */}
                <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
                    {options.map((option, idx) => {
                        const isCorrectAnswer = option === currentCard.answer
                        const isSelected = selected === option

                        let btnClass = 'bg-[#0D1829] border-2 border-white/5 text-gray-200 hover:border-[#1A6BFF]/40 hover:bg-[#1A6BFF]/5'

                        if (answered) {
                            if (isCorrectAnswer) {
                                btnClass = 'bg-[#00E5A0]/10 border-2 border-[#00E5A0]/60 text-[#00E5A0]'
                            } else if (isSelected) {
                                btnClass = 'bg-[#FF6B6B]/10 border-2 border-[#FF6B6B]/60 text-[#FF6B6B]'
                            } else {
                                btnClass = 'bg-[#0D1829] border-2 border-white/5 text-gray-600 opacity-40'
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(option)}
                                disabled={answered}
                                className={`${btnClass} rounded-3xl p-5 text-left font-bold text-sm leading-snug transition-all flex items-center gap-4 group`}
                            >
                                <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border transition-all ${answered && isCorrectAnswer
                                        ? 'bg-[#00E5A0] border-[#00E5A0] text-[#080F1E]'
                                        : answered && isSelected
                                            ? 'bg-[#FF6B6B] border-[#FF6B6B] text-white'
                                            : 'bg-white/5 border-white/10 text-gray-500 group-hover:border-[#1A6BFF]/40 group-hover:text-white'
                                    }`}>
                                    {['A', 'B', 'C', 'D'][idx]}
                                </span>
                                <span>{option}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Next button — shows after answering */}
                {answered && (
                    <button
                        onClick={handleNext}
                        className="mt-2 bg-[#1A6BFF] hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95 animate-fade-in"
                    >
                        {currentIndex < cards.length - 1 ? 'Próxima →' : '🏆 Ver Resultado'}
                    </button>
                )}
            </main>
        </div>
    )
}