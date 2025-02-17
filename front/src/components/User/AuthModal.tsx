"use client";

import { useState } from "react";
import { Box, Modal, Tabs, Tab } from "@mui/material";
import { ReactElement } from "react";
import { useAuthContext } from "@context/useAuthContext";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LockIcon from "@mui/icons-material/Lock";
import { SignUpForm } from "@User/SignUpForm";
import { SignInForm } from "@User/SignInForm";

export function AuthModal({
  open,
  handleClose,
  redirectTo
} : {
  open?: boolean;
  handleClose?: () => void;
  redirectTo?: string;
}){
  const { showAuthModal, closeAuthModal } = useAuthContext();
  const [tabIndex, setTabIndex] = useState<number>(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) =>{
    setTabIndex(newValue);
  }

  //静的ページのAuthベース || Modal単体利用
  const isModalOpen = open || showAuthModal;
  const onCloseHandler = handleClose ?? closeAuthModal;

  //グーグルアイコン
  const GoogleSVGIcon = (): ReactElement => (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ width: "20px", height: "20px" }}
    >
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
      <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
  );

  return(
    <Modal
      open={isModalOpen}
      onClose={onCloseHandler}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "background.default",
            maxWidth: 400,
            borderRadius: 2,
            boxShadow: 24,
            width: "80%",
            p: 1,
            mx: "auto",
            my: "5%",
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              backgroundColor: "background.default",
              width: "75%",
              "& .MuiTabs-indicator": {
              bottom: "6px",
            },
              "& .MuiTab-root": {
              minHeight: "50px",},
            }}
          >
            <Tab icon={<LockIcon/>} iconPosition="start" label="ログイン" sx={{ fontSize: "12px" }}/>
            <Tab icon={<PersonAddIcon/>} iconPosition="start" label="新規登録" sx={{ fontSize: "12px" }}/>
          </Tabs>
            {tabIndex === 0 && <SignInForm redirectTo={redirectTo } GoogleSVGIcon={<GoogleSVGIcon />} />}
            {tabIndex === 1 && <SignUpForm redirectTo={redirectTo } GoogleSVGIcon={<GoogleSVGIcon />} />}
        </Box>
    </Modal>
  );
}