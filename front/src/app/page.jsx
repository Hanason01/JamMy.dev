import { Header } from '../components/Header';
import { BackgroundImage } from '../components/TopPage/BackgroundImage';
import { Overview } from '../components/TopPage/Overview';
import { Help } from '../components/TopPage/Help';

export default function Home() {
  return (
    <div>
      <Header />
      <BackgroundImage />
      <Overview />
      <Help />
    </div>
  );
}
