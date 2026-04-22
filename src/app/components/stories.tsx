"use client"

import { useRouter } from "next/navigation"

type Story = {
  id: string
  nome: string
  username: string
  foto?: string
  visto?: boolean
}

export function RightSidebar() {
  const router = useRouter()

  // 🔥 mock inicial (depois vem do backend)
  const stories: Story[] = [
    { id: "1", nome: "RH", username: "@rh", visto: false },
    { id: "2", nome: "Comunicação", username: "@comunicacao", visto: false },
    { id: "3", nome: "Diretoria", username: "@diretoria", visto: true },
    { id: "4", nome: "TI", username: "@ti", visto: true },
  ]

  function handleOpenStory(id: string) {
    // 🚀 no futuro: página completa do post/story
    router.push(`/stories/${id}`)
  }

  return (
<aside className="hidden lg:flex flex-col h-screen">

  <div className="bg-white rounded-2xl p-4 shadow-sm border flex-1 overflow-y-auto">
    
    <h2 className="text-gray-800 font-semibold mb-4">
      Atualizações
    </h2>

    {/* Lista vertical */}
    <div className="flex flex-col gap-4">

      {stories.map((story) => (
        <div
          key={story.id}
          onClick={() => handleOpenStory(story.id)}
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition"
        >
          
          {/* Avatar quadrado */}
          <div
            className={`
              p-[2px] rounded-xl
              ${story.visto 
                ? "bg-gray-300" 
                : "bg-gradient-to-tr from-yellow-400 to-teal-400"}
            `}
          >
            <div className="bg-white p-[2px] rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-gray-200 flex items-center justify-center text-sm font-semibold">
                {story.nome.charAt(0)}
              </div>
            </div>
          </div>

          {/* Infos */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {story.nome}
            </p>
            <p className="text-xs text-gray-400">
              Atualização recente
            </p>
          </div>

        </div>
      ))}

    </div>

  </div>

</aside>
  )
}