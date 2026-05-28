"use client";

import Image from "next/image";

interface Liker {
  id: string;
  nome: string;
  foto: string;
}

interface LikeViewProps {
  likers: Liker[];
  totalLikes: number;
}

export function LikeView({ likers = [], totalLikes = 0 }: LikeViewProps) {
  // Pegamos os 3 primeiros para o visual empilhado
  const visualLikers = likers.slice(0, 3);

  if (totalLikes === 0) return null;

  return (
    <div className="flex items-center gap-2 px-1">
      {/* Container das fotos empilhadas */}
      <div className="flex -space-x-2">
        {visualLikers.map((liker, index) => (
          <div key={liker.id} className="relative group">
            <Image
              src={liker.foto}
              alt={liker.nome}
              width={24}
              height={24}
              loading="lazy"
              
              draggable={false}
              className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm"
              style={{ zIndex: 3 - index }}
            />

            {/* Tooltip: Aparece no Hover (PC) ou Long Press/Touch (Mobile) */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
              <div className="bg-neutral-800 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap shadow-xl">
                {liker.nome}
                {/* Setinha do tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
              </div>
            </div>
          </div>
        ))}

        {/* Círculo com o "+" caso tenha muita gente */}
        {totalLikes > 3 && (
          <div className="w-6 h-6 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center z-0 shadow-sm">
            <span className="text-[8px] font-bold text-primary">
              +{totalLikes - 3}
            </span>
          </div>
        )}
      </div>

      {/* Texto descritivo lateral - Minimalista para celular */}
      <div className="text-[11px] text-primary leading-tight">
        {totalLikes === 1 ? (
          <span>
            Curtido por{" "}
            <b className="text-neutral-800">{likers[0]?.nome || "alguém"}</b>
          </span>
        ) : (
          <span>
            <b className="text-neutral-800">{likers[0]?.nome || "Alguém"}</b> e{" "}
            <b className="text-neutral-800 text-nowrap">
              {totalLikes - 1} outros
            </b>
          </span>
        )}
      </div>
    </div>
  );
}
