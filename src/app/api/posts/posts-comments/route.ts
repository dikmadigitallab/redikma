import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { notify } from "@/lib/notifications/notify"


async function notifyComment(postId: string, authorId: string, parentId?: string | null) {
  try {
    const session = await getServerSession(authOptions)
    const nome = session?.user?.nome || "Alguém"

    if (parentId) {
      const parentComment = await prisma.comentario.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      })
      if (parentComment && parentComment.authorId !== authorId) {
        await notify({
          type: "COMMENT",
          title: "Nova resposta",
          message: `${nome} respondeu seu comentário`,
          userIds: [parentComment.authorId],
          actorId: authorId,
          data: { postId },
        })
      }
    } else {
      const post = await prisma.postagem.findUnique({
        where: { id: postId },
        select: { authorId: true },
      })
      if (post && post.authorId !== authorId) {
        await notify({
          type: "COMMENT",
          title: "Novo comentário",
          message: `${nome} comentou em sua postagem`,
          userIds: [post.authorId],
          actorId: authorId,
          data: { postId },
        })
      }
    }
  } catch {
    // notificação é secundária — silêncio
  }
}

// CREATE

/* 
export async function POST(req: Request) {
  const TRUNCATE_LENGTH =50
  try {
    const { texto, postId, authorId, parentId } = await req.json()

    if (!texto || !postId || !authorId) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      )
    }

    if (texto.length > TRUNCATE_LENGTH) {
      return NextResponse.json(
        { error: `Texto do comentário excede o limite de ${TRUNCATE_LENGTH} caracteres` },
        { status: 400 }
      )
    }

    const postExiste = await prisma.postagem.findUnique({ where: { id: postId }, select: { id: true } })
    if (!postExiste) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    }

    const userExiste = await prisma.user.findUnique({ where: { id: authorId }, select: { id: true } })
    if (!userExiste) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const comentario = await prisma.comentario.create({
      data: {
        texto,
        postId,
        authorId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    // Notificações (não-bloqueante — nunca deve impedir o comentário)
    notifyComment(postId, authorId, parentId).catch(() => {})

    return NextResponse.json(comentario)
  } catch (error) {
    console.error("Erro ao criar comentário:", error)
    return NextResponse.json(
      { error: "Erro ao criar comentário" },
      { status: 500 }
    )
  }
}

 */

export async function POST(req: Request) {
  const TRUNCATE_LENGTH = 50;

  try {
    const { texto, postId, authorId, parentId } = await req.json();

    const textoLimpo = String(texto ?? "").trim();

    if (!textoLimpo || !postId || !authorId) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    if (textoLimpo.length > TRUNCATE_LENGTH) {
      return NextResponse.json(
        {
          error: `Texto do comentário excede o limite de ${TRUNCATE_LENGTH} caracteres`,
        },
        { status: 403 }
      );
    }

    const postExiste = await prisma.postagem.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!postExiste) {
      return NextResponse.json(
        { error: "Post não encontrado" },
        { status: 404 }
      );
    }

    const userExiste = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    if (!userExiste) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const comentario = await prisma.comentario.create({
      data: {
        texto: textoLimpo,
        postId,
        authorId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true,
          },
        },
        likes: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    notifyComment(postId, authorId, parentId).catch(() => {});

    return NextResponse.json(comentario);
  } catch (error) {
    console.error("Erro ao criar comentário:", error);

    return NextResponse.json(
      { error: "Erro ao criar comentário" },
      { status: 500 }
    );
  }
}


// READ (por post)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "postId não informado" },
        { status: 400 }
      )
    }

    const comentarios = await prisma.comentario.findMany({
      where: {
        postId,
        aprovado: true
      },
      select: {
        id: true,
        texto: true,
        parentId: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(comentarios)
  } catch (error) {
    console.error("Erro ao buscar comentários:", error)
    return NextResponse.json(
      { error: "Erro ao buscar comentários" },
      { status: 500 }
    )
  }
}


/* 

// ja esta deletando em cascata, só precisa atualizar na page
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "Id não informado" },
        { status: 400 }
      )
    }

    const comentario = await prisma.comentario.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    })

    if (!comentario) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      )
    }

    const isOwner = comentario.authorId === session.user.id

    const role = session.user.role
    const isAdmin = role === "SYSTEM_ADM" || role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para deletar" },
        { status: 403 }
      )
    }

    await prisma.comentario.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro ao deletar comentário:", error)
    return NextResponse.json(
      { error: "Erro ao deletar comentário" },
      { status: 500 }
    )
  }
}

 
 */

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "Id não informado" },
        { status: 400 }
      )
    }

    const comentario = await prisma.comentario.findUnique({
      where: { id },
      include: {
        post: true,
      },
    })

    if (!comentario) {
      return NextResponse.json(
        { error: "Comentário não encontrado" },
        { status: 404 }
      )
    }

    const isOwner = comentario.authorId === session.user.id
    const isPostAuthor = comentario.post.authorId === session.user.id
    const isAdmin =
      session.user.role === "ADMIN" ||
      session.user.role === "SYSTEM_ADM"

    if (!isOwner && !isPostAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão" },
        { status: 403 }
      )
    }

    await prisma.$transaction([
      prisma.comentario.deleteMany({
        where: {
          parentId: id,
        },
      }),

      prisma.comentario.deleteMany({
        where: {
          parent: {
            parentId: id,
          },
        },
      }),

      prisma.comentario.deleteMany({
        where: {
          parentId: id,
        },
      }),

      prisma.comentario.delete({
        where: {
          id,
        },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro ao deletar comentário:", error)
    return NextResponse.json(
      { error: "Erro ao deletar comentário" },
      { status: 500 }
    )
  }
}

