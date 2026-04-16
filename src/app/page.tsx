"use client"

import { ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#E5E7EB] text-gray-800">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 bg-white/70 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400 mb-6" />

        <h1 className="text-3xl sm:text-5xl font-bold max-w-2xl">
          Conecte-se, compartilhe e descubra novas experiências
        </h1>

        <p className="mt-4 text-gray-600 max-w-xl">
          Uma nova forma de interagir com pessoas, conteúdos e ideias em um só lugar.
        </p>

        <div className="flex gap-4 mt-6">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-teal-500 text-white font-medium flex items-center gap-2">
            Começar agora <ArrowRight size={16} />
          </button>

          <button className="px-6 py-3 rounded-xl bg-white shadow text-gray-700">
            Saiba mais
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        
        {[ 
          {
            title: "Compartilhe momentos",
            desc: "Publique fotos, vídeos e atualizações com facilidade."
          },
          {
            title: "Interaja em tempo real",
            desc: "Converse, comente e conecte-se com outras pessoas."
          },
          {
            title: "Descubra conteúdos",
            desc: "Explore tendências e conteúdos personalizados."
          }
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-yellow-400 to-teal-400 mb-4" />
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
          </div>
        ))}

      </section>

      {/* Preview */}
      <section className="px-6 py-16 bg-white/70 backdrop-blur-xl text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
          Experiência moderna e intuitiva
        </h2>

        <div className="mx-auto w-full max-w-md h-[500px] rounded-[32px] bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner flex items-center justify-center">
          <span className="text-gray-500">Preview do app</span>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-4xl font-bold">
          Pronto para começar?
        </h2>

        <p className="text-gray-600 mt-3">
          Crie sua conta e comece agora mesmo.
        </p>

        <button className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-teal-500 text-white font-medium">
          Criar conta
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6">
        © 2026 Sua plataforma
      </footer>

    </main>
  )
}