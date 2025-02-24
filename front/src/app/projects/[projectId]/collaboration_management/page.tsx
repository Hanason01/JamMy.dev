import { Header } from "@components/Header"
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi"
import { CollaborationManagementStepper } from "@CollaborationManagement/CollaborationManagementStepper";
import { CollaborationManagementProvider } from "@context/useCollaborationManagementContext";
import { Suspense } from"react";

export async function generateMetadata() {
  return {
    title: "JamMy - 応募管理ページ",
    description: "JamMyの応募管理ページでは、応募された音声の編集や合成を行う事ができます。",
  };
}

export default function CollaborationManagement(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      < Header />
      <FeedbackAlert />
        <CollaborationManagementProvider>
          <CollaborationManagementStepper />
        </CollaborationManagementProvider>
      < BottomNavi />
    </Suspense>
  );
}