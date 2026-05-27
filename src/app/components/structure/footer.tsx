import { version } from '../../../../package.json';
//vamos dar nomes de animais  em ingles para as versões, tipo "1.0.0 - Lion", "1.1.0 - Tiger", etc. para ficar mais divertido
const VERSION = ` ${version} - Lion-🦁-${version.split('.').join('')}`;

export function Footer() {
  return (
    <footer className="w-full shrink-0" style={{ backgroundColor: "var(--white)" }}>
      <div className="w-full border-t hidden md:block" style={{ borderColor: "var(--border)" }}>
        <div className="h-30 max-w-7xl mx-auto my-4 px-4 sm:px-6 lg:px-8 flex items-start justify-between text-sm text-gray-500">
          <span>© 2026 ReDikma todos os direitos reservados</span>
          <span>Versão {VERSION}</span>
        </div>
      </div>
      <div className="h-16 md:hidden" />
    </footer>
  );
}