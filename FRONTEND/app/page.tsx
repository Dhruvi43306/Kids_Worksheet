import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomeClient from "./HomeClient";

export default function HomePage() {
  return (
    <div className="ls-home-root">
      <Navbar />
      <HomeClient />
      <Footer />
    </div>
  );
}

