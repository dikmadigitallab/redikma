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
    <main className="min-h-screen flex items-center justify-center bg-[#E5E7EB] px-4">

      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[28px] shadow-2xl p-8 space-y-6"
      >

        <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400" />
          Dikma
        </div>

        <h1 className="text-xl font-semibold text-gray-700">
          Login com CPF
        </h1>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Seu CPF</p>
            <div className="flex items-center border border-gray-200 focus-within:border-teal-400 rounded-xl px-4 py-3 bg-white transition">
              <ShieldCheck size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleChange}
                className="w-full bg-transparent outline-none ml-3 text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || cpf.replace(/\D/g, "").length !== 11}
            className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 to-teal-400 shadow-md hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        {message && (
          <p className="text-center text-sm text-gray-500">
            {message}
          </p>
        )}

      </motion.div>
    </main>
  )
}