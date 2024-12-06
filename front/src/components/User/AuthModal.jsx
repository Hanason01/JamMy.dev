"use client";

import { useState } from "react";
import { Box, Modal, Tabs, Tab } from "@mui/material";
import { useAuthContext } from "../../context/useAuthContext";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LockIcon from "@mui/icons-material/Lock";
import { SignUpForm } from "./SignUpForm";
import { SignInForm } from "./SignInForm";

export function AuthModal({open, handleClose, redirectTo}){
  const { showAuthModal, closeAuthModal } = useAuthContext();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) =>{
    setTabIndex(newValue);
  }

  //トップページベースかAuthContextベース
  const isModalOpen = open || showAuthModal;

  return(
    <Modal
      open={isModalOpen}
      onClose={() => {
        closeAuthModal();
        if (open) handleClose()}}>
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
            my: "20%",
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
            {tabIndex === 0 && <SignInForm redirectTo={redirectTo} />}
            {tabIndex === 1 && <SignUpForm redirectTo={redirectTo} />}
        </Box>
    </Modal>
  );
}