"use client";

import { Project, User, SetState, EnrichedProject, PostProjectFormData, EditProjectRequestData, GetKeyType, PageData} from "@sharedTypes/types";
import { useState, useEffect} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Paper, Box, Avatar, AvatarGroup, Button, IconButton, Typography,Menu, MenuItem, TextField, Checkbox, FormControlLabel, Alert, CircularProgress,Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,Divider, Snackbar, Tooltip, ButtonBase, Chip } from "@mui/material";
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
import LinkIcon from '@mui/icons-material/Link';
import XIcon from '@mui/icons-material/X';
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useProjectContext } from "@context/useProjectContext";
import { useFeedbackContext } from "@context/useFeedbackContext";
import { useAuthContext } from "@context/useAuthContext";
import { useClientCacheContext } from "@context/useClientCacheContext";
import { usePostProjectValidation } from "@validation/usePostProjectValidation";
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { audioEncoder } from "@utils/audioEncoder";
import { useEditProjectRequest } from "@services/project/useEditProjectRequest";
import { useDeleteProjectRequest } from "@services/project/useDeleteProjectRequest";
import { useLikeToggle } from "@services/project/feedback/useLikeToggle";
import { useBookmarkToggle } from "@services/project/feedback/useBookmarkToggle";
import { useDeleteProjectToggle } from "@services/project/useDeleteProjectToggle";
import { ParticipantModal } from "@Project/ParticipantModal";
import { useRevalidateSWR } from "@utils/useRevalidateSWR"

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
  const [expanded, setExpanded] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [isOpenParticipantModal, setIsOpenParticipantModal] = useState<boolean>(false);


  //編集・削除用途のセット（リクエスト関係は別途定義）
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const preVisibility = [
    { label: "公開", value: "is_public" },
    { label: "限定公開", value: "is_private" },
  ];
  const [formError, setFormError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [tempData, setTempData] = useState<PostProjectFormData | null>(null);

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
  const { batchUpdateAll } = useRevalidateSWR();
  const handleMutate = async () => {
    await batchUpdateAll(project.id);
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
  const { handleDeleteProjectSWR } = useDeleteProjectToggle();

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

  //件数表示のフォーマッター
  const formatNumber = (num: number | null): string => {
    if (num === null) return "0";
    if (num < 10000) {
      return num.toString();
    } else if (num < 100000000) {
      return (num / 10000).toFixed(1).replace(/\.0$/, "") + "万";
    } else {
      return (num / 100000000).toFixed(1).replace(/\.0$/, "") + "億";
    }
  };

  //ユーザーページ遷移
  const handleClickAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem("scrollPosition");

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
    if (data.isClosed) {
      setTempData(data);
      setOpenEditDialog(true);
    } else {
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

      if(data.isClosed && project.audioFilePath){
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 44100
        });
        const audioData = await fetchAudioData(project.audioFilePath);
        const audioBufferData = await audioContext.decodeAudioData( audioData);
        audioFile = await audioEncoder(audioBufferData, "MP3");
      }
      const visibilityValue = preVisibility.find((option) => option.label === data.visibility)?.value;

      if (!visibilityValue) {
        console.error("無効な公開範囲が選択されています");
        return;
      }

      const requestData: EditProjectRequestData = {
        "project[title]": data.title.trim(),
        "project[description]": data.description.trim(),
        "project[visibility]": visibilityValue,
        "project[status]": data.isClosed ? "closed" : "null",
        "project[audio_file]": audioFile,
      };

      const formData = new FormData();
      Object.entries(requestData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await editProject(formData, project.id);
      setIsEditing(false);

      await handleMutate();
      setFeedbackByKey("project:edit:success");
    }catch(error: any) {
      if (error.title) {
        setError("title", { type: "manual", message: error.title });
      } else if (error.description) {
        setError("description", { type: "manual", message: error.description });
      } else {
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
    await handleDeleteProjectSWR(project.id, mode, getKey);
    const fromPage = searchParams.get("from");
    if (fromPage === "my_projects" || fromPage === "collaborating" || fromPage === "collaborated" || fromPage === "bookmarks") {
      router.replace(`/mypage?tab=${fromPage}&feedback=project:delete:success`);
    } else if (fromPage === "projects") {
      router.replace("/projects?feedback=project:delete:success");
    } else if (mode === "list"){
      await handleMutate()
      setFeedbackByKey("project:delete:success");
    } else{
      router.replace("/projects?feedback=project:delete:success");
    }
  }

   // いいねボタン
  const handleLikeToggle = async () => {
    if (!requireAuth()) {
      return;
    }

    if (project.attributes.liked_by_current_user) {
      await handleUnlike(project.id, project.attributes.current_like_id, mode, getKey);
    } else {
      await handleLike(project.id, mode, getKey);
    }
  };

     // ブックマークボタン
    const handleBookmarkToggle = async () => {
      if (!requireAuth()) {
        return;
      }

      if (project.attributes.bookmarked_by_current_user) {
        await handleUnBookmark(project.id, project.attributes.current_bookmark_id, mode, getKey);
      } else {
        await handleBookmark(project.id, mode, getKey);
      }
    };

    //コメントボタン
    const handleCommentToggle = () => {
      if (!requireAuth()) {
        return;
      }

      if (mode === "list") {
        setIsCommentRoute(true);
        router.push(`/projects/${project.attributes.id}/project_show`);
      } else if (mode === "detail") {
        setIsCommentRoute(true);
      }
    };

    //リンク共有ボタン
    const handleCopyLink = () => {
      const projectUrl = `${process.env.NEXT_PUBLIC_FRONT_URL}/projects/${project.id}/project_show`;
      navigator.clipboard.writeText(projectUrl)
        .then(() => setOpenSnackbar(true))
        .catch(err => console.error("リンクのコピーに失敗しました:", err));
      handleShareMenuClose();
    };

    //X投稿リンク
    const handleShareToX = () => {
      const text = encodeURIComponent(`#JamMy で「${project.attributes.title}」をチェック！`);
      const url = encodeURIComponent(`${process.env.NEXT_PUBLIC_FRONT_URL}/projects/${project.id}/project_show`);
      const twitterUrl = `https://x.com/intent/tweet?text=${text}&url=${url}`;
      handleShareMenuClose();
      window.open(twitterUrl, "_blank");
    }

    const handleShareMenu = (event: React.MouseEvent<HTMLElement>) => {
      setShareAnchorEl(event.currentTarget);
    };

    const handleShareMenuClose = () => {
      setShareAnchorEl(null);
    };

  return(
    <Paper
      elevation={3}
      sx={{
        border: "1px solid #ddd",
        borderRadius: 2,
        p: 2,
        position: "relative",
        maxWidth: 600,
        width: { xs: "100%", sm: "100%", md: "400px", lg: "450px" },
        backgroundColor: "background.default",
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
                src={
                  project.user.attributes.avatar_url
                    ? `/api/proxy-image?key=${encodeURIComponent(project.user.attributes.avatar_url)}`
                    : "/default-icon.png"
                }
                alt={project.user.attributes.nickname || project.user.attributes.username || undefined }
                sx={{ cursor: "pointer" }}
              />
            </ButtonBase>
            <Box sx={{ ml:2, flex: 1, display: "flex", alignItems: "center", maxWidth: 150 }}>
              <Typography
              variant="body1"
              component="span"
              color="textPrimary"
              onClick={handleClickAvatar}
              sx={{
                cursor: "pointer",
                textDecoration: "none",
                transition: "text-decoration 0.2s ease-in-out",
                "&:hover": { textDecoration: "underline" },
                "&:active": { textDecoration: "underline" },
              }}>
                {project.user.attributes.nickname || project.user.attributes.username || "名無しのユーザー" }
              </Typography>
            </Box>
          </Box>

          {/* タイムスタンプ・メニュー */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="textPrimary" sx={{ml:3}}>
              {formattedDate}
            </Typography>
            {project.isOwner && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuOpen(e);
                }}
                sx={{ ml: 2 }}>
                <MoreHorizIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()}
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
                    e.stopPropagation();
                    handleMenuClose();
                    handleEdit();
                  }}
                >
                  <EditIcon sx={{ mr: 1 }} /> 編集
                </MenuItem>
                )}
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    handleDeleteProxy();
                  }}
                >
                  <DeleteIcon sx={{color:"#e53935", mr: 1 }} /> <span style={{ color: "#e53935" }}>削除</span>
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
                e.stopPropagation();
                setOpenDeleteDialog(false);
              }}
              variant="outlined">
              キャンセル
            </Button>
            <Button onClick={(e) => {
                  e.stopPropagation();
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
      <Box>
        {/* 通常モード */}
        <Typography variant="h6" sx={{ mt: 1 }}>
          {project.attributes.title}
        </Typography>
        <Typography variant="body2" sx={{
          maxWidth: "100%",
          width: "auto",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}>
          {expanded ? project.attributes.description : `${previewText}`}
        </Typography>
        {!isDescriptionShort &&(
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center"}}>
            <Typography
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded();
              }}
              color="primary"
              variant="body2">
                {expanded ? "閉じる": "続きを読む"}
              </Typography>
            <IconButton
            onClick={(e)=> {
              e.stopPropagation();
              toggleExpanded();
            }}
            sx={{ color: "primary.main", pl: 0 }}>
              {expanded ? <ExpandLessIcon/> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        )}
      </Box>
    )}
    {/* コラボ状況 & 応募ボタン & 再生ボタン グループ */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          my: 2,
          mx: 1,
          gap:2,
          pointerEvents: isEditing ? "none" : "auto",
          opacity: isEditing ? 0.5 : 1,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 , width: 260 }}>
          {/* コラボ状況 */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
          <Chip
            icon={<PeopleIcon sx={{fontSize: 20}} />}
            label="参加者"
            onClick={(event) => {
              event.stopPropagation();
              setIsOpenParticipantModal(true);
            }}
            sx={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              py: 0.5,
            }}
          />
          {project.attributes.collaborations.length > 0 ? (
            <AvatarGroup
            max={4}
            spacing="small"
            sx={{ minWidth: 130, justifyContent: "flex-end" }}
            onClick={(event) => {
              event.stopPropagation();
              setIsOpenParticipantModal(true);
            }}
            >
              {project.attributes.collaborations.map((user) => (
                <Avatar
                  key={user.user_id}
                  alt={user.nickname || user.username || "名無しのユーザー"}
                  src={
                    user.avatar_url
                      ? `/api/proxy-image?key=${encodeURIComponent(user.avatar_url)}`
                      : "/default-avatar.png"
                  }
                />
              ))}
            </AvatarGroup>
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ ml: 2, fontWeight: "bold" }}
            >
              『募集中』
            </Typography>
          )}
          </Box>

          {/* モーダルの表示 */}
          <ParticipantModal
            isOpenParticipantModal={isOpenParticipantModal}
            setIsOpenParticipantModal={setIsOpenParticipantModal}
            participants={project.attributes.collaborations}
          />

        {/* 応募管理・応募するボタン */}
          <Box>
          {project.attributes.status === "open" ? (
            project.isOwner ? (
              <Button
              variant="secondary"
              fullWidth
              disabled={isEditing}
              onClick={(e) => {
                e.stopPropagation();
                handleCollaborationManagementRequest();
              }}
                >応募管理</Button>
            ) : (
              <Button
              variant="secondary"
              fullWidth
              disabled={isEditing}
              onClick={(e) => {
                e.stopPropagation();
                handleCollaborationRequest();
              }}
              >応募する</Button>
              )
          ) : (
            <Button
            variant="secondary"
            fullWidth
            disabled
          >
            プロジェクト終了済
          </Button>
          )}
          </Box>
        </Box>
        {/* 再生ボタン */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems:"center"}}>
          <Typography variant="body2" color="textSecondary"sx={{ fontSize: 15 }}>
            Play!
          </Typography>
          <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onPlayClick(project);
          }}
          sx={{
            color: "white",
            backgroundColor: "primary.main",
            borderRadius: "50%",
            padding: 2,
            width: 80,
            height: 80,
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
            transition: "transform 0.1s ease, box-shadow 0.1s ease",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            "&:active": {
              transform: "scale(0.9)",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
            },
          }}><PlayArrowIcon sx={{ fontSize: 70 }}/></IconButton>
        </Box>
      </Box>

      {/* フィードボタン群 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          mt: 1,
          width: "100%",
        }}
      >
        {/* コメントボタン */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleCommentToggle();
          }}
          sx={{color: "text.secondary" }}
          >
            <ChatBubbleOutlineIcon
            sx={{
              fontSize: 25,
              transition: "transform 0.2s ease-in-out",
              "&:active": {
                transform: "scale(0.8)",
              },
              }} />
          </IconButton>
          <Typography variant="body2" color="textSecondary"sx={{ fontSize: 20 }}>
            {formatNumber(project.attributes.comment_count)}
          </Typography>
        </Box>

        {/* いいねボタン */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleLikeToggle();
          }}
          sx={{
            color: project.attributes.liked_by_current_user ? "secondary.main" : "text.secondary",
            transition: "transform 0.2s ease-in-out",
            "&:active": {
              transform: "scale(0.8)",
            },
          }}
          >
          {project.attributes.liked_by_current_user ? (
            <FavoriteIcon  sx={{ fontSize: 25 }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 25 }} />
          )}
          </IconButton>
          <Typography variant="body2" color={project.attributes.liked_by_current_user ? "secondary.main" : "textSecondary"}sx={{ fontSize: 20 }}>
          {formatNumber(project.attributes.like_count)}
          </Typography>
        </Box>

        {/* 共有ボタン */}
        <>
          <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleShareMenu(e);
          }}
          sx={{color: "text.secondary"}}
          >
            <IosShareIcon
            sx={{
              fontSize: 25,
              transition: "transform 0.2s ease-in-out",
              "&:active": {
                transform: "scale(0.8)",
              },
              }}  />
          </IconButton>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={2000}
            onClose={() => setOpenSnackbar(false)}
            message="リンクをコピーしました"
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{ bottom: 56 }}
          />
          <Menu
            id="menu-appbar"
            anchorEl={shareAnchorEl}
            open={Boolean(shareAnchorEl)}
            onClose={handleShareMenuClose}
            onClick={(e) => e.stopPropagation()}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink();
                }}
              >
                <LinkIcon sx={{ mr: 1 }} />URLで共有
            </MenuItem>
            <MenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareToX();
                }}
              >
                <XIcon sx={{ mr: 1, height: 22, width: 22}} />で投稿
            </MenuItem>
          </Menu>
        </>



        {/* ブックマーク */}
        <IconButton
        onClick={(e) => {
          e.stopPropagation();
          handleBookmarkToggle();
        }}
        sx={{
          color: project.attributes.bookmarked_by_current_user ? "secondary.main" : "text.secondary",
          transition: "transform 0.2s ease-in-out",
          "&:active": {
            transform: "scale(0.8)",
          },
        }}
        >
        {project.attributes.bookmarked_by_current_user ? (
          <BookmarkIcon sx={{ fontSize: 25 }} />
        ) : (
          <BookmarkBorderIcon sx={{ fontSize: 25 }} />
        )}
        </IconButton>
      </Box>
    </Paper>
  );
};