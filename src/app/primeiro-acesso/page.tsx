"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PrimeiroAcessoPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState({
    termos: false,
    lgpd: false,
    cookies: false,
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session?.user) {
      router.replace("/login")
      return
    }

    if (!session.user.first_acess) {
      router.replace("/intern/feed")
    }
  }, [session, status, router])

  const allAccepted = accepted.termos && accepted.lgpd && accepted.cookies

  async function handleAccept() {
    if (!allAccepted || loading) return

    setLoading(true)
    try {
      const res = await fetch("/api/auth/first-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aceiteTermos: true,
          aceiteLgpd: true,
          aceiteCookies: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao aceitar termos")
      }

      await update({ first_acess: false })

      toast.success("Termos aceitos com sucesso!")
      router.push("/intern/profile?firstAccess=true")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f7fb]">
        <div className="animate-spin w-8 h-8 border-4 border-neutral-300 border-t-neutral-600 rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex flex-col">
      <header className="bg-white border-b border--primary px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A4554] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            <Image
              src="/icons/redikma_logo.png"
              alt="Logo Redikma"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-lg text-neutral-900">ReDikma</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-3xl bg-white rounded-[28px] border border-primary shadow-sm overflow-hidden">
          <div className="px-6 md:px-10 py-8 border-b border-neutral-100">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
              Primeiro Acesso
            </h1>
            <p className="text-primary mt-2 text-sm md:text-base">
              Bem-vindo, <span className="font-semibold text-neutral-700">{session.user.nome}</span>! Antes de acessar a plataforma, leia e aceite os termos abaixo.
            </p>
          </div>

          <div className="px-6 md:px-10 py-6 space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-800">
              Você está logado como <strong>{session.user.nome}</strong> — CPF: <strong>{session.user.cpf}</strong> — Cargo: <strong>{session.user.cargo}</strong>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-4 p-4 rounded-2xl border border-primary hover:border-neutral-300 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted.termos}
                  onChange={() => setAccepted(prev => ({ ...prev, termos: !prev.termos }))}
                  className="mt-0.5 w-5 h-5 rounded border-neutral-300 text-[#0A4554] focus:ring-[#0A4554]"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm">
                    Termos de Uso
                  </p>
                  <p className="text-sm text-primary mt-0.5">
                    Declaro que li e concordo com os{" "}
                    <Link href="/legais/termos-de-uso" target="_blank" className="text-[#0A4554] underline hover:no-underline">
                      Termos de Uso da plataforma ReDikma
                    </Link>.
                  </p>
                </div>
                {accepted.termos && <Check size={20} className="text-green-600 shrink-0" />}
              </label>

              <label className="flex items-start gap-4 p-4 rounded-2xl border border-primary hover:border-neutral-300 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted.lgpd}
                  onChange={() => setAccepted(prev => ({ ...prev, lgpd: !prev.lgpd }))}
                  className="mt-0.5 w-5 h-5 rounded border-neutral-300 text-[#0A4554] focus:ring-[#0A4554]"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm">
                    Política de Privacidade (LGPD)
                  </p>
                  <p className="text-sm text-primary mt-0.5">
                    Declaro que li e estou ciente da{" "}
                    <Link href="/legais/lgpd" target="_blank" className="text-[#0A4554] underline hover:no-underline">
                      Política de Privacidade e Proteção de Dados
                    </Link>.
                  </p>
                </div>
                {accepted.lgpd && <Check size={20} className="text-green-600 fshrink-0" />}
              </label>

              <label className="flex items-start gap-4 p-4 rounded-2xl border border-primary hover:border-neutral-300 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted.cookies}
                  onChange={() => setAccepted(prev => ({ ...prev, cookies: !prev.cookies }))}
                  className="mt-0.5 w-5 h-5 rounded border-neutral-300 text-[#0A4554] focus:ring-[#0A4554]"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 text-sm">
                    Política de Cookies
                  </p>
                  <p className="text-sm text-primary mt-0.5">
                    Autorizo a utilização de cookies necessários para o funcionamento da plataforma, conforme descrito na Política de Privacidade.
                  </p>
                </div>
                {accepted.cookies && <Check size={20} className="text-green-600 shrink-0" />}
              </label>
            </div>
          </div>

          <div className="px-6 md:px-10 py-6 border-t border-neutral-100 bg-neutral-50">
            <button
              onClick={handleAccept}
              disabled={!allAccepted || loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0A4554] text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Aguarde..." : "Aceitar e Continuar"}
              {!loading && <ArrowRight size={18} />}
            </button>
            <p className="text-xs text-neutral-400 mt-3">
              Ao clicar em &quot;Aceitar e Continuar&quot;, você confirma a leitura e aceitação de todos os termos acima.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
