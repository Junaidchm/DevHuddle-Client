import NavBar from "@/src/components/layouts/NavBar";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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
