import { Header } from "../../components/Header";
import { BottomNavi } from "../../components/BottomNavi";

export default function Notification(){
  return(
    <div>
      <Header />
      <h1>通知画面</h1>
      <h3>本リリースまでお待ちください...</h3>
      <BottomNavi />
    </div>
  );
}