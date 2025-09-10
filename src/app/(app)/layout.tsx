import { Providers } from "@/src/store/providers";
import "../styles/community-feed.css";
import NavBar from "@/src/components/layouts/NavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Providers>
        <NavBar />
      </Providers>
      <div>{children}</div>
    </>
  );
}
