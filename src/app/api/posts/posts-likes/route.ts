import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { addLike } from "@/lib/likes"
import { notify } from "@/lib/notifications/notify";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";


//curtir
/* 
export async function POST(req: Request) {
  try {
    const { postId, userId } = await req.json()

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      )
    }

    const like = await addLike({ postId, userId })

    return NextResponse.json(like)

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro ao curtir postagem" },
      { status: 500 }
    )
  }
}

 */


export async function POST(req: Request) {
  const sessions = await getServerSession(authOptions);
  const nome = sessions?.user.nome
  try {
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      );
    }

    const like = await addLike({ postId, userId });

    const post = await prisma.postagem.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
      },
    });

    const autorPostId = post?.authorId;

    if (autorPostId && autorPostId !== userId) {
      await notify({
        type: "LIKE",
        title: "Nova curtida",
        message: `${nome} curtiu sua postagem`,
        userIds: [autorPostId],
        actorId: userId,
        excludeCurrentUser: true,
        data: {
          postId,
        },
      });
    }

    return NextResponse.json(like);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao curtir postagem" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "PostId não informado" },
        { status: 400 }
      )
    }

    const likes = await prisma.like.findMany({
      where: {
        postId
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      total: likes.length,
      likes
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar likes" },
      { status: 500 }
    )
  }
}

//descurtir
export async function DELETE(req: Request) {
  try {
    const { postId, userId } = await req.json()

    await prisma.like.deleteMany({
      where: {
        postId,
        userId
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao remover like" },
      { status: 500 }
    )
  }
}
//18129187710