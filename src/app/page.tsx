"use client"

import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {

  const route = useRouter()
  return (
    <main style={{ backgroundColor: 'var(--background)', color: 'var(--black)' }} className="min-h-screen">

      {/* Header Navigation */}
      <header className="fixed top-0 w-full z-50" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--primary-dark)' }}>D</div>
            <span style={{ color: 'var(--primary-dark)' }}>Dikma</span>
          </div>
          <button
            onClick={() => route.push('/login')}
            className="px-6 py-2 rounded-lg font-medium transition"
            style={{ backgroundColor: 'var(--primary-dark)', color: 'var(--white)' }}
          >
            Entrar
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32 pt-40">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6" style={{ backgroundColor: 'var(--secondary)' }}>D</div>

        <h1 className="text-4xl sm:text-5xl font-bold max-w-2xl leading-tight">
          Conecte-se com sua equipe
        </h1>

        <p className="mt-4 text-lg max-w-xl" style={{ color: 'var(--gray)' }}>
          Uma plataforma segura e moderna para comunicação interna, engajamento e colaboração em sua organização.
        </p>

        <div className="flex gap-4 mt-8 flex-col sm:flex-row">
          <button 
            onClick={() => route.push('/login')}
            className="px-8 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-dark)' }}
          >
            Começar agora <ArrowRight size={16} />
          </button>

          <button className="px-8 py-3 rounded-xl font-medium transition" style={{ backgroundColor: 'var(--background)', border: `2px solid var(--primary-dark)`, color: 'var(--primary-dark)' }}>
            Saiba mais
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {[
          {
            title: "Compartilhe conteúdos",
            desc: "Publique notícias, atualizações e momentos importantes com segurança.",
            icon: "📝"
          },
          {
            title: "Engajamento em tempo real",
            desc: "Interaja através de curtidas, comentários e reações com seus colegas.",
            icon: "💬"
          },
          {
            title: "Gestão centralizada",
            desc: "Administradores controlam conteúdo, usuários e automações facilmente.",
            icon: "⚙️"
          },
          {
            title: "Segurança de dados",
            desc: "Conformidade LGPD e proteção total de informações sensíveis.",
            icon: "🔒"
          },
          {
            title: "Monitoramento de clima",
            desc: "Acompanhe o humor e bem-estar dos colaboradores diariamente.",
            icon: "😊"
          },
          {
            title: "Automações inteligentes",
            desc: "Postagens automáticas para aniversários, promoções e eventos.",
            icon: "✨"
          }
        ].map((item, i) => (
          <div key={i} className="rounded-xl p-6 transition hover:shadow-md" style={{ backgroundColor: 'var(--white)', border: `1px solid var(--border)` }}>
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-lg" style={{ color: 'var(--black)' }}>{item.title}</h3>
            <p className="text-sm mt-2" style={{ color: 'var(--gray)' }}>{item.desc}</p>
          </div>
        ))}

      </section>

      {/* Stats */}
      <section className="px-6 py-16 max-w-6xl mx-auto grid gap-6 sm:grid-cols-3">
        {[
          { number: "100%", label: "Seguro e conformável" },
          { number: "24/7", label: "Suporte disponível" },
          { number: "∞", label: "Escalável" }
        ].map((stat, i) => (
          <div key={i} className="text-center rounded-xl p-8" style={{ backgroundColor: 'var(--white)', border: `1px solid var(--border)` }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--primary-dark)' }}>{stat.number}</div>
            <p className="mt-2 text-sm" style={{ color: 'var(--gray)' }}>{stat.label}</p>
          </div>
        ))}
      </section>

      {/* CTA Final */}
      <section className="px-6 py-20 text-center flex flex-col items-center" style={{ backgroundColor: 'var(--primary-dark)' }}>
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Pronto para transformar sua comunicação?
        </h2>

        <p className="text-white/80 mt-3 max-w-xl">
          Comece sua jornada com a plataforma número 1 de engajamento corporativo.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md">

          <button 
            onClick={() => route.push('/login')}
            className="w-full py-3 rounded-xl text-white font-medium transition hover:opacity-90"
            style={{ backgroundColor: 'var(--secondary)' }}
          >
            Acessar plataforma
          </button>

          <button
            className="w-full py-3 rounded-xl text-white font-medium transition hover:opacity-90"
            style={{ backgroundColor: 'var(--warning)' }}
          >
            Solicitar demo
          </button>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-8" style={{ color: 'var(--gray)', borderTop: `1px solid var(--border)` }}>
        © 2026 Dikma - Plataforma de Engajamento Corporativo
      </footer>

    </main>
  )
}
