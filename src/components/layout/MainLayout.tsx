import Header from "./Header.jsx";
import OfflineBanner from "../ui/OfflineBanner";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <OfflineBanner />
      {children}
    </div>
  );
}
