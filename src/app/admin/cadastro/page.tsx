"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { UserPlus, Upload, FileText, X, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type Tab = "individual" | "lote"

interface ResultItem {
  nome: string
  cpf: string
  senha: string
  username: string
}

interface ImportResult {
  summary: {
    total: number
    success: number
    errors: number
    skipped: number
  }
  results: {
    success: ResultItem[]
    errors: { linha: number; erro: string; debug?: string }[]
    skipped: { linha: number; cpf: string; motivo: string }[]
  }
}

export default function CadastroPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [tab, setTab] = useState<Tab>("individual")
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    admissao: "",
    cargo: "",
    nascimento: "",
    cpf: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return null
  }

  if (!session) {
    return null
  }

  function formatCPF(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  function handleChangeCpf(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, cpf: formatCPF(e.target.value) })
  }

  async function handleSubmitIndividual(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/usuarios/criar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cpf: form.cpf.replace(/\D/g, ""),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      toast.success(`${data.user.nome} cadastrado!\nUsername: ${data.user.username}\nSenha: ${data.senhaPadrao}`)
      setForm({ nome: "", admissao: "", cargo: "", nascimento: "", cpf: "" })
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitLote() {
    if (!file) return

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/usuarios/criar/lote", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error)
        return
      }

      setResult(data)

      if (data.summary.success > 0) {
        toast.success(`${data.summary.success} usuário(s) importado(s) com sucesso!`)
      }

      if (data.summary.errors > 0) {
        toast.warning(`${data.summary.errors} erro(s) ao importar`)
      }

      if (data.summary.skipped > 0) {
        toast.info(`${data.summary.skipped} usuário(s) ignorado(s) (já cadastrados)`)
      }
    } catch {
      toast.error("Erro ao processar arquivo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen bg-[var(--background)] px-4 py-6 md:px-8 md:py-10"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <div
          className="bg-[var(--white)] border border-[var(--border)] rounded-3xl shadow-sm p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: "var(--primary-dark)" }}
              >
                <UserPlus size={26} />
              </div>

              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold tracking-tight"
                  style={{ color: "var(--black)" }}
                >
                  Cadastro de Usuários
                </h1>
                <p
                  className="text-sm md:text-base mt-1"
                  style={{ color: "var(--gray)" }}
                >
                  Adicione usuários individualmente ou importe vários registros por
                  planilha.
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="inline-flex p-1 rounded-2xl border shadow-sm w-full md:w-auto"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
              }}
            >
              <button
                onClick={() => setTab("individual")}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full md:w-auto"
                style={{
                  backgroundColor:
                    tab === "individual"
                      ? "var(--primary-dark)"
                      : "transparent",
                  color:
                    tab === "individual"
                      ? "white"
                      : "var(--black)",
                  boxShadow:
                    tab === "individual"
                      ? "0 4px 12px rgba(0,0,0,0.08)"
                      : "none",
                }}
              >
                Cadastro Individual
              </button>

              <button
                onClick={() => setTab("lote")}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full md:w-auto"
                style={{
                  backgroundColor:
                    tab === "lote"
                      ? "var(--primary-dark)"
                      : "transparent",
                  color:
                    tab === "lote"
                      ? "white"
                      : "var(--black)",
                  boxShadow:
                    tab === "lote"
                      ? "0 4px 12px rgba(0,0,0,0.08)"
                      : "none",
                }}
              >
                Importar Planilha
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {tab === "individual" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[var(--white)] border border-[var(--border)] rounded-3xl shadow-sm p-6 md:p-8"
          >
            <form
              onSubmit={handleSubmitIndividual}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: "var(--black)" }}
                >
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) =>
                    setForm({ ...form, nome: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--black)",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: "var(--black)" }}
                >
                  CPF *
                </label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={handleChangeCpf}
                  placeholder="000.000.000-00"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--black)",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: "var(--black)" }}
                >
                  Cargo *
                </label>
                <input
                  type="text"
                  value={form.cargo}
                  onChange={(e) =>
                    setForm({ ...form, cargo: e.target.value })
                  }
                  placeholder="Título reduzido do cargo"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--black)",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: "var(--black)" }}
                >
                  Data de Admissão *
                </label>
                <input
                  type="date"
                  value={form.admissao}
                  onChange={(e) =>
                    setForm({ ...form, admissao: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                  style={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--black)",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-semibold"
                  style={{ color: "var(--black)" }}
                >
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  value={form.nascimento}
                  onChange={(e) =>
                    setForm({ ...form, nascimento: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                  style={{
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--black)",
                  }}
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-50 shadow-md"
                  style={{ backgroundColor: "var(--primary-dark)" }}
                >
                  {loading ? "Cadastrando..." : "Cadastrar Usuário"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {tab === "lote" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[var(--white)] border border-[var(--border)] rounded-3xl shadow-sm p-6 md:p-8 space-y-6"
          >
            {/* Informações */}
            <div
              className="p-5 rounded-2xl border"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText
                  size={18}
                  style={{ color: "var(--secondary)" }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--black)" }}
                >
                  Modelo da Planilha
                </span>
              </div>

              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--gray)" }}
              >
                A planilha deve conter as colunas Nome, Admissão, Título Reduzido
                (Cargo), Nascimento e CPF.
              </p>

              <p
                className="text-sm mt-2"
                style={{ color: "var(--gray)" }}
              >
                Formato {/* aceito */}: .xlsx{/* , .xls, .txt e .tsv. */}
              </p>

              <a
                href="https://vcgyvauqdxoddiiutrds.supabase.co/storage/v1/object/public/modelos/planilha-users/modelo_planilha_colaboradores.xlsx"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-90"
                style={{
                  backgroundColor: "var(--primary-dark)",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
              >
                <span style={{ color: "#ffffff" }}>Baixar Modelo</span>
              </a>
            </div>

            {/* Upload */}
            <div
              className="border-2 border-dashed rounded-3xl p-10 text-center"
              style={{ borderColor: "var(--border)" }}
            >
              <Upload
                size={40}
                className="mx-auto mb-4"
                style={{ color: "var(--secondary)" }}
              />

              <p
                className="text-sm md:text-base mb-5"
                style={{ color: "var(--black)" }}
              >
                Arraste o arquivo aqui ou selecione no computador
              </p>

              <input
                type="file"
                accept=".xlsx,.xls,.txt,.tsv"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
                className="hidden"
                id="file-upload"
              />

              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-5 py-3 rounded-xl text-sm font-medium cursor-pointer text-white transition hover:opacity-90 shadow-sm"
                style={{ backgroundColor: "var(--primary-dark)" }}
              >
                Selecionar Arquivo
              </label>

              {file && (
                <div
                  className="mt-5 inline-flex items-center gap-3 px-4 py-2 rounded-xl"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--black)" }}
                  >
                    {file.name}
                  </span>

                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 rounded-full hover:bg-gray-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Botão */}
            <button
              onClick={handleSubmitLote}
              disabled={loading || !file}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-50 shadow-md"
              style={{
                backgroundColor: !file
                  ? "var(--gray)"
                  : "var(--primary-dark)",
              }}
            >
              {loading ? "Processando..." : "Importar Usuários"}
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}