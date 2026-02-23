import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    CheckCircle2,
    Paperclip,
    Cpu,
    BrainCircuit,
    Menu,
    X
} from 'lucide-react'

export default function Landing() {
    const navigate = useNavigate()

    const [isScrolled, setIsScrolled] = React.useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="bg-[#080F1E] text-white overflow-x-hidden selection:bg-indigo-500/30 font-dm">
            {/* NAV FIXA */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#080F1E]/80 backdrop-blur-md py-3 shadow-lg border-b border-white/5' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold flex items-center font-syne">
                            🃏 Flip<span className="text-[#00D4FF]">ei</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#como-funciona" className="text-sm font-medium text-gray-400 hover:text-[#00D4FF] transition-colors">Como funciona</a>
                        <a href="#funcionalidades" className="text-sm font-medium text-gray-400 hover:text-[#00D4FF] transition-colors">Funcionalidades</a>
                        <a href="#precos" className="text-sm font-medium text-gray-400 hover:text-[#00D4FF] transition-colors">Preços</a>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Entrar</Link>
                        <Link to="/cadastro" className="bg-[#1A6BFF] hover:bg-[#1A6BFF]/90 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(26,107,255,0.3)]">Começar grátis</Link>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-[#0D1829] border-b border-white/5 p-6 flex flex-col gap-4 animate-fade-in">
                        <a href="#como-funciona" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-gray-400">Como funciona</a>
                        <a href="#funcionalidades" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-gray-400">Funcionalidades</a>
                        <a href="#precos" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-gray-400">Preços</a>
                        <hr className="border-white/5" />
                        <Link to="/login" className="py-2 text-gray-400">Entrar</Link>
                        <Link to="/cadastro" className="bg-[#1A6BFF] text-center p-3 rounded-2xl font-bold">Começar grátis</Link>
                    </div>
                )}
            </nav>

            {/* HERO SECTION */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
                {/* Glow Effects */}
                <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-[#1A6BFF]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[#00D4FF]/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-[#111F35] border border-white/10 px-4 py-2 rounded-full mb-8 animate-fade-in">
                        <span className="flex h-2 w-2 rounded-full bg-[#00D4FF] animate-ping"></span>
                        <span className="text-xs font-bold tracking-wider text-gray-300 uppercase">Powered by IA · Em breve</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-syne font-extrabold tracking-tight mb-8 leading-[1.1] animate-slide-up">
                        Cole o PDF.<br />
                        <span className="text-grad-blue">Flipei faz o resto.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-12 leading-relaxed animate-fade-in">
                        Transforme qualquer material em flashcards inteligentes com IA. Estude mais em menos tempo — feito pra quem estuda de verdade no Brasil.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <Link to="/cadastro" className="w-full sm:w-auto bg-[#1A6BFF] hover:bg-[#1A6BFF]/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(26,107,255,0.4)] flex items-center justify-center gap-2">
                            Quero acesso antecipado
                        </Link>
                        <a href="#como-funciona" className="w-full sm:w-auto px-8 py-4 text-white font-bold text-lg hover:bg-white/5 rounded-2xl transition-colors flex items-center justify-center gap-2">
                            Ver como funciona <ArrowRight className="w-5 h-5" />
                        </a>
                    </div>

                    {/* Floating Cards */}
                    <div className="relative h-[250px] md:h-[400px] max-w-5xl mx-auto">
                        <div className="absolute left-[5%] top-[10%] animate-float" style={{ animationDelay: '0s' }}>
                            <div className="bg-[#111F35] border-t-2 border-[#FFD600] p-6 rounded-2xl shadow-2xl w-56 transform -rotate-6 animate-glow-pulse">
                                <div className="text-xs text-[#FFD600] font-bold mb-2 uppercase">Direito</div>
                                <div className="text-sm font-medium text-gray-200 text-left">Qual o prazo para impetrar Mandado de Segurança?</div>
                            </div>
                        </div>

                        <div className="absolute right-[5%] top-[15%] animate-float" style={{ animationDelay: '2s' }}>
                            <div className="bg-[#111F35] border-t-2 border-[#00E5A0] p-6 rounded-2xl shadow-2xl w-60 transform rotate-6 animate-glow-pulse">
                                <div className="text-xs text-[#00E5A0] font-bold mb-2 uppercase">Biologia ENEM</div>
                                <div className="text-sm font-medium text-gray-200 text-left">Explique a diferença entre células procariontes e eucariontes.</div>
                            </div>
                        </div>

                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:top-[10%] animate-float" style={{ animationDelay: '1s' }}>
                            <div className="bg-[#111F35] border-t-2 border-[#1A6BFF] p-8 rounded-2xl shadow-2xl w-64 md:w-80 animate-glow-pulse">
                                <div className="text-xs text-[#1A6BFF] font-bold mb-2 uppercase">Cálculo I</div>
                                <div className="text-lg font-bold text-gray-200 mb-4 italic text-left">dy/dx = ?</div>
                                <div className="pt-4 border-t border-white/5 flex gap-2">
                                    <span className="bg-[#1A6BFF]/10 text-[#1A6BFF] text-[10px] px-2 py-1 rounded">Derivadas</span>
                                    <span className="bg-white/5 text-gray-400 text-[10px] px-2 py-1 rounded">Engenharia</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STRIP DE NÚMEROS */}
            <section className="bg-[#0D1829] py-12 border-y border-white/5">
                <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
                        <span className="text-4xl font-syne font-bold text-[#FFD600]">3x</span>
                        <span className="text-gray-400 text-sm font-medium">Mais rápido que fazer<br className="hidden md:block" /> cards na mão</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
                        <span className="text-4xl font-syne font-bold text-[#00E5A0]">+50</span>
                        <span className="text-gray-400 text-sm font-medium">Formatos aceitos<br className="hidden md:block" /> PDF, Word, Imagem</span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
                        <span className="text-4xl font-syne font-bold text-[#00D4FF]">100%</span>
                        <span className="text-gray-400 text-sm font-medium">Focado no contexto<br className="hidden md:block" /> brasileiro</span>
                    </div>
                </div>
            </section>

            {/* COMO FUNCIONA */}
            <section id="como-funciona" className="py-24 md:py-32 scroll-mt-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl md:text-6xl font-syne font-bold text-center mb-24">Como funciona</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group relative bg-[#111F35] p-10 rounded-[2rem] border border-white/5 hover:border-[#1A6BFF]/50 transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-9xl font-syne font-bold text-white/[0.03] pointer-events-none">01</div>
                            <div className="w-16 h-16 bg-[#FFD600]/10 rounded-2xl flex items-center justify-center mb-8">
                                <Paperclip className="w-8 h-8 text-[#FFD600]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 font-syne">Sobe o material</h3>
                            <p className="text-gray-400 leading-relaxed text-lg">PDF da faculdade, foto do caderno ou aquele resumo gigante. Só arrastar.</p>
                        </div>

                        <div className="group relative bg-[#111F35] p-10 rounded-[2rem] border border-white/5 hover:border-[#1A6BFF]/50 transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-9xl font-syne font-bold text-white/[0.03] pointer-events-none">02</div>
                            <div className="w-16 h-16 bg-[#1A6BFF]/10 rounded-2xl flex items-center justify-center mb-8">
                                <Cpu className="w-8 h-8 text-[#1A6BFF]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 font-syne">IA gera os cards</h3>
                            <p className="text-gray-400 leading-relaxed text-lg">Nossa IA lê tudo e extrai o que é realmente importante em formato de estudo.</p>
                        </div>

                        <div className="group relative bg-[#111F35] p-10 rounded-[2rem] border border-white/5 hover:border-[#1A6BFF]/50 transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 text-9xl font-syne font-bold text-white/[0.03] pointer-events-none">03</div>
                            <div className="w-16 h-16 bg-[#00E5A0]/10 rounded-2xl flex items-center justify-center mb-8">
                                <BrainCircuit className="w-8 h-8 text-[#00E5A0]" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 font-syne">Estuda e evolui</h3>
                            <p className="text-gray-400 leading-relaxed text-lg">Pratique com repetição espaçada e veja seu progresso subindo todo dia.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FUNCIONALIDADES */}
            <section id="funcionalidades" className="py-24 md:py-32 bg-[#0D1829]/50 scroll-mt-20">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 group relative bg-[#111F35] p-10 md:p-16 rounded-[2.5rem] border border-white/5 hover:border-[#1A6BFF]/50 transition-all overflow-hidden flex flex-col md:flex-row gap-12 items-center">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1A6BFF] to-transparent opacity-50"></div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-3xl md:text-4xl font-syne font-bold mb-6">Geração inteligente de flashcards</h3>
                                <p className="text-gray-400 text-lg leading-relaxed font-medium">A tecnologia mais avançada de processamento de texto para criar perguntas e respostas que realmente testam o seu conhecimento.</p>
                            </div>
                            <div className="flex-1 relative h-48 w-full flex items-center justify-center">
                                <div className="absolute bg-[#1A6BFF] w-32 h-40 rounded-xl rotate-[-10deg] animate-float opacity-80"></div>
                                <div className="absolute bg-[#00D4FF] w-32 h-40 rounded-xl translate-x-12 translate-y-4 shadow-2xl animate-float opacity-80" style={{ animationDelay: '1s' }}></div>
                            </div>
                        </div>

                        <div className="group relative bg-[#111F35] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#1A6BFF]/50 transition-all overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD600] to-transparent opacity-50"></div>
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-3xl">🔁</div>
                            <h4 className="text-2xl font-bold mb-4 font-syne">Repetição espaçada</h4>
                            <p className="text-gray-400 text-lg leading-relaxed">Algoritmo que entende o que você está esquecendo e te mostra no momento certo.</p>
                        </div>

                        <div className="group relative bg-[#111F35] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#1A6BFF]/50 transition-all overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E5A0] to-transparent opacity-50"></div>
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-3xl text-[#00E5A0]">📊</div>
                            <h4 className="text-2xl font-bold mb-4 font-syne">Progresso em tempo real</h4>
                            <p className="text-gray-400 text-lg leading-relaxed">Dashboards detalhados para você ver exatamente onde precisa focar seus estudos.</p>
                        </div>

                        <div className="group relative bg-[#111F35] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#1A6BFF]/50 transition-all overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1A6BFF] to-transparent opacity-50"></div>
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-3xl text-[#1A6BFF]">📱</div>
                            <h4 className="text-2xl font-bold mb-4 font-syne">Web + Mobile</h4>
                            <p className="text-gray-400 text-lg leading-relaxed">Estude no computador ou no busão. Sincronização automática em todos os dispositivos.</p>
                        </div>

                        <div className="group relative bg-[#111F35] p-10 rounded-[2.5rem] border border-white/5 hover:border-[#1A6BFF]/50 transition-all overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B6B] to-transparent opacity-50"></div>
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 text-3xl text-[#FF6B6B]">👥</div>
                            <h4 className="text-2xl font-bold mb-4 font-syne">Decks compartilháveis</h4>
                            <p className="text-gray-400 text-lg leading-relaxed">Crie, colabore e compartilhe decks com seus amigos de sala ou colegas de estudo.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* PREÇOS */}
            <section id="precos" className="py-24 md:py-32 scroll-mt-20">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl md:text-6xl font-syne font-bold text-center mb-24">Preços para todos</h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-5xl mx-auto">
                        <div className="w-full bg-[#111F35] p-12 rounded-[3.5rem] border border-white/5 flex flex-col items-center text-center hover:border-white/10 transition-colors">
                            <span className="text-gray-500 font-bold mb-6 uppercase tracking-[0.2em] text-xs">Acesso Básico</span>
                            <div className="text-6xl font-syne font-bold mb-10 text-white flex items-baseline">
                                R$0<span className="text-xl text-gray-500 font-medium ml-2">/mês</span>
                            </div>
                            <ul className="space-y-5 mb-12 w-full text-left max-w-xs mx-auto">
                                <li className="flex items-center gap-4 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-700" /> 50 cards sugeridos/mês</li>
                                <li className="flex items-center gap-4 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-700" /> 3 decks personalizados</li>
                                <li className="flex items-center gap-4 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-700" /> Revisão inteligente</li>
                                <li className="flex items-center gap-4 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-700" /> App Web + Mobile</li>
                            </ul>
                            <Link to="/cadastro" className="w-full py-5 px-8 border border-white/10 hover:bg-white/5 rounded-2xl font-bold transition-all text-lg">Começar grátis</Link>
                        </div>

                        <div className="w-full bg-[#1A6BFF] p-12 rounded-[3.5rem] shadow-[0_0_60px_rgba(26,107,255,0.3)] transform md:scale-110 relative overflow-hidden flex flex-col items-center text-center">
                            <div className="absolute top-0 right-0 bg-white text-[#1A6BFF] text-[10px] font-black px-10 py-2 rotate-45 translate-x-8 translate-y-6">ILIMITADO</div>
                            <span className="text-blue-100 font-bold mb-6 uppercase tracking-[0.2em] text-xs">Experiência Pro</span>
                            <div className="text-6xl font-syne font-bold mb-10 text-white flex items-baseline">
                                R$19<span className="text-xl text-blue-100 font-medium ml-2">/mês</span>
                            </div>
                            <ul className="space-y-5 mb-12 w-full text-left max-w-xs mx-auto">
                                <li className="flex items-center gap-4 text-white font-medium"><CheckCircle2 className="w-5 h-5 text-blue-200" /> Cards gerados ilimitados</li>
                                <li className="flex items-center gap-4 text-white font-medium"><CheckCircle2 className="w-5 h-5 text-blue-200" /> Upload de PDF ilimitado</li>
                                <li className="flex items-center gap-4 text-white font-medium"><CheckCircle2 className="w-5 h-5 text-blue-200" /> Dashboard de performance</li>
                                <li className="flex items-center gap-4 text-white font-medium"><CheckCircle2 className="w-5 h-5 text-blue-200" /> Prioridade na fila de IA</li>
                            </ul>
                            <Link to="/cadastro" className="w-full py-5 px-8 bg-white text-[#1A6BFF] rounded-2xl font-black transition-all hover:shadow-2xl hover:scale-[1.03] text-lg">Assinar Pro</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-24 container mx-auto px-6">
                <div className="relative bg-grad-blue rounded-[3.5rem] p-12 md:p-28 overflow-hidden shadow-2xl">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="relative z-10 text-center flex flex-col items-center">
                        <h2 className="text-4xl md:text-7xl font-syne font-extrabold mb-10 leading-tight text-white italic">Seja o primeiro a usar o Flipei.</h2>
                        <p className="text-xl md:text-2xl text-blue-50 mb-14 max-w-3xl font-medium opacity-90 leading-relaxed">Participe da lista de acesso antecipado e ganhe 3 meses de Pro grátis no lançamento oficial.</p>

                        <div className="w-full max-w-lg flex flex-col sm:flex-row gap-4">
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-5 outline-none placeholder:text-blue-100 focus:bg-white/20 focus:border-white/40 transition-all text-white text-lg font-medium"
                            />
                            <button
                                onClick={() => navigate('/cadastro')}
                                className="bg-white text-[#1A6BFF] px-10 py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                Quero entrar <ArrowRight className="w-6 h-6" />
                            </button>

                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-16 border-t border-white/5 bg-[#0D1829]/30">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
                        <span className="text-2xl font-bold flex items-center font-syne">
                            🃏 Flip<span className="text-[#00D4FF]">ei</span>
                        </span>
                        <div className="text-gray-500 text-sm font-medium italic">© 2025 Flipei · Estudo inteligente feito no Brasil 🇧🇧</div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-10 md:gap-16">
                        <div className="flex flex-col gap-4 text-center md:text-left">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Produto</span>
                            <a href="#como-funciona" className="text-gray-500 hover:text-[#00D4FF] transition-colors text-sm font-medium">Como funciona</a>
                            <a href="#funcionalidades" className="text-gray-500 hover:text-[#00D4FF] transition-colors text-sm font-medium">Funcionalidades</a>
                            <a href="#precos" className="text-gray-500 hover:text-[#00D4FF] transition-colors text-sm font-medium">Preços</a>
                        </div>
                        <div className="flex flex-col gap-4 text-center md:text-left">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Legal</span>
                            <Link to="/privacidade" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Privacidade</Link>
                            <Link to="/termos" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Termos</Link>
                        </div>
                        <div className="flex flex-col gap-4 text-center md:text-left">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Social</span>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Instagram</a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm font-medium">Twitter</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}