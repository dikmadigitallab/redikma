"use client"

import { User } from "next-auth"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/app/components/sidebar"
import {
  Camera,
  Mail,
  Phone,
  Lock,
} from "lucide-react"

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

  const [preview, setPreview] = useState("")

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
            foto: data.user.foto ?? "",
          })

          setPreview(data.user.foto ?? "")
        }
      } catch {
        toast.error("Erro ao carregar dados")
      }
    }

    fetchUser()
  }, [])

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]

    if (!file) return

    const previewUrl = URL.createObjectURL(file)

    setPreview(previewUrl)

    setForm((prev) => ({
      ...prev,
      foto: file,
    }))
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setLoading(true)

    const formData = new FormData()

    if (form.email)
      formData.append("email", form.email)

    if (form.telefone)
      formData.append(
        "telefone",
        form.telefone
      )

    if (form.senha)
      formData.append("senha", form.senha)

    if (
      form.foto instanceof File ||
      form.foto instanceof Blob
    ) {
      formData.append(
        "foto",
        form.foto,
        "profile.jpg"
      )
    }

    try {
      const res = await fetch(
        "/api/users/profile",
        {
          method: "PUT",
          body: formData,
        }
      )

      const data = await res.json()

      if (!res.ok) throw new Error()

      setPreview(data.user.foto)

      await update({
        email: form.email,
        telefone: form.telefone,
        foto: data.user.foto,
      })

      toast.success(
        "Perfil atualizado com sucesso"
      )
    } catch {
      toast.error("Erro ao atualizar perfil")
    } finally {
      setLoading(false)
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (!user) return null

  return (
    <div className="h-screen w-full flex bg-[#f6f7fb] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-3 py-4 md:px-8 md:py-8">
        <div className="max-w-5xl mx-auto">

          <div className="bg-white border border-neutral-200 rounded-[28px] overflow-hidden shadow-sm">

            {/* Topo */}
            <div className="px-5 md:px-8 py-7 border-b border-neutral-100 bg-[#fafcff]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                {/* Perfil */}
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">

                  <div className="relative group">
                    <img
                      src={
                        preview ||
                        user.foto ||
                        "../photoProfile/userDefault.png"
                      }
                      alt="Foto"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
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
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-50 transition-all"
                    >
                      <Camera
                        size={16}
                        className="text-neutral-600"
                      />
                    </label>
                  </div>

                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                      {user.nome}
                    </h1>

                    <p className="text-sm text-neutral-500 mt-1">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {/* Infos */}
                <div className="flex flex-wrap justify-center lg:justify-end gap-3">

                  <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 min-w-[160px]">
                    <p className="text-[10px] uppercase font-semibold text-neutral-400">
                      CPF
                    </p>

                    <p className="text-sm font-semibold text-neutral-700 mt-1">
                      {user.cpf}
                    </p>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-2xl px-4 py-3 min-w-[160px]">
                    <p className="text-[10px] uppercase font-semibold text-neutral-400">
                      Cargo
                    </p>

                    <p className="text-sm font-semibold text-neutral-700 mt-1">
                      {user.cargo}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-5 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Email */}
                <div>
                  <label className="text-[11px] font-semibold uppercase text-neutral-500 ml-1">
                    E-mail corporativo
                  </label>

                  <div className="relative mt-2">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl bg-[#f8fafc] border border-neutral-200 pl-12 pr-4 text-sm outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div>
                  <label className="text-[11px] font-semibold uppercase text-neutral-500 ml-1">
                    Telefone / WhatsApp
                  </label>

                  <div className="relative mt-2">
                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      type="text"
                      name="telefone"
                      value={form.telefone}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl bg-[#f8fafc] border border-neutral-200 pl-12 pr-4 text-sm outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold uppercase text-neutral-500 ml-1">
                    Alterar senha
                  </label>

                  <div className="relative mt-2">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                    />

                    <input
                      type="password"
                      name="senha"
                      placeholder="Deixe em branco para não alterar"
                      value={form.senha}
                      onChange={handleChange}
                      className="w-full h-14 rounded-2xl bg-[#f8fafc] border border-neutral-200 pl-12 pr-4 text-sm outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="w-full sm:w-auto px-6 h-12 rounded-2xl text-sm font-semibold text-neutral-500 hover:bg-neutral-100 transition-all"
                >
                  Descartar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 h-12 rounded-2xl bg-black text-white text-sm font-semibold hover:opacity-90 transition-all"
                >
                  {loading
                    ? "Salvando..."
                    : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}