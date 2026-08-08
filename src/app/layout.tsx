import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/Provider";
import StoreProvider from "@/redux/StoreProvider";
import InitUser from "@/InitUser";
import OrderChatBot from "@/components/OrderChatBot";


export const metadata: Metadata = {
  title: "snapcart | 10 minutes grocery delivery App",
  description: "10 minutes grocery delivery App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
     
    >
      <body className="w-full min-h-screenbg-linear-to-b from-green-50 to-white">
        <Provider>
        <StoreProvider>
   <InitUser/>
        {children}
        <OrderChatBot/>
        </StoreProvider>
        </Provider>
        
        </body>
    </html>
  );
}
