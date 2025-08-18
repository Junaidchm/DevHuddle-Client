interface ErrorProps {
    error:string
}

export default function ErrorModal({error}:ErrorProps) {
  return (
    <div className="fixed bottom-3 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-70 flex items-center space-x-2">
      <span>{error}</span>
    </div>
  );
}
