import { version } from '../../../package.json';
const VERSION = ` ${version} - ${new Date().getFullYear()}`;

export function Footer() {
  return (
    <footer className="hidden md:block w-full flex-shrink-0 bg-[#F5F5F5]">
      {/* borda ocupa tela inteira */}
      <div className="w-full border-t" style={{ borderColor: "var(--border)" }}>

        {/* conteúdo centralizado */}
        <div className="h-30 max-w-7xl mx-auto my-4 px-4 sm:px-6 lg:px-8 flex items-start justify-between text-sm text-gray-500">
          <span>© 2026 ReDikma</span>
          <span>Versão {VERSION}</span>
        </div>

      </div>
    </footer>
  );
}