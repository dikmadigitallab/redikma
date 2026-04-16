"use client"

import { useState } from "react"
import { Phone, ShieldCheck, Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

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

      console.log("Código mock enviado:", newCode)

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
        setStep("success")
        route.push("/feed")
        setMessage("Login realizado com sucesso")
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
      // mock simples
      if (email === "admin@dikma.com" && password === "123456") {
        route.push("/feed")
        setMessage("Login realizado com sucesso")
      } else {
        setMessage("Email ou senha inválidos")
        route.push("/error")
      }
      setLoading(false)
    }, 1200)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#E5E7EB] px-4">
      <div className="w-full max-w-sm sm:max-w-md bg-white/70 backdrop-blur-xl rounded-[32px] shadow-2xl p-6 sm:p-8 space-y-6">

        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400" />

          <h1 className="text-xl sm:text-2xl font-semibold text-gray-700">
            Bem-vindo de volta!
          </h1>

          <p className="text-sm text-gray-500">
            Escolha como deseja entrar
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => {
              setMode("phone")
              setStep("phone")
              setMessage("")
            }}
            className={`w-1/2 py-2 text-sm rounded-lg ${
              mode === "phone" ? "bg-white shadow text-gray-700" : "text-gray-400"
            }`}
          >
            Telefone
          </button>

          <button
            onClick={() => {
              setMode("email")
              setMessage("")
            }}
            className={`w-1/2 py-2 text-sm rounded-lg ${
              mode === "email" ? "bg-white shadow text-gray-700" : "text-gray-400"
            }`}
          >
            Email
          </button>
        </div>

        {mode === "phone" && step === "phone" && (
          <div className="space-y-4">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <Phone size={18} className="text-gray-400" />
              <input
                type="tel"
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent outline-none ml-3 text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            <button
              onClick={sendCode}
              disabled={loading || phone.length < 10}
              className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 via-green-400 to-teal-500 shadow-md disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </div>
        )}

        {mode === "phone" && step === "code" && (
          <div className="space-y-4">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <ShieldCheck size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-transparent outline-none ml-3 text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 via-green-400 to-teal-500 shadow-md disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Confirmar código"}
            </button>

            <button
              onClick={sendCode}
              className="w-full text-sm text-gray-400 hover:text-gray-600"
            >
              Reenviar código
            </button>
          </div>
        )}

        {mode === "email" && (
          <div className="space-y-4">
            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none ml-3 text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
              <Lock size={18} className="text-gray-400" />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none ml-3 text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            <button
              onClick={loginEmail}
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-yellow-400 via-green-400 to-teal-500 shadow-md disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Mock: admin@dikma.com / 123456
            </p>
          </div>
        )}

        {generatedCode && mode === "phone" && step === "code" && (
          <p className="text-xs text-gray-400 text-center">
            Código mock: {generatedCode}
          </p>
        )}

        {message && (
          <p className="text-center text-sm text-gray-500">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}