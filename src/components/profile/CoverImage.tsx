// app/components/CoverImage.tsx
const CoverImage = () => {
  return (
    <div className="relative h-[200px] bg-gradient-to-r from-blue-500 to-purple-500 overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNmMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNnptMCAxYTUgNSAwIDEgMCAwIDEwIDUgNSAwIDAgMCAwLTEweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvZz48L3N2Zz4=')] bg-[length:60px_60px] opacity-20 z-0"
      ></div>
    </div>
  );
};

export default CoverImage;