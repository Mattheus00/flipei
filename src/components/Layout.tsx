import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    Library,
    PlusCircle,
    Settings as SettingsIcon,
    BarChart2,
    Menu,
    X,
    Bell,
    LogOut
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useAuth } from '../contexts/AuthContext'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface LayoutProps {
    children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation()
    const { user, signOut } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Meus Decks', href: '/decks', icon: Library },
        { name: 'Gerar Cards', href: '/generate', icon: PlusCircle },
        { name: 'Meu Progresso', href: '/progress', icon: BarChart2 },
        { name: 'Configurações', href: '/settings', icon: SettingsIcon },
    ]

    const userFullName = user?.user_metadata?.full_name || 'Estudante'
    const userInitials = userFullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

    return (
        <div className="min-h-screen bg-[#080F1E] text-white font-dm">
            {/* Sidebar for Desktop */}
            <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-white/5 bg-[#0D1829] lg:flex z-50">
                <div className="flex h-24 items-center px-8">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold font-syne tracking-tight">
                            🃏 Flip<span className="text-[#00D4FF]">ei</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-2 px-4 py-6">
                    <div className="px-4 mb-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Menu Principal</div>
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all group",
                                    isActive
                                        ? "bg-[#1A6BFF] text-white shadow-[0_10px_20px_rgba(26,107,255,0.2)]"
                                        : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300")} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 space-y-2">
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-600 hover:bg-red-500/10 hover:text-red-400 transition-all group"
                    >
                        <LogOut className="h-5 w-5" />
                        Sair da conta
                    </button>

                    <div className="bg-[#111F35] rounded-2xl p-4 flex items-center gap-3 border border-white/5">
                        <div className="h-10 w-10 rounded-xl bg-grad-blue flex items-center justify-center font-black text-white shadow-lg text-sm italic">
                            {userInitials}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-bold truncate">{userFullName}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Membro Flipei</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Header and Mobile Nav */}
            <div className="lg:pl-72">
                <header className="sticky top-0 z-40 border-b border-white/5 bg-[#080F1E]/80 backdrop-blur-xl">
                    <div className="flex h-20 items-center justify-between px-6 lg:px-10">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-400 hover:text-white lg:hidden"
                        >
                            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>

                        <div className="hidden lg:flex items-center gap-2">
                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">
                                App / {navigation.find(n => n.href === location.pathname)?.name || 'Página'}
                            </div>
                        </div>

                        <div className="flex-1 lg:hidden flex justify-center">
                            <Link to="/" className="flex items-center gap-2">
                                <span className="text-xl font-bold font-syne tracking-tight">
                                    🃏 Flip<span className="text-[#00D4FF]">ei</span>
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => alert('Feature em desenvolvimento: Em breve você receberá notificações sobre seus estudos!')}
                                className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-colors relative group"
                            >
                                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-[#FF6B6B] rounded-full border-2 border-[#080F1E]"></span>
                            </button>
                            <div className="h-10 w-10 rounded-full bg-white/10 p-0.5 lg:hidden overflow-hidden ring-2 ring-white/5">
                                <div className="h-full w-full rounded-full bg-grad-blue flex items-center justify-center text-xs font-black italic">
                                    {userInitials}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md lg:hidden animate-fade-in" onClick={() => setIsMobileMenuOpen(false)}>
                        <nav
                            className="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-[#0D1829] p-8 shadow-2xl animate-slide-right flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-12">
                                <span className="text-2xl font-bold font-syne tracking-tight">
                                    🃏 Flip<span className="text-[#00D4FF]">ei</span>
                                </span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-white p-2 -mr-2 transition-colors">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-4">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 rounded-2xl px-6 py-4 text-lg font-bold transition-all",
                                                isActive
                                                    ? "bg-[#1A6BFF] text-white shadow-xl"
                                                    : "text-gray-500 hover:text-white"
                                            )}
                                        >
                                            <item.icon className="h-6 w-6" />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-6">
                                <div className="flex items-center gap-4 px-2">
                                    <div className="h-12 w-12 rounded-2xl bg-grad-blue flex items-center justify-center font-black italic">{userInitials}</div>
                                    <div>
                                        <div className="font-bold">{userFullName}</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Membro Premium</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 text-red-400 font-black uppercase text-xs tracking-widest"
                                >
                                    <LogOut className="h-4 w-4" /> Sair
                                </button>
                            </div>
                        </nav>
                    </div>
                )}

                {/* Main Content */}
                <main className="p-6 lg:p-10">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slide-right {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-right {
                    animation: slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    )
}