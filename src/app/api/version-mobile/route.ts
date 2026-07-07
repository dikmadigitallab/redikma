import { NextResponse } from "next/server"

const ULTIMA_VERSAO = process.env.APP_VERSION ||''

function compararVersoes(atual: string, ultima: string) {
  const a = atual.split(".").map(Number)
  const b = ultima.split(".").map(Number)

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const numA = a[i] || 0
    const numB = b[i] || 0

    if (numA < numB) return true
    if (numA > numB) return false
  }

  return false
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const versaoAtual = searchParams.get("versao")

  if (!versaoAtual) {
    return NextResponse.json({ erro: "versao não informada" }, { status: 400 })
  }

  const temAtualizacao = compararVersoes(versaoAtual, ULTIMA_VERSAO)

  return NextResponse.json({ atualizar: temAtualizacao })
}

/* 
vamos testar isso para que seja possivel atualizar o app mobile sem precisar passar por lojas de aplicativos, que as vezes demoram para aprovar
 atualizações. Assim, quando o usuário abrir o app, ele pode ser notificado sobre a disponibilidade d
 e uma nova versão e ser direcionado para baixar a atualização diretamente do nosso site ou loja de aplicativos, garantindo que todos
  tenham acesso às últimas melhorias e correções de bugs.
  vamos subir isso na branch oscar
*/