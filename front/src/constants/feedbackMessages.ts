import { FeedbackMessages } from "@sharedTypes/types";

const feedbackMessages: FeedbackMessages = {
  //User
  signin: {
    success: {
      message: "ログインしました",
      severity: "success",
    },
    failure: {
      message: "ログインできませんでした",
      severity: "error",
    },
  },

  signup: {
    success: {
      message: "アカウントが作成されました",
      severity: "success",
    },
    failure: {
      message: "アカウント作成に失敗しました",
      severity: "error",
    },
  },

  logout: {
    success: {
      message: "ログアウトしました",
      severity: "success",
    },
    info: {
      message: "既にログアウト済みです",
      severity: "info",
    },
    error: {
      message: "ログアウト処理に失敗しました。再度お試しください。",
      severity: "error",
    },
  },

  // auth: {
  //   error: {
  //     message: "認証エラーが発生しました。再度お試しください。",
  //     severity: "error",
  //   }
  // },

  //Project
  project: {
    //create
    create: {
      success: {
        message: "プロジェクトを投稿しました",
        severity: "success",
      },
      info: {
        message: "プロジェクトの作成が許可されていません。",
        severity: "info",
      },
      error: {
        message: "プロジェクトの作成に失敗しました。再度お試しください。",
        severity: "error",
      },
    },
    //edit
    edit: {
      success: {
        message: "投稿を更新しました",
        severity: "success",
      },
      info: {
        message: "投稿の編集は許可されていません。",
        severity: "info",
      },
      error: {
        message: "投稿の更新に失敗しました。再度お試しください。",
        severity: "error",
      },
    },
    //delete
    delete: {
      success: {
        message: "投稿を削除しました",
        severity: "success",
      },
    },
    info: {
      message: "投稿が既に削除されているか存在しません",
      severity: "info",
    },
    error: {
      message: "投稿の削除に失敗しました。再度お試しください。",
      severity: "error",
    },
  },

  // like
  like: {
    error: {
      message: "いいねの追加に失敗しました。再度お試しください。",
      severity: "error",
    },
    not_found: {
      message: "対象が見つかりません。",
      severity: "info",
    },
  },
  // unlike
  unlike: {
    error: {
      message: "いいねの解除に失敗しました。再度お試しください。",
      severity: "error",
    },
  },

   // bookmark
  bookmark: {
    error: {
      message: "ブックマークの追加に失敗しました。再度お試しください。",
      severity: "error",
    },
    not_found: {
      message: "対象が見つかりません。",
      severity: "info",
    },
  },
  // unlike
  unBookmark: {
    error: {
      message: "ブックマークの解除に失敗しました。再度お試しください。",
      severity: "error",
    },
  },

  // comment
  comment: {
    error: {
      message: "コメントに失敗しました。再度お試しください。",
      severity: "error",
    },
    not_found: {
      message: "コメントの対象が見つかりません。",
      severity: "info",
    },
  },
  // unlike
  deleteComment: {
    error: {
      message: "コメントの削除に失敗しました。再度お試しください。",
      severity: "error",
    },
  },

  //collaboration
  collaboration: {
    // create
    create: {
      success: {
        message: "プロジェクトに応募しました",
        severity: "success",
      },
      info: {
        message: "応募が許可されていません。",
        severity: "info",
      },
      error: {
        message: "応募に失敗しました。再度お試しください。",
        severity: "error",
      },
    },
    // delete
    delete: {
      success: {
        message: "応募音声を削除しました",
        severity: "success",
      },
      info: {
        message: "削除対象が見つかりません。",
        severity: "info",
      },
      error: {
        message: "応募音声の削除に失敗しました。再度お試しください。",
        severity: "error",
      },
    },
  },

  // Collaboration Management
  collaboration_management: {
    // update
    update: {
      success: {
        message: "コラボが完了しました",
        severity: "success",
      },
      info: {
        message: "コラボの更新は許可されていません。",
        severity: "info",
      },
      error: {
        message: "コラボの更新に失敗しました。再度お試しください。",
        severity: "error",
      },
    },
    // terminate
    terminate: {
      success: {
        message: "プロジェクトを終了しました",
        severity: "success",
      },
      info: {
        message: "プロジェクトを終了する権限がありません。",
        severity: "info",
      },
      error: {
        message: "プロジェクトの終了に失敗しました。再度お試しください。",
        severity: "error",
      },
    },
  },
};

export default feedbackMessages;
