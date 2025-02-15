"use client";

import { Project, User, SetState, EnrichedProject, PostProjectFormData, EditProjectRequestData, GetKeyType} from "@sharedTypes/types";
import { useState, useEffect} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paper, Box, Avatar, Button, IconButton, Typography,Menu, MenuItem, TextField, Checkbox, FormControlLabel, Alert, CircularProgress,Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,Divider, Snackbar, Tooltip, ButtonBase } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PeopleIcon from "@mui/icons-material/People";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import IosShareIcon from '@mui/icons-material/IosShare';
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useProjectContext } from "@context/useProjectContext";
import { useFeedbackContext } from "@context/useFeedbackContext";
import { useAuthContext } from "@context/useAuthContext";
import { useClientCacheContext } from "@context/useClientCacheContext";
import { useSWRContext } from "@context/useSWRContext";
import { usePostProjectValidation } from "@validation/usePostProjectValidation";
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { audioEncoder } from "@utils/audioEncoder";
import { useEditProjectRequest } from "@services/project/useEditProjectRequest";
import { useDeleteProjectRequest } from "@services/project/useDeleteProjectRequest";
import { useLikeToggle } from "@services/project/feedback/useLikeToggle";
import { useBookmarkToggle } from "@services/project/feedback/useBookmarkToggle";
import { useSWRConfig } from "swr";
import { useApplyMutate } from "@utils/useApplyMutate";
import { getMyProjectsKey, getProjectDetailKey, getAllProjectsKey } from "@swr/getKeys";
import { unstable_serialize } from "swr/infinite";

