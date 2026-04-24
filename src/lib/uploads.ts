import { createClient } from "@supabase/supabase-js"

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
  const extension = file.name.split(".").pop()
  const fileName = generateFileName(extension || "png")

  const filePath = `posts-image/${fileName}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file)

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return data.publicUrl
}