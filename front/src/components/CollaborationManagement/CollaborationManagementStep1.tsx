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
  setCollaborations,
  globalAudioContextRef,
}: {
  onNext: () => void;
  collaborations: Collaboration[];
  setCollaborations: SetState<Collaboration[]>;
  globalAudioContextRef: AudioContext | null;
}){
  //Context関連
  const {
    currentProject, setCurrentProject,
    currentUser, setCurrentUser,
    currentAudioFilePath, setCurrentAudioFilePath } = useProjectContext();

  const {
    postAudioData, setPostAudioData,
    synthesisList, setSynthesisList,
  } = useCollaborationManagementContext();

  const {
    setIsPlaybackTriggered, playbackTriggeredByRef,
    setIsPlaybackReset, playbackResetTriggeredByRef} = usePlayback();

    console.log("globalAudioContextの状態: ", globalAudioContextRef?.state);


  //状態変数
  const [loading, setLoading] = useState<boolean>(false);
  const [enablePostAudioPreview, setEnablePostAudioPreview] = useState<boolean>(true);
  const [slots, setSlots] = useState<{ slotId: string; collaborationId: number | null; audioBuffer: AudioBuffer | null }[]>([
    { slotId: "slot1", collaborationId: null, audioBuffer: null },
    { slotId: "slot2", collaborationId: null, audioBuffer: null },
  ]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [openSlots, setOpenSlots] = useState<{ [key: string]: boolean }>({});
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [selectedVolume, setSelectedVolume] = useState<number>(50);


  //フック関係
  const { processAudio } = useAudioProcessing();
  const { fetchAudioData } = useFetchAudioData();



  // ダイアログを開く関数
  const handleClickOpen = (slotId: string) => {
    setOpenSlots((prev) => ({ ...prev, [slotId]: true }));
  };

  // ダイアログを閉じる関数
  const handleClose = (slotId: string) => {
    setOpenSlots((prev) => ({ ...prev, [slotId]: false }));
  };


  const router = useRouter();


  //初期化
  useEffect(() => {
    const initializeAudioContext = async () => {
      try {
        let project = currentProject;
        let user = currentUser;
        let audioFilePath = currentAudioFilePath;
        if (!currentProject || !currentUser || !currentAudioFilePath) {
            project = JSON.parse(sessionStorage.getItem("currentProject") || "null")
            setCurrentProject(project);
            user = JSON.parse(sessionStorage.getItem("currentUser") || "null");
            setCurrentUser(user);
            audioFilePath = sessionStorage.getItem("currentAudioFilePath") || null
            setCurrentAudioFilePath(audioFilePath);
        }

        //初回アクセス時の保有チェック
        const authenticatedUser = JSON.parse(localStorage.getItem("authenticatedUser") || "null");
        if (user && user.id !== String(authenticatedUser.id)) {
          router.push("/projects");
        }

        // 投稿音声AudioBuffer の取得
        if (audioFilePath && globalAudioContextRef) {
          const audioArrayBuffer = await fetchAudioData(audioFilePath);
          const audioBufferData = await globalAudioContextRef.decodeAudioData(audioArrayBuffer);
          setPostAudioData(audioBufferData);
        }
        else{
          console.error("音声データを取得できませんでした");
        }
      } catch (error) {
        console.error("AudioContext の初期化に失敗しました", error);
      }
    };
    initializeAudioContext();
  }, []);


  // 編集管理
  useEffect(() => {
    const hasActiveSlot = slots.some((slot) => slot.collaborationId !== null);
    setIsEditing(hasActiveSlot);
  }, [slots]);


  //選択処理
  const handleCollaborationSelect = async (slotId: string, collaborationId: number) => {
    if (!globalAudioContextRef) return;

    setIsPlaybackTriggered(false);
    playbackTriggeredByRef.current = null;
    setIsPlaybackReset(true);
    playbackResetTriggeredByRef.current = "select";

    const collaboration = collaborations.find(collaboration => collaboration.id === collaborationId);
    if (!collaboration) return;
    try {
      const audioArrayBuffer = await fetchAudioData(collaboration.audioFile.file_path);
      const audioBuffer = await globalAudioContextRef.decodeAudioData(audioArrayBuffer);
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
    const itemsToAdd: ExtendedCollaboration[] = await Promise.all(
      slots
      .filter((slot) => slot.collaborationId !== null)
      .map(async(slot) => {
        const collaboration = collaborations.find((c) => c.id === slot.collaborationId);

        if (!collaboration) {
          throw new Error(`CollaborationID ${slot.collaborationId}。IDない状態でSlotsに追加された応募音声（不正なデータ）があります。`);
        }

        if (!slot.audioBuffer) {
          throw new Error(`スロット ${slot.slotId} に AudioBuffer が存在しません。`);
        }

        const processedBuffer = await processAudio(slot.audioBuffer, selectedVolume);

        return {
          ...collaboration,
          audioBuffer: processedBuffer,
        };
      })
    );

      setSynthesisList((prevList) => [...prevList, ...itemsToAdd]);

      setSlots((prevSlots) =>
        prevSlots.map((slot) => ({
          ...slot,
          collaborationId: null,
          audioBuffer: null,
        }))
      );

      setOpenSnackbar(true);

      setIsPlaybackTriggered(false);
      playbackTriggeredByRef.current = null;
      setIsPlaybackReset(true);
      playbackResetTriggeredByRef.current = "AddToSynthesisList";
    }catch (e) {
      console.error("合成リストへの追加に失敗しました");
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
            fontSize: "1rem",
            color: "text.primary",
          },
          "& .MuiInputBase-root": {
            fontSize: "1rem",
            color: "text.primary",
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
          {postAudioData && globalAudioContextRef ? (
            <AudioPlayer
              id = {"Post"} //Post
              audioBuffer={postAudioData}
              audioContext={globalAudioContextRef}
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
          width: "100%",
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
        {globalAudioContextRef ? (
          slots.map((slot, index) => {
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
                    mode = "management"
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
                  sx ={{ my: 1}}
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
            backgroundColor: "grey",
            marginBottom: "56px",
          },
        }}
      />
      </Box>
    </Box>
  );
};