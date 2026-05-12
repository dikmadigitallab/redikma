type Story = {
  id: number | string;
  nome: string;
  criadoEm: string;
  descricao?: string | null;
  titulo?: string | null;
  imagem?: string | null;
};

interface StoriesModalProps {
  selectedStory: Story | null;
  closeStory: () => void;
}

export const StoriesModal = ({
  selectedStory,
  closeStory,
}: StoriesModalProps) => {
  if (!selectedStory) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeStory}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(10, 69, 84, 0.55)" }}
      />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{
          backgroundColor: "var(--white)",
          borderColor: "var(--border)",
        }}
      >
        {/* Barra superior decorativa */}
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary-dark) 0%, var(--secondary) 70%, var(--accent) 100%)",
          }}
        />

        {/* Cabeçalho */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--white)",
              }}
            >
              {selectedStory.nome.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3
                className="text-base font-bold truncate"
                style={{ color: "var(--primary-dark)" }}
              >
                {selectedStory.nome}
              </h3>

              <p
                className="text-xs mt-1"
                style={{ color: "var(--gray)" }}
              >
                {selectedStory.criadoEm}
              </p>
            </div>
          </div>

          {/* Botão Fechar */}
          <button
            onClick={closeStory}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
            style={{
              backgroundColor: "var(--background)",
              color: "var(--primary-dark)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            {/* Título opcional */}
            {selectedStory.titulo && (
              <h4
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--primary-dark)" }}
              >
                {selectedStory.titulo}
              </h4>
            )}

            {/* Descrição */}
            <p
              className="text-sm leading-7 whitespace-pre-line"
              style={{ color: "var(--black)" }}
            >
              {selectedStory.descricao ||
                "Atualização recente da empresa com informações importantes para toda a equipe."}
            </p>

            {/* Imagem opcional */}
            {selectedStory.imagem && (
              <img
                src={selectedStory.imagem}
                alt={selectedStory.nome}
                className="w-full rounded-2xl mt-6 object-cover max-h-[420px]"
              />
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div
          className="px-6 py-4 border-t flex items-center justify-between"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--background)",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--success)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "var(--gray)" }}
            >
              Comunicação interna Dikma
            </span>
          </div>

          <button
            onClick={closeStory}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "var(--primary-dark)",
              color: "var(--white)",
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};