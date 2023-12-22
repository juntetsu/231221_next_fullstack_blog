import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const prisma = new PrismaClient();

// DB接続用の関数
export async function main() {
  try {
    await prisma.$connect();
  } catch (err) {
    return Error("DB接続に失敗しました");
  }
}

// ブログの全記事取得用API
export const GET = async (req: NextRequest, res: NextResponse) => {
  try {
    // DBに接続
    await main();
    // 全記事を取得（postはModel名Postを小文字にしたもの）
    const posts = await prisma.post.findMany();
    return NextResponse.json({ message: "Success!", posts }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: "Error!", err }, { status: 500 });
    // finallyはエラーが発生してもしなくても実行される
  } finally {
    // DB接続を切断
    await prisma.$disconnect();
  }
};

// ブログ投稿用API
export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    // ①のtitleやdescriptionはreqの中に入っている。
    // 従来はreq.bodyとしていたが、13からはreq.json()とする
    const { title, description } = await req.json();
    const posts = await prisma.post.create({ data: { title, description } }); // ①
    // リソースの作成が完了した場合のステータスコードは201
    return NextResponse.json({ message: "Success!", posts }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: "Error!", err }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};
