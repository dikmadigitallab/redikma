import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    if (!userId) {
      return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
    }

    // 1. LIXEIRA AUTOMÁTICA DE 7 DIAS
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    // Apaga todas as notificações deste usuário mais velhas que 7 dias
    await prisma.notification.deleteMany({
      where: {
        userId: userId,
        createdAt: {
          lt: seteDiasAtras,
        },
      },
    });

    // 2. BUSCA AS NOTIFICAÇÕES RECENTES COM FOTO E NOME
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      // Traz os dados de quem gerou a notificação
      include: {
        actor: {
          select: { nome: true, foto: true }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}