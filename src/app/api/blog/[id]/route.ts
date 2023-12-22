import { main } from "@/app/api/blog/route";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// 特定の記事をid指定で取得するAPI
export const GET = async (req: NextRequest, res: NextResponse) => {
  try {
    // ①で指定するid
    // idはnumber型である必要があるため、parseIntで数値に変換
    // split()でURLを"/blog/"で分割
    // （分割後の配列[0]は"http://localhost:3000/api/blog/", [1]が以降のid）
    const id: number = parseInt(req.url.split("/blog/")[1]);
    await main();
    // idを指定し、findFirstで取得
    const post = await prisma.post.findFirst({ where: { id } }); // ①
    return NextResponse.json({ message: "Success!", post }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error!", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

// 特定の記事をid指定で編集するAPI
export const PUT = async (req: NextRequest, res: NextResponse) => {
  try {
    const id = parseInt(req.url.split("/blog/")[1]);

    // ①のtitleやdescriptionはreqの中に入っている。
    const { title, description } = await req.json();

    await main();
    const post = await prisma.post.update({
      data: { title, description }, // ①
      where: { id },
    });
    return NextResponse.json({ message: "Success!", post }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error!", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};

// 特定の記事をid指定で削除するAPI
export const DELETE = async (req: NextRequest, res: NextResponse) => {
  try {
    const id = parseInt(req.url.split("/blog/")[1]);
    await main();
    const post = await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "Success!", post }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error!", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};