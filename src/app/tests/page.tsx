"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

interface DetalheErro {
  indice: number
  cpf: string
  senha: string
  mensagem: string | null
  status: number | undefined
  ok: boolean | undefined
  url: string | null | undefined
}

interface ResultadoTeste {
  sucesso: number
  erro: number
  total: number
  tempoTotalSegundos: string
  requestsPorSegundo: string
  min: string
  max: string
  media: string
  p95: string
  p99: string
  primeirosErros: DetalheErro[]
}

export default function PaginaTesteCarga() {
  const [resultado, setResultado] = useState<ResultadoTeste | null>(null)
  const [executando, setExecutando] = useState(false)

  async function executarTeste(): Promise<void> {
    setExecutando(true)
    setResultado(null)

    const totalRequisicoes = 100
    const concorrencia = 100

    // Como sua autenticação usa CPF e senha
    const cpf = "06230124645"
    const senha = "175264"

    let sucesso = 0
    let erro = 0
    let contadorGlobal = 0

    const tempos: number[] = []
    const primeirosErros: DetalheErro[] = []

    async function realizarLogin(): Promise<void> {
      const indice = ++contadorGlobal
      const inicio = performance.now()

      try {
        const response = await signIn("credentials", {
          cpf,
          senha,
          redirect: false,
        })

        const fim = performance.now()
        tempos.push(fim - inicio)

        // No seu authorize(), qualquer falha retorna null.
        // Quando isso acontece, o signIn retorna ok=false e error="CredentialsSignin".
        if (response?.ok) {
          sucesso++
        } else {
          erro++

          if (primeirosErros.length < 20) {
            primeirosErros.push({
              indice,
              cpf,
              senha,
              mensagem: response?.error ?? "Falha na autenticação",
              status: response?.status,
              ok: response?.ok,
              url: response?.url,
            })
          }

          console.error("Falha no login", {
            indice,
            cpf,
            senha,
            response,
          })
        }
      } catch (e) {
        const fim = performance.now()
        tempos.push(fim - inicio)
        erro++

        if (primeirosErros.length < 20) {
          primeirosErros.push({
            indice,
            cpf,
            senha,
            mensagem:
              e instanceof Error ? e.message : "Erro desconhecido",
            status: undefined,
            ok: false,
            url: null,
          })
        }

        console.error("Exceção no login", {
          indice,
          cpf,
          senha,
          erro: e,
        })
      }
    }

    async function worker(total: number): Promise<void> {
      for (let i = 0; i < total; i++) {
        await realizarLogin()
      }
    }

    function calcularPercentil(
      valores: number[],
      percentil: number
    ): number {
      if (valores.length === 0) return 0

      const ordenados = [...valores].sort((a, b) => a - b)
      const indice = Math.floor((percentil / 100) * ordenados.length)

      return ordenados[Math.min(indice, ordenados.length - 1)]
    }

    function formatar(valor: number): string {
      return valor.toFixed(2)
    }

    const inicioTeste = performance.now()

    const requisicoesPorWorker = Math.floor(
      totalRequisicoes / concorrencia
    )

    const resto = totalRequisicoes % concorrencia

    const workers: Promise<void>[] = []

    for (let i = 0; i < concorrencia; i++) {
      const total =
        i < resto
          ? requisicoesPorWorker + 1
          : requisicoesPorWorker

      workers.push(worker(total))
    }

    await Promise.all(workers)

    const fimTeste = performance.now()
    const duracaoSegundos = (fimTeste - inicioTeste) / 1000
    const totalExecutado = sucesso + erro

    const min = tempos.length ? Math.min(...tempos) : 0
    const max = tempos.length ? Math.max(...tempos) : 0
    const media = tempos.length
      ? tempos.reduce((acc, valor) => acc + valor, 0) / tempos.length
      : 0

    setResultado({
      sucesso,
      erro,
      total: totalExecutado,
      tempoTotalSegundos: formatar(duracaoSegundos),
      requestsPorSegundo: formatar(
        totalExecutado / duracaoSegundos
      ),
      min: formatar(min),
      max: formatar(max),
      media: formatar(media),
      p95: formatar(calcularPercentil(tempos, 95)),
      p99: formatar(calcularPercentil(tempos, 99)),
      primeirosErros,
    })

    setExecutando(false)
  }

  return (
    <div style={{ padding: 40 }}>
      <button
        onClick={executarTeste}
        disabled={executando}
        style={{
          padding: "12px 24px",
          fontSize: 16,
          cursor: executando ? "not-allowed" : "pointer",
        }}
      >
        {executando ? "Executando teste..." : "Iniciar teste de carga"}
      </button>

      {resultado && (
        <pre
          style={{
            marginTop: 20,
            padding: 20,
            background: "#f4f4f4",
            borderRadius: 8,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {JSON.stringify(resultado, null, 2)}
        </pre>
      )}
    </div>
  )
}