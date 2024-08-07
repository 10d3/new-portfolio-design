"use client";

import { PropsWithChildren, ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/shared/theme-provider";

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <>
      <TooltipProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TooltipProvider>
    </>
  );
};

export default Providers;
