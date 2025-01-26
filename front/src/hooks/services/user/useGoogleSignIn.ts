export const useGoogleSignIn = () => {
  const signInWithGoogle = async (): Promise<void> => {
    try {
      // バックエンドのエンドポイントにリクエストを送る
      console.log("NEXT_PUBLIC_API_URL",process.env.NEXT_PUBLIC_API_URL);
      console.log("NEXT_PUBLIC_GOOGLE_CLIENT_ID",process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
      console.log("NEXT_PUBLIC_REDIRECT_URI",process.env.NEXT_PUBLIC_REDIRECT_URI);
      console.log("NEXT_PUBLIC_AUTH_ORIGIN_URL",process.env.NEXT_PUBLIC_AUTH_ORIGIN_URL);
        //Google認証開始のエンドポイント
      const backendAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google_oauth2`;
        //認証終了後の遷移先
      const authOriginUrl = process.env.NEXT_PUBLIC_AUTH_ORIGIN_URL;
      if(!authOriginUrl){
        console.error("OriginUrlが見つかりません");
        return;
      }
      const redirectUrl = `${backendAuthUrl}?auth_origin_url=${encodeURIComponent(authOriginUrl)}`;
      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error("Google認証中にエラーが発生しました:", error);
      alert("Google認証に失敗しました。再度お試しください。");
    }
  };

  return { signInWithGoogle };
};
