"use client"
import { User } from "next-auth"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/app/components/sidebar"
import { Editor } from "@/app/components/photo-editor"

export default function PerfilPage() {
  const { update } = useSession()
  const [user, setUser] = useState<User | null>(null)

  const [form, setForm] = useState<{
    senha: string
    email: string
    telefone: string
    foto: string | File | Blob // Alterado para aceitar Blob do editor
  }>({
    senha: "",
    email: "",
    telefone: "",
    foto: "",
  })

  const [preview, setPreview] = useState("")
  const [tempFile, setTempFile] = useState<File | null>(null) // Arquivo bruto para o editor
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/users/profile")
      const data = await res.json()

      if (data?.user) {
        setUser(data.user)
        setForm({
          senha: "",
          email: data.user.email ?? "",
          telefone: data.user.telefone ?? "",
          foto: data.user.foto ?? "",
        })
        setPreview(data.user.foto ?? "")
      }
    }

    fetchUser()
  }, [])

  // 1. Quando seleciona o arquivo, abre o editor em vez de salvar direto
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setTempFile(file)
    setShowEditor(true)
  }

  // 2. Recebe o resultado do Editor
  function handleSaveEditedImage(blob: Blob) {
    const previewUrl = URL.createObjectURL(blob)
    setPreview(previewUrl)
    
    setForm((prev) => ({
      ...prev,
      foto: blob, // Guardamos o Blob editado
    }))
    setShowEditor(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData()

    if (form.email) formData.append("email", form.email)
    if (form.telefone) formData.append("telefone", form.telefone)
    if (form.senha) formData.append("senha", form.senha)

    // Se a foto for um File ou Blob (resultado do editor)
    if (form.foto instanceof File || form.foto instanceof Blob) {
      formData.append("foto", form.foto, "profile.jpg")
    }

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error("Erro ao atualizar perfil")
        return
      }

      setPreview(data.user.foto)

      await update({
        email: form.email,
        telefone: form.telefone,
        foto: data.user.foto,
      })

      toast.success("Perfil atualizado com sucesso")
    } catch (err) {
      toast.error("Erro de conexão")
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  if (!user) return null

  return (
    <div
      className="min-h-screen flex justify-center items-start py-10 px-4"
      style={{ backgroundColor: "var(--background)" }}
    >
      <Sidebar />

      <div
        className="w-full max-w-3xl rounded-2xl shadow-md p-6 space-y-6"
        style={{ backgroundColor: "var(--white)" }}
      >
        {/* Modal do Editor */}
        {showEditor && tempFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl">
              <h2 className="text-lg font-bold mb-4 text-center">Editar Foto de Perfil</h2>
              <Editor
                imageFile={tempFile}
                aspectRatio="1/1"
                onSave={handleSaveEditedImage}
                onCancel={() => setShowEditor(false)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <img
            src={preview || "/photoProfile/default.jpeg"}
            alt="foto"
            className="w-20 h-20 rounded-full object-cover border-2 border-primary-dark"
          />
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--black)" }}>
              {user.nome}
            </h1>
            <p className="text-sm" style={{ color: "var(--gray)" }}>
              @{user.username}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span style={{ color: "var(--gray)" }}>CPF</span>
            <p style={{ color: "var(--black)" }}>{user.cpf}</p>
          </div>
          <div>
            <span style={{ color: "var(--gray)" }}>Cargo</span>
            <p style={{ color: "var(--black)" }}>{user.cargo}</p>
          </div>
          <div>
            <span style={{ color: "var(--gray)" }}>Data de nascimento</span>
            <p style={{ color: "var(--black)" }}>
              {new Date(user.aniversario).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span style={{ color: "var(--gray)" }}>Admissão</span>
            <p style={{ color: "var(--black)" }}>
              {new Date(user.admissao).toLocaleDateString()}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm block mb-1" style={{ color: "var(--gray)" }}>
              Foto de Perfil
            </label>

            <div className="relative">
              <input
                type="file"
                id="upload-foto"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />

              <label
                htmlFor="upload-foto"
                className="w-full flex items-center justify-center p-2 border border-dashed rounded-lg cursor-pointer hover:opacity-70"
                style={{
                  borderColor: "var(--primary-dark)",
                  backgroundColor: "var(--background)",
                  color: "var(--primary-dark)",
                }}
              >
                Escolher e editar nova foto...
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm" style={{ color: "var(--gray)" }}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--white)",
                color: "var(--black)",
              }}
            />
          </div>

          <div>
            <label className="text-sm" style={{ color: "var(--gray)" }}>Telefone</label>
            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--white)",
                color: "var(--black)",
              }}
            />
          </div>

          <div>
            <label className="text-sm" style={{ color: "var(--gray)" }}>Nova senha</label>
            <input
              type="password"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-lg"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--white)",
                color: "var(--black)",
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--primary-dark)", color: "var(--white)" }}
          >
            Salvar alterações
          </button>
        </form>
      </div>
    </div>
  )
}