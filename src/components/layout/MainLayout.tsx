import Header from "./Header.jsx";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      {children}
    </div>
  );
}
