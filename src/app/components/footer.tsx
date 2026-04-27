const VERSION = "0.1.2"

export function Footer() {
  return (
    <footer className="hidden md:block flex-shrink-0 bg-white border-t border-gray-200">
      <div className="px-[10%] h-20 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <span>© 2026 ReDikma</span>
          <span className="text-gray-500">Versão {VERSION}</span>
        </div>
      </div>
    </footer>
  );
}