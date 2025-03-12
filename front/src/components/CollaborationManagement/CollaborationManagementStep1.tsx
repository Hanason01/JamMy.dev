"use client";

import { AudioBuffer,PostSettings,SetState, Project, User, Collaboration, ExtendedCollaboration } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, InputAdornment, Slider, Button, MenuItem, Switch, FormGroup, FormControlLabel, Divider, CircularProgress, Avatar, Select, Dialog, DialogTitle, DialogContent, DialogContentText,IconButton, Snackbar, } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import { PostProjectProcessing } from "@Project/post_project/PostProjectProcessing";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { useAudioProcessing } from "@audio/useAudioProcessing";
import { useProjectContext } from "@context/useProjectContext";
import { useCollaborationManagementContext } from "@context/useCollaborationManagementContext";
import { usePlayback } from "@context/usePlayBackContext";

export function CollaborationManagementStep1({
  onNext,
  collaborations,
  setCollaborations
}: {
  onNext: () => void;
  collaborations: Collaboration[];
  setCollaborations: SetState<Collaboration[]>;
}){
  //Context関連
  const {
    currentProject, setCurrentProject,
    currentUser, setCurrentUser,
    currentAudioFilePath, setCurrentAudioFilePath } = useProjectContext();

  const {
    postAudioData, setPostAudioData,
    globalAudioContextRef,
    synthesisList, setSynthesisList,
  } = useCollaborationManagementContext();

  const {
    setIsPlaybackTriggered, playbackTriggeredByRef,
    setIsPlaybackReset, playbackResetTriggeredByRef} = usePlayback();


  //状態変数
  const [loading, setLoading] = useState<boolean>(false);
  const [enablePostAudioPreview, setEnablePostAudioPreview] = useState<boolean>(true); //録音時投稿音声同時再生
  const [slots, setSlots] = useState<{ slotId: string; collaborationId: number | null; audioBuffer: AudioBuffer | null }[]>([
    { slotId: "slot1", collaborationId: null, audioBuffer: null },
    { slotId: "slot2", collaborationId: null, audioBuffer: null },
  ]);
  const [isEditing, setIsEditing] = useState<boolean>(false); //slotsにcollaborationが入っていれ（編集中）ばtrue
  const [openSlots, setOpenSlots] = useState<{ [key: string]: boolean }>({});
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false); // Snackbar の開閉状態管理
  const [selectedVolume, setSelectedVolume] = useState<number>(1); // 音量管理


  //フック関係
  const { processAudio } = useAudioProcessing({ selectedVolume });




  // ダイアログを開く関数
  const handleClickOpen = (slotId: string) => {
    setOpenSlots((prev) => ({ ...prev, [slotId]: true }));
  };

  // ダイアログを閉じる関数
  const handleClose = (slotId: string) => {
    setOpenSlots((prev) => ({ ...prev, [slotId]: false }));
  };


  const router = useRouter();

  //フック
  const { fetchAudioData } = useFetchAudioData();


  //初期化
  useEffect(() => {
    const initializeAudioContext = async () => {
      try {
        let project = currentProject;
        let user = currentUser;
        let audioFilePath = currentAudioFilePath;
        // リロードの場合セッションストレージから復元、状態変数へ保持
        if (!currentProject || !currentUser || !currentAudioFilePath) {
            project = JSON.parse(sessionStorage.getItem("currentProject") || "null")
            setCurrentProject(project);
            user = JSON.parse(sessionStorage.getItem("currentUser") || "null");
            setCurrentUser(user);
            audioFilePath = sessionStorage.getItem("currentAudioFilePath") || null
            setCurrentAudioFilePath(audioFilePath);
            // console.log("セッションストレージから復元", project, user, audioFilePath);
        }

        //初回アクセス時の保有チェック
        const authenticatedUser = JSON.parse(localStorage.getItem("authenticatedUser") || "null");
        // console.log("authenticatedUser,currentUser", authenticatedUser.id,user?.id)
        if (user && user.id !== String(authenticatedUser.id)) {
          // console.log("他人の投稿にアクセスしたため、/projects にリダイレクトします");
          router.push("/projects");
        }

        // globalAudioContext の初期化
        globalAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 44100
        });
        // console.log("globalAudioContext の初期化に成功", globalAudioContextRef.current);

        // 投稿音声AudioBuffer の取得
        if (audioFilePath) {
          const audioArrayBuffer = await fetchAudioData(audioFilePath);
          const audioBufferData = await globalAudioContextRef.current.decodeAudioData(audioArrayBuffer);
          setPostAudioData(audioBufferData);
          // console.log("AudioBuffer の取得およびデコードに成功",audioBufferData);
        }
        else{
          // console.log("audioFilePathが存在しないため、AudioBufferの取得およびデコードは行わません", audioFilePath);
        }
      } catch (error) {
        console.error("AudioContext の初期化に失敗しました", error);
      }
    };
    initializeAudioContext();
  }, []);


  // 編集中管理
  useEffect(() => {
    const hasActiveSlot = slots.some((slot) => slot.collaborationId !== null);
    setIsEditing(hasActiveSlot);
  }, [slots]);


  //選択処理
  const handleCollaborationSelect = async (slotId: string, collaborationId: number) => {
    if (!globalAudioContextRef.current) return;
    const collaboration = collaborations.find(collaboration => collaboration.id === collaborationId);
    if (!collaboration) return;
    try {
      const audioArrayBuffer = await fetchAudioData(collaboration.audioFile.file_path);
      const audioBuffer = await globalAudioContextRef.current.decodeAudioData(audioArrayBuffer);
      setSlots(prev =>
        prev.map(slot =>
          slot.slotId === slotId ? { ...slot, collaborationId, audioBuffer} : slot
        )
      );
    } catch (error) {
      console.error("AudioBuffer の取得に失敗しました:", error);
    }
  };

  //選択解除
  const handleRemoveAudio = (slotId: string) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.slotId === slotId ? { ...slot, collaborationId: null, audioBuffer: null } : slot
      )
    );
  };


  // 合成リストに追加
  const handleAddToSynthesisList = async () => {
    try{
    // スロットに入っている collaborationId を持つアイテムを合成リストに追加
    const itemsToAdd: ExtendedCollaboration[] = await Promise.all(
      slots
      .filter((slot) => slot.collaborationId !== null)
      .map(async(slot) => {
        const collaboration = collaborations.find((c) => c.id === slot.collaborationId);
        //collaborationガード
        if (!collaboration) {
          throw new Error(`CollaborationID ${slot.collaborationId}。IDない状態でSlotsに追加された応募音声（不正なデータ）があります。`);
        }
        //audioBufferガード
        if (!slot.audioBuffer) {
          throw new Error(`スロット ${slot.slotId} に AudioBuffer が存在しません。`);
        }
        //エフェクト適用
        const processedBuffer = await processAudio(slot.audioBuffer);

        return {
          ...collaboration,
          audioBuffer: processedBuffer,
        };
      })
    );

      // synthesisList に追加
      setSynthesisList((prevList) => [...prevList, ...itemsToAdd]);

      // slots をリセット
      setSlots((prevSlots) =>
        prevSlots.map((slot) => ({
          ...slot,
          collaborationId: null,
          audioBuffer: null,
        }))
      );

      setOpenSnackbar(true);

      //各PlayBackContextの初期化
      setIsPlaybackTriggered(false);
      playbackTriggeredByRef.current = null;
      setIsPlaybackReset(true);
      playbackResetTriggeredByRef.current = "AddToSynthesisList";
    }catch (e) {
      // console.log("合成リストへの追加に失敗しました");
    }
  };

  // Snackbar を閉じる関数
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };


  //同時再生制御関数
  const handleEnablePostAudioPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
      setIsPlaybackTriggered(false);
      playbackTriggeredByRef.current = null;
      setIsPlaybackReset(true);
      playbackResetTriggeredByRef.current = "toggle";
      if(setEnablePostAudioPreview){
        setEnablePostAudioPreview(isChecked);
      }
  }


  return(
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
      maxWidth: "600px",
      p:2
      }}>
      <Box sx={{
        justifyContent: "flex-start",
        "& .MuiTypography-root": {
            fontSize: "1rem", // 全体のフォントサイズ
            color: "text.primary", // テーマの文字色
          },
          "& .MuiInputBase-root": {
            fontSize: "1rem", // 入力フィールドの文字サイズ
            color: "text.primary", // 入力フィールドの文字色
          },
      }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%", position: "relative", my:2}}>
              <Avatar src={
                        currentUser?.attributes.avatar_url
                          ? `/api/proxy-image?key=${encodeURIComponent(currentUser.attributes.avatar_url)}`
                          : "/default-icon.png"
                      }
                      alt={currentUser?.attributes.nickname || currentUser?.attributes.username || undefined }
                      sx={{ width: 35, height: 35 }} />
              <Typography
              variant="body2"
              component="span"
              color="textSecondary"
              sx={{
                maxWidth: "60%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                ml: 1,
              }}>
                { currentUser?.attributes.nickname || currentUser?.attributes.username }
              </Typography>
            </Box>
            <Box sx={{ mb:1}}>
              <Typography
              variant="body1"
              color="textPrimary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center",
                }} >
              { currentProject?.attributes.title }
              </Typography>
            </Box>
          {postAudioData && globalAudioContextRef.current ? (
            <AudioPlayer
              id = {"Post"} //Post
              audioBuffer={postAudioData}
              audioContext={globalAudioContextRef.current}
              enablePostAudioPreview={enablePostAudioPreview}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <CircularProgress
                size={64}
                sx={{
                  color: "primary.main",
                }}
              />
            </Box>
            )}
        </Box>
      </Box>

      <Divider sx={{my:3}} />

      {/* 投稿音声と同時に聴くスイッチ */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%", // 親要素の幅を100%に
        }}
      >
        <FormGroup sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "auto",}}>
          <FormControlLabel
            required
            control={
              <Switch
                checked={enablePostAudioPreview}
                onChange={(e) => {
                  handleEnablePostAudioPreview(e);
                }}
              />
            }
            label="投稿音声と同時に聴く"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontSize: "0.9rem",
                color: "text.primary",
              },
            }}
          />
        </FormGroup>
      </Box>


      {/* Collaboration Slots */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {globalAudioContextRef.current ? (
          slots.map((slot, index) => {
              // collaborationIdに基づいて該当するcollaborationを取得
              const collaboration = collaborations.find(
                (collaboration) => collaboration.id === slot.collaborationId
              );

            return(
            <Box key={slot.slotId} sx={{ mt: 2 }}>
              {slot.collaborationId ? (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", width: "100%", position: "relative", mb:0.5}}>
                    <Avatar src={
                              collaboration?.user.avatar_url
                                ? `/api/proxy-image?key=${encodeURIComponent(collaboration.user.avatar_url)}`
                                : "/default-icon.png"
                            }
                            alt={collaboration?.user.nickname || collaboration?.user.username || undefined }
                            sx={{ width: 25, height: 25 }} />
                    <Typography
                    variant="body2"
                    component="span"
                    color="textSecondary"
                    sx={{
                      maxWidth: "25%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      ml: 1,
                    }}
                    >
                      { collaboration?.user.nickname || collaboration?.user.username }
                    </Typography>
                    <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)",
                    whiteSpace: "nowrap", }}>
                    {/* コメントを表示するボタン */}
                      <Button variant="outlined" onClick={() => handleClickOpen(slot.slotId)} sx={{ textTransform: "none", fontSize: "0.725rem" }}>
                        コメント
                      </Button>

                      {/* ダイアログ */}
                      <Dialog onClose={() => handleClose(slot.slotId)} open={!!openSlots[slot.slotId]}>
                        <DialogTitle sx={{
                          position: "relative",
                          paddingRight: "48px",
                        }}
                        >
                          応募者のコメント
                          <IconButton
                            aria-label="close"
                            onClick={() => handleClose(slot.slotId)}
                            sx={{
                              position: "absolute",
                              right: 8,
                              top: 8,
                              color: (theme) => theme.palette.grey[500],
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </DialogTitle>
                        <DialogContent dividers>
                          <DialogContentText gutterBottom>
                            {collaboration?.comment || "コメントなし"}
                          </DialogContentText>
                        </DialogContent>
                      </Dialog>
                    </Box>
                  </Box>
                  {slot.collaborationId && slot.audioBuffer && (
                  <PostProjectProcessing
                    id = {slot.collaborationId.toString()}
                    mode = "with-effects"
                    simpleUI = {true}
                    audioBufferForProcessing={slot.audioBuffer}
                    onRemove={() => handleRemoveAudio(slot.slotId)}
                    enablePostAudioPreview={enablePostAudioPreview}
                    setEnablePostAudioPreview={setEnablePostAudioPreview}
                    selectedVolume ={selectedVolume}
                    setSelectedVolume={setSelectedVolume}

                  />)}
                </>
              ) : collaborations.length > 0 ? (
                <Select
                  value={slot.collaborationId || ""}
                  onChange={(e) =>
                    handleCollaborationSelect(slot.slotId, Number(e.target.value))
                  }
                  displayEmpty
                  fullWidth
                  sx ={{ my: 2}}
                >
                  <MenuItem value="" disabled>
                    応募音声を選択
                  </MenuItem>
                  {collaborations
                    .filter(
                      (collaboration) =>
                        !synthesisList.some((item) => item.id === collaboration.id) &&
                        !slots.some((s) => s.collaborationId === collaboration.id)
                    )
                    .map((collaboration) => (
                      <MenuItem key={collaboration.id} value={collaboration.id}>
                        {collaboration.user.nickname || collaboration.user.username}
                      </MenuItem>
                    ))}
                </Select>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{textAlign: "center"}}>
                  応募がありません
                </Typography>
              )}
            </Box>
            );
          })
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "150px",
            }}
          >
            <CircularProgress
              size={64}
              sx={{
                color: "primary.main",
              }}
            />
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 5, display: "flex", justifyContent: "center" }}>
        {isEditing ? (
          <Button
          variant="contained"
          color="primary"
          onClick={() => handleAddToSynthesisList()}
          endIcon={loading ? <CircularProgress size={24} /> : <AddIcon />}
          >
            合成リストに追加
          </Button>
        ) : (
          <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          endIcon={loading ? <CircularProgress size={24} /> : <ArrowForwardIosIcon />}
          >
            合成画面へ
          </Button>
        )}
        <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="リストに追加しました"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "grey", // 背景色
            // color: "#ffffff", // テキスト色
            // fontWeight: "bold", // 太字
            // fontSize: "1rem", // フォントサイズ
            marginBottom: "56px",
          },
        }}
      />
      </Box>
    </Box>
  );
};