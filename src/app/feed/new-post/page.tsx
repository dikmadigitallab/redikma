"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Image as ImageIcon, X, Info } from "lucide-react"
import { useRouter } from "next/navigation"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

export default function CreatePostPage() {
  const router = useRouter()

  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  // Esse estado controla a porcentagem do enquadramento vertical (0% topo, 100% fundo)
  const [imagePosition, setImagePosition] = useState(50) 

  const [isRecurring, setIsRecurring] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null)
      setImagePosition(50) // Reseta a posição ao remover a imagem
      return
    }
    const objectUrl = URL.createObjectURL(image)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [image])

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-900">
      
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full active:scale-90 transition-transform">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Nova postagem</h1>
        <button className="bg-gradient-to-r from-yellow-400 to-teal-400 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md active:scale-95 transition-all">
          Postar
        </button>
      </header>

      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-6">
        
        {/* Card de Conteúdo: Imagem Primeiro, Texto Depois */}
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100 space-y-6">
          
          {previewUrl ? (
            <div className="space-y-4">
              {/* Container da Imagem com ajuste dinâmico */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ 
                    objectPosition: `center ${imagePosition}%`, // Aplica o ajuste vertical
                    objectFit: 'cover' 
                  }}
                  className="w-full h-72 transition-all duration-150 ease-out"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:text-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Controle do Enquadramento */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.1em] font-black text-slate-400 flex justify-between">
                  <span>Ajustar enquadramento vertical</span>
                  <span className="text-teal-500">{imagePosition}%</span>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={imagePosition}
                  onChange={(e) => setImagePosition(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            </div>
          ) : (
            /* Botão de Upload quando não há imagem */
            <label className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ImageIcon size={28} />
              </div>
              <p className="font-bold text-slate-600">Adicionar uma foto</p>
              <p className="text-xs text-slate-400">Clique para selecionar</p>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </label>
          )}

          {/* Legenda (Agora embaixo da imagem) */}
          <div className="pt-2 border-t border-slate-50">
            <textarea
              placeholder="Escreva uma legenda..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[100px] resize-none outline-none text-slate-700 placeholder-slate-400 text-base leading-relaxed"
            />
          </div>
        </div>

        {/* Configurações (Mesmo estilo profissional anterior) */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-5">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Configurações</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-slate-700">Post recorrente</span>
              <span className="text-xs text-slate-400 leading-tight">
                (Será postado automaticamente após o ciclo)
              </span>
            </div>
            <input
              type="checkbox"
              className="w-6 h-6 rounded-md accent-teal-500 cursor-pointer"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700">Post fixo</span>
            <input
              type="checkbox"
              className="w-6 h-6 rounded-md accent-teal-500 cursor-pointer"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
            />
          </div>

          {!isFixed && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
              <p className="text-sm font-bold text-slate-600 mb-2">Duração</p>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as DurationType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="24h">24 horas</option>
                <option value="7d">7 dias</option>
                <option value="30d">30 dias</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}