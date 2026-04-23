"use client"

import { useRouter } from "next/navigation"

type Story = {
  id: string
  nome: string
  username: string
  foto?: string
  visto?: boolean
  descricao: string // 👈 NOVO (conteúdo do post)
  criadoEm?: string // 👈 opcional (tempo: "2h", etc)
}

export function RightSidebar() {
  const router = useRouter()

  // 🔥 mock inicial (depois vem do backend)
const stories: Story[] = [
  {
    id: "1",
    nome: "RH",
    username: "rh",
    visto: false,
    descricao: "Hoje temos aniversariantes na equipe! 🎉 Não esqueça de parabenizar seus colegas.",
    criadoEm: "2h"
  },
  {
    id: "2",
    nome: "Comunicação",
    username: "comunicacao",
    visto: false,
    descricao: "Novo comunicado interno disponível com atualizações importantes sobre os projetos.",
    criadoEm: "4h"
  },
  {
    id: "3",
    nome: "Diretoria",
    username: "diretoria",
    visto: true,
    descricao: "Reunião geral marcada para sexta-feira às 10h. Contamos com a presença de todos.",
    criadoEm: "1d"
  },
  {
    id: "4",
    nome: "TI",
    username: "ti",
    visto: true,
    descricao: "Manutenção programada no sistema hoje às 22h. Pode haver instabilidade temporária.",
    criadoEm: "3h"
  },
  {
    id: "5",
    nome: "Financeiro",
    username: "financeiro",
    visto: false,
    descricao: "Lembrete: prazo para envio de reembolsos encerra amanhã às 18h.",
    criadoEm: "5h"
  },
  {
    id: "6",
    nome: "Marketing",
    username: "marketing",
    visto: true,
    descricao: "Nova campanha lançada! Confira os materiais disponíveis na intranet.",
    criadoEm: "6h"
  },
  {
    id: "7",
    nome: "RH",
    username: "rh",
    visto: false,
    descricao: "Pesquisa de clima organizacional já está disponível. Sua opinião é importante!",
    criadoEm: "7h"
  },
  {
    id: "8",
    nome: "TI",
    username: "ti",
    visto: true,
    descricao: "Atualização de segurança aplicada com sucesso. Nenhuma ação necessária dos usuários.",
    criadoEm: "8h"
  },
  {
    id: "9",
    nome: "Diretoria",
    username: "diretoria",
    visto: false,
    descricao: "Resultados do trimestre superaram as expectativas. Parabéns a todos!",
    criadoEm: "9h"
  },
  {
    id: "10",
    nome: "Comunicação",
    username: "comunicacao",
    visto: true,
    descricao: "Nova política interna publicada. Leia atentamente para se manter atualizado.",
    criadoEm: "10h"
  },
  {
    id: "11",
    nome: "RH",
    username: "rh",
    visto: false,
    descricao: "Treinamento obrigatório disponível na plataforma. Prazo até sexta-feira.",
    criadoEm: "11h"
  },
  {
    id: "12",
    nome: "TI",
    username: "ti",
    visto: true,
    descricao: "Novo sistema de chamados já está ativo. Utilize para suporte técnico.",
    criadoEm: "12h"
  },
  {
    id: "13",
    nome: "Marketing",
    username: "marketing",
    visto: false,
    descricao: "Evento interno será realizado na próxima semana. Em breve mais detalhes.",
    criadoEm: "13h"
  },
  {
    id: "14",
    nome: "Financeiro",
    username: "financeiro",
    visto: true,
    descricao: "Folha de pagamento já foi processada e estará disponível amanhã.",
    criadoEm: "14h"
  },
  {
    id: "15",
    nome: "Diretoria",
    username: "diretoria",
    visto: false,
    descricao: "Agradecemos o empenho de todos na entrega do último projeto.",
    criadoEm: "15h"
  },
  {
    id: "16",
    nome: "RH",
    username: "rh",
    visto: true,
    descricao: "Novas vagas internas abertas. Consulte a área de carreiras.",
    criadoEm: "16h"
  },
  {
    id: "17",
    nome: "TI",
    username: "ti",
    visto: false,
    descricao: "Backup realizado com sucesso. Nenhuma inconsistência detectada.",
    criadoEm: "17h"
  },
  {
    id: "18",
    nome: "Comunicação",
    username: "comunicacao",
    visto: true,
    descricao: "Newsletter semanal enviada. Confira as novidades da empresa.",
    criadoEm: "18h"
  },
  {
    id: "19",
    nome: "Marketing",
    username: "marketing",
    visto: false,
    descricao: "Resultados da campanha anterior foram positivos. Obrigado pelo apoio!",
    criadoEm: "19h"
  },
  {
    id: "20",
    nome: "Financeiro",
    username: "financeiro",
    visto: true,
    descricao: "Relatórios financeiros do mês já estão disponíveis para consulta.",
    criadoEm: "20h"
  }
]

  function handleOpenStory(id: string) {
    // 🚀 no futuro: página completa do post/story
    router.push(`/stories/${id}`)
  }

  return (
<div className="hidden lg:flex flex-col gap-0 h-full mt-[10%]">

  <div className="flex-shrink-0">
    <h2 className="font-semibold mb-4 text-base" style={{ color: 'var(--black)' }}>
      Atualizações
    </h2>
  </div>

  <div className="flex-1 flex flex-col gap-5 overflow-y-auto">

    {stories.map((story) => (
      <div
        key={story.id}
        onClick={() => handleOpenStory(story.id)}
        className="flex gap-3 cursor-pointer p-3 transition hover:opacity-70 w-full"
        style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: story.visto ? 'transparent' : 'var(--background)'
        }}
      >
        
        <div
          className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-semibold text-white"
          style={{ backgroundColor: story.visto ? 'var(--gray)' : 'var(--secondary)' }}
        >
          {story.nome.charAt(0)}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          
          <p className="text-sm font-medium" style={{ color: 'var(--black)' }}>
            {story.nome}
          </p>

          <p className="text-xs line-clamp-2" style={{ color: 'var(--gray)' }}>
            {story.descricao || "Atualização recente da empresa com informações importantes para o time."}
          </p>

          <p className="text-xs mt-1" style={{ color: 'var(--gray)' }}>
            {story.criadoEm}
          </p>

        </div>

      </div>
    ))}

  </div>

</div>
  )
}
