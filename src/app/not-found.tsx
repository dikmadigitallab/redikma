export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#E5E7EB] px-4">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400 flex items-center justify-center text-4xl text-white mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Página não encontrada</h1>
        <p className="text-gray-500 mb-6">
          Desculpe, não conseguimos encontrar esta página.<br />
          Verifique o endereço ou volte para a página inicial  oscar e andre.
        </p>
        <a
          href="/"
          className="inline-block bg-gradient-to-r from-yellow-400 via-green-400 to-teal-500 text-white px-6 py-3 rounded-xl font-medium shadow hover:opacity-90 transition"
        >
          Voltar para o início
        </a>
      </div>
    </main>
  );
}