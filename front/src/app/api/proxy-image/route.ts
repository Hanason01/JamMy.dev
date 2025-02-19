import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// S3 クライアントの初期化
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "jam-my";

export async function GET(req: NextRequest) {
  const imageKey = req.nextUrl.searchParams.get("key"); // クエリパラメータから画像キーを取得

  if (!imageKey) {
    return new NextResponse(JSON.stringify({ error: "不正なリクエストです" }), { status: 400 });
  }

  const decodedKey = decodeURIComponent(imageKey || "");

  // Google画像の場合
  if (decodedKey.startsWith("https://")) {
    try {
      const response = await fetch(decodedKey, { headers: { "User-Agent": "Mozilla/5.0" } });

      if (!response.ok) {
        throw new Error(`Google画像の取得失敗: ${response.status}`);
      }

      const imageBlob = await response.arrayBuffer();

      return new NextResponse(imageBlob, {
        status: 200,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch (error) {
      console.error("Google画像の取得に失敗しました:", error);
      return new NextResponse(JSON.stringify({ error: "Google画像の取得に失敗しました" }), { status: 500 });
    }
  }

  //S3画像の場合
  try {
    // S3 から画像データをストリームで取得
    const params = { Bucket: BUCKET_NAME, Key: decodedKey };
    const command = new GetObjectCommand(params);
    const { Body, ContentType } = await s3.send(command); // S3 へコマンド送信

    if (!Body) {
      throw new Error("画像データが見つかりません");
    }

    //ストリームの変換
    //S3からデータ取得を担当するNode.jsは仕様として、IncomingMessageストリームをBodyとして保持するが、API Routeではレスポンスとして返すストリームは「Web Streams API の ReadableStream」を期待する為、Bodyオブジェクトが保有するtransformToWebStreamメソッドを使用して変換する。
    let stream: ReadableStream;
    if (Body instanceof ReadableStream) {
      stream = Body;
    } else if ("transformToWebStream" in Body) {
      stream = Body.transformToWebStream();
    } else {
      throw new Error("Unsupported stream type");
    }

    // ストリームをレスポンスとして返す
    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("画像の取得に失敗しました:", error);
    return new NextResponse(JSON.stringify({ error: "画像の取得に失敗しました" }), { status: 500 });
  }
}
