import { useState } from 'react'

import {
    Upload,
    FileText,
    Link as LinkIcon,
    Zap,
    Settings,
    AlertCircle,
    ChevronRight,
    Loader2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Generate() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [method, setMethod] = useState('upload')
    const [isGenerating, setIsGenerating] = useState(false)
    const [title, setTitle] = useState('')

    const handleGenerate = async () => {
        if (!title) {
            alert('Dê um nome para o seu deck antes de gerar.')
            return
        }
        if (!user) return

        setIsGenerating(true)

        try {
            // 1. Criar o Deck
            const { data: deck, error: deckError } = await supabase
                .from('decks')
                .insert([{
                    user_id: user.id,
                    title: title,
                    emoji: '🧠',
                    color: '#1A6BFF'
                }])
                .select()
                .single()

            if (deckError) throw deckError

            // 2. Simular geração de cards (IA mockada aqui, mas salvando no banco real)
            const mockCards = [
                { question: 'Pergunta 1 gerada por IA', answer: 'Resposta 1 gerada por IA', tags: ['Conteúdo', 'IA'] },
                { question: 'Conceito principal do material', answer: 'Explicação detalhada gerada automaticamente.', tags: ['Resumo'] },
                { question: 'Qual a importância deste tópico?', answer: 'Este tópico é fundamental para entender a base da disciplina.', tags: ['Importante'] },
            ]

            const cardsToInsert = mockCards.map(c => ({
                deck_id: deck.id,
                question: c.question,
                answer: c.answer,
                tags: c.tags
            }))

            const { error: cardsError } = await supabase
                .from('cards')
                .insert(cardsToInsert)

            if (cardsError) throw cardsError

            // 3. Sucesso! Redirecionar
            setTimeout(() => {
                navigate(`/study/${deck.id}`)
            }, 1500)

        } catch (err) {
            console.error('Erro na geração:', err)
            alert('Erro ao gerar materiais. Tente novamente.')
            setIsGenerating(false)
        }
    }

    return (
        <div className="space-y-10 animate-fade-in font-dm text-white">
            <header>
                <h1 className="text-3xl font-syne font-bold uppercase italic tracking-tighter">Gerar novos Flashcards</h1>
                <p className="text-gray-400 mt-1 font-medium">Nossa IA processa seu conteúdo e cria perguntas e respostas otimizadas.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Interface */}
                <div className="lg:col-span-2 space-y-8">

                    <div className="space-y-4 bg-[#0D1829] border-2 border-white/5 p-8 rounded-[3rem]">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">Título do novo Deck</label>
                        <input
                            type="text"
                            placeholder="Ex: Aula de Histologia, Resumo de Direito..."
                            className="w-full bg-[#111F35] border-2 border-white/5 rounded-2xl px-8 py-5 outline-none focus:border-[#1A6BFF]/40 text-white font-bold text-xl placeholder:text-gray-800 transition-all"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Method Selector */}
                    <div className="bg-[#0D1829] border-2 border-white/5 p-1 rounded-3xl flex gap-1">
                        <button
                            onClick={() => setMethod('upload')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${method === 'upload' ? 'bg-[#1A6BFF] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Upload className="h-4 w-4" /> Material
                        </button>
                        <button
                            onClick={() => setMethod('text')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${method === 'text' ? 'bg-[#1A6BFF] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            <FileText className="h-4 w-4" /> Texto
                        </button>
                        <button
                            onClick={() => setMethod('url')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${method === 'url' ? 'bg-[#1A6BFF] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            <LinkIcon className="h-4 w-4" /> Link
                        </button>
                    </div>

                    {/* Content Input Area */}
                    <div className="bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 min-h-[400px] flex flex-col justify-center relative overflow-hidden group">
                        {isGenerating && (
                            <div className="absolute inset-0 bg-[#080F1E]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 border-4 border-[#1A6BFF]/20 rounded-full animate-spin border-t-[#1A6BFF]"></div>
                                    <Zap className="absolute inset-0 m-auto h-10 w-10 text-[#00D4FF] animate-pulse" />
                                </div>
                                <h3 className="text-3xl font-syne font-bold mb-2 italic uppercase tracking-tighter">O Flipei está lendo...</h3>
                                <p className="text-gray-500 max-w-xs font-black uppercase text-[10px] tracking-[0.3em]">Transformando texto em conhecimento</p>
                            </div>
                        )}

                        {method === 'upload' && (
                            <div className="text-center space-y-8 animate-fade-in px-4">
                                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-white/10 group-hover:border-[#1A6BFF]/30 transition-all cursor-pointer">
                                    <Upload className="h-10 w-10 text-gray-700 group-hover:text-[#1A6BFF]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-syne font-bold uppercase tracking-tighter italic">Sobe seu PDF ou Doc</h3>
                                    <p className="text-gray-500 mt-2 font-medium max-w-xs mx-auto">Arraste seus materiais ou clique para explorar sua biblioteca local.</p>
                                </div>
                                <button
                                    onClick={() => alert('Feature em desenvolvimento: Em breve você poderá subir arquivos diretamente!')}
                                    className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/5"
                                >
                                    Explorar Arquivos
                                </button>
                            </div>
                        )}

                        {method === 'text' && (
                            <div className="h-full flex flex-col space-y-4 animate-fade-in">
                                <textarea
                                    placeholder="Cole aqui o texto do seu resumo, capítulo de livro ou anotações da aula..."
                                    className="w-full flex-1 bg-transparent border-none outline-none resize-none text-gray-200 placeholder:text-gray-800 text-xl font-medium min-h-[300px]"
                                ></textarea>
                            </div>
                        )}

                        {method === 'url' && (
                            <div className="text-center space-y-10 animate-fade-in">
                                <div className="w-full max-w-lg mx-auto">
                                    <input
                                        type="url"
                                        placeholder="https://exemplo.com.br/artigo-de-estudo"
                                        className="w-full bg-[#111F35] border-2 border-white/5 px-8 py-6 rounded-2xl outline-none focus:border-[#1A6BFF]/50 text-white transition-all font-bold text-lg"
                                    />
                                </div>
                                <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] italic">O Flipei irá extrair apenas o conteúdo educacional da URL.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Footer */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
                        <div className="flex items-center gap-3 text-[10px] text-gray-600 font-black uppercase tracking-widest italic">
                            <AlertCircle className="h-5 w-5 text-[#FFD600]" />
                            <span>Dica: Contextos claros geram cards melhores.</span>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full md:w-auto bg-[#1A6BFF] hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_10px_40px_rgba(26,107,255,0.3)] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                <>Criar Flashcards <ChevronRight className="h-6 w-6" /></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <aside className="space-y-6">
                    <section className="bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 bg-surface-glass relative overflow-hidden">
                        <h3 className="text-lg font-syne font-bold mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                            <Settings className="h-5 w-5 text-[#1A6BFF]" /> IA Config
                        </h3>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-1">Estilo de Card</label>
                                <select className="w-full bg-[#111F35] border-2 border-white/5 p-4 rounded-xl outline-none text-xs font-black uppercase tracking-widest appearance-none cursor-pointer focus:border-[#1A6BFF]/40">
                                    <option>Equilíbrio (Auto)</option>
                                    <option>Conceitual</option>
                                    <option>Fatos & Datas</option>
                                    <option>Vapt-Vupt (Resumo)</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex justify-between px-1">
                                    Densidade <span>~15 cards</span>
                                </label>
                                <input type="range" className="w-full accent-[#1A6BFF] h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-1">Idioma</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button className="bg-[#1A6BFF] p-3 rounded-xl text-[10px] font-black uppercase">PT-BR</button>
                                    <button className="bg-white/5 p-3 rounded-xl text-[10px] font-black uppercase text-gray-500">EN-US</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="bg-grad-blue p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
                        <h3 className="text-xl font-syne font-bold mb-3 italic">Dica Pro</h3>
                        <p className="text-sm text-blue-50/80 leading-relaxed font-medium">Flashcards gerados de PDFs estruturados (como slides de aula) têm 40% mais eficácia na retenção.</p>
                    </div>
                </aside>
            </div>
        </div>
    )
}