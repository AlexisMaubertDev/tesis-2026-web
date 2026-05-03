import { type JSX } from "react";
import Snackbar from "../ui/Snackbar";

export default function PageLayout({ children }: { children: JSX.Element }) {
  return (
    <main
      className="relative font-sans flex flex-col min-h-screen
    justify-center items-center bg-san-marino-300 text-zinc-900 overflow-hidden"
    >
      {children}
      <Snackbar />
    </main>
  );
}
