"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {

  const route = useRouter()
  return (
    <main style={{ backgroundColor: 'var(--background)', color: 'var(--black)' }} className="min-h-screen">

      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50 h-14 md:h-16" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <nav className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg md:text-xl">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white text-sm md:text-base" style={{ backgroundColor: 'var(--primary-dark)' }}>D</div>
            <span className="hidden sm:inline" style={{ color: 'var(--primary-dark)' }}>Dikma</span>
          </div>
          <button
            onClick={() => route.push('/login')}
            className="px-4 md:px-6 py-2 rounded-lg font-medium text-sm md:text-base transition"
            style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--white)' }}
          >
            Entrar
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 md:px-6 py-20 md:py-32 pt-20 md:pt-40">
        <div className="w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ backgroundColor: 'var(--secondary)' }}>D</div>

        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold max-w-2xl leading-tight">
          Conecte-se com sua equipe
        </h1>

        <p className="mt-3 md:mt-4 text-sm md:text-lg max-w-xl" style={{ color: 'var(--gray)' }}>
          Plataforma segura e moderna para comunicação interna e engajamento.
        </p>

        <div className="flex gap-3 md:gap-4 mt-6 md:mt-8 flex-col sm:flex-row w-full max-w-xs md:max-w-md">
          <button 
            onClick={() => route.push('/login')}
            className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-white font-medium text-sm md:text-base flex items-center justify-center gap-2 transition hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-dark)' }}
          >
            Começar agora <ArrowRight size={16} className="hidden md:inline" />
          </button>

          <button className="px-6 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl font-medium text-sm md:text-base transition" style={{ backgroundColor: 'var(--background)', border: `2px solid var(--primary-dark)`, color: 'var(--primary-dark)' }}>
            Saiba mais
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 md:px-6 py-12 md:py-20 max-w-6xl mx-auto grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {[
          {
            title: "Compartilhe conteúdos",
            desc: "Publique notícias e atualizações com segurança.",
            icon: "📝"
          },
          {
            title: "Engajamento",
            desc: "Curtidas, comentários e reações em tempo real.",
            icon: "💬"
          },
          {
            title: "Gestão centralizada",
            desc: "Administradores controlam conteúdo facilmente.",
            icon: "⚙️"
          },
          {
            title: "Segurança",
            desc: "Conformidade LGPD e proteção total.",
            icon: "🔒"
          },
          {
            title: "Clima organizacional",
            desc: "Monitore o bem-estar dos colaboradores.",
            icon: "😊"
          },
          {
            title: "Automações",
            desc: "Postagens automáticas e inteligentes.",
            icon: "✨"
          }
        ].map((item, i) => (
          <div key={i} className="rounded-lg md:rounded-xl p-4 md:p-6 transition hover:shadow-md" style={{ backgroundColor: 'var(--white)', border: `1px solid var(--border)` }}>
            <div className="text-2xl md:text-3xl mb-2 md:mb-3">{item.icon}</div>
            <h3 className="font-semibold text-sm md:text-lg" style={{ color: 'var(--black)' }}>{item.title}</h3>
            <p className="text-xs md:text-sm mt-1 md:mt-2" style={{ color: 'var(--gray)' }}>{item.desc}</p>
          </div>
        ))}

      </section>

      {/* Stats */}
      <section className="px-4 md:px-6 py-12 md:py-16 max-w-6xl mx-auto grid gap-4 md:gap-6 sm:grid-cols-3">
        {[
          { number: "100%", label: "Seguro" },
          { number: "24/7", label: "Suporte" },
          { number: "∞", label: "Escalável" }
        ].map((stat, i) => (
          <div key={i} className="text-center rounded-lg md:rounded-xl p-4 md:p-8" style={{ backgroundColor: 'var(--white)', border: `1px solid var(--border)` }}>
            <div className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--primary-dark)' }}>{stat.number}</div>
            <p className="mt-1 md:mt-2 text-xs md:text-sm" style={{ color: 'var(--gray)' }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* CTA Final */}
      <section className="px-4 md:px-6 py-12 md:py-20 text-center flex flex-col items-center" style={{ backgroundColor: 'var(--primary-dark)' }}>
        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white">
          Pronto para transformar sua comunicação?
        </h2>

        <p className="text-white/80 mt-2 md:mt-3 max-w-xl text-sm md:text-base">
          Comece sua jornada com a plataforma de engajamento corporativo.
        </p>

        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 w-full max-w-xs md:max-w-md">

          <button 
            onClick={() => route.push('/login')}
            className="w-full py-2.5 md:py-3 rounded-lg md:rounded-xl text-white font-medium text-sm md:text-base transition hover:opacity-90"
            style={{ backgroundColor: 'var(--secondary)' }}
          >
            Acessar plataforma
          </button>

          <button
            className="w-full py-2.5 md:py-3 rounded-lg md:rounded-xl text-white font-medium text-sm md:text-base transition hover:opacity-90"
            style={{ backgroundColor: 'var(--warning)' }}
          >
            Solicitar demo
          </button>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs md:text-sm py-6 md:py-8" style={{ color: 'var(--gray)', borderTop: `1px solid var(--border)` }}>
        © 2026 Dikma - Plataforma Corporativa
      </footer>

    </main>
  )
}
