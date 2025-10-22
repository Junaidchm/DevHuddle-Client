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
