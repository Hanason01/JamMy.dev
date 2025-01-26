import { Header } from "@components/Header";
import { FeedbackAlert } from "@components/FeedbackAlert";
import { BottomNavi } from "@components/BottomNavi";

export default function MyPage(){
  return(
    <div>
      <Header />
      <FeedbackAlert />
      <h1>利用きやく</h1>
      <h3>仮ページ...</h3>
      <BottomNavi />
    </div>
  );
}