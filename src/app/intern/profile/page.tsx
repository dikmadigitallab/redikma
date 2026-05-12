"use client"
import { User } from "next-auth"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/app/components/sidebar"

export default function PerfilPage() {
  const { update } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    senha: "",
    email: "",
    telefone: "",
    foto: "" as string | File | Blob,
  })

  const [preview, setPreview] = useState("src/app/intern/profile/page.tsx")

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/users/profile")
        const data = await res.json()

        if (data?.user) {
          setUser(data.user)
          setForm({
            senha: "",
            email: data.user.email ?? "",
            telefone: data.user.telefone ?? "",
            foto: data.user.foto ?? "../photoProfile/userDefault.png",
          })
          setPreview(data.user.foto ?? "")
        }
      } catch (err) {
        toast.error("Erro ao carregar dados")
      }
    }
    fetchUser()
  }, [])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setForm((prev) => ({ ...prev, foto: file }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData()

    if (form.email) formData.append("email", form.email)
    if (form.telefone) formData.append("telefone", form.telefone)
    if (form.senha) formData.append("senha", form.senha)
    if (form.foto instanceof File || form.foto instanceof Blob) {
      formData.append("foto", form.foto, "profile.jpg")
    }

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error()

      setPreview(data.user.foto)
      await update({
        email: form.email,
        telefone: form.telefone,
        foto: data.user.foto,
      })

      toast.success("Perfil atualizado com sucesso")
    } catch (err) {
      toast.error("Erro ao atualizar perfil")
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  if (!user) return null

  return (
<div className="h-screen w-full flex flex-col md:flex-row bg-neutral-50 overflow-hidden">
  <Sidebar />

  <main className="flex-1 h-full overflow-y-auto px-4 py-4 md:py-8 flex justify-center items-start">
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-neutral-200/60 flex flex-col">
      
      {/* Cabeçalho Compacto com Upload Integrado */}
      <div className="p-6 md:p-8 border-b border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group">
            <img
              src={preview || user.foto || "../photoProfile/userDefault.png"}
              alt="foto"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-neutral-100 shadow-sm"
            />

            <input
              type="file"
              id="upload-foto"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />

            <label
              htmlFor="upload-foto"
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white text-[10px] font-bold uppercase"
            >
              Trocar
            </label>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-xl font-black text-neutral-900 leading-tight">
              {user.nome}
            </h1>
            <p className="text-sm text-neutral-500">
              @{user.username}
            </p>
          </div>
        </div>

        {/* Dados Administrativos em Badge Horizontal */}
        <div className="flex gap-4">
          <div className="bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100">
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">
              CPF
            </p>
            <p className="text-xs font-bold text-neutral-700">
              {user.cpf}
            </p>
          </div>

          <div className="bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100">
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">
              Cargo
            </p>
            <p className="text-xs font-bold text-neutral-700">
              {user.cargo}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário em Grid de Duas Colunas */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 uppercase ml-1">
              E-mail Corporativo
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-500 uppercase ml-1">
              Telefone / WhatsApp
            </label>
            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[11px] font-bold text-neutral-500 uppercase ml-1">
              Alterar Senha
            </label>
            <input
              type="password"
              name="senha"
              placeholder="Deixe em branco para não alterar"
              value={form.senha}
              onChange={handleChange}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm"
            />
          </div>
        </div>

        {/* Rodapé do Form com Ações */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-neutral-100">
          <button
            type="button"
            className="text-sm font-bold text-neutral-400 hover:text-neutral-600 transition-colors order-2 sm:order-1"
            onClick={() => window.location.reload()}
          >
            Descartar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-lg shadow-neutral-200 disabled:opacity-50 order-1 sm:order-2"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  </main>
</div>
  )
}