import { useState, useRef, useCallback } from 'react'
import {
    FileText,
    Zap,
    Settings,
    AlertCircle,
    ChevronRight,
    Loader2,
    CheckCircle2,
    Save,
    RefreshCw,
    X,
    Upload,
    FileUp,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { generateCards, FlashCard } from '../lib/groq'
import { extractTextFromPDF } from '../lib/pdfExtractor'

type InputMethod = 'upload' | 'text'

export default function Generate() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [method, setMethod] = useState<InputMethod>('upload')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isExtractingPDF, setIsExtractingPDF] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [title, setTitle] = useState('')
    const [text, setText] = useState('')
    const [density, setDensity] = useState(10)
    const [language, setLanguage] = useState('PT-BR')
    const [cards, setCards] = useState<FlashCard[]>([])
    const [error, setError] = useState<string | null>(null)
    const [step, setStep] = useState<'input' | 'preview'>('input')
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = useCallback(async (file: File) => {
        if (file.type !== 'application/pdf') {
            setError('Apenas arquivos PDF são suportados neste modo.')
            return
        }

        setError(null)
        setPdfFile(file)

        // Auto-preencher o título com o nome do arquivo
        if (!title) {
            const nameWithoutExt = file.name.replace(/\.pdf$/i, '')
            setTitle(nameWithoutExt)
        }

        setIsExtractingPDF(true)
        try {
            const extractedText = await extractTextFromPDF(file)
            setText(extractedText)
        } catch (err: any) {
            setError(err.message || 'Erro ao ler o PDF. Tente outro arquivo.')
            setPdfFile(null)
        } finally {
            setIsExtractingPDF(false)
        }
    }, [title])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileSelect(file)
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFileSelect(file)
    }

    const handleGenerate = async () => {
        if (!title.trim()) {
            setError('Dê um nome para o seu deck antes de gerar.')
            return
        }

        const finalText = text.trim()
        if (finalText.length < 50) {
            setError(method === 'upload'
                ? 'O PDF precisa ter pelo menos 50 caracteres de texto extraível.'
                : 'Cole um texto com pelo menos 50 caracteres para a IA gerar cards relevantes.'
            )
            return
        }
        if (!user) return

        setError(null)
        setIsGenerating(true)

        try {
            const generatedCards = await generateCards(finalText, density, language)
            setCards(generatedCards)
            setStep('preview')
        } catch (err: any) {
            setError(err.message || 'Erro ao gerar cards. Verifique sua chave de API do Groq.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleRemoveCard = (index: number) => {
        setCards(cards.filter((_, i) => i !== index))
    }

    const handleEditCard = (index: number, field: 'pergunta' | 'resposta', value: string) => {
        const updated = [...cards]
        updated[index] = { ...updated[index], [field]: value }
        setCards(updated)
    }

    const handleSave = async () => {
        if (!user || cards.length === 0) return

        setIsSaving(true)
        try {
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

            const cardsToInsert = cards.map(c => ({
                deck_id: deck.id,
                question: c.pergunta,
                answer: c.resposta,
                tags: ['IA', 'Groq']
            }))

            const { error: cardsError } = await supabase
                .from('cards')
                .insert(cardsToInsert)

            if (cardsError) throw cardsError

            navigate(`/study/${deck.id}`)
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar. Tente novamente.')
            setIsSaving(false)
        }
    }

    const handleRegenerate = () => {
        setCards([])
        setStep('input')
    }

    // ---- PREVIEW STEP ----
    if (step === 'preview') {
        return (
            <div className="space-y-8 animate-fade-in font-dm text-white">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <CheckCircle2 className="h-6 w-6 text-[#00E5A0]" />
                            <h1 className="text-3xl font-syne font-bold uppercase italic tracking-tighter">Cards Gerados!</h1>
                        </div>
                        <p className="text-gray-400 font-medium">
                            A IA criou <span className="text-white font-bold">{cards.length} cards</span> para o deck <span className="text-[#1A6BFF] font-bold">"{title}"</span>. Revise, edite ou apague.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRegenerate}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all border border-white/5"
                        >
                            <RefreshCw className="h-4 w-4" /> Refazer
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || cards.length === 0}
                            className="flex items-center gap-2 bg-[#00E5A0] hover:bg-emerald-400 text-[#080F1E] px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(0,229,160,0.3)] active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isSaving ? 'Salvando...' : `Salvar ${cards.length} Cards`}
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map((card, index) => (
                        <div key={index} className="bg-[#0D1829] border-2 border-white/5 rounded-3xl p-6 space-y-4 hover:border-[#1A6BFF]/30 transition-all">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-[#1A6BFF] uppercase tracking-widest">Card {index + 1}</span>
                                <button onClick={() => handleRemoveCard(index)} className="text-gray-700 hover:text-red-500 p-1.5 rounded-xl transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Pergunta</label>
                                <textarea value={card.pergunta} onChange={(e) => handleEditCard(index, 'pergunta', e.target.value)} className="w-full bg-[#111F35] border-2 border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-[#1A6BFF]/40 text-white text-sm font-medium resize-none transition-all" rows={2} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Resposta</label>
                                <textarea value={card.resposta} onChange={(e) => handleEditCard(index, 'resposta', e.target.value)} className="w-full bg-[#111F35] border-2 border-white/5 rounded-2xl px-4 py-3 outline-none focus:border-[#1A6BFF]/40 text-white text-sm font-medium resize-none transition-all" rows={3} />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setCards([...cards, { pergunta: '', resposta: '' }])}
                        className="border-2 border-dashed border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:border-[#1A6BFF]/40 hover:bg-[#1A6BFF]/5 transition-all text-gray-600 hover:text-[#1A6BFF] min-h-[180px]"
                    >
                        <span className="text-3xl">+</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Card</span>
                    </button>
                </div>
            </div>
        )
    }

    // ---- INPUT STEP ----
    return (
        <div className="space-y-8 animate-fade-in font-dm text-white">
            <header>
                <h1 className="text-3xl font-syne font-bold uppercase italic tracking-tighter">Gerar Flashcards com IA</h1>
                <p className="text-gray-400 mt-1 font-medium">Powered by <span className="text-[#00D4FF] font-bold">Groq • Llama 3</span> — Suba um PDF ou cole seu texto.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    {/* Nome do Deck */}
                    <div className="space-y-3 bg-[#0D1829] border-2 border-white/5 p-8 rounded-[3rem]">
                        <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-1">Nome do Deck</label>
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
                            <Upload className="h-4 w-4" /> PDF
                        </button>
                        <button
                            onClick={() => setMethod('text')}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${method === 'text' ? 'bg-[#1A6BFF] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            <FileText className="h-4 w-4" /> Texto
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 min-h-[360px] flex flex-col justify-center relative overflow-hidden">

                        {/* Loading overlay while generating */}
                        {isGenerating && (
                            <div className="absolute inset-0 bg-[#080F1E]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8 animate-fade-in rounded-[3rem]">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 border-4 border-[#1A6BFF]/20 rounded-full animate-spin border-t-[#1A6BFF]"></div>
                                    <Zap className="absolute inset-0 m-auto h-10 w-10 text-[#00D4FF] animate-pulse" />
                                </div>
                                <h3 className="text-3xl font-syne font-bold mb-2 italic uppercase tracking-tighter">Groq está pensando...</h3>
                                <p className="text-gray-500 max-w-xs font-black uppercase text-[10px] tracking-[0.3em]">Gerando {density} cards com Llama 3</p>
                            </div>
                        )}

                        {/* PDF Upload Mode */}
                        {method === 'upload' && (
                            <div className="space-y-6 animate-fade-in">
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${isDragging
                                        ? 'border-[#1A6BFF] bg-[#1A6BFF]/10 scale-[1.02]'
                                        : pdfFile
                                            ? 'border-[#00E5A0]/60 bg-[#00E5A0]/5'
                                            : 'border-white/10 hover:border-[#1A6BFF]/40 hover:bg-[#1A6BFF]/5'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileInputChange}
                                    />

                                    {isExtractingPDF ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="h-12 w-12 text-[#1A6BFF] animate-spin" />
                                            <p className="text-white font-black uppercase tracking-widest text-sm">Lendo o PDF...</p>
                                            <p className="text-gray-500 text-xs font-medium">Extraindo texto das páginas</p>
                                        </div>
                                    ) : pdfFile ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-[#00E5A0]/20 rounded-2xl flex items-center justify-center">
                                                <FileUp className="h-8 w-8 text-[#00E5A0]" />
                                            </div>
                                            <div>
                                                <p className="text-[#00E5A0] font-black text-lg">{pdfFile.name}</p>
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {(pdfFile.size / 1024 / 1024).toFixed(1)}MB • {text.length.toLocaleString()} caracteres extraídos
                                                </p>
                                            </div>
                                            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Clique para trocar o arquivo</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
                                                <Upload className="h-10 w-10 text-gray-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-syne font-bold uppercase tracking-tight italic text-white">Arraste seu PDF aqui</h3>
                                                <p className="text-gray-500 mt-2 font-medium">ou clique para selecionar o arquivo</p>
                                            </div>
                                            <div className="flex gap-3 text-[10px] text-gray-600 font-black uppercase tracking-widest">
                                                <span>📄 PDF</span>
                                                <span>•</span>
                                                <span>Máx. recomendado: 10MB</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Preview of extracted text */}
                                {text && !isExtractingPDF && (
                                    <div className="bg-[#111F35] border border-white/5 rounded-2xl p-4 max-h-32 overflow-y-auto">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">Texto Extraído (prévia)</p>
                                        <p className="text-gray-400 text-xs leading-relaxed">{text.substring(0, 400)}...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Text Mode */}
                        {method === 'text' && (
                            <div className="h-full flex flex-col space-y-4 animate-fade-in">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Cole seu texto aqui
                                </label>
                                <textarea
                                    placeholder="Cole aqui o texto do seu resumo, capítulo de livro, anotações da aula...&#10;&#10;Quanto mais detalhado, melhores serão os cards!"
                                    className="w-full bg-transparent border-none outline-none resize-none text-gray-200 placeholder:text-gray-700 text-base font-medium min-h-[260px] leading-relaxed"
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                />
                                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                    <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">
                                        {text.length} caracteres {text.length < 50 && text.length > 0 && <span className="text-red-500">— mínimo 50</span>}
                                    </span>
                                    <span className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">
                                        ~{Math.ceil(text.split(' ').filter(Boolean).length / 200)} min de leitura
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-fade-in">
                            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
                        </div>
                    )}

                    {/* Action Footer */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                        <div className="flex items-center gap-3 text-[10px] text-gray-600 font-black uppercase tracking-widest italic">
                            <AlertCircle className="h-5 w-5 text-[#FFD600]" />
                            <span>Textos estruturados geram cards melhores.</span>
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || isExtractingPDF || (!text && method === 'text') || (method === 'upload' && !pdfFile && !text)}
                            className="w-full md:w-auto bg-[#1A6BFF] hover:bg-indigo-500 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-[0_10px_40px_rgba(26,107,255,0.3)] active:scale-95 flex items-center justify-center gap-3 disabled:opacity-40"
                        >
                            {isGenerating ? <Loader2 className="animate-spin h-6 w-6" /> : (
                                <>Gerar {density} Cards <ChevronRight className="h-6 w-6" /></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <aside className="space-y-6">
                    <section className="bg-[#0D1829] border-2 border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                        <h3 className="text-lg font-syne font-bold mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                            <Settings className="h-5 w-5 text-[#1A6BFF]" /> IA Config
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex justify-between px-1">
                                    Quantidade <span className="text-white">{density} cards</span>
                                </label>
                                <input
                                    type="range" min="5" max="50" value={density}
                                    onChange={(e) => setDensity(parseInt(e.target.value))}
                                    className="w-full accent-[#1A6BFF] h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-gray-700 font-bold px-1">
                                    <span>5</span><span>50</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-1">Idioma dos Cards</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setLanguage('PT-BR')} className={`p-3 rounded-xl text-[10px] font-black uppercase transition-all ${language === 'PT-BR' ? 'bg-[#1A6BFF] text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white'}`}>🇧🇷 PT-BR</button>
                                    <button onClick={() => setLanguage('EN-US')} className={`p-3 rounded-xl text-[10px] font-black uppercase transition-all ${language === 'EN-US' ? 'bg-[#1A6BFF] text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white'}`}>🇺🇸 EN-US</button>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-1">Modelo</label>
                                <div className="bg-[#111F35] border-2 border-white/5 p-4 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 bg-[#00E5A0] rounded-full animate-pulse"></div>
                                    <span className="text-xs font-black text-white">Llama 3.1 8B (Groq)</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="bg-grad-blue p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
                        <h3 className="text-xl font-syne font-bold mb-3 italic">📄 PDF Funciona!</h3>
                        <p className="text-sm text-blue-50/80 leading-relaxed font-medium">Arraste qualquer PDF de aula, livro ou artigo. O texto é extraído direto no seu navegador — seus arquivos <strong>nunca saem do seu computador</strong>.</p>
                    </div>
                </aside>
            </div>
        </div>
    )
}