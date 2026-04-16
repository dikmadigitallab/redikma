"use client"

import { motion } from "framer-motion"
import { Users, MessageCircle, BarChart3, ShieldCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white">

      {/* HERO */}
      <section className="px-6 py-20 max-w-7xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-bold"
        >
          Comunicação interna mais simples e eficiente
        </motion.h1>

        <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
          Uma plataforma completa para engajamento de colaboradores, gestão de comunicação e integração do RH em um único ambiente.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-teal-500 text-black font-medium">
            Começar agora
          </button>

          <button className="px-6 py-3 rounded-xl border border-gray-600">
            Ver demonstração
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16 max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white/5 rounded-2xl p-6 space-y-3">
          <Users className="text-teal-400" />
          <h3 className="font-semibold">Engajamento</h3>
          <p className="text-sm text-gray-400">
            Curtidas, comentários e interações para fortalecer a cultura interna.
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 space-y-3">
          <MessageCircle className="text-teal-400" />
          <h3 className="font-semibold">Comunicação</h3>
          <p className="text-sm text-gray-400">
            Postagens automáticas e comunicados institucionais centralizados.
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 space-y-3">
          <BarChart3 className="text-teal-400" />
          <h3 className="font-semibold">Métricas</h3>
          <p className="text-sm text-gray-400">
            Dashboard com dados de visualizações e engajamento.
          </p>
        </div>

        <div className="bg-white/5 rounded-2xl p-6 space-y-3">
          <ShieldCheck className="text-teal-400" />
          <h3 className="font-semibold">Segurança</h3>
          <p className="text-sm text-gray-400">
            Controle de acesso e proteção de dados conforme LGPD.
          </p>
        </div>

      </section>

      {/* SOBRE */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-4xl font-bold">
          Tudo que sua empresa precisa em um só lugar
        </h2>

        <p className="mt-4 text-gray-400">
          Gestão de usuários, automações de RH, histórico de promoções e interação social em uma única plataforma integrada.
        </p>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 pb-20 max-w-7xl mx-auto text-center">
        <div className="bg-gradient-to-r from-yellow-400 to-teal-500 rounded-3xl p-10 text-black">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Pronto para transformar sua comunicação interna?
          </h2>

          <button className="mt-6 px-6 py-3 bg-black text-white rounded-xl">
            Criar conta
          </button>
        </div>
      </section>

    </main>
  )
}