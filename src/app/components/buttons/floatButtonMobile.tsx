'use client'

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react"; // Ajuste caso seu ícone venha de outra biblioteca
import { useSession } from "next-auth/react";

// Definimos a interface para as props do componente
interface FloatButtonMobileProps {
  callback: (abrir: boolean) => void;
}

export function FloatButtonMobile({ callback }: FloatButtonMobileProps) {
  const router = useRouter();
  const session = useSession();
  const role = session.data?.user?.role;


  return (
 <>
 {role === "COMMON" ? (
  <></>
) : (
  <div
    className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer shadow-xl active:scale-90 transition-all z-50"
    style={{
      background:
        "linear-gradient(135deg, #60a5fa 0%, #34d399 50%, #facc15 100%)",
      border: "2px solid var(--white)",
    }}
    onClick={() => {
      if (window.innerWidth >= 1024) {
        callback(true);
        return;
      }
      router.push("/intern/feed/new-post");
    }}
  >
    <Plus size={28} strokeWidth={2.5} className="text-white" />
  </div>
)}
 </>
  )
}
