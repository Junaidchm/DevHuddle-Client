import NavBar from "@/src/components/layouts/NavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <div className="min-h-screen bg-[#F3F2EF] font-sans">
      <NavBar />
      <div className="py-6">{children}</div>
    </div>
  );
}
