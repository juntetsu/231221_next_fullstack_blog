"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

// ①記事編集用の関数
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

// 記事のデータ取得用の関数
const getPostById = async (id: number) => {
  const res = await fetch(`http://localhost:3000/api/blog/${id}`);
  const data = await res.json();

  return data.post;
};

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
    // ②記事を編集する
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
      <Toaster />
      <div className="w-full m-auto flex my-4">
        <div className="flex flex-col justify-center items-center m-auto">
          <p className="text-2xl text-slate-200 font-bold p-3">
            ブログの編集 🚀
          </p>
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
