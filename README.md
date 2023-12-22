- [構成](#構成)
- [環境構築](#環境構築)
- [Supabase](#supabase)
- [Prisma](#prisma)
  - [1.インストール](#1インストール)
  - [2. 設定](#2-設定)
    - [2-1. .env の DATABASE\_URL 変更](#2-1-env-の-database_url-変更)
    - [2-2. スキーマ（データ構造）設定](#2-2-スキーマデータ構造設定)
    - [2-3. Migration](#2-3-migration)
    - [2-4. テスト用記事作成](#2-4-テスト用記事作成)
  - [3. API 作成](#3-api-作成)
    - [3-1. DB 接続するための関数](#3-1-db-接続するための関数)
    - [3-2. 全記事取得する API](#3-2-全記事取得する-api)
    - [3-3. 投稿用の API](#3-3-投稿用の-api)
    - [3-4.　特定の記事を取得するための API](#3-4特定の記事を取得するための-api)
    - [3-5.　特定の記事を編集するための API](#3-5特定の記事を編集するための-api)
    - [3-6.　特定の記事を削除するための API](#3-6特定の記事を削除するための-api)
  - [4. フロントエンド作成](#4-フロントエンド作成)
    - [4-1. 作成した API を叩いてブログを出力させる](#4-1-作成した-api-を叩いてブログを出力させる)
    - [4-2. 「ブログ新規作成」ページを作成](#4-2-ブログ新規作成ページを作成)
      - [4-2-1. `@/app/blog/add/page.tsx`作成](#4-2-1-appblogaddpagetsx作成)
      - [4-2-2. 取得した情報を基に API を叩いて投稿する](#4-2-2-取得した情報を基に-api-を叩いて投稿する)
    - [4-3. 編集と削除](#4-3-編集と削除)
      - [4-3-1. 記事編集](#4-3-1-記事編集)
      - [4-3-2. 記事編集画面に編集元のタイトルと本文を表示させたい。](#4-3-2-記事編集画面に編集元のタイトルと本文を表示させたい)
      - [4-3-3. 削除する](#4-3-3-削除する)

# 構成

- Next.js:
- TypeScript: 5.3.2
- Prisma
- Supabase

# 環境構築

`npx create-next-app`  
`npm run dev`

# Supabase

# Prisma

詳しくは公式ドキュメントか、以前の Prisma チュートリアル見て。

## 1.インストール

`npm i prisma --save-dev`  
`npx prisma init`

## 2. 設定

### 2-1. .env の DATABASE_URL 変更

Supabase の`Project Settings` > `Database` > `Connection string` > `URI`コピー

### 2-2. スキーマ（データ構造）設定

prisma/schema.prisma

```
model Post {
  id Int @id @default(autoincrement())
  title String
  description String
  date DateTime @default(now())
}
```

### 2-3. Migration

`npx prisma migrate dev --name init`

SQL 文のテーブルが完成  
Supabese にもテーブルが作成される。

migrations/migration.sql

```
-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
```

### 2-4. テスト用記事作成

適当に

## 3. API 作成

`@/app/api/blog/route.ts`作成  
これによってエンドポイントは`http://localhost:3000/api/blog`になる。

route.ts

```typescript
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, res: NextResponse) => {
  console.log("GET");
};
```

`http://localhost:3000/api/blog`にアクセスし、`GET`と出力されれば準備 OK

### 3-1. DB 接続するための関数

`npm i @prisma/client`インストール

`@/app/api/blog/route.ts`

```typescript
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
```

### 3-2. 全記事取得する API

`@/app/api/blog/route.ts`

```typescript
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
```

`http://localhost:3000/api/blog`にアクセス

```
{
    "message": "Success!",
    "posts": [
        {
            "id": 1,
            "title": "Test Title",
            "description": "Test Description",
            "date": "2023-12-21T14:23:12.339Z"
        }
    ]
}
```

### 3-3. 投稿用の API

```typescript
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
```

Postman を使って POST リクエストを送る

```
{
    "message": "Success!",
    "posts": {
        "id": 2,
        "title": "Panのブログ",
        "description": "今日は寒いです。",
        "date": "2023-12-21T15:13:22.360Z"
    }
}
```

### 3-4.　特定の記事を取得するための API

id を指定するためのエンドポイント  
`@/app/api/blog/[id]/route.ts`作成

```typescript
import { main } from "@/app/api/blog/route";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

// 特定の記事をidで取得するAPI
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
```

### 3-5.　特定の記事を編集するための API

```typescript
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
```

### 3-6.　特定の記事を削除するための API

```typescript
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
```

CRUD 操作に必要な API の準備はこれで OK

## 4. フロントエンド作成

### 4-1. 作成した API を叩いてブログを出力させる

app/page.tsx

```typescript
import { PostType } from "@/types";
import Link from "next/link";

// ①全記事を取得する関数
const fetchAllPosts = async () => {
  const res = await fetch("http://localhost:3000/api/blog", {
    cache: "no-store", //　"no-store": SSR,  "force-cache": SSG
  });

  const data = await res.json();

  return data.posts;
};

export default async function Home() {
  // ②全記事を取得
  const posts = await fetchAllPosts();

  return (
    <main className="w-full h-full">
      // ブログ新規作成ボタン
      <div className="flex my-5">
        <Link
          href={"/blog/add"}
          className=" md:w-1/6 sm:w-2/4 text-center rounded-md p-2 m-auto bg-slate-300 font-semibold"
        >
          ブログ新規作成
        </Link>
      </div>
      // ③記事の一覧を表示
      <div className="w-full flex flex-col justify-center items-center">
        {posts.map((post: PostType) => (
          <div
            key={post.id}
            className="w-3/4 p-4 rounded-md mx-3 my-2 bg-slate-300 flex flex-col justify-center"
          >
            <div className="flex items-center my-3">
              <div className="mr-auto">
                // タイトル
                <h2 className="mr-auto font-semibold">{post.title}</h2>
              </div>
              // 編集ボタン
              <Link
                href={`/blog/edit/${post.id}`}
                className="px-4 py-1 text-center text-xl bg-slate-900 rounded-md font-semibold text-slate-200"
              >
                編集
              </Link>
            </div>

            <div className="mr-auto my-1">
              <blockquote className="font-bold text-slate-700">
                // 日付
                {new Date(post.date).toDateString()} {/*post.dateはDate型のためエラーになるのでstring型に変換*/}
              </blockquote>
            </div>

            <div className="mr-auto my-1">
              // 本文
              <h2>{post.description}</h2>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

src/type.ts

```typescript
export type PostType = {
  id: number;
  title: string;
  description: string;
  date: Date;
};
```

### 4-2. 「ブログ新規作成」ページを作成

「ブログ新規作成」ボタンをクリックすると`localhost:3000/blog/add`ページに遷移するが、今のところ 404

#### 4-2-1. `@/app/blog/add/page.tsx`作成

title と description をフォームに入力し、「投稿」ボタンをクリックすると記事が追加される。  
`useRef`で DOM から値を取得（`useState`の`onChange`で取得するのもあり）

```typescript
"use client";

import React, { useRef } from "react";

const PostBlog = () => {
  // useRefを使うことでDOM要素を取得
  const titleRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(titleRef.current?.value); // ?をつけることでnullの場合のエラーを回避
    console.log(descriptionRef.current?.value);
  };

  return (
    <div className="w-full m-auto flex my-4">
      <div className="flex flex-col justify-center items-center m-auto">
        <form onSubmit={handleSubmit}>
          <input
            ref={titleRef} // refを設定
            placeholder="タイトルを入力"
            type="text"
            className="rounded-md px-4 w-full py-2 my-2"
          />
          <textarea
            ref={descriptionRef} // refを設定
            placeholder="記事詳細を入力"
            className="rounded-md px-4 py-2 w-full my-2"
          ></textarea>
          <button className="font-semibold px-4 py-2 shadow-xl bg-slate-200 rounded-lg m-auto hover:bg-slate-100">
            投稿
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostBlog;
```

#### 4-2-2. 取得した情報を基に API を叩いて投稿する

@/app/blog/add/page.tsx

```typescript
"use client";

import React, { useRef } from "react";

// 記事投稿用の関数
const addPost = async (
  title: string | undefined,
  description: string | undefined
) => {
  // ここのエンドポイントは"api/blog/route.ts"で記事投稿用のAPIを作成しているので
  const res = await fetch("http://localhost:3000/api/blog", {
    // 新規投稿なのでPOST
    method: "POST",
    // JSON形式ですよーというリクエストヘッダー
    headers: {
      "Content-Type": "application/json",
    },
    // 送信するデータ（JSONに変換）
    body: JSON.stringify({ title, description }),
  });

  return res.json();
};

const PostBlog = () => {
  const titleRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 記事を投稿する（非同期処理なのでawait/async忘れずに）
    await addPost(titleRef.current?.value, descriptionRef.current?.value);
  };

  return (
    ...
  );
};

export default PostBlog;
```

問題点

1. 投稿したら自動的にホームに戻りたい
1. 投稿ボタンを押した際のラグ中にローディング中であることを表示させたい

1 の実装  
`useRouter`を使う

@/app/blog/add/page.tsx

```typescript
// useRouterをインポート（next/routerからじゃないよー）
import { useRouter } from "next/navigation";
import React, { useRef } from "react";

const PostBlog = () => {
  // useRouterを使用
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    await addPost(titleRef.current?.value, descriptionRef.current?.value);

    // 投稿後にホーム画面に戻る
    router.push("/");
    // refresh()をつけないと新規作成した記事が反映されないことがある
    router.refresh();
  };

  ...
```

2 の実装  
[react-hot-toast](https://react-hot-toast.com/)を使ってみる  
`npm i react-hot-toast`

@/app/blog/add/page.tsx

```typescript
"use client";

...

// ①react-hot-toastをインポート
import toast, { Toaster } from "react-hot-toast";

...

const PostBlog = () => {

  ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ③投稿中のトースト通知
    toast.loading("投稿中...");

    await addPost(titleRef.current?.value, descriptionRef.current?.value);

    // ④投稿完了のトースト通知
    toast.success("投稿が完了しました！");

    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* ②トースト通知コンポーネント */}
      <Toaster />
      <div className="w-full m-auto flex my-4">
        ...
      </div>
    </>
  );
};

export default PostBlog;
```

### 4-3. 編集と削除

`@/app/blog/edit/[id]/page.tsx`作成

#### 4-3-1. 記事編集

だいたい記事投稿と一緒

app/blog/edit/[id]/page.tsx

```typescript
"use client";

import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

// 記事編集用の関数
const editPost = async (
  title: string | undefined,
  description: string | undefined,
  id: number
) => {
  // ${id}とすることで、URLのidを取得できる
  const res = await fetch(`http://localhost:3000/api/blog/${id}`, {
    // 更新なのでPUT
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description, id }),
  });

  return res.json();
};

// paramsとはNext.jsのルーティング機能で、
// [id]というファイル名にすることで、
// そのファイル名のURLにアクセスした時に、
// その[id]の部分をparamsとして取得することができる
const EditPost = ({ params }: { params: { id: number } }) => {
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 編集中のトースト通知
    toast.loading("編集中...");
    await editPost(
      titleRef.current?.value,
      descriptionRef.current?.value,
      params.id
    );
    // 編集完了のトースト通知
    toast.success("編集が完了しました！");

    router.push("/");
    router.refresh();
  };

  return (
    <>
      <Toaster />
      <div className="w-full m-auto flex my-4">
        <div className="flex flex-col justify-center items-center m-auto">
          {/* onSubmitでhandleSubmit */}
          <form onSubmit={handleSubmit}>
            <input
              ref={titleRef}
              placeholder="タイトルを入力"
              type="text"
              className="rounded-md px-4 w-full py-2 my-2"
            />
            <textarea
              ref={descriptionRef}
              placeholder="記事詳細を入力"
              className="rounded-md px-4 py-2 w-full my-2"
            ></textarea>
            <button className="font-semibold px-4 py-2 shadow-xl bg-slate-200 rounded-lg m-auto hover:bg-slate-100">
              更新
            </button>
            <button className="ml-2 font-semibold px-4 py-2 shadow-xl bg-red-400 rounded-lg m-auto hover:bg-slate-100">
              削除
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditPost;
```

#### 4-3-2. 記事編集画面に編集元のタイトルと本文を表示させたい。

現段階だと記事編集画面に飛ぶとフォームに何も値が入ってない状態。

`app/blog/edit/[id]/page.tsx`に、詳細ページのデータを取得する関数追加  
`useEffect`を使って読み込み時に取得

```typescript
...

// 記事のデータ取得用の関数
const getPostById = async (id: number) => {
  const res = await fetch(`http://localhost:3000/api/blog/${id}`);
  const data = await res.json();

  return data.post;
};

const EditPost = ({ params }: { params: { id: number } }) => {

  ...

// useEffectを使用して、
  // ページが読み込まれた時にその記事のデータを取得して、
  // titleRefとdescriptionRefにそれぞれの値を入れる
  useEffect(() => {
    getPostById(params.id)
      .then((data) => {
        if (titleRef.current && descriptionRef.current) {
          titleRef.current.value = data.title;
          descriptionRef.current.value = data.description;
        }
      })
      .catch((err) => {
        toast.error("エラーが発生しました。");
      });
  }, []);

  return (
    <>
      ...
    </>
  );
};

export default EditPost;

```

#### 4-3-3. 削除する

```typescript

...

// 記事を削除する関数
const deletePost = async (id: number) => {
  const res = await fetch(`http://localhost:3000/api/blog/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.json();
};

const EditPost = ({ params }: { params: { id: number } }) => {

  ...

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    // 削除中のトースト通知
    toast.loading("削除中...");
    // 記事を削除する
    await deletePost(params.id);
    // 削除完了のトースト通知
    toast.success("削除が完了しました！");

    router.push("/");
    router.refresh();
  }

  ...

  return (
    <>
      <Toaster />
      <div className="w-full m-auto flex my-4">
        <div className="flex flex-col justify-center items-center m-auto">
          <p className="text-2xl text-slate-200 font-bold p-3">
            ブログの編集 🚀
          </p>
          {/* onSubmitでhandleSubmit */}
          <form onSubmit={handleSubmit}>
          ...

            <button className="ml-2 font-semibold px-4 py-2 shadow-xl bg-red-400 rounded-lg m-auto hover:bg-slate-100" onClick={handleDelete}>
              削除
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditPost;
```