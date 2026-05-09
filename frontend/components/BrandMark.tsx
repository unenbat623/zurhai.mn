export default function BrandMark() {
  return (
    <div className="flex shrink-0 items-center space-x-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500">
        <div className="h-4 w-4 rounded-full border-2 border-white opacity-80" />
      </div>
      <span className="text-lg font-serif font-bold italic tracking-tight text-white md:text-xl">
        ASTRA<span className="font-sans font-light not-italic text-indigo-400">AI</span>
      </span>
    </div>
  );
}
