import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"
import fs from "fs/promises"
import path from "path"
import os from "os"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

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



export async function uploadVideo(
  file: File,
  bucket: string
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  const ext = file.name.split(".").pop() || "mp4"

  // tenta comprimir com ffmpeg; se falhar, faz upload do original
  try {
    const compressedBuffer = await compressVideo(inputBuffer, ext)
    const fileName = generateFileName("mp4")
    const filePath = `posts-video/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, compressedBuffer, {
        contentType: "video/mp4",
      })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch {
    // fallback: upload original sem compressão
    const fileName = generateFileName(ext)
    const filePath = `posts-video/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, inputBuffer, {
        contentType: (file.type?.split(";")[0]?.trim()) || "video/mp4",
      })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return data.publicUrl
  }
}

async function compressVideo(
  buffer: Buffer,
  ext: string
): Promise<Buffer> {
  const ffmpeg = require("fluent-ffmpeg") as any
  const ffmpegPath = require("ffmpeg-static") as string | null

  if (!ffmpegPath) {
    throw new Error("ffmpeg binary not found")
  }

  ffmpeg.setFfmpegPath(ffmpegPath)

  const tempDir = os.tmpdir()
  const tempInput = path.join(tempDir, `frash_input_${Date.now()}.${ext}`)
  const tempOutput = path.join(tempDir, `frash_output_${Date.now()}.mp4`)

  try {
    await fs.writeFile(tempInput, buffer)

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInput)
        .videoCodec("libx264")
        .audioCodec("aac")
        .size("?x720")
        .outputOptions([
          "-crf 28",
          "-preset medium",
          "-movflags +faststart",
          "-b:a 64k",
        ])
        .on("end", () => resolve())
        .on("error", (err: Error) => reject(err))
        .save(tempOutput)
    })

    return await fs.readFile(tempOutput)
  } finally {
    await fs.unlink(tempInput).catch(() => {})
    await fs.unlink(tempOutput).catch(() => {})
  }
}

export async function deleteStorageFile(publicUrl: string): Promise<void> {
  const url = new URL(publicUrl)
  const segments = url.pathname.split("/")
  const publicIndex = segments.indexOf("public")
  if (publicIndex === -1 || publicIndex + 1 >= segments.length) return

  const bucket = segments[publicIndex + 1]
  const filePath = segments.slice(publicIndex + 2).join("/")

  if (!bucket || !filePath) return

  const client = supabaseAdmin ?? supabase

  const { error } = await client.storage.from(bucket).remove([filePath])

  if (error) {
    console.error(`[Storage] Erro ao deletar ${bucket}/${filePath}:`, error.message)
  }
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

  return `${data.publicUrl}?t=${Date.now()}`
}
