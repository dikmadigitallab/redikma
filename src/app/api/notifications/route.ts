import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const all = searchParams.get("all") === "true";

    if (!userId) {
      return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
    }

    // 1. LIXEIRA AUTOMÁTICA DE 7 DIAS (sempre roda)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    await prisma.notification.deleteMany({
      where: {
        userId: userId,
        createdAt: {
          lt: seteDiasAtras,
        },
      },
    });

    // 2. BUSCA AS NOTIFICAÇÕES
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        actor: {
          select: { nome: true, foto: true }
        }
      },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar notificações" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "true";
    const userId = searchParams.get("userId");

    if (clearAll) {
      if (!userId) {
        return NextResponse.json({ error: "userId obrigatório para clearAll" }, { status: 400 });
      }
      await prisma.notification.deleteMany({ where: { userId } });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as any)?.code === "P2025") {
      return NextResponse.json({ error: "Notificação não encontrada" }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao deletar notificação" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, title, message, userIds, actorId, data, excludeCurrentUser } = body;

    if (!type || !title || !message) {
      return NextResponse.json({ error: "type, title e message são obrigatórios" }, { status: 400 });
    }

    let targets: string[] = userIds ?? [];

    if (!targets.length) {
      return NextResponse.json({ error: "userIds é obrigatório" }, { status: 400 });
    }

    if (excludeCurrentUser && actorId) {
      targets = targets.filter((id: string) => id !== actorId);
    }

    targets = [...new Set(targets)].filter(Boolean);

    if (!targets.length) {
      return NextResponse.json({ message: "Nenhum destino válido" });
    }

    await prisma.notification.createMany({
      data: targets.map((userId: string) => ({
        userId,
        actorId: actorId || null,
        type,
        title,
        message,
        data: data ?? {},
        read: false,
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 });
  }
}