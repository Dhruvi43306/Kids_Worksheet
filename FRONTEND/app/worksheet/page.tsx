import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WorksheetClient from "./WorksheetClient";

export const metadata = {
  title: "Worksheet Preview — LearnSpark",
  description: "Preview, personalise and print your generated worksheet.",
};

export default function WorksheetPage() {
  return (
    <>
      <Navbar />
      <WorksheetClient />
      <Footer />
    </>
  );
}
