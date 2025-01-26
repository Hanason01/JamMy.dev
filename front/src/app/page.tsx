import { Header } from "@components/Header";
import { BackgroundImage } from "@TopPage/BackgroundImage";
import { Overview } from "@TopPage/Overview";
import { Help } from "@TopPage/Help";

export default function Home(){
  return (
    <div>
      <Header />
      <BackgroundImage />
      <Overview />
      <Help />
    </div>
  );
}
