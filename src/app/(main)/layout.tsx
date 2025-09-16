import { Providers } from "@/src/store/providers";
// import "../styles/community-feed.css";
// import "../../global.css"
import NavBar from "@/src/components/layouts/NavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <div>{children}</div>
    </>
  );
}
