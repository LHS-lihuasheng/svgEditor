"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ParametersTab() {
  return (
    <div className="p-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">组件参数设置</h3>
        <div className="space-y-2">
          {/* 尺寸设置区块 */}
          <ParameterSection title="尺寸设置">
            <ParameterItem label="宽度">
              <Input
                type="number"
                className="w-20 h-8"
                placeholder="自动"
                disabled
              />
            </ParameterItem>
            <ParameterItem label="高度">
              <Input
                type="number"
                className="w-20 h-8"
                placeholder="自动"
                disabled
              />
            </ParameterItem>
          </ParameterSection>

          {/* 定位设置区块 */}
          <ParameterSection title="定位设置">
            <ParameterItem label="定位方式">
              <Select disabled>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="选择定位" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">静态</SelectItem>
                  <SelectItem value="absolute">绝对定位</SelectItem>
                  <SelectItem value="fixed">固定定位</SelectItem>
                </SelectContent>
              </Select>
            </ParameterItem>

            {/* 坐标设置子区块 */}
            <div className="grid grid-cols-2 gap-2">
              <ParameterItem label="X" fullWidth>
                <Input
                  type="number"
                  className="h-8"
                  disabled
                />
              </ParameterItem>
              <ParameterItem label="Y" fullWidth>
                <Input
                  type="number"
                  className="h-8"
                  disabled
                />
              </ParameterItem>
            </div>
          </ParameterSection>
        </div>
      </div>
    </div>
  )
}

// 参数区块组件
function ParameterSection({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground">{title}</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}

// 单个参数项组件
function ParameterItem({
  label,
  children,
  fullWidth = false
}: {
  label: string
  children: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={`flex items-center justify-between ${fullWidth ? 'w-full' : ''}`}>
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  )
} 