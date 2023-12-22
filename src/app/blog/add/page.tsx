"use client";
// useRouterをインポート（next/routerからじゃないよー）
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
// react-hot-toastをインポート
import toast, { Toaster } from "react-hot-toast";

// 記事投稿用の関数
const addPost = async (
  title: string | undefined,
  description: string | undefined
) => {
  // ここのエンドポイントは"api/blob/reoute.ts"で記事投稿用のAPIを作成しているので
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
  // useRouterを使用
  const router = useRouter();
  const titleRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 投稿中のトースト通知
    toast.loading("投稿中...")
    // 記事を投稿する（非同期処理なのでawait/async忘れずに）
    await addPost(titleRef.current?.value, descriptionRef.current?.value);
    // 投稿完了のトースト通知
    toast.success("投稿が完了しました！")

    // 投稿後にホーム画面に戻る
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* トースト通知コンポーネント */}
      <Toaster />
      <div className="w-full m-auto flex my-4">
        <div className="flex flex-col justify-center items-center m-auto">
          <p className="text-2xl text-slate-200 font-bold p-3">
            ブログ新規作成 🚀
          </p>
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
    </>
  );
};

export default PostBlog;
