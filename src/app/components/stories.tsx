"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoriesModal } from "./modal-stories";

type Story = {
  id: string;
  nome: string;
  username: string;
  foto?: string;
  visto?: boolean;
  descricao: string;
  criadoEm: string; // obrigatório
  titulo?: string | null;
  imagem?: string | null;
};

export function RightSidebar() {
  const router = useRouter();

  // Estado do story selecionado
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Mock inicial
  const stories: Story[] = [
    {
      id: "1",
      nome: "Dikma",
      username: "dikma",
      visto: false,
      descricao:
        "Desde 1996, a Dikma transforma experiência, inovação e tecnologia em soluções que aumentam a competitividade de seus clientes.",
      criadoEm: "2h",
    },
    {
      id: "2",
      nome: "Propósito",
      username: "proposito",
      visto: false,
      descricao:
        "A competitividade dos nossos clientes é a razão de nossa existência e de todas as nossas ações.",
      criadoEm: "3h",
    },
    {
      id: "3",
      nome: "Missão",
      username: "missao",
      visto: false,
      descricao:
        "Aumentar a competitividade dos clientes por meio de soluções eficientes, mecanizadas e personalizadas.",
      criadoEm: "4h",
    },
    {
      id: "4",
      nome: "Visão",
      username: "visao",
      visto: true,
      descricao:
        "Ser reconhecida como parceira estratégica da Indústria 4.0.",
      criadoEm: "5h",
    },
    {
      id: "5",
      nome: "Valores",
      username: "valores",
      visto: false,
      descricao:
        "Compromisso, resposta rápida, empatia, qualidade, zelo e valorização das pessoas e transformação digital.",
      criadoEm: "6h",
    },
    {
      id: "6",
      nome: "Cultura",
      username: "cultura",
      visto: true,
      descricao:
        "Acolhimento, organização e excelência fazem parte da forma como trabalhamos e nos relacionamos todos os dias.",
      criadoEm: "7h",
    },
    {
      id: "7",
      nome: "Pessoas",
      username: "pessoas",
      visto: false,
      descricao:
        "Valorizamos cada colaborador e acreditamos que o desenvolvimento das pessoas fortalece nossos resultados.",
      criadoEm: "8h",
    },
    {
      id: "8",
      nome: "Inovação",
      username: "inovacao",
      visto: true,
      descricao:
        "Investimos continuamente em tecnologia, automação e equipamentos de ponta para elevar produtividade e segurança.",
      criadoEm: "9h",
    },
    {
      id: "9",
      nome: "Segurança",
      username: "seguranca",
      visto: false,
      descricao:
        "Segurança vem sempre em primeiro lugar, garantindo tranquilidade e proteção para todos os colaboradores.",
      criadoEm: "10h",
    },
    {
      id: "10",
      nome: "Qualidade",
      username: "qualidade",
      visto: true,
      descricao:
        "A certificação ISO 9001:2015 reforça nosso compromisso com a melhoria contínua e a excelência nos processos.",
      criadoEm: "11h",
    },
    {
      id: "11",
      nome: "Sustentabilidade",
      username: "sustentabilidade",
      visto: false,
      descricao:
        "Promovemos o uso responsável de recursos como água e energia, com foco em eficiência e responsabilidade ambiental.",
      criadoEm: "12h",
    },
    {
      id: "12",
      nome: "Parceria",
      username: "parceria",
      visto: true,
      descricao:
        "Transformar clientes em parceiros sempre foi parte da essência da Dikma.",
      criadoEm: "13h",
    },
    {
      id: "13",
      nome: "Tecnologia",
      username: "tecnologia",
      visto: false,
      descricao:
        "Nossa atuação combina mão de obra mecanizada e soluções modernas para simplificar processos e gerar resultados.",
      criadoEm: "14h",
    },
    {
      id: "14",
      nome: "Excelência",
      username: "excelencia",
      visto: true,
      descricao:
        "Servir com excelência é um compromisso diário presente em cada atividade e em cada detalhe.",
      criadoEm: "15h",
    },
    {
      id: "15",
      nome: "Agilidade",
      username: "agilidade",
      visto: false,
      descricao:
        "Resposta rápida e atuação estratégica garantem maior eficiência para nossos clientes e equipes.",
      criadoEm: "16h",
    },
    {
      id: "16",
      nome: "Indústria 4.0",
      username: "industria40",
      visto: true,
      descricao:
        "Estamos alinhados à transformação digital e às novas tecnologias que impulsionam a indústria moderna.",
      criadoEm: "17h",
    },
    {
      id: "17",
      nome: "Facilities",
      username: "facilities",
      visto: false,
      descricao:
        "Oferecemos soluções integradas em limpeza industrial, manutenção, áreas verdes e apoio operacional.",
      criadoEm: "18h",
    },
    {
      id: "18",
      nome: "Confiança",
      username: "confianca",
      visto: true,
      descricao:
        "Nossa trajetória é construída com persistência, ousadia e compromisso com resultados sustentáveis.",
      criadoEm: "19h",
    },
    {
      id: "19",
      nome: "Equipe",
      username: "equipe",
      visto: false,
      descricao:
        "Cada colaborador contribui para um ambiente acolhedor, organizado e orientado pela excelência.",
      criadoEm: "20h",
    },
    {
      id: "20",
      nome: "ReDikma",
      username: "redikma",
      visto: false,
      descricao:
        "Um espaço para fortalecer nossa conexão e manter viva a cultura que nos une todos os dias.",
      criadoEm: "21h",
    },
  ];

  // Abre o modal
  function handleOpenStory(story: Story) {
    setSelectedStory(story);
  }

  // Fecha o modal
  function closeStory() {
    setSelectedStory(null);
  }

  return (
    <>
      <div className="hidden lg:flex flex-col h-full">
        {/* Cabeçalho */}
        <div className="flex-shrink-0 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--primary)" }}
              >
                Atualizações
              </h2>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--gray)" }}
              >
                Comunicados e novidades da empresa
              </p>
            </div>

            <div
              className="px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--primary)",
              }}
            >
              Novo
            </div>
          </div>
        </div>

        {/* Card principal */}
        <div
          className="flex-1 overflow-hidden rounded-2xl shadow-sm border"
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
                "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)",
            }}
          />

          {/* Lista */}
          <div className="h-full overflow-y-auto">
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleOpenStory(story)}
                className="group relative cursor-pointer transition-all duration-300"
              >
                {!story.visto && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                    style={{ backgroundColor: "var(--secondary)" }}
                  />
                )}

                <div
                  className="flex gap-4 px-4 py-4 border-b transition-all duration-300 group-hover:opacity-90"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: story.visto
                      ? "var(--white)"
                      : "rgba(79, 195, 217, 0.06)",
                  }}
                >
                  <div className="relative flex-shrink-0">
                    {!story.visto && (
                      <div
                        className="absolute -inset-1 rounded-2xl opacity-20 blur-sm"
                        style={{ backgroundColor: "var(--secondary)" }}
                      />
                    )}

                    <div
                      className="relative w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm"
                      style={{
                        backgroundColor: story.visto
                          ? "var(--background)"
                          : "var(--secondary)",
                        color: story.visto
                          ? "var(--primary)"
                          : "var(--white)",
                      }}
                    >
                      {story.nome.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{
                          color: story.visto
                            ? "var(--black)"
                            : "var(--primary)",
                        }}
                      >
                        {story.nome}
                      </p>

                      {!story.visto && (
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                          style={{
                            backgroundColor: "var(--success)",
                            boxShadow:
                              "0 0 0 3px rgba(107, 194, 141, 0.15)",
                          }}
                        />
                      )}
                    </div>

                    <p
                      className="text-xs leading-5 line-clamp-2 mt-1"
                      style={{ color: "var(--gray)" }}
                    >
                      {story.descricao}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      <div
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: "var(--gray)" }}
                      />

                      <p
                        className="text-[11px] font-medium"
                        style={{ color: "var(--gray)" }}
                      >
                        {story.criadoEm}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StoriesModal
        selectedStory={selectedStory}
        closeStory={closeStory}
      />
    </>
  );
}