"use client"

import { useState } from "react"
import { CreatNewPost } from "../../components/modal-postagem"

import { RightSidebar } from "../../components/stories"
import { FeedNoticias } from "../../components/feed"
import { Footer } from '../../components/footer'
/* import { Header } from "@/app/components/feedHeader" */
import { FloatButtonMobile } from "@/app/components/floatButtonMobile"

export default function Feed() {
  const [openModal, setOpenModal] = useState(false)
  const [refreshFeed, setRefreshFeed] = useState(0)





  return (
    <div
      className="h-screen min-h-[98dvh] w-full  flex flex-col overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Header */}
    {/*   <Header /> */}

      {/* Conteúdo principal */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Layout central */}
        <div className="flex-1 flex w-full px-3 sm:px-4 md:px-[5%] py-4 md:py-6 gap-4 md:gap-6 overflow-hidden min-h-0">
          {/* Feed principal */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto pb-24 md:pb-6 scrollbar-hide">
            <div className="w-full max-w-3xl mx-auto">
              <FeedNoticias
                onRefresh={() =>
                  setRefreshFeed((k) => k + 1)
                }
              />
            </div>
          </main>

          {/* Sidebar direita */}
          <aside
            className="hidden lg:flex lg:flex-col lg:w-[30vw] xl:w-130 h-full shrink-0 overflow-hidden rounded-3xl border shadow-sm"
            style={{
              backgroundColor: "var(--white)",
              borderColor: "var(--border)",
              boxShadow:
                "0 4px 20px rgba(10, 69, 84, 0.04)",
            }}
          >
            {/* Barra decorativa superior */}
            <div
              className="h-1 w-full flex-shrink-0"
              style={{
                background:
                  "linear-gradient(90deg, var(--primary-dark) 0%, var(--secondary) 70%, var(--accent) 100%)",
              }}
            />

            {/* Conteúdo com rolagem independente */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              <RightSidebar />
            </div>
          </aside>
        </div>

        {/* Botão flutuante mobile */}
        <FloatButtonMobile callback={setOpenModal} />
      </div>

      {/* Footer */}
      <Footer />

      {/* Modal de criação de posts */}
      <CreatNewPost
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() =>
          setRefreshFeed((k) => k + 1)
        }
        onRefresh={() =>
          setRefreshFeed((k) => k + 1)
        }
      />
    </div>
  )
}
