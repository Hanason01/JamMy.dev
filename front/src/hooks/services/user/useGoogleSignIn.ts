export const useGoogleSignIn = () => {
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const backendAuthUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google_oauth2`;
      const originUrl =
        process.env.NODE_ENV === "development"
            ? `${process.env.NEXT_PUBLIC_FRONT_URL}/auth/google_callback`
            : `${process.env.NEXT_PUBLIC_FRONT_URL}/auth/google_callback`;
      if(!originUrl){
        console.error("OriginUrlが見つかりません");
        return;
      }
      const redirectUrl = `${backendAuthUrl}?auth_origin_url=${encodeURIComponent(originUrl)}`;
      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error("Google認証中にエラーが発生しました:", error);
      alert("Google認証に失敗しました。再度お試しください。");
    }
  };

  return { signInWithGoogle };
};
