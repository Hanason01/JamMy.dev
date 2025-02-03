"use client";

import { useState } from "react";
import { Box, Modal, Tabs, Tab } from "@mui/material";
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
            width: "90%",
            p: 3,
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
              width: "80%",
              "& .MuiTabs-indicator": {
              bottom: "6px",
            },
              "& .MuiTab-root": {
              minHeight: "60px",},
            }}
          >
            <Tab icon={<LockIcon/>} iconPosition="start" label="ログイン" />
            <Tab icon={<PersonAddIcon/>} iconPosition="start" label="新規登録" />
          </Tabs>
            {tabIndex === 0 && <SignInForm redirectTo={redirectTo } />}
            {tabIndex === 1 && <SignUpForm redirectTo={redirectTo } />}
        </Box>
    </Modal>
  );
}