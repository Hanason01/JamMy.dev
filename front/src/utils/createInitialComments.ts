import { InitialCommentResponse, InitialComment, User } from "@sharedTypes/types";

// コメントデータをフラット構造に変換する関数
export function createInitialComments(data: InitialCommentResponse[], included: User[]) : InitialComment[]{
  // 1. ユーザー情報をマップ化（user_id -> Userオブジェクト）
  const userMap: Record<string, User> = included.reduce<Record<string, User>>((map, item) => {
    if (item.type === "user") {
      map[item.id] = item as User;
    }
    return map;
  }, {});

  console.log("整形後のuserMap", userMap);

  // 2. コメントをフラットな配列に変換
  const flatComments: InitialComment[] = data.map(comment => {
    return {
      id: comment.id,
      type: comment.type,
      attributes: comment.attributes,
      user: userMap[comment.relationships.user.data.id],  // ユーザー情報を紐付け
    };
  });

  return flatComments;
}

