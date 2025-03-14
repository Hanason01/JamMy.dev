"use client";

import { AudioBuffer,PostSettings,SetState, Project, User, Collaboration, ExtendedCollaboration } from "@sharedTypes/types";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography, TextField, InputAdornment, Slider, Button, MenuItem, Switch, FormGroup, FormControlLabel, Divider, CircularProgress, Avatar, Select, Dialog, DialogTitle, DialogContent,DialogContentText, DialogActions,IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { PostProjectProcessing } from "@Project/post_project/PostProjectProcessing";
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";
import { useFetchAudioData } from "@audio/useFetchAudioData";
import { useAudioProcessing } from "@audio/useAudioProcessing";
import { useAudioMerge } from "@audio/useAudioMerge";
import { useProjectContext } from "@context/useProjectContext";
import { useCollaborationManagementContext } from "@context/useCollaborationManagementContext";
import { usePlayback } from "@context/usePlayBackContext";

export function CollaborationManagementStep2({
  onNext,
  onBack,
  globalAudioContextRef,
}: {
  onNext: () => void;
  onBack: () => void;
  globalAudioContextRef: AudioContext | null;
}){
  //Context関連
  const {currentProject,currentUser} = useProjectContext();

  const {
    postAudioData,
    synthesisList, setSynthesisList,
    setMergedAudioBuffer
  } = useCollaborationManagementContext();

  const {
    setIsPlaybackTriggered, playbackTriggeredByRef,
    setIsPlaybackReset, playbackResetTriggeredByRef} = usePlayback();


  //状態変数
  const [loading, setLoading] = useState<boolean>(false);
  const [enablePostAudioPreview, setEnablePostAudioPreview] = useState<boolean>(true); //録音時投稿音声同時再生
  const [openComments, setOpenComments] = useState<{ [key: number]: boolean }>({});
  const [openDialog, setOpenDialog] = useState(false); //削除確認
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null); // 削除確認ダイアログに利用
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null); // 削除確認ダイアログに利用


  //フック関係
  const {mergeAudioBuffers} = useAudioMerge({
    postAudioData,
    synthesisList,
    globalAudioContextRef,
    setMergedAudioBuffer
  });

  // コメントを開く関数
  const handleClickOpen = (id: number) => {
    setOpenComments((prev) => ({ ...prev, [id]: true }));
  };

  // コメントを閉じる関数
  const handleClose = (id: number) => {
    setOpenComments((prev) => ({ ...prev, [id]: false }));
  };

  // ダイアログを開く
  const handleOpenDialog = (id: number, userName: string | null) => {
    setSelectedItemId(id);
    setSelectedItemName(userName);
    setOpenDialog(true);
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItemId(null);
    setSelectedItemName(null);
  };

  //合成リストから削除する関数
  const handleRemoveItem = () => {
    if (selectedItemId !== null) {
      setSynthesisList((prevList) =>
        prevList.filter((item) => item.id !== selectedItemId)
      );
    }
    handleCloseDialog();
  };

  //合成ボタン
  const handleAudioMerge = async() => {
    try{
      setLoading(true);
      await mergeAudioBuffers();
      onNext();
    } catch (error) {
      console.error("音声合成中にエラーが発生しました", error);
    } finally {
      setLoading(false);
      // console.log("合成された音声",)
    }
  }


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
      }}
    >
      <Box sx={{
        justifyContent: "flex-start",
        width: "100%",
        "& .MuiTypography-root": {
            fontSize: "1rem",
            color: "text.primary",
          },
          "& .MuiInputBase-root": {
            fontSize: "1rem",
            color: "text.primary",
          },
        }}
      >
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

      <Divider sx={{my:1}} />

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

      {/* 合成リスト表示 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {synthesisList.length > 0 ? (
          synthesisList.map((item) => (
            <Box key={item.id} sx={{ mt: 2 }}>
              {/* ユーザー情報とコメント */}
                <Box sx={{ display: "flex", alignItems: "center", width: "100%", position: "relative", mb:0.5}}>
                  <Avatar src={
                            item.user.avatar_url
                              ? `/api/proxy-image?key=${encodeURIComponent(item.user.avatar_url)}`
                              : "/default-icon.png"
                          }
                          alt={item.user.nickname ||item.user.username || undefined }
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
                    { item.user.nickname || item.user.username }
                  </Typography>
                  <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)",
                  whiteSpace: "nowrap", }}>
                  {/* コメントを表示するボタン */}
                    <Button variant="outlined" onClick={() => handleClickOpen(item.id)} sx={{ textTransform: "none", fontSize: "0.875rem" }}>
                      コメント
                    </Button>

                    {/* ダイアログ */}
                    <Dialog onClose={() => handleClose(item.id)} open={!!openComments[item.id]}>
                      <DialogTitle sx={{
                        position: "relative",
                        paddingRight: "48px",
                      }}
                    >
                        応募者のコメント
                        <IconButton
                          aria-label="close"
                          onClick={() => handleClose(item.id)}
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
                          {item.comment || "コメントなし"}
                        </DialogContentText>
                      </DialogContent>
                    </Dialog>
                  </Box>
                </Box>
                {item.id && item.audioBuffer && (
                  <Box sx={{ flex: "0 0 auto", position: "relative" }}>
                    <AudioPlayer
                    id = {item.id.toString()}
                    audioBuffer={item.audioBuffer}
                    audioContext={globalAudioContextRef}
                    enablePostAudioPreview={enablePostAudioPreview}
                    />
                    <IconButton
                      onClick={() => handleOpenDialog(item.id,item.user.nickname || item.user.username)}
                      sx={{
                        position: "absolute",
                        top: "-3rem",
                        right: "0.2rem",
                        color: "gray",
                      }}
                      aria-label="Close"
                    >
                      <HighlightOffIcon fontSize="large"/>
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="h6" color="textSecondary" sx={{textAlign: "center",}}>
              合成リストは空です
            </Typography>
          )}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 3,
        }}
      >
        <Button onClick={onBack} variant="primary" startIcon={<ArrowBackIosIcon />}>
          音声選択/編集
        </Button>
        {synthesisList.length > 0  &&(
        <Button onClick={handleAudioMerge} variant="primary" disabled={loading}
        endIcon={loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : <Diversity3OutlinedIcon />}
        >
          合成する
        </Button>
        )}
      </Box>
      {/* 削除確認ダイアログ */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle sx={{ fontSize: 22}}>
        {selectedItemName}さんの応募音声を削除しますか？
        </DialogTitle>
        <DialogContent>
          <DialogContentText gutterBottom>
            合成リストから削除された音声は編集前の状態に戻ります
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="secondary">
            キャンセル
          </Button>
          <Button onClick={handleRemoveItem} variant="secondary">
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};