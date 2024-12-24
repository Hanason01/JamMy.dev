export function handleStatusErrors(status: number): never{
  switch (status) {
    case 404:
      throw new Error("リソースが見つかりませんでした。");
    case 500:
      throw new Error("サーバーエラーが発生しました。");
    case 401:
      // ローカルストレージをクリア
      localStorage.removeItem('authenticatedUser');
      throw new Error("認証に失敗しました。");
    default:
      throw new Error("エラーが発生しました。");
  }
};
