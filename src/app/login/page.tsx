"use client"

import { useState } from "react"
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"

export default function LoginCPF() {
  const [cpf, setCpf] = useState("")
  const [senha, setSenha] = useState("")
  const [showSenha, setShowSenha] = useState(false)
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

  function handleChangeCpf(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCPF(e.target.value))
  }

  async function handleLogin() {
    const cpfNumerico = cpf.replace(/\D/g, "")
    if (loading || cpfNumerico.length !== 11 || !senha) return

    setLoading(true)
    setMessage("")

    try {
      const result = await signIn("credentials", {
        cpf: cpfNumerico,
        senha,
        redirect: false,
      })

      if (result?.error) {
        setMessage("CPF ou senha incorretos")
        return
      }

      route.push("/feed")
    } catch (error) {
      console.error(error)
      setMessage("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 md:px-6" style={{ backgroundColor: 'var(--background)' }}>

      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-sm md:max-w-md rounded-lg md:rounded-2xl shadow-lg p-6 md:p-8 space-y-5 md:space-y-6"
        style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}
      >

        <div className="flex items-center gap-2 md:gap-3 pb-3 md:pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg" style={{ backgroundColor: 'var(--primary-dark)' }}>D</div>
          <span className="font-semibold text-base md:text-lg" style={{ color: 'var(--black)' }}>Dikma</span>
        </div>

        <div className="space-y-1 md:space-y-2">
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--black)' }}>
            Bem-vindo de volta
          </h1>
          <p style={{ color: 'var(--gray)' }} className="text-xs md:text-sm">
            Faça login com seu CPF e senha para acessar
          </p>
        </div>

        <div className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: 'var(--black)' }}>CPF</label>
            <div className="flex items-center px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl transition" style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)` }}>
              <ShieldCheck size={16} className="md:w-[18px] md:h-[18px]" style={{ color: 'var(--secondary)' }} />
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleChangeCpf}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin()
                  }
                }}
                className="w-full bg-transparent outline-none ml-2 md:ml-3 text-sm"
                style={{ color: 'var(--black)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: 'var(--black)' }}>Senha</label>
            <div className="flex items-center px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl transition" style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)` }}>
              <Lock size={16} className="md:w-[18px] md:h-[18px]" style={{ color: 'var(--secondary)' }} />
              <input
                type={showSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin()
                  }
                }}
                className="w-full bg-transparent outline-none ml-2 md:ml-3 text-sm"
                style={{ color: 'var(--black)' }}
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="ml-2"
              >
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || cpf.replace(/\D/g, "").length !== 11 || !senha}
            className="w-full py-2.5 md:py-3 rounded-lg md:rounded-xl text-white font-medium text-sm md:text-base transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: loading || cpf.replace(/\D/g, "").length !== 11 || !senha ? 'var(--gray)' : 'var(--primary-dark)' }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>

        {message && (
          <div className="text-center text-xs md:text-sm rounded-lg md:rounded-xl p-3" style={{ 
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