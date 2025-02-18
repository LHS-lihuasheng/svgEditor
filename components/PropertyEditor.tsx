import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Component, SVGComponent, SectionComponent } from '@/types/svg-editor'

interface PropertyEditorProps {
  selectedComponent?: Component | null
  onUpdate: (component: Component) => void
}

export function PropertyEditor({ selectedComponent, onUpdate }: PropertyEditorProps) {
  if (!selectedComponent) {
    return <div className="text-muted-foreground">请选择一个组件</div>
  }

  const handleChange = (field: keyof Component, value: any) => {
    onUpdate({
      ...selectedComponent,
      [field]: value
    })
  }

  const handleSVGChange = (field: keyof SVGComponent, value: any) => {
    onUpdate({
      ...selectedComponent,
      [field]: value
    } as Component)
  }

  const handleSectionChange = (field: keyof SectionComponent, value: any) => {
    onUpdate({
      ...selectedComponent,
      [field]: value
    } as Component)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>位置 X</Label>
        <Input 
          type="number"
          value={selectedComponent.position.x}
          onChange={e => handleChange('position', {
            ...selectedComponent.position,
            x: Number(e.target.value)
          })}
        />
      </div>

      <div className="space-y-2">
        <Label>位置 Y</Label>
        <Input 
          type="number"
          value={selectedComponent.position.y}
          onChange={e => handleChange('position', {
            ...selectedComponent.position,
            y: Number(e.target.value)
          })}
        />
      </div>

      <div className="space-y-2">
        <Label>宽度</Label>
        <Input 
          type="text"
          value={selectedComponent.size.width}
          onChange={e => handleChange('size', {
            ...selectedComponent.size,
            width: e.target.value
          })}
        />
      </div>

      <div className="space-y-2">
        <Label>高度</Label>
        <Input 
          type="text"
          value={selectedComponent.size.height}
          onChange={e => handleChange('size', {
            ...selectedComponent.size,
            height: e.target.value
          })}
        />
      </div>

      {selectedComponent.type === 'svg' && (
        <div className="space-y-2">
          <Label>ViewBox</Label>
          <Input 
            type="text"
            value={(selectedComponent as SVGComponent).viewBox}
            onChange={e => handleSVGChange('viewBox', e.target.value)}
          />
        </div>
      )}

      {selectedComponent.type === 'section' && (
        <div className="space-y-2">
          <Label>旋转角度</Label>
          <Input 
            type="number"
            value={(selectedComponent as SectionComponent).rotate || 0}
            onChange={e => handleSectionChange('rotate', Number(e.target.value))}
          />
        </div>
      )}
    </div>
  )
} 