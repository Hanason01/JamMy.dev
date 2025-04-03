import { InitialCommentResponse, InitialComment, User } from "@sharedTypes/types";

export function createInitialComments(data: InitialCommentResponse[], included: User[]) : InitialComment[]{
  const userMap: Record<string, User> = included.reduce<Record<string, User>>((map, item) => {
    if (item.type === "user") {
      map[item.id] = item as User;
    }
    return map;
  }, {});


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

