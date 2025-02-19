import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// S3 クライアントの設定
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "jam-my";

export async function GET(req: NextRequest) {
  const audioKey = req.nextUrl.searchParams.get("key");
  if (!audioKey) {
    return new NextResponse(JSON.stringify({ error: "不正なリクエストです" }), { status: 400 });
  }

  const decodedKey = decodeURIComponent(audioKey);

  try {
    const params = { Bucket: BUCKET_NAME, Key: decodedKey };
    const command = new GetObjectCommand(params);
    const { Body, ContentType } = await s3.send(command);

    if (!Body) {
      throw new Error("音声データが見つかりません");
    }

    //BodyはS3のStream形式
    const arrayBuffer = await Body.transformToByteArray();
    // ストリームをArrayBufferに変換し完全なデータでレスポンスを返す

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": ContentType || "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("音声の取得に失敗しました:", error);
    return new NextResponse(JSON.stringify({ error: "音声の取得に失敗しました" }), { status: 500 });
  }
}
