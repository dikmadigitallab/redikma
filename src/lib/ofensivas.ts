// lib/ofensivas.ts

export const badWords = [
  // Suas originais
  "fdp", "filho da puta", "puta", "caralho", "porra", "merda", "bosta", "arrombado", 
  "idiota", "imbecil", "otario", "otário", "burro", "vagabundo", "desgraçado", 
  "desgracado", "corno", "viado", "babaca", "escroto", "lixo", "cu", "rola", 
  "piroca", "buceta", "xota", "foder", "fodase", "foda-se", "safado", "safada", 
  "vadia", "punheta", "fuck", "fucking", "bitch", "asshole", "dick", "pussy", 
  "slut", "whore", "shit", "bullshit", "motherfucker", "inferno",

  // Ofensas e Baixo Calão (PT-BR)
  "abestado", "analfabeto", "animal", "asno", "baitola", "biba", "bicha", "bisca", 
  "boçal", "boiola", "bolagato", "boquete", "cacete", "cadela", "cafajeste", 
  "canalha", "caceta", "chibata", "chifrudo", "chupeta", "clitoris", "corna", 
  "cuzão", "cuzao", "cuzinho", "debil", "demente", "desgraça", "ebrio", "eunuco", 
  "estupido", "estúpida", "fanchone", "foda", "fodão", "fodido", "fodida", 
  "fofoqueiro", "frangalho", "fuleira", "fuleiragem", "galinha", "gentalha", 
  "gozo", "gozada", "grelo", "horripilante", "imundo", "imundice", "isquelético", 
  "jumento", "ladrao", "ladrão", "lambisgoia", "lazarento", "leproso", "lesbica", 
  "lésbica", "louco", "maconheiro", "maluco", "mandrake", "masturba", "meleca", 
  "mocreia", "mocréia", "mondrongo", "mongol", "nanico", "ninfeta", "orgia", 
  "paca", "pafia", "palhaço", "pau", "peido", "pênis", "penis", "pentelho", 
  "perereca", "pica", "pifio", "pilantra", "piranha", "pistoleira", "pnc", 
  "prostituta", "prostituto", "pqp", "quenga", "quengagem", "rabo", "rapariga", 
  "retardado", "ridiculo", "roela", "roshow", "siririca", "tarado", "tesao", 
  "tesão", "testiculo", "tonto", "trouxa", "troxa", "vaca", " vadiagem", "vambora", 
  "veado", "verme", "xana", "xaninha", "xavasca", "xereca", "xupada", "xupar",

  // Termos em Inglês (Slangs)
  "abuse", "anal", "anus", "arse", "ass", "bastard", "blowjob", "boob", "boobie", 
  "boobies", "bullcrap", "cock", "cum", "cunt", "damn", "dildo", "douche", 
  "douchebag", "fag", "faggot", "jerk", "nigger", "retard", "scum", "sex", 
  "sexy", "suck", "tit", "tits", "twat", "vagina",

  // Variações de escrita (Leet Speak)
  "4rrombado", "b0sta", "c4r4lh0", "d3sgr4c4d0", "f0d4", "m3rd4", "p0rr4", 
  "pu74", "sh1t", "v14d0"
];

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function containsBadWords(text: string): boolean {
  const normalizedText = normalizeText(text)

  return badWords.some((word) => {
    const normalizedWord = normalizeText(word)

    const regex = new RegExp(`\\b${normalizedWord}\\b`, "i")

    return regex.test(normalizedText)
  })
}

export function censorBadWords(text: string): string {
  let censoredText = text

  badWords.forEach((word) => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    const regex = new RegExp(`\\b${escapedWord}\\b`, "gi")

    censoredText = censoredText.replace(
      regex,
      "*".repeat(word.length)
    )
  })

  return censoredText
}