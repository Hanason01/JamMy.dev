import { InitialCommentResponse, InitialComment, User } from "@sharedTypes/types";

// コメントデータをフラット構造に変換する関数
export function createInitialComments(data: InitialCommentResponse[], included: User[]) : InitialComment[]{
  // ユーザー情報をマップ化
  const userMap: Record<string, User> = included.reduce<Record<string, User>>((map, item) => {
    if (item.type === "user") {
      map[item.id] = item as User;
    }
    return map;
  }, {});


  // コメントをフラットな配列に変換
  const flatComments: InitialComment[] = data.map(comment => {
    return {
      id: comment.id,
      type: comment.type,
      attributes: comment.attributes,
      user: userMap[comment.relationships.user.data.id],
    };
  });

  return flatComments;
}