export function ProjectCard({
  mode,
  category,
  project,
  onPlayClick,
  getKey
} : {
  mode:"list" | "detail";
  category?: string;
  project: EnrichedProject;
  onPlayClick: (project: EnrichedProject) => void;
  getKey: GetKeyType;
}){
  //状態変数・変数
  const [expanded, setExpanded] = useState<boolean>(false); //概要展開
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);


  //編集・削除用途のセット（リクエスト関係は別途定義）
  const [isEditing, setIsEditing] = useState<boolean>(false); //編集モード
  const preVisibility = [
    { label: "公開", value: "is_public" },
    { label: "限定公開", value: "is_private" },
  ];
  const [formError, setFormError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false); //削除用
  const [tempData, setTempData] = useState<PostProjectFormData | null>(null); //フォームデータの一時保管

    //バリデーション
  const { register, handleSubmit, setError, errors } = usePostProjectValidation({
      title: project.attributes.title,
      description: project.attributes.description,
      visibility: project.attributes.visibility === "is_public" ? "公開" : "限定公開",
    });

    //フック
  const { fetchAudioData } = useFetchAudioData();
  const { editProject } = useEditProjectRequest();
  const { deleteProject } = useDeleteProjectRequest();

    // SWR関連
  const { mutate, cache } = useSWRConfig()
  const { myProjectsMutate, projectListMutate } = useSWRContext();
  const handleMutate = async () => {
    // **詳細ページの更新**
    const detailKey = getProjectDetailKey(project.id);
    if (detailKey) {
      console.log("詳細ページの再フェッチ:", detailKey);
      await mutate(detailKey, undefined, { revalidate: true });
    }

    // **マイページのプロジェクト一覧の更新**
    if (myProjectsMutate) {
      const myProjectsKeys = [
        getMyProjectsKey(0, "my_projects"),
        getMyProjectsKey(0, "collaborating"),
        getMyProjectsKey(0, "collaborated"),
        getMyProjectsKey(0, "bookmarks")
      ];
      console.log("🔄 マイページの再フェッチ:", myProjectsKeys);
      await Promise.all(myProjectsKeys.map((key) => myProjectsMutate(key)));
    }

    // **全体のプロジェクト一覧の更新**
    if (projectListMutate) {
      const allProjectsKey = getAllProjectsKey(0);
      console.log(" 全体のプロジェクト一覧の再フェッチ");
      await projectListMutate(allProjectsKey);
    }
  };

    //モード切替
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setTempData(null);
  }

  //汎用フック
  const { handleLike, handleUnlike } = useLikeToggle();
  const { handleBookmark, handleUnBookmark } = useBookmarkToggle();

  //汎用Context関係
  const { setCurrentProject, setCurrentUser, setCurrentAudioFilePath, } = useProjectContext();
  const { setFeedbackByKey } = useFeedbackContext();
  const { requireAuth } = useAuthContext();
  const { setIsCommentRoute } = useClientCacheContext();

  //遷移
  const router = useRouter();
  const searchParams = useSearchParams();

  //スクロール位置復元
  useEffect(() => {
    if(mode === "list"){
      const scrollPosition = localStorage.getItem("scrollPosition");
      if (scrollPosition) {
        window.scrollTo(0, Number(scrollPosition));
        localStorage.removeItem("scrollPosition");
      }
    }
  }, []);


  //概要トグルハンドル
  const toggleExpanded = () => setExpanded(!expanded);

  //メニューアイコン操作
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  //プロジェクト概要の短縮
  const previewLength = 100;
  const previewText = project.attributes.description.slice(0, previewLength);
  const isDescriptionShort = project.attributes.description.length <= previewLength

  //プロジェクトの作成時間取得
  const createdAt = new Date(project.attributes.created_at);
  const formattedDate = formatDistanceToNow(createdAt, { addSuffix: true, locale: ja })

  //ユーザーページ遷移
  const handleClickAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (project.isOwner) {
      router.push("/mypage");
    } else {
      router.push(`/other_users/${project.user.id}`);
    }
  };


  //応募ページ遷移
  const handleCollaborationRequest = () => {
    setCurrentProject(project);
    setCurrentUser(project.user);
    setCurrentAudioFilePath(project.audioFilePath || null);
    router.push(`/projects/${project.id}/collaboration`);
  };

  //応募管理ページ遷移
  const handleCollaborationManagementRequest = () => {
    setCurrentProject(project);
    setCurrentUser(project.user);
    setCurrentAudioFilePath(project.audioFilePath || null);
    router.push(`/projects/${project.id}/collaboration_management`);
  };

  //詳細ページへ遷移（スクロール位置保存）
  const handleProjectClick = () => {
    const scrollPosition = window.scrollY;
    localStorage.setItem("scrollPosition", String(scrollPosition));
    router.push(`/projects/${project.attributes.id}/project_show?from=${category}`);
  };

  // 保存処理の中間関数
  const handleEditProxy = (data: PostProjectFormData) => {
    //プロジェクト終了が指定された場合、確認ダイアログ発動
    if (data.isClosed) {
      setTempData(data);
      setOpenEditDialog(true);
    } else {
    //指定されなかった場合は、そのまま編集処理へ移行
      handleEditProject(data);
    }
  };

  // ダイアログの確認後の処理（編集）
  const handleDialogConfirmEdit = () => {
    if (tempData) {
      handleEditProject(tempData);
      setTempData(null);
    }
    setOpenEditDialog(false);
  };

  //編集ボタン
  const handleEditProject = async (data: PostProjectFormData) =>{
    try{
      setLoading(true);
      let audioFile:File | "null" = "null";
      let audioContext = null;

      //プロジェクト終了が指示された場合
      if(data.isClosed && project.audioFilePath){
        //AudioContext作成
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 44100
        });
        // AudioBuffer 取得・MP3へエンコード
        const audioData = await fetchAudioData(project.audioFilePath);
        const audioBufferData = await audioContext.decodeAudioData( audioData);
        audioFile = await audioEncoder(audioBufferData, "MP3");
      }

      //不正な公開範囲パラメータをブロック
      const visibilityValue = preVisibility.find((option) => option.label === data.visibility)?.value;

      if (!visibilityValue) {
        console.error("無効な公開範囲が選択されています");
        return;
      }

      // リクエストデータを作成
      const requestData: EditProjectRequestData = {
        "project[title]": data.title.trim(),
        "project[description]": data.description.trim(),
        "project[visibility]": visibilityValue,
        "project[status]": data.isClosed ? "closed" : "null",
        "project[audio_file]": audioFile, //なければ"null"
      };

      // FormData の生成
      const formData = new FormData();
      Object.entries(requestData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // APIリクエストの送信
      await editProject(formData, project.id);
      console.log("プロジェクトが正常に更新されました");
      setIsEditing(false);
      await handleMutate()
      setFeedbackByKey("project:edit:success");
    }catch(error: any) {
      if (error.title) {
        setError("title", { type: "manual", message: error.title });
      } else if (error.description) {
        setError("description", { type: "manual", message: error.description });
      } else {
        // 他の特定フィールドでのエラーがない場合、フォーム全体に対するエラーメッセージを設定
        setFormError(error.general);
      }
    }finally{
      setLoading(false);
    }
  }

  // 削除処理の中間関数
  const handleDeleteProxy = () => {
    setOpenDeleteDialog(true);
  };

  // ダイアログの確認後の処理（削除）
  const handleDialogConfirmDelete = () => {
    handleDeleteProject();
    setOpenDeleteDialog(false);
  };

  //削除ボタン
  const handleDeleteProject = async () =>{
    await deleteProject(project.id)
    await handleMutate()
    const fromPage = searchParams.get("from");
    if (fromPage === "my_projects" || fromPage === "collaborating" || fromPage === "collaborated" || fromPage === "bookmarks") {
      router.replace(`/mypage?tab=${fromPage}&feedback=project:delete:success`);
    } else if (fromPage === "projects") {
      router.replace("/projects?feedback=project:delete:success");
    } else if (mode === "list"){ //一覧系ページにて削除処理
      await handleMutate()
      setFeedbackByKey("project:delete:success");
    } else{ //詳細ページにリンクアクセスしている場合
      router.replace("/projects?feedback=project:delete:success");
    }
  }

   // いいねボタン
  const handleLikeToggle = async () => {
    if (!requireAuth()) {
      return; // 未ログインなら処理を中断
    }

    if (project.attributes.liked_by_current_user) {
      // すでに「いいね」されている → 解除
      await handleUnlike(project.id, project.attributes.current_like_id, mode, getKey);
    } else {
      // まだ「いいね」されていない → 追加
      await handleLike(project.id, mode, getKey);
    }
  };

     // ブックマークボタン
    const handleBookmarkToggle = async () => {
      if (!requireAuth()) {
        return; // 未ログインなら処理を中断
      }

      if (project.attributes.bookmarked_by_current_user) {
        // すでに「ブックマーク」されている → 解除
        await handleUnBookmark(project.id, project.attributes.current_bookmark_id, mode, getKey);
      } else {
        // まだ「ブックマーク」されていない → 追加
        await handleBookmark(project.id, mode, getKey);
      }
    };

    //コメントボタン
    const handleCommentToggle = () => {
      if (!requireAuth()) {
        return; // 未ログインなら処理を中断
      }

      if (mode === "list") {
        // 一覧ページなら詳細ページに遷移
        setIsCommentRoute(true);
        router.push(`/projects/${project.attributes.id}/project_show`);
      } else if (mode === "detail") {
        // 詳細ページならそのままフォーカス
        setIsCommentRoute(true);
      }
    };

    //リンク共有ボタン
    const handleCopyLink = () => {
      const projectUrl = `${window.location.origin}/projects/${project.id}/project_show`;
      navigator.clipboard.writeText(projectUrl)
        .then(() => setOpenSnackbar(true))
        .catch(err => console.error("リンクのコピーに失敗しました:", err));
    };

  return(
    <Paper
      elevation={3}
      sx={{
        border: "1px solid #ddd",
        borderRadius: 2,
        padding: 2,
        marginBottom: 2,
        position: "relative",
        maxWidth: 600,
        backgroundColor: "background.default",
        mx: 1,
        cursor: mode === "list" && !isEditing ? "pointer" : "default",
      }}
      onClick={mode === "list" && !isEditing ? handleProjectClick : undefined}
      >
        {/* アイコン・ユーザー名 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pointerEvents: isEditing ? "none" : "auto",
            opacity: isEditing ? 0.5 : 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ButtonBase
              onClick={handleClickAvatar}
              sx={{
                borderRadius: "50%",
                overflow: "hidden",
                transition: "transform 0.2s ease-in-out",
                "&:active": {
                  transform: "scale(0.8)",
                },
              }}
            >
              <Avatar
                src={project.user.attributes.avatar_url || "/default-icon.png"}
                alt={project.user.attributes.nickname || project.user.attributes.username || undefined }
                sx={{ cursor: "pointer" }}
              />
            </ButtonBase>
            <Box sx={{ ml:2, flex: 1, display: "flex", alignItems: "center" }}>
              <Typography variant="body1" component="span" color="textPrimary">
                {project.user.attributes.nickname || project.user.attributes.username || "名無しのユーザー" }
              </Typography>
            </Box>
          </Box>

          {/* タイムスタンプ・メニュー */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="textPrimary" sx={{ml:5}}>
              {formattedDate}
            </Typography>
            {project.isOwner && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation(); // バブリング防止
                  handleMenuOpen(e);
                }}
                sx={{ ml: 2 }}>
                <MoreHorizIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()} // バブリング防止
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                {project.attributes.status !== "closed" && (
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation(); // バブリング防止
                    handleMenuClose();
                    handleEdit();
                  }}
                >
                  <EditIcon sx={{ mr: 1 }} /> 編集
                </MenuItem>
                )}
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation(); // バブリング防止
                    handleMenuClose();
                    handleDeleteProxy();
                  }}
                >
                  <DeleteIcon sx={{ mr: 1 }} /> 削除
                </MenuItem>
              </Menu>
            </>
            )}
          </Box>
        </Box>
      {/* 削除用ダイアログ */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>プロジェクトを削除しますか？</DialogTitle>
          <Divider />
          <DialogContent>
            <DialogContentText>
              プロジェクトを削除すると、応募中の音声は削除され、プロジェクトの音声も削除されます。
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{mb:1}} >
            <Button onClick={(e) => {
                e.stopPropagation(); // バブリング防止
                setOpenDeleteDialog(false);
              }}
              variant="outlined">
              キャンセル
            </Button>
            <Button onClick={(e) => {
                  e.stopPropagation(); // バブリング防止
                  handleDialogConfirmDelete();
                }}
                variant="contained"
                color="primary">
              確認
            </Button>
          </DialogActions>
        </Dialog>

      {/* 編集モード */}
      {isEditing ? (
        <>
          <form onSubmit={handleSubmit(handleEditProxy)}>
            <Box sx={{ display: "flex", flexDirection: "column", gap:2, my:2 }}>
              <TextField
                {...register("title")}
                label="タイトル"
                variant="outlined"
                fullWidth
                size="small"
                multiline
                defaultValue={project.attributes.title}
                error={!!errors.title}
                helperText={errors.title?.message}
              />
              <TextField
                {...register("description")}
                label="概要"
                variant="outlined"
                fullWidth
                size="small"
                multiline
                defaultValue={project.attributes.description}
                error={!!errors.description}
                helperText={errors.description?.message}
              />
              <TextField
                {...register("visibility")}
                variant="outlined"
                select
                label="公開範囲"
                size="small"
                defaultValue={project.attributes.visibility === "is_public" ? "公開" : "限定公開"}
                error={!!errors.visibility}
                helperText={errors.visibility?.message}
              >
                {preVisibility.map((option) => (
                  <MenuItem key={option.value} value={option.label}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                  {...register("isClosed")}
                    size="small"
                    color="primary"
                  />
                }
                label="プロジェクト終了"
              />
            </Box>

            {formError && <Alert severity="error">{formError}</Alert>}

            {/* キャンセル・保存ボタン */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={handleCancel}>
                キャンセル
              </Button>
              {loading ? (
                <CircularProgress
                  size={48}
                  sx={{
                    color: "primary",
                  }}
                />
              ) : (
                <Button type="submit" variant="contained" color="primary">
                  保存
                </Button>
              )}
            </Box>
          </form>

          {/* 編集用ダイアログ */}
          <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
            <DialogTitle>プロジェクトを終了しますか？</DialogTitle>
            <Divider />
            <DialogContent>
              <DialogContentText>
              「プロジェクトを終了する」にチェックが入っています。プロジェクトを終了すると、以降の応募は受けられず、編集する事も再開する事もできません。まだ合成されていない応募中の音声は削除されます。
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{mb:1}} >
              <Button onClick={() => setOpenEditDialog(false)} variant="outlined">
                キャンセル
              </Button>
              <Button onClick={handleDialogConfirmEdit} variant="contained" color="primary">
                確認
              </Button>
            </DialogActions>
          </Dialog>

        </>
      ) : (
      <>
        {/* 通常モード */}
        <Typography variant="h6" sx={{ mt: 1 }}>
          {project.attributes.title}
        </Typography>
        <Typography variant="body2">
          {expanded ? project.attributes.description : `${previewText}`}
        </Typography>
        {!isDescriptionShort &&(
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
            <Typography
              onClick={(e) => {
                e.stopPropagation(); // バブリング防止
                toggleExpanded();
              }}
              color="primary"
              variant="body2">
                {expanded ? "閉じる": "続きを読む"}
              </Typography>
            <IconButton
            onClick={(e)=> {
              e.stopPropagation(); // バブリング防止
              toggleExpanded();
            }}
            sx={{ color: "primary.main", pl: 0 }}>
              {expanded ? <ExpandLessIcon/> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        )}
      </>
    )}
      {/* コラボ状況 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            my: 2.5,
            pointerEvents: isEditing ? "none" : "auto",
            opacity: isEditing ? 0.5 : 1,
          }}
        >
          <PeopleIcon sx={{ color: "text.secondary"}} />
          <Typography variant="body2" color="textSecondary">
            ユーザーB、ユーザーC他数名が参加（実装中）
          </Typography>
        </Box>




      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          width: "100%",
          m: 1,
          gap:2,
          pointerEvents: isEditing ? "none" : "auto",
          opacity: isEditing ? 0.5 : 1,
        }}
      >
        <Box>
          {/* 応募管理・応募するボタン */}
          <Box >
          {project.attributes.status === "open" && (
            project.isOwner ? (
              <Button
              variant="secondary"
              fullWidth
              disabled={isEditing}
              onClick={(e) => {
                e.stopPropagation(); // バブリング防止
                handleCollaborationManagementRequest();
              }}
                >応募管理</Button>
            ) : (
              <Button
              variant="secondary"
              fullWidth
              disabled={isEditing}
              onClick={(e) => {
                e.stopPropagation(); // バブリング防止
                handleCollaborationRequest();
              }}
              >応募する</Button>
            )
          )}
          </Box>

          {/* フィードボタン群 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: 1
            }}
          >
            {/* コメントボタン */}
            <IconButton
            onClick={(e) => {
              e.stopPropagation(); // バブリング防止
              handleCommentToggle();
            }}
            sx={{ color: "text.secondary" }}
            >
              <ChatBubbleOutlineIcon  />
            </IconButton>
            <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
              {project.attributes.comment_count}
            </Typography>

            {/* いいねボタン */}
            <IconButton
            onClick={(e) => {
              e.stopPropagation(); // バブリング防止
              handleLikeToggle();
            }}
            sx={{ color: project.attributes.liked_by_current_user ? "secondary.main" : "text.secondary" }}
            >
            {project.attributes.liked_by_current_user ? (
              <FavoriteIcon  />
            ) : (
              <FavoriteBorderIcon />
            )}
            </IconButton>
            <Typography variant="body2" color={project.attributes.liked_by_current_user ? "secondary.main" : "textSecondary"}sx={{ mr: 2 }}>
              {project.attributes.like_count}
            </Typography>

            {/* 共有ボタン */}
            <>
              <Tooltip title="リンクをコピー">
                <IconButton
                onClick={(e) => {
                  e.stopPropagation(); // バブリング防止
                  handleCopyLink();
                }}
                sx={{ color: "text.secondary", mr:2 }}
                >
                  <IosShareIcon  />
                </IconButton>
              </Tooltip>
              <Snackbar
                open={openSnackbar}
                autoHideDuration={2000}
                onClose={() => setOpenSnackbar(false)}
                message="リンクをコピーしました"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              />
            </>

            {/* ブックマーク */}
            <IconButton
            onClick={(e) => {
              e.stopPropagation(); // バブリング防止
              handleBookmarkToggle();
            }}
            sx={{ color: project.attributes.bookmarked_by_current_user ? "secondary.main" : "text.secondary",
            }}
            >
            {project.attributes.bookmarked_by_current_user ? (
              <BookmarkIcon />
            ) : (
              <BookmarkBorderIcon />
            )}
            </IconButton>
          </Box>
        </Box>

        {/* 再生ボタン */}
        <Box sx={{ display: "flex", justifyContent: "flex-end"}}>
          <IconButton
          onClick={(e) => {
            e.stopPropagation(); // バブリング防止
            onPlayClick(project);
          }}
          sx={{
          color: "primary.main",
          border: "2px solid",
          borderRadius: "14px",
          padding: 0,
          mr: 4,
          }}><PlayArrowIcon sx={{ fontSize: 70 }}/></IconButton>
        </Box>
      </Box>
    </Paper>
  );
};