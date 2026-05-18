import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId obrigatório" },
        { status: 400 }
      );
    }

    // Conta TODAS as notificações do usuário (Lidas e Não Lidas)
    const totalCount = await prisma.notification.count({
      where: {
        userId: userId,
      },
    });

    // Conta APENAS as notificações que o usuário ainda não abriu (read: false)
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        read: false,
      },
    });

    return NextResponse.json({ 
      total: totalCount, 
      unread: unreadCount 
    }, { status: 200 });

  } catch (error) {
    console.error("Erro no contador de notificações:", error);
    return NextResponse.json(
      { error: "Erro ao contar notificações" },
      { status: 500 }
    );
  }
}