import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-12 max-w-2xl mx-auto",
        inter.className
      )}
    >
      <Navbar />
      {children}
    </div>
  );
}
