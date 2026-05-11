// lib/ofensivas.ts

export const badWords = [
  "fdp",
  "filho da puta",
  "puta",
  "caralho",
  "porra",
  "merda",
  "bosta",
  "arrombado",
  "idiota",
  "imbecil",
  "otario",
  "otário",
  "burro",
  "vagabundo",
  "desgraçado",
  "desgracado",
  "corno",
  "viado",
  "babaca",
  "escroto",
  "lixo",
  "cu",
  "rola",
  "piroca",
  "buceta",
  "xota",
  "foder",
  "fodase",
  "foda-se",
  "safado",
  "safada",
  "vadia",
  "punheta",

  "fuck",
  "fucking",
  "bitch",
  "asshole",
  "dick",
  "pussy",
  "slut",
  "whore",
  "shit",
  "bullshit",
  "motherfucker",
]

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