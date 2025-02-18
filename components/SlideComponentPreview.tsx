export default function SlideComponentPreview() {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-400">图片 1</span>
        </div>
        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-xs text-gray-400">图片 2</span>
        </div>
        <div className="flex-shrink-0 w-8 h-16 bg-gradient-to-r from-transparent to-gray-50 absolute right-4" />
      </div>
      <div className="mt-2 text-xs text-gray-500 text-center">左右滑动切换图片</div>
    </div>
  )
}

