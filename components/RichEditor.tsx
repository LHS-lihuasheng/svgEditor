interface RichEditorProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  onImageUpload?: (file: File) => Promise<string | null>
  maxLength?: number
}

export function RichEditor({
  id,
  name,
  value,
  onChange,
  onImageUpload,
  maxLength
}: RichEditorProps) {
  // 实现富文本编辑器
  // 可以使用 TinyMCE、CKEditor 等
  // 需要支持图片上传和字数限制
} 