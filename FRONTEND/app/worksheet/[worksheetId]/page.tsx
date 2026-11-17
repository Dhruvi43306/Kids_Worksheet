import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WorksheetClient from "../WorksheetClient";

export const metadata = {
  title: "Worksheet Preview — LearnSpark",
  description: "Preview, personalise and print your generated worksheet.",
};

interface PageProps {
  params: Promise<{ worksheetId: string }>;
}

export default async function GeneratedWorksheetPage({ params }: PageProps) {
  const { worksheetId } = await params;
  const id = Number(worksheetId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <WorksheetClient worksheetId={id} />
      <Footer />
    </>
  );
}
