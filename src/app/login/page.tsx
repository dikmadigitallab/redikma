"use client"

import { useState } from "react"
import { Phone, ShieldCheck, Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function LoginTelefone() {
  const [mode, setMode] = useState<"phone" | "email">("phone")

  const [step, setStep] = useState<"phone" | "code" | "success">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const route = useRouter()

  function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  function sendCode() {
    setLoading(true)
    setMessage("")

    setTimeout(() => {
      const newCode = generateCode()
      setGeneratedCode(newCode)

      setStep("code")
      setLoading(false)
      setMessage("Código enviado")
    }, 1200)
  }

  function verifyCode() {
    setLoading(true)
    setMessage("")

    setTimeout(() => {
      if (code === generatedCode) {
        route.push("/feed")
      } else {
        setMessage("Código inválido")
        route.push("/error")
      }
      setLoading(false)
    }, 1200)
  }

  function loginEmail() {
    setLoading(true)
    setMessage("")

    setTimeout(() => {
      if (email === "admin@dikma.com" && password === "123456") {
        route.push("/feed")
      } else {
        setMessage("Email ou senha inválidos")
        route.push("/error")
      }
      setLoading(false)
    }, 1200)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#E5E7EB] px-4">

      {/* Background blur estilo imagem */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[28px] shadow-2xl p-8 space-y-6"
      >

        {/* Logo */}
        <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400" />
          Dikma
        </div>

        {/* Título */}
        <h1 className="text-xl font-semibold text-gray-700">
          Faça o seu login
        </h1>

        {/* Switch */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => {
              setMode("phone")
              setStep("phone")
              setMessage("")
            }}
            className={`w-1/2 py-2 text-sm rounded-lg transition ${
              mode === "phone"
                ? "bg-white shadow text-gray-700"
                : "text-gray-400"
            }`}
          >
            Telefone
          </button>

          <button
            onClick={() => {
              setMode("email")
              setMessage("")
            }}
            className={`w-1/2 py-2 text-sm rounded-lg transition ${
              mode === "email"
                ? "bg-white shadow text-gray-700"
                : "text-gray-400"
            }`}
          >
            Email
          </button>
        </div>

        <AnimatePresence mode="wait">

          {/* TELEFONE */}
          {mode === "phone" && step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <p className="text-sm text-gray-600 mb-1">Seu telefone</p>
                <div className="flex items-center border border-gray-200 focus-within:border-teal-400 rounded-xl px-4 py-3 bg-white transition">
                  <Phone size={18} className="text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Digite seu telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent outline-none ml-3 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={sendCode}
                disabled={loading || phone.length < 10}
                className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 to-teal-400 shadow-md hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar código"}
              </button>
            </motion.div>
          )}

          {/* CÓDIGO */}
          {mode === "phone" && step === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <p className="text-sm text-gray-600 mb-1">Código</p>
                <div className="flex items-center border border-gray-200 focus-within:border-teal-400 rounded-xl px-4 py-3 bg-white transition">
                  <ShieldCheck size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Digite o código"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-transparent outline-none ml-3 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 to-teal-400 shadow-md hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Confirmar código"}
              </button>

              <button
                onClick={sendCode}
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                Reenviar código
              </button>
            </motion.div>
          )}

          {/* EMAIL */}
          {mode === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <p className="text-sm text-gray-600 mb-1">Seu e-mail</p>
                <div className="flex items-center border border-gray-200 focus-within:border-teal-400 rounded-xl px-4 py-3 bg-white transition">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none ml-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Sua senha</p>
                <div className="flex items-center border border-gray-200 focus-within:border-teal-400 rounded-xl px-4 py-3 bg-white transition">
                  <Lock size={18} className="text-gray-400" />
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none ml-3 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <input type="checkbox" className="accent-teal-500" />
                Lembrar-me
              </div>

              <button
                onClick={loginEmail}
                disabled={loading || !email || !password}
                className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 to-teal-400 shadow-md hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Esqueceu sua senha?{" "}
                <span className="underline cursor-pointer">
                  Clique aqui
                </span>
              </p>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Mensagem */}
        {message && (
          <p className="text-center text-sm text-gray-500">
            {message}
          </p>
        )}

        {/* Código mock */}
        {generatedCode && mode === "phone" && step === "code" && (
          <p className="text-xs text-gray-400 text-center">
            Código: {generatedCode}
          </p>
        )}

      </motion.div>
    </main>
  )
}