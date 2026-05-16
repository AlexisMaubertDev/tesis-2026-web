import Snackbar from "../ui/Snackbar";

type Props = {
  children: React.ReactNode;
};

export default function PageLayout({ children }: Props) {
  return (
    <div
      className="relative font-sans flex flex-col min-h-screen
    justify-start items-center bg-san-marino-100 text-zinc-900 overflow-hidden"
    >
      {children}
      <Snackbar />
    </div>
  );
}
