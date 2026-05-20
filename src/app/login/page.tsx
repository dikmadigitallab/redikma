"use client"

import { useState, useEffect } from "react"
import { ShieldCheck, Lock, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { signIn, useSession } from "next-auth/react"
import { toast } from "sonner"

export default function LoginCPF() {
  const [cpf, setCpf] = useState("")
  const [senha, setSenha] = useState("")
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

      if (session?.user) {
        if (session.user.first_acess) {
          router.replace("/primeiro-acesso")
        } else {
          router.replace("/intern/feed")
        }
      }
  }, [session, status, router])

  function formatCPF(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  function handleChangeCpf(e: React.ChangeEvent<HTMLInputElement>) {
    setCpf(formatCPF(e.target.value))
  }

  async function handleLogin() {
    const cpfNumerico = cpf.replace(/\D/g, "")
    if (loading || cpfNumerico.length !== 11 || !senha) return

    setLoading(true)

    try {
      const result = await signIn("credentials", {
        cpf: cpfNumerico,
        senha,
        redirect: false,
      })

      if (result?.error) {
        toast.error("CPF ou senha incorretos")
        return
      }

      toast.success("Login realizado com sucesso!")
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex w-full font-sans" style={{ backgroundColor: 'var(--background)' }}>

      {/* LADO ESQUERDO: Contexto Social e Pessoas (Oculto no Mobile) */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        {/* Imagem de fundo focada em pessoas colaborando */}
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        />
        {/* Camada translúcida estilo glassmorphism puxando para o verde da marca */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-[#047857]/90 mix-blend-multiply" />

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 p-12 text-white max-w-xl text-center flex flex-col items-center"
        >
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Bem-vindo à <span className="text-green-400">ReDikma</span>
          </h2>

          <p className="text-lg text-gray-200 mb-8">
            Um espaço de conexão, acolhimento e organização, que aproxima as pessoas e fortalece a nossa cultura todos os dias.
          </p>

          {/* Elemento de Prova Social / Avatares */}
          <div className="flex -space-x-4 justify-center">
            <img className="w-12 h-12 rounded-full border-2 border-green-900 object-cover" src="https://i.pravatar.cc/100?img=68" alt="Usuário 1" />
            <img className="w-12 h-12 rounded-full border-2 border-green-900 object-cover" src="https://i.pravatar.cc/100?img=47" alt="Usuário 2" />
            <img className="w-12 h-12 rounded-full border-2 border-green-900 object-cover" src="https://i.pravatar.cc/100?img=33" alt="Usuário 3" />
            <img className="w-12 h-12 rounded-full border-2 border-green-900 object-cover" src="https://i.pravatar.cc/100?img=12" alt="Usuário 4" />
            <div className="w-12 h-12 rounded-full border-2 border-green-900 bg-gray-800 flex items-center justify-center text-xs font-medium text-white shadow-lg">
              +99
            </div>
          </div>
        </motion.div>
      </div>



      {/* LADO DIREITO: Formulário de Login (Responsivo) */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden"
        style={{ backgroundColor: '#0A4554' }} // Fundo CHAPADO com Azul Corporativo
      >

        {/* --- DECORAÇÕES GEOMÉTRICAS E LINHAS INFORMES --- */}

        {/* Linha Informe 1: Forma orgânica com borda grossa e rotação */}
        <div
          className="absolute border-[3px] pointer-events-none"
          style={{
            borderColor: '#4FC3D9',
            opacity: 0.15,
            width: '600px',
            height: '600px',
            top: '-15%',
            right: '-20%',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', // Cria a forma "informe/orgânica"
            transform: 'rotate(25deg)'
          }}
        />

        {/* Linha Informe 2: Forma orgânica sobreposta, mais fina e com outra opacidade */}
        <div
          className="absolute border-[1px] pointer-events-none"
          style={{
            borderColor: '#4FC3D9',
            opacity: 0.3,
            width: '450px',
            height: '450px',
            top: '5%',
            right: '-10%',
            borderRadius: '60% 40% 30% 70% / 50% 40% 60% 50%',
            transform: 'rotate(-15deg)'
          }}
        />

        {/* Forma Geométrica 1: Círculo Perfeito no fundo esquerdo */}
        <div
          className="absolute rounded-full border-[4px] pointer-events-none"
          style={{
            borderColor: '#4FC3D9',
            opacity: 0.08,
            width: '400px',
            height: '400px',
            bottom: '-10%',
            left: '-15%'
          }}
        />

        {/* Forma Geométrica 2: Quadrado Rotacionado (Losango) flutuando */}
        <div
          className="absolute border-[2px] pointer-events-none"
          style={{
            borderColor: '#FDE205', // Toque sutil do Accent (Amarelo Forte)
            opacity: 0.1,
            width: '180px',
            height: '180px',
            bottom: '15%',
            right: '10%',
            transform: 'rotate(45deg)'
          }}
        />

        {/* --- CARD DE LOGIN --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full max-w-md rounded-2xl shadow-2xl p-8 md:p-10 space-y-8 z-10"
          style={{ backgroundColor: '#FFFFFF' }} // Card branco para contrastar com o fundo escuro
        >
          {/* Cabeçalho */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6 pb-6" style={{ borderBottom: '1px solid #E0E0E0' }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                style={{ backgroundColor: '#0A4554' }} // Logo em Azul Corporativo
              >
                D
              </div>
              <span className="font-bold text-2xl tracking-tight" style={{ color: '#1A1A1A' }}>Dikma</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#1A1A1A' }}>
              Bem-vindo de volta
            </h1>
            <p className="text-sm md:text-base" style={{ color: '#757575' }}>
              Faça login com seu CPF e senha para acessar
            </p>
          </div>

          {/* Campos */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1A1A1A' }}>CPF</label>
              <div
                className="flex items-center px-4 py-3 rounded-xl transition-all focus-within:ring-2 focus-within:border-transparent"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0' }} // Fundo de input levemente cinza
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79, 195, 217, 0.4)'} // Focus em Ciano
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <ShieldCheck size={20} style={{ color: '#4FC3D9' }} />
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleChangeCpf}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin()
                  }}
                  className="w-full bg-transparent outline-none ml-3 text-base placeholder-[#757575]"
                  style={{ color: '#1A1A1A' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1A1A1A' }}>Senha</label>
              <div
                className="flex items-center px-4 py-3 rounded-xl transition-all focus-within:ring-2 focus-within:border-transparent"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0' }}
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79, 195, 217, 0.4)'} // Focus em Ciano
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <Lock size={20} style={{ color: '#4FC3D9' }} />
                <input
                  type={showSenha ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin()
                  }}
                  className="w-full bg-transparent outline-none ml-3 text-base placeholder-[#757575]"
                  style={{ color: '#1A1A1A' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="ml-2 hover:opacity-70 transition-opacity"
                  style={{ color: '#757575' }}
                >
                  {showSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Ação de Login */}
            <button
              onClick={handleLogin}
              disabled={loading || cpf.replace(/\D/g, "").length !== 11 || !senha}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-base transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none mt-4"
              // Botão acompanhando o Primary Dark para manter elegância, mudando no hover (usando style inline pra ficar fixo, mas vc pode por hover via tailwind se tiver configurado as cores lá)
              style={{ backgroundColor: loading || cpf.replace(/\D/g, "").length !== 11 || !senha ? '#757575' : '#0A4554' }}
            >
              {loading ? "Entrando..." : "Entrar na Plataforma"}
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  )
}