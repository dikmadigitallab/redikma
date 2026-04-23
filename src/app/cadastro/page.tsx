"use client"

import { useState, useEffect } from "react"

function gerarSenha(cpf: string) {
  const cleaned = cpf.replace(/\D/g, "")
  if (cleaned.length < 6) return ""
  return `Dk@${cleaned.slice(-6)}`
}

export default function CadastroUsuario() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    dataAdmissao: "",
  })

  const [senha, setSenha] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (form.cpf) {
      setSenha(gerarSenha(form.cpf))
    }
  }, [form.cpf])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function regenerarSenha() {
    setSenha(gerarSenha(form.cpf))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          // ⚠️ temporário até ter select no form
          roleId: "SEU_ROLE_ID_AQUI",
          cargoId: "SEU_CARGO_ID_AQUI",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || "Erro ao cadastrar usuário")
        return
      }

      alert(`Usuário criado com sucesso!\nSenha inicial: ${data.senhaInicial}`)

      // reset
      setForm({
        nome: "",
        cpf: "",
        dataNascimento: "",
        dataAdmissao: "",
      })

      setSenha("")
    } catch (error) {
      console.error(error)
      alert("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F7F2]">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm p-8 border border-[#E8F5E9]">

        <h1 className="text-2xl font-semibold text-[#2D5A27] mb-6">
          Cadastro de Colaborador
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-[#2D5A27] mb-1">
              Nome completo
            </label>
            <input
              type="text"
              name="nome"
              placeholder="Ex: João da Silva"
              value={form.nome}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4CAF50] focus:outline-none"
              required
            />
          </div>

          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-[#2D5A27] mb-1">
              CPF
            </label>
            <input
              type="text"
              name="cpf"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4CAF50] focus:outline-none"
              required
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2D5A27] mb-1">
                Data de nascimento
              </label>
              <input
                type="date"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4CAF50] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2D5A27] mb-1">
                Data de admissão
              </label>
              <input
                type="date"
                name="dataAdmissao"
                value={form.dataAdmissao}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#4CAF50] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Senha */}
          <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl p-4">
            <p className="text-sm text-[#2D5A27] mb-1">
              Senha inicial
            </p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-[#2D5A27]">
                {senha || "Aguardando CPF..."}
              </span>

              <button
                type="button"
                onClick={regenerarSenha}
                className="text-sm font-medium text-[#4CAF50] hover:underline"
              >
                Gerar novamente
              </button>
            </div>

            <p className="text-xs text-[#757575] mt-2">
              O usuário deverá alterar essa senha no primeiro acesso.
            </p>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4CAF50] text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Cadastrando..." : "Cadastrar usuário"}
          </button>

        </form>
      </div>
    </div>
  )
}