import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { COMPONENT_TEMPLATES, ComponentTemplate } from "@/types/atomicComponent"
import { PlusCircle, Save, X, Settings, Trash, EyeIcon, DownloadIcon, UploadIcon } from "lucide-react"

// 假设我们有一个本地存储的自定义模板
const LOCAL_TEMPLATES_KEY = "svg-editor-custom-templates"

export function TemplateManager() {
    const [isOpen, setIsOpen] = useState(false)
    const [showManager, setShowManager] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [template, setTemplate] = useState<Partial<ComponentTemplate>>({
        label: "",
        icon: "🔹",
        description: "",
        category: "自定义",
        code: "",
        defaultSize: {
            width: 100,
            height: 100
        },
        tags: []
    })
    const [customTemplates, setCustomTemplates] = useState<Record<string, ComponentTemplate>>({})

    // 加载自定义模板
    const loadCustomTemplates = () => {
        try {
            const saved = localStorage.getItem(LOCAL_TEMPLATES_KEY)
            if (saved) {
                return JSON.parse(saved)
            }
        } catch (error) {
            console.error("Failed to load custom templates:", error)
        }
        return {}
    }

    // 加载自定义模板（扩展）
    useEffect(() => {
        const templates = loadCustomTemplates()
        setCustomTemplates(templates)
    }, [isOpen, showManager])

    // 保存自定义模板
    const saveCustomTemplate = () => {
        if (!template.label || !template.code) {
            alert("模板名称和代码不能为空")
            return
        }

        try {
            const customTemplates = loadCustomTemplates()
            const templateId = `custom-${Date.now()}`

            customTemplates[templateId] = template
            localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(customTemplates))

            // 更新全局模板
            Object.assign(COMPONENT_TEMPLATES, customTemplates)

            setIsOpen(false)
            setTemplate({
                label: "",
                icon: "🔹",
                description: "",
                category: "自定义",
                code: "",
                defaultSize: {
                    width: 100,
                    height: 100
                },
                tags: []
            })
        } catch (error) {
            console.error("Failed to save custom template:", error)
            alert("保存模板失败")
        }
    }

    // 处理字段变更
    const handleChange = (field: string, value: any) => {
        setTemplate(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // 删除模板
    const deleteTemplate = (id: string) => {
        try {
            const templates = loadCustomTemplates()
            if (templates[id]) {
                delete templates[id]
                localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(templates))

                // 重新加载模板
                setCustomTemplates(templates)

                // 更新全局模板 (如果当前活跃的话)
                if (COMPONENT_TEMPLATES[id]) {
                    delete COMPONENT_TEMPLATES[id]
                }
            }
        } catch (error) {
            console.error("Failed to delete template:", error)
            alert("删除模板失败")
        }
    }

    // 渲染代码预览HTML
    const previewCode = useMemo(() => {
        if (!template.code) return ""

        let code = template.code

        // 替换变量
        code = code.replace(/width/g, String(template.defaultSize?.width || 100))
        code = code.replace(/height/g, String(template.defaultSize?.height || 100))
        code = code.replace(/{children}/g, "")

        return code
    }, [template.code, template.defaultSize])

    // 导出模板
    const exportTemplates = () => {
        try {
            const templates = loadCustomTemplates()
            const dataStr = JSON.stringify(templates, null, 2)
            const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

            const exportFileName = `svg-editor-templates-${new Date().toISOString().slice(0, 10)}.json`

            const linkElement = document.createElement('a')
            linkElement.setAttribute('href', dataUri)
            linkElement.setAttribute('download', exportFileName)
            linkElement.click()
        } catch (error) {
            console.error("Failed to export templates:", error)
            alert("导出模板失败")
        }
    }

    // 导入模板
    const importTemplates = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const templates = JSON.parse(e.target?.result as string)
                    localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(templates))

                    // 更新全局模板
                    Object.assign(COMPONENT_TEMPLATES, templates)

                    setCustomTemplates(templates)
                    alert("成功导入模板")
                } catch (error) {
                    console.error("Invalid template file:", error)
                    alert("导入失败：无效的模板文件")
                }
            }
            reader.readAsText(file)
        } catch (error) {
            console.error("Failed to import templates:", error)
            alert("导入模板失败")
        }
    }

    return (
        <>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsOpen(true)}
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    创建模板
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowManager(true)}
                >
                    <Settings className="h-4 w-4 mr-2" />
                    管理模板
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>创建自定义组件模板</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="label">组件名称</Label>
                                <Input
                                    id="label"
                                    value={template.label}
                                    onChange={e => handleChange("label", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="icon">图标</Label>
                                <Input
                                    id="icon"
                                    value={template.icon as string}
                                    onChange={e => handleChange("icon", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">描述</Label>
                            <Input
                                id="description"
                                value={template.description}
                                onChange={e => handleChange("description", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">分类</Label>
                            <Input
                                id="category"
                                value={template.category}
                                onChange={e => handleChange("category", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="code">组件代码</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    <EyeIcon className="h-4 w-4 mr-1" />
                                    {showPreview ? "隐藏预览" : "查看预览"}
                                </Button>
                            </div>
                            <Textarea
                                id="code"
                                rows={5}
                                value={template.code}
                                onChange={e => handleChange("code", e.target.value)}
                                placeholder="<div>{children}</div>"
                            />
                            <p className="text-xs text-muted-foreground">
                                使用width, height表示尺寸，{"{children}"}表示子组件位置
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="width">默认宽度</Label>
                                <Input
                                    id="width"
                                    type="text"
                                    value={template.defaultSize?.width}
                                    onChange={e => handleChange("defaultSize", {
                                        ...template.defaultSize,
                                        width: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">默认高度</Label>
                                <Input
                                    id="height"
                                    type="text"
                                    value={template.defaultSize?.height}
                                    onChange={e => handleChange("defaultSize", {
                                        ...template.defaultSize,
                                        height: isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value)
                                    })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">标签（用逗号分隔）</Label>
                            <Input
                                id="tags"
                                value={(template.tags || []).join(", ")}
                                onChange={e => handleChange("tags", e.target.value.split(",").map(t => t.trim()))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4 mr-2" />
                            取消
                        </Button>
                        <Button onClick={saveCustomTemplate}>
                            <Save className="h-4 w-4 mr-2" />
                            保存模板
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 模板管理对话框 */}
            <Dialog open={showManager} onOpenChange={setShowManager}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>管理自定义模板</DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        {Object.keys(customTemplates).length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                还没有自定义模板
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(customTemplates).map(([id, template]) => (
                                    <div
                                        key={id}
                                        className="flex items-center justify-between p-2 border rounded-md"
                                    >
                                        <div className="flex items-center">
                                            <span className="mr-2">{template.icon}</span>
                                            <div>
                                                <p className="text-sm font-medium">{template.label}</p>
                                                <p className="text-xs text-muted-foreground">{template.category}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteTemplate(id)}
                                        >
                                            <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={exportTemplates}>
                                <DownloadIcon className="h-4 w-4 mr-2" />
                                导出
                            </Button>

                            <label className="cursor-pointer">
                                <Button variant="outline" onClick={() => document.getElementById('import-templates')?.click()}>
                                    <UploadIcon className="h-4 w-4 mr-2" />
                                    导入
                                </Button>
                                <input
                                    id="import-templates"
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={importTemplates}
                                />
                            </label>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 代码预览区域 */}
            {showPreview && (
                <div className="mt-2 p-4 border rounded-md bg-slate-50">
                    <div className="mb-2 text-xs text-muted-foreground">预览:</div>
                    <div
                        className="p-2 border bg-white rounded"
                        style={{
                            width: Number(template.defaultSize?.width) || 100,
                            height: Number(template.defaultSize?.height) || 100
                        }}
                        dangerouslySetInnerHTML={{ __html: previewCode }}
                    />
                </div>
            )}
        </>
    )
} 