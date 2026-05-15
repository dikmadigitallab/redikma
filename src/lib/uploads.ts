import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function generateFileName(extension: string) {
  const now = new Date()

  const pad = (n: number) => n.toString().padStart(2, "0")

  const datePart =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds()) +
    now.getMilliseconds()

  const randomPart = Math.random().toString(36).substring(2, 8)

  return `${datePart}_${randomPart}.${extension}`
}

export async function uploadImage(
  file: File,
  bucket: string
): Promise<string> {
  // comprime imagem sem perder qualidade visual
  const arrayBuffer =
    await file.arrayBuffer()

  const buffer = Buffer.from(arrayBuffer)

  const compressedImage = await sharp(buffer)
    .rotate()
    .resize({
      width: 1920,
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 92,
      mozjpeg: true,
    })
    .toBuffer()

  const fileName =
    generateFileName("jpg")

  const filePath = `posts-image/${fileName}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, compressedImage, {
      contentType: "image/jpeg",
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}



// função específica para upload de imagem de perfil, que remove a imagem anterior (se existir) para evitar acúmulo de arquivos
export async function uploadProfileImage(
  file: File,
  userId: string,
  bucket: string
): Promise<string> {
  // comprime imagem sem perder qualidade visual
  const arrayBuffer =
    await file.arrayBuffer()

  const buffer = Buffer.from(arrayBuffer)

  const compressedImage = await sharp(buffer)
    .rotate()
    .resize({
      width: 1600,
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 92,
      mozjpeg: true,
    })
    .toBuffer()

  const filePath = `profile/${userId}.jpg`

  // remove qualquer arquivo anterior
  const { data: files } = await supabase.storage
    .from(bucket)
    .list("profile")

  if (files) {
    const toDelete = files
      .filter((f) =>
        f.name.startsWith(userId + ".")
      )
      .map((f) => `profile/${f.name}`)

    if (toDelete.length > 0) {
      await supabase.storage
        .from(bucket)
        .remove(toDelete)
    }
  }

  // upload imagem comprimida
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, compressedImage, {
      upsert: true,
      contentType: "image/jpeg",
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return data.publicUrl
}
