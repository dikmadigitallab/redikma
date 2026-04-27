"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { UserPlus, Upload, FileText, X, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"

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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
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
    setMessage(null)

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
        setMessage({ type: "error", text: data.error })
        return
      }

      setMessage({ type: "success", text: `Usuário ${data.user.nome} cadastrado! Username: ${data.user.username} | Senha: ${data.senhaPadrao}` })
      setForm({ nome: "", admissao: "", cargo: "", nascimento: "", cpf: "" })
    } catch {
      setMessage({ type: "error", text: "Erro de conexão" })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitLote() {
    if (!file) return

    setLoading(true)
    setMessage(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/usuarios/criar/lote", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.error })
        return
      }

      setResult(data)
      setMessage({
        type: "success",
        text: `${data.summary.success} usuários importados com sucesso!`,
      })
    } catch {
      setMessage({ type: "error", text: "Erro ao processar arquivo" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary-dark)" }}>
            <UserPlus size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--black)" }}>
              Cadastro de Usuários
            </h1>
            <p className="text-xs md:text-sm" style={{ color: "var(--gray)" }}>
              Adicione usuários individual ou em lote
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("individual")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{
              backgroundColor: tab === "individual" ? "var(--primary-dark)" : "var(--white)",
              color: tab === "individual" ? "white" : "var(--black)",
              border: "1px solid var(--border)",
            }}
          >
            Cadastro Individual
          </button>
          <button
            onClick={() => setTab("lote")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{
              backgroundColor: tab === "lote" ? "var(--primary-dark)" : "var(--white)",
              color: tab === "lote" ? "white" : "var(--black)",
              border: "1px solid var(--border)",
            }}
          >
            Importar Planilha
          </button>
        </div>

        {message && (
          <div
            className="mb-6 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: message.type === "success" ? "#E8F5E9" : "#FFE5E5",
              border: `1px solid ${message.type === "success" ? "var(--success)" : "var(--border)"}`,
              color: "var(--black)",
            }}
          >
            {message.text}
          </div>
        )}

        {tab === "individual" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg md:rounded-xl p-6 shadow-sm"
            style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)" }}
          >
            <form onSubmit={handleSubmitIndividual} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--black)" }}>
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--black)" }}>
                  CPF *
                </label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={handleChangeCpf}
                  placeholder="000.000.000-00"
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--black)" }}>
                  Cargo *
                </label>
                <input
                  type="text"
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                  placeholder="Título reduzido do cargo"
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--black)" }}>
                  Data de Admissão *
                </label>
                <input
                  type="date"
                  value={form.admissao}
                  onChange={(e) => setForm({ ...form, admissao: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--black)" }}>
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  value={form.nascimento}
                  onChange={(e) => setForm({ ...form, nascimento: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg md:rounded-xl p-6 shadow-sm"
            style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)" }}
          >
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} style={{ color: "var(--secondary)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--black)" }}>
                  Modelo da Planilha
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--gray)" }}>
                A planilha deve conter as colunas: <strong>Nome</strong>, <strong>Admissão</strong>, <strong>Título Reduzido (Cargo)</strong>, <strong>Nascimento</strong>, <strong>CPF</strong>
              </p>
              <p className="text-xs mt-2" style={{ color: "var(--gray)" }}>
                Formato: arquivo .txt com tabulação entre colunas, ou exporte do Excel como "Texto (Tabulação)"
              </p>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: "var(--border)" }}>
              <Upload size={32} className="mx-auto mb-4" style={{ color: "var(--secondary)" }} />
              <p className="text-sm mb-4" style={{ color: "var(--black)" }}>
                Arraste o arquivo aqui ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.txt,.tsv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 rounded-lg text-sm cursor-pointer transition"
                style={{ backgroundColor: "var(--primary-dark)", color: "white" }}
              >
                Selecionar Arquivo
              </label>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-sm" style={{ color: "var(--black)" }}>{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitLote}
              disabled={loading || !file}
              className="w-full mt-4 py-2.5 rounded-lg text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: !file ? "var(--gray)" : "var(--primary-dark)" }}
            >
              {loading ? "Processando..." : "Importar Usuários"}
            </button>

            {result && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "#E8F5E9" }}>
                    <div className="text-lg font-bold" style={{ color: "var(--success)" }}>{result.summary.success}</div>
                    <div className="text-xs" style={{ color: "var(--gray)" }}>Importados</div>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "#FFF3E0" }}>
                    <div className="text-lg font-bold" style={{ color: "#F57C00" }}>{result.summary.skipped}</div>
                    <div className="text-xs" style={{ color: "var(--gray)" }}>Ignorados</div>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "#FFEBEE" }}>
                    <div className="text-lg font-bold" style={{ color: "#E53935" }}>{result.summary.errors}</div>
                    <div className="text-xs" style={{ color: "var(--gray)" }}>Erros</div>
                  </div>
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: "var(--background)" }}>
                    <div className="text-lg font-bold" style={{ color: "var(--black)" }}>{result.summary.total}</div>
                    <div className="text-xs" style={{ color: "var(--gray)" }}>Total</div>
                  </div>
                </div>

                {result.results.success.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2" style={{ color: "var(--black)" }}>
                      <CheckCircle size={14} className="inline mr-1" style={{ color: "var(--success)" }} />
                      Usuários importadas
                    </h3>
                    <div className="max-h-48 overflow-y-auto rounded-lg" style={{ backgroundColor: "var(--background)" }}>
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            <th className="text-left p-2">Nome</th>
                            <th className="text-left p-2">Username</th>
                            <th className="text-left p-2">Senha</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.results.success.map((item, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                              <td className="p-2">{item.nome}</td>
                              <td className="p-2 font-mono text-xs">{item.username}</td>
                              <td className="p-2 font-mono">{item.senha}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {result.results.errors.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2" style={{ color: "var(--black)" }}>
                      Erros
                    </h3>
                    <div className="max-h-32 overflow-y-auto rounded-lg p-2" style={{ backgroundColor: "#FFEBEE" }}>
                      {result.results.errors.map((err, i) => (
                        <div key={i} className="text-xs py-1" style={{ color: "#E53935" }}>
                          Linha {err.linha}: {err.erro}
                          {err.debug && <span className="block text-gray-500 mt-1">{err.debug}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}