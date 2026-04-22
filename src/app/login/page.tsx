"use client"

import { useState } from "react"
import { Phone, ShieldCheck, Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function Login() {
  const router = useRouter()

  const [mode, setMode] = useState<"phone" | "cpf">("phone")
  const [step, setStep] = useState<"phone" | "code" | "success">("phone")

  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")

  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

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
<<<<<<< HEAD
        setStep("success")
        setMessage("Login realizado com sucesso")
        router.push("/feed")
=======
        route.push("/feed")
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
      } else {
        setMessage("Código inválido")
        router.push("/error")
      }
      setLoading(false)
    }, 1200)
  }

  function loginCpf() {
    setLoading(true)
    setMessage("")

    setTimeout(() => {
<<<<<<< HEAD
      if (!cpf) {
        setMessage("Informe o CPF")
        setLoading(false)
        return
=======
      if (email === "admin@dikma.com" && password === "123456") {
        route.push("/feed")
      } else {
        setMessage("Email ou senha inválidos")
        route.push("/error")
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
      }

      if (password === "123456") {
        setMessage("Login realizado com sucesso")
        router.push("/feed")
      } else {
        setMessage("Senha inválida")
        router.push("/error")
      }

      setLoading(false)
    }, 1200)
  }

  return (
<<<<<<< HEAD
    <main className="min-h-[100dvh] flex items-start justify-center bg-[#E5E7EB] px-4 pt-10 pb-20">
      <div className="w-full max-w-sm sm:max-w-md bg-white/70 backdrop-blur-xl rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400" />
=======
    <main className="min-h-screen flex items-center justify-center bg-[#E5E7EB] px-4">

      {/* Background blur estilo imagem */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529336953121-ad5a0d43d0d2')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 backdrop-blur-sm" />
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3

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

<<<<<<< HEAD
        {/* TOGGLE */}
=======
        {/* Título */}
        <h1 className="text-xl font-semibold text-gray-700">
          Faça o seu login
        </h1>

        {/* Switch */}
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => {
              setMode("phone")
              setStep("phone")
              setMessage("")
            }}
<<<<<<< HEAD
            className={`w-1/2 py-2 text-sm rounded-lg ${
=======
            className={`w-1/2 py-2 text-sm rounded-lg transition ${
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
              mode === "phone"
                ? "bg-white shadow text-gray-700"
                : "text-gray-400"
            }`}
          >
            Telefone
          </button>

          <button
            onClick={() => {
              setMode("cpf")
              setMessage("")
            }}
<<<<<<< HEAD
            className={`w-1/2 py-2 text-sm rounded-lg ${
              mode === "cpf"
=======
            className={`w-1/2 py-2 text-sm rounded-lg transition ${
              mode === "email"
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
                ? "bg-white shadow text-gray-700"
                : "text-gray-400"
            }`}
          >
            CPF
          </button>
        </div>

<<<<<<< HEAD
        {/* TELEFONE */}
        {mode === "phone" && step === "phone" && (
          <div className="space-y-4">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <Phone size={18} className="text-gray-400" />
              <input
                type="tel"
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent outline-none ml-3 text-sm"
              />
            </div>

            <button
              onClick={sendCode}
              disabled={loading || phone.length < 10}
              className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 via-green-400 to-teal-500 disabled:opacity-50"
=======
        <AnimatePresence mode="wait">

          {/* TELEFONE */}
          {mode === "phone" && step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
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

<<<<<<< HEAD
        {mode === "phone" && step === "code" && (
          <div className="space-y-4">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <ShieldCheck size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-transparent outline-none ml-3 text-sm"
              />
            </div>

            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 via-green-400 to-teal-500 disabled:opacity-50"
=======
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
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
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

<<<<<<< HEAD
        {/* CPF */}
        {mode === "cpf" && (
          <div className="space-y-4">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <Mail size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full bg-transparent outline-none ml-3 text-sm"
              />
            </div>

            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none ml-3 text-sm"
              />
            </div>

            <button
              onClick={loginCpf}
              disabled={loading || !cpf || !password}
              className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 via-green-400 to-teal-500 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Mock: qualquer CPF + senha 123456
            </p>
          </div>
        )}

        {/* DEBUG MOCK */}
        {generatedCode && mode === "phone" && step === "code" && (
          <p className="text-xs text-gray-400 text-center">
            Código mock: {generatedCode}
          </p>
        )}

        {/* MESSAGE */}
=======
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
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
        {message && (
          <p className="text-center text-sm text-gray-500">
            {message}
          </p>
        )}

<<<<<<< HEAD
      </div>
=======
        {/* Código mock */}
        {generatedCode && mode === "phone" && step === "code" && (
          <p className="text-xs text-gray-400 text-center">
            Código: {generatedCode}
          </p>
        )}

      </motion.div>
>>>>>>> 0ff67f6d8b8707f612bd6cc2f091cd9b728db8d3
    </main>
  )
}