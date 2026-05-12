"use client"

import { useState } from "react"
import { CreatNewPost } from "../../components/modal-postagem"

import { RightSidebar } from "../../components/stories"
import { FeedNoticias } from "../../components/feed"
import { Footer } from '../../components/footer'
import { useSession } from "next-auth/react"
import { Header } from "@/app/components/feedHeader"
import { FloatButtonMobile } from "@/app/components/floatButtonMobile"

export default function Feed() {
  const [openModal, setOpenModal] = useState(false)
  const [refreshFeed, setRefreshFeed] = useState(0)





  return (
    /* Adicione dvh (dynamic viewport height) se possível para mobile, ou h-screen fixo */
    <div className="h-screen w-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header - h-fixo e flex-shrink-0 para não amassar */}
      <Header />
      {/* Main Content Area - flex-1 garante que ocupa o resto da tela abaixo do header */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Container do Centro - overflow-hidden aqui é vital */}
        <div className="flex-1 flex w-full px-4 md:px-[5%] lg:px-[5%] py-8 md:py-6 gap-4 md:gap-6 overflow-hidden">

          {/* Feed Principal - overflow-y-auto faz a rolagem ficar SÓ aqui */}
          <main className="flex-3 h-full  overflow-y-auto pb-24 md:pb-6 scrollbar-hide">
            <FeedNoticias onRefresh={() => setRefreshFeed(k => k + 1)} />
          </main>

          {/* Sidebar Direita - h-full e overflow-y-auto para rolar independente */}
          <aside className="hidden lg:flex lg:flex-col lg:w-[600px] h-full flex-shrink-0 overflow-y-auto" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
            <div className="p-4">
              <RightSidebar />
            </div>
          </aside>
        </div>

        {/* Botão Flutuante Mobile */}
        <FloatButtonMobile callback={setOpenModal} />
      </div>

      {/* Footer - Se o footer for importante, ele deve estar aqui ou dentro do Sidebar */}
      {/* <Footer /> */}
      <Footer />
      {/* modal de criação de posts */}
      <CreatNewPost
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => setRefreshFeed(k => k + 1)}
        onRefresh={() => setRefreshFeed(k => k + 1)}
      />
    </div>
  )
}
