"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function LoginCPF() {
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const route = useRouter()

  function formatCPF(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCPF(e.target.value))
  }

async function handleLogin() {
  setLoading(true)
  setMessage("")

  try {
    const res = await fetch("/api/autenticar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cpf }),
    })

    const data = await res.json()

    if (!res.ok) {
      setMessage(data.error || "Erro ao fazer login")
      return
    }

    // ✅ login ok → cookie já foi salvo no backend
    route.push("/feed")

  } catch (error) {
    console.error(error)
    setMessage("Erro de conexão")
  } finally {
    setLoading(false)
  }
}
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--background)' }}>

      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6"
        style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}
      >

        {/* Logo */}
        <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--primary-dark)' }}>D</div>
          <span className="font-semibold text-lg" style={{ color: 'var(--black)' }}>Dikma</span>
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--black)' }}>
            Bem-vindo de volta
          </h1>
          <p style={{ color: 'var(--gray)' }} className="text-sm">
            Faça login com seu CPF para acessar a plataforma
          </p>
        </div>

        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--black)' }}>Seu CPF</label>
            <div className="flex items-center px-4 py-3 rounded-xl transition" style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)` }}>
              <ShieldCheck size={18} style={{ color: 'var(--secondary)' }} />
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleChange}
                className="w-full bg-transparent outline-none ml-3 text-sm"
                style={{ color: 'var(--black)' }}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || cpf.replace(/\D/g, "").length !== 11}
            className="w-full py-3 rounded-xl text-white font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: loading || cpf.replace(/\D/g, "").length !== 11 ? 'var(--gray)' : 'var(--primary-dark)' }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        {/* Mensagem de erro ou sucesso */}
        {message && (
          <div className="text-center text-sm rounded-xl p-3" style={{ 
            backgroundColor: message.includes('Erro') ? '#FFE5E5' : '#E8F5E9',
            color: message.includes('Erro') ? 'var(--black)' : 'var(--success)',
            border: `1px solid ${message.includes('Erro') ? 'var(--border)' : 'var(--success)'}`
          }}>
            {message}
          </div>
        )}

      </motion.div>
    </main>
  )
}
