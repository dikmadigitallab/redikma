import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import * as XLSX from "xlsx"

function gerarSenhaPadrao(cpf: string) {
  return cpf.replace(/\D/g, "").slice(0, 6)
}



function gerarUsername(nome: string, cpf: string): string {
  const nomeFormatado = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "")
    .slice(0, 15)

  const ultimosDigitos = cpf.slice(-6)
  const numerosEmbaralhados = ultimosDigitos.split("").sort(() => Math.random() - 0.5).join("")

  return `${nomeFormatado}_${numerosEmbaralhados}`
}

function isExcelDateSerial(value: unknown): boolean {
  if (typeof value !== "number") return false
  return value >= 20000 && value <= 60000
}

function parseExcelDate(value: unknown): Date | null {
  if (typeof value === "number" && isExcelDateSerial(value)) {
    const date = XLSX.SSF.parse_date_code(value)
    if (date) {
      return new Date(date.y, date.m - 1, date.d)
    }
  }
  return null
}

function parseDateString(dateStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null
  
  const str = dateStr.trim()
  
  if (/^\d{1,2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split("/").map(Number)
    return new Date(y, m - 1, d)
  }

  if (/^\d{1,2}\/\d{4}$/.test(str)) {
    const [d, my] = str.split("/").map(Number)
    const m = Math.floor(my / 100)
    const y = my % 100
    return new Date(1900 + y, m - 1, d)
  }
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const date = new Date(str)
    return isNaN(date.getTime()) ? null : date
  }
  
  if (/^\d+$/.test(str)) {
    const num = parseInt(str, 10)
    if (num >= 20000 && num <= 60000) {
      const date = XLSX.SSF.parse_date_code(num)
      if (date) {
        return new Date(date.y, date.m - 1, date.d)
      }
    }
  }
  
  const parsed = new Date(str)
  return isNaN(parsed.getTime()) ? null : parsed
}

function getCellValue(row: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const lowerKey = key.toLowerCase()
    for (const [k, v] of Object.entries(row)) {
      if (k.toLowerCase() === lowerKey && v !== undefined && v !== null) {
        return v
      }
    }
  }
  return null
}

function parseDateField(value: unknown): Date | null {
  if (value instanceof Date) return value
  if (typeof value === "number") {
    const date = parseExcelDate(value)
    if (date) return date
  }
  if (typeof value === "string") {
    return parseDateString(value)
  }
  return null
}

function normalizeCPF(cpf: unknown): string {
  if (!cpf) return ""
  return String(cpf).replace(/\D/g, "")
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })

    if (workbook.SheetNames.length === 0) {
      return NextResponse.json({ error: "Planilha vazia" }, { status: 400 })
    }

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })

    if (data.length < 1) {
      return NextResponse.json({ error: "Planilha sem dados" }, { status: 400 })
    }

    const results = {
      success: [] as { nome: string; cpf: string; senha: string; username: string }[],
      errors: [] as { linha: number; erro: string; debug?: string }[],
      skipped: [] as { linha: number; cpf: string; motivo: string }[],
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNum = i + 2

      const nome = String(getCellValue(row, ["nome", "Nome"]) || "").trim()
      const admissaoRaw = getCellValue(row, ["admissão", "admissao", "Admissão"])
      const cargo = String(getCellValue(row, ["título reduzido (cargo)", "título reduzido", "cargo", "Cargo", "título reduzido (cargo)"]) || "").trim()
      const nascimentoRaw = getCellValue(row, ["nascimento", "Nascimento"])
      const cpfRaw = row["cpf"] || row["CPF"]

      const hasData = nome || admissaoRaw || cargo || nascimentoRaw || cpfRaw
      if (!hasData) {
        continue
      }

      if (!nome) {
        results.errors.push({ linha: rowNum, erro: `Nome vazio`, debug: `row: ${JSON.stringify(row)}` })
        continue
      }

      if (!cargo) {
        results.errors.push({ linha: rowNum, erro: `Cargo vazio`, debug: `cargo raw: ${row["cargo"] || row["Cargo"]}` })
        continue
      }

      const admissaoDate = parseDateField(admissaoRaw)
      if (!admissaoDate) {
        results.errors.push({ linha: rowNum, erro: `Admissão inválida`, debug: `admissao: "${admissaoRaw}" (tipo: ${typeof admissaoRaw})` })
        continue
      }

      const nascimentoDate = parseDateField(nascimentoRaw)
      if (!nascimentoDate) {
        results.errors.push({ linha: rowNum, erro: `Nascimento inválido`, debug: `nascimento: "${nascimentoRaw}" (tipo: ${typeof nascimentoRaw})` })
        continue
      }

      const cpf = normalizeCPF(cpfRaw)
      if (cpf.length !== 11) {
        results.errors.push({ linha: rowNum, erro: `CPF inválido: ${cpf}`, debug: `cpf original: "${cpfRaw}"` })
        continue
      }

      const existingUser = await prisma.user.findUnique({
        where: { cpf },
      })

      if (existingUser) {
        results.skipped.push({
          linha: rowNum,
          cpf,
          motivo: "CPF já cadastrado",
        })
        continue
      }

      const senhaPadrao = gerarSenhaPadrao(cpf)
      const senhaHash = await hash(senhaPadrao, 10)
      const username = gerarUsername(nome, cpf)

      await prisma.user.create({
        data: {
          nome,
          username,
          cpf,
          cargo,
          aniversario: nascimentoDate,
          admissao: admissaoDate,
          senha_hash: senhaHash,
        },
      })

      results.success.push({
        nome,
        cpf,
        senha: senhaPadrao,
        username,
      })
    }

    return NextResponse.json({
      message: `Processamento concluído`,
      summary: {
        total: data.length,
        success: results.success.length,
        errors: results.errors.length,
        skipped: results.skipped.length,
      },
      results,
    })
  } catch (error) {
    console.error("Erro ao processar planilha:", error)
    return NextResponse.json({ error: "Erro ao processar planilha" }, { status: 500 })
  }
}