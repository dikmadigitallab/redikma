"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Users, Search, Edit2, Trash2, X, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface Usuario {
  id: string
  nome: string
  username: string
  cpf: string
  cargo: string
  role: "SYSTEM_ADM" | "ADMIN" | "POSTADOR" | "COMMON"
  foto: string | null
  aniversario: string
  admissao: string
}

interface EditForm {
  id: string
  nome: string
  cargo: string
  role: "SYSTEM_ADM" | "ADMIN" | "POSTADOR" | "COMMON"
  senhaAtual: string
  novaSenha: string
}

export default function UsuariosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    id: "",
    nome: "",
    cargo: "",
    role: "COMMON",
    senhaAtual: "",
    novaSenha: "",
  })
  const [showNovaSenha, setShowNovaSenha] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      buscarUsuarios()
    }
  }, [status])

  useEffect(() => {
    buscarUsuarios()
  }, [busca])

  async function buscarUsuarios() {
    setLoading(true)
    try {
      const url = busca
        ? `/api/usuarios?busca=${encodeURIComponent(busca)}`
        : "/api/usuarios"
      const res = await fetch(url)
      const data = await res.json()
      if (res.ok) {
        setUsuarios(data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function abrirEditModal(usuario: Usuario) {
    setUsuarioSelecionado(usuario)
    setEditForm({
      id: usuario.id,
      nome: usuario.nome,
      cargo: usuario.cargo,
      role: usuario.role,
      senhaAtual: "",
      novaSenha: "",
    })
    setEditModal(true)
  }

  function abrirDeleteModal(usuario: Usuario) {
    setUsuarioSelecionado(usuario)
    setDeleteModal(true)
  }

  async function handleSalvarEdicao() {
    if (!editForm.nome.trim()) {
      toast.error("Nome é obrigatório")
      return
    }

    if (!editForm.cargo.trim()) {
      toast.error("Cargo é obrigatório")
      return
    }

    if (editForm.novaSenha && !editForm.senhaAtual) {
      toast.error("Digite a senha atual para alterar")
      return
    }

    setSaving(true)

    try {
      const res = await fetch("/api/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao salvar")
        return
      }

      toast.success("Usuário atualizado com sucesso!")
      buscarUsuarios()
      setEditModal(false)
    } catch {
      toast.error("Erro ao salvar alterações")
    } finally {
      setSaving(false)
    }
  }

  async function handleDeletar() {
    if (!usuarioSelecionado) return

    setSaving(true)
    try {
      const res = await fetch(`/api/usuarios?id=${usuarioSelecionado.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success(`${usuarioSelecionado.nome} foi deletado`)
        buscarUsuarios()
        setDeleteModal(false)
      } else {
        const data = await res.json()
        toast.error(data.error || "Erro ao deletar")
      }
    } catch {
      toast.error("Erro ao deletar usuário")
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--primary-dark)" }} />
      </div>
    )
  }

  if (!session) return null

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "var(--primary-dark)" }}>
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--black)" }}>
                Usuários do Sistema
              </h1>
              <p className="text-xs md:text-sm" style={{ color: "var(--gray)" }}>
                {usuarios.length} usuários cadastrados
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--gray)" }} />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, cargo ou username..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)", color: "var(--black)" }}
          />
        </div>

        <div className="rounded-lg md:rounded-xl overflow-hidden" style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)" }}>
          {loading ? (
            <div className="p-8 text-center" style={{ color: "var(--gray)" }}>
              Carregando...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-8 text-center" style={{ color: "var(--gray)" }}>
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: "var(--gray)" }}>Nome</th>
                    <th className="text-left p-3 text-xs font-medium hidden md:table-cell" style={{ color: "var(--gray)" }}>Username</th>
                    <th className="text-left p-3 text-xs font-medium hidden sm:table-cell" style={{ color: "var(--gray)" }}>CPF</th>
                    <th className="text-left p-3 text-xs font-medium" style={{ color: "var(--gray)" }}>Cargo</th>
                    <th className="text-left p-3 text-xs font-medium hidden lg:table-cell" style={{ color: "var(--gray)" }}>Role</th>
                    <th className="text-right p-3 text-xs font-medium" style={{ color: "var(--gray)" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                            style={{ backgroundColor: "var(--primary-dark)" }}
                          >
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium" style={{ color: "var(--black)" }}>{usuario.nome}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm hidden md:table-cell" style={{ color: "var(--gray)" }}>{usuario.username}</td>
                      <td className="p-3 text-sm hidden sm:table-cell font-mono" style={{ color: "var(--gray)" }}>{usuario.cpf}</td>
                      <td className="p-3 text-sm" style={{ color: "var(--black)" }}>{usuario.cargo}</td>
                      <td className="p-3 hidden lg:table-cell">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor:
                              usuario.role === "SYSTEM_ADM" ? "#E53935" :
                              usuario.role === "ADMIN" ? "#F57C00" :
                              usuario.role === "POSTADOR" ? "#1976D2" : "#757575",
                            color: "white",
                          }}
                        >
                          {usuario.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirEditModal(usuario)}
                            className="p-2 rounded-lg transition hover:bg-gray-100"
                            title="Editar"
                          >
                            <Edit2 size={16} style={{ color: "var(--secondary)" }} />
                          </button>
                          <button
                            onClick={() => abrirDeleteModal(usuario)}
                            className="p-2 rounded-lg transition hover:bg-gray-100"
                            title="Deletar"
                          >
                            <Trash2 size={16} style={{ color: "#E53935" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-lg p-6"
            style={{ backgroundColor: "var(--white)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--black)" }}>Editar Usuário</h2>
              <button onClick={() => setEditModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--black)" }}>Nome</label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--black)" }}>Cargo</label>
                <input
                  type="text"
                  value={editForm.cargo}
                  onChange={(e) => setEditForm({ ...editForm, cargo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--black)" }}>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as EditForm["role"] })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                >
                  <option value="SYSTEM_ADM">System Admin</option>
                  <option value="ADMIN">Admin</option>
                  <option value="POSTADOR">Postador</option>
                  <option value="COMMON">Comum</option>
                </select>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: "var(--black)" }}>Alterar Senha</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--gray)" }}>Senha Atual</label>
                    <input
                      type="password"
                      value={editForm.senhaAtual}
                      onChange={(e) => setEditForm({ ...editForm, senhaAtual: e.target.value })}
                      placeholder="Digite a senha atual"
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--gray)" }}>Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showNovaSenha ? "text" : "password"}
                        value={editForm.novaSenha}
                        onChange={(e) => setEditForm({ ...editForm, novaSenha: e.target.value })}
                        placeholder="Digite a nova senha"
                        className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNovaSenha(!showNovaSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--gray)" }}>Nova senha = 6 primeiros dígitos do CPF</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setEditModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarEdicao}
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary-dark)" }}
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-lg p-6"
            style={{ backgroundColor: "var(--white)" }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFEBEE" }}>
                <AlertTriangle size={24} style={{ color: "#E53935" }} />
              </div>
            </div>

            <h2 className="text-lg font-bold text-center mb-2" style={{ color: "var(--black)" }}>
              Confirmar Exclusão
            </h2>

            <p className="text-sm text-center mb-6" style={{ color: "var(--gray)" }}>
              Tem certeza que deseja deletar o usuário <strong>{usuarioSelecionado?.nome}</strong>?
              <br />Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={saving}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--black)" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletar}
                disabled={saving}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "#E53935" }}
              >
                {saving ? "Deletando..." : "Deletar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}