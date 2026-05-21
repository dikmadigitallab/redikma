"use client"

import { User } from "next-auth"
import { Suspense, useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/app/components/sidebar"
import {
  Camera,
  ImagePlus,
  Mail,
  Phone,
  Lock,
  AlertTriangle,
} from "lucide-react"

function PerfilPageContent() {
  const { update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isFirstAccess = searchParams.get("firstAccess") === "true"

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    senha: "",
    email: "",
    telefone: "",
    foto: "" as string | File | Blob,
  })

  const [preview, setPreview] = useState("")
  const [showSourceOptions, setShowSourceOptions] = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

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

    setShowSourceOptions(false)

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

    if (form.email) {
      formData.append("email", form.email)
    }

    if (form.telefone) {
      formData.append(
        "telefone",
        form.telefone
      )
    }

    if (form.senha) {
      formData.append("senha", form.senha)
    }

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

      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...(form.email ? { email: form.email } : {}),
              ...(form.telefone ? { telefone: form.telefone } : {}),
              foto: data.user.foto,
            }
          : prev
      )

      await update({
        ...(form.email ? { email: form.email } : {}),
        ...(form.telefone ? { telefone: form.telefone } : {}),
        foto: data.user.foto,
      })

      toast.success(
        "Perfil atualizado com sucesso"
      )

      if (isFirstAccess) {
        router.replace("/intern/profile")
      }
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

  if (!user) {
    return (
      <div className="h-screen w-full flex bg-[#f6f7fb] overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-3 py-4 md:px-8 md:py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-[var(--primary)] rounded-[28px] shadow-sm p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-24 w-24 rounded-full bg-neutral-200 mx-auto" />
                <div className="h-6 w-48 bg-neutral-200 rounded mx-auto" />
                <div className="h-4 w-32 bg-neutral-200 rounded mx-auto" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <section className="h-screen w-full flex bg-[#f6f7fb] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto px-3 py-4 md:px-8 md:py-8 pb-24 sm:pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-[var(--primary)] rounded-[28px] shadow-sm">
            {/* Topo */}
            <div className="px-5 md:px-8 py-7 border-b border-neutral-100 bg-[#fafcff]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                {/* Perfil */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        preview ||
                        user.foto ||
                        "/photoProfile/userDefault.png"
                      }
                      alt="Foto"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                    />

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFile}
                      className="hidden"
                    />
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFile}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => setShowSourceOptions((prev) => !prev)}
                      className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-[var(--primary)] flex items-center justify-center cursor-pointer hover:bg-neutral-50 transition-all"
                    >
                      <Camera
                        size={16}
                        className="text-neutral-600"
                      />
                    </button>

                    {showSourceOptions && (
                      <div className="absolute bottom-12 right-0 bg-white border border-[var(--primary)] rounded-2xl shadow-xl p-2 z-50 min-w-[180px]">
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition text-sm font-semibold"
                        >
                          <Camera size={16} className="text-[var(--primary)]" />
                          Câmera
                        </button>
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition text-sm font-semibold"
                        >
                          <ImagePlus size={16} className="text-[var(--primary)]" />
                          Galeria
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-center sm:text-left min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 break-words">
                      {user.nome}
                    </h1>

                    <p className="text-sm text-[var(--primary)] mt-1 break-all">
                      @{user.username}
                    </p>
                  </div>
                </div>

                {/* Infos */}
                <div className="flex flex-col sm:flex-row w-full lg:w-auto justify-center lg:justify-end gap-3">
                  <div className="bg-white border border-[var(--primary)] rounded-2xl px-4 py-3 w-full sm:min-w-[160px] sm:w-auto">
                    <p className="text-[10px] uppercase font-semibold text-neutral-400">
                      CPF
                    </p>

                    <p className="text-sm font-semibold text-neutral-700 mt-1 break-all">
                      {user.cpf}
                    </p>
                  </div>

                  <div className="bg-white border border-[var(--primary)] rounded-2xl px-4 py-3 w-full sm:min-w-[160px] sm:w-auto">
                    <p className="text-[10px] uppercase font-semibold text-neutral-400">
                      Cargo
                    </p>

                    <p className="text-sm font-semibold text-neutral-700 mt-1 break-words">
                      {user.cargo}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isFirstAccess && (
              <div className="mx-5 md:mx-8 mt-5 md:mt-8 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 text-sm">
                    Primeiro Acesso
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Por segurança, cadastre uma nova senha antes de começar a usar a plataforma. Preencha o campo &quot;Alterar senha&quot; abaixo e clique em Salvar.
                  </p>
                </div>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-5 md:p-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Email */}
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[var(--primary)] ml-1">
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
                      className="w-full h-14 rounded-2xl bg-[#f8fafc] border border-[var(--primary)] pl-12 pr-4 text-sm outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div>
                  <label className="text-[11px] font-semibold uppercase text-[var(--primary)] ml-1">
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
                      className="w-full h-14 rounded-2xl bg-[#f8fafc] border border-[var(--primary)] pl-12 pr-4 text-sm outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold uppercase text-[var(--primary)] ml-1">
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
                      className="w-full h-14 rounded-2xl bg-[#f8fafc] border border-[var(--primary)] pl-12 pr-4 text-sm outline-none focus:border-neutral-400 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    disabled={loading}
                    className="w-full sm:w-auto sm:min-w-[140px] h-12 px-6 rounded-2xl text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-10)] transition-all flex items-center justify-center disabled:opacity-60"
                  >
                    Descartar
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto sm:min-w-[140px] h-12 px-8 rounded-2xl bg-black text-white text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Salvando..."
                      : "Salvar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </section>
  )
}

export default function PerfilPage() {
  return (
    <Suspense fallback={null}>
      <PerfilPageContent />
    </Suspense>
  )
}
