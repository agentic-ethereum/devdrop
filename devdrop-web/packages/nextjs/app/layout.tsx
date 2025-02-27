import "@rainbow-me/rainbowkit/styles.css";
import { SessionProvider } from "next-auth/react";
import Provider from "~~/components/Provider";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({ title: "DevDrop", description: "Built with 🏗 Scaffold-ETH 2" });

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <SessionProvider>
            <ScaffoldEthAppWithProviders>
              <Provider>{children}</Provider>
            </ScaffoldEthAppWithProviders>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
