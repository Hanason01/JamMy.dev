"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCurrentRouteState} from "@context/useCurrentRouteContext";
import { useNotificationContext } from "@context/useNotificationContext";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import Badge from "@mui/material/Badge";

export function BottomNavi() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRoute, previousRoute, setCurrentRoute, lastDetailRoute, setLastDetailRoute } = useCurrentRouteState();
  const { hasUnread } = useNotificationContext();

  // パスが変更（現在位置が変更）されたらcontextでその情報を保持。かつ
  useEffect(() => {
    setCurrentRoute(pathname); // Contextに反映
  }, [pathname, setCurrentRoute]);

  const value = (() => {
    switch (currentRoute) {
      case "/projects":
        return 0;
      case "/post_project":
        return 1;
      case "/notification":
        return 2;
      case "/mypage":
        return 3;
      default:
        return 0;
    }
  })();

  const handleNavigationChange = (event: React.SyntheticEvent,
    newValue: number): void => {
    // 選択された値に基づきルートを設定
    let route = "/projects";
    switch (newValue) {
      case 0:
        route = "/projects";
        break;
      case 1:
        route = "/post_project";
        break;
      case 2:
        route = "/notification";
        break;
      case 3:
        route = "/mypage";
        break;
      default:
        route = "/projects";
    }
    if (route === "/projects") {
      // 一覧ページにすでにいる場合 → 最新データ取得（2回目のボタン押下は再フェッチ依頼とみなす）
      if (currentRoute === "/projects") {
        // window.scrollTo({ top: 0, behavior: "smooth" }); // スクロール初期化
        // await mutate(undefined, { revalidate: true }); // 再フェッチ
        // setSize(1); // 1ページ目にリセット
      // // 詳細→一覧以外のナビ→一覧なら詳細へ戻る（詳細→一覧は次段のelse処理となる）
      // } else if (lastDetailRoute && previousRoute !== "/projects"){
      //   router.push(lastDetailRoute);
      } else {
        // 他のページから一覧に戻る（通常の一覧への遷移）
        if (lastDetailRoute){ setLastDetailRoute(null); } //詳細→一覧の場合は、履歴を削除
        setCurrentRoute(route);
        router.push(route);
      }
    } else {
      // 通常の遷移（一覧関係なし）
      setCurrentRoute(route); // Contextの状態を更新
      router.push(route); // ページ遷移
    }
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleNavigationChange}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "primary.main",
      }}
    >
      <BottomNavigationAction icon={<HomeIcon />}
        sx={{
          color: "primary.contrastText",
          "&.Mui-selected": {
            color: "secondary.main",
          },
        }} />
      <BottomNavigationAction icon={<AddIcon />}
        sx={{
          color: "primary.contrastText",
          "&.Mui-selected": {
            color: "secondary.main",
          },
        }}/>
      <BottomNavigationAction
        icon={
          <Badge color="error" variant="dot" invisible={!hasUnread}>
            <NotificationsIcon />
          </Badge>
        }
        sx={{
          color: "primary.contrastText",
          "&.Mui-selected": {
            color: "secondary.main",
          },
        }}
      />
      <BottomNavigationAction icon={<PersonIcon />}
        sx={{
          color: "primary.contrastText",
          "&.Mui-selected": {
            color: "secondary.main",
          },
        }}/>
    </BottomNavigation>
  );
}
