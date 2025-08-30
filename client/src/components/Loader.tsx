export const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
      <p className="text-gray-600 font-medium animate-pulse">Loading Typation…</p>
    </div>
  </div>
)
