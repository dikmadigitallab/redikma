'use client'

import { useState, useRef, useEffect } from "react"
import { Trash2, Edit3, MoreHorizontal } from "lucide-react"

interface PostOptionsProps {
  postId: string;
  onDelete: (id: string) => void; // Sua função de callback para deletar
  onEdit?: (id: string) => void;  // Opcional: sua função para editar
}

export function PostOptions({ postId, onDelete, onEdit }: PostOptionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fecha o menu automaticamente se o usuário clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative flex justify-end w-full" ref={menuRef}>
      {/* Botão de 3 pontinhos */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-primary hover:bg-primary-10 p-1 rounded-full transition-colors flex items-center justify-center select-none"
      >
        <MoreHorizontal size={24} />
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-10 w-48 bg-white border border-primary rounded-xl shadow-xl z-60 py-2 animate-in fade-in zoom-in duration-200">
          
          {/* Opção: Editar */}
          <button
            onClick={() => {
              if (onEdit) onEdit(postId)
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-neutral-50 transition-colors"
          >
            <Edit3 size={16} />
            Editar post
          </button>
          
          {/* Linha Divisória */}
          <div className="h-1px bg-neutral-100 my-1" />

          {/* Opção: Apagar */}
          <button
            onClick={() => {
              onDelete(postId) // Executa o seu callback de exclusão
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <Trash2 size={16} />
            Apagar post
          </button>
        </div>
      )}
    </div>
  )
}