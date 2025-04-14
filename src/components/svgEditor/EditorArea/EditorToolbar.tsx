/**
 * @description 编辑器顶部工具栏组件
 * 管理编辑器顶部的操作按钮
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LucideRefreshCw, LucideCode, LucideCloudUpload, LucideSave, LucideHistory, LucideTrash2, LucideBookTemplate } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { usePanel } from '@/contexts/PanelContext';
import { useEditor } from '@/contexts/EditorContext';
import { useCode } from '@/contexts/CodeContext';
import { useAssets } from '@/contexts/AssetContext';
import { saveUrlMapping, getUrlByHash, initDB, listArchives, deleteArchive, saveCustomTemplate, archiveStorage, ArchiveItem } from '@/utils/indexedDBUtils';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPONENT_CATEGORIES, categoryDisplayNames } from "@/types/component";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useArchiveManager } from './ArchiveManager';

// 预设的图标列表（使用Emoji，按类别组织）
const PRESET_ICONS: Record<string, string[]> = {
    "常用": ["📄", "📊", "📈", "📱", "💻", "🔍", "🔔", "⚙️", "🏠", "⭐"],
    "文件": ["📁", "📂", "📝", "📌", "📎", "🔖", "📑", "📃", "📋", "📇"],
    "媒体": ["🎨", "🎯", "🎬", "🎵", "📷", "🎞️", "🎮", "🎲", "🎭", "🎤"],
    "工具": ["🔧", "📦", "🔢", "🔠", "🛠️", "⚒️", "🧰", "🧪", "🧲", "🪛"],
    "通讯": ["📞", "📧", "📥", "📤", "📫", "📨", "📩", "📮", "📟", "🔊"],
    "科技": ["⏱️", "⚡", "💡", "🔋", "🔌", "🖥️", "🖱️", "🖨️", "💽", "💾"],
    "网络": ["🌐", "💬", "🗣️", "👥", "🔗", "📡", "📶", "📱", "💻", "⌨️"],
    "状态": ["❤️", "✅", "❌", "⚠️", "🔴", "🟠", "🟢", "🔵", "⚪", "⚫"]
};

export function EditorToolbar() {
    const { toggleShowCodePreview } = usePanel();
    const { resetComponents, components, selectedComponentId } = useEditor();
    const { code, extractImagePaths } = useCode();
    const { findImageByPath, imageAssets, rootDirectory } = useAssets();
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [archives, setArchives] = useState<ArchiveItem[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateFormData, setTemplateFormData] = useState({
        templateName: '',
        category: 'packedTemplate',
        description: '',
        icon: '📄'
    });
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [currentIconCategory, setCurrentIconCategory] = useState<string>("常用");

    // 使用存档管理器
    const {
        manageArchive,
        restoreArchive,
        currentArchiveId,
        isArchiving,
        isRestoring,
        isDirectoryChanging
    } = useArchiveManager();

    // 初始化数据库连接
    useEffect(() => {
        initDB().catch(err => console.error("Failed to init DB on mount:", err));
    }, []);

    // 加载存档列表
    const loadArchiveList = useCallback(async () => {
        if (!isDrawerOpen) return;

        try {
            const archiveList = await listArchives();
            setArchives(archiveList);
            console.log("存档已加载:", archiveList);
        } catch (error) {
            toast({
                title: "加载存档列表失败",
                description: "加载存档列表失败",
                variant: "destructive",
            });
            setArchives([]);
        }
    }, [isDrawerOpen]);

    // 当抽屉打开时加载存档列表
    useEffect(() => {
        if (isDrawerOpen) {
            loadArchiveList();
        }
    }, [isDrawerOpen, loadArchiveList]);

    // 上传单个图片的处理函数
    const uploadImage = useCallback(async (file: File, hash: string): Promise<{ success: boolean; path: string, hash: string, url?: string; error?: string }> => {
        const formData = new FormData();
        formData.append("media", file);

        try {
            const response = await fetch('/api/media/uploadimg', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || result.errcode) {
                console.error(`Upload failed for ${file.name}:`, result.error || result.errmsg || response.statusText);
                return { success: false, path: file.name, hash: hash, error: result.error || result.errmsg || `HTTP error! status: ${response.status}` };
            }

            console.log(`Uploaded ${file.name}, URL: ${result.url}`);
            return { success: true, path: file.name, hash: hash, url: result.url };
        } catch (error: any) {
            console.error(`Error uploading ${file.name}:`, error);
            return { success: false, path: file.name, hash: hash, error: error.message || 'Unknown upload error' };
        }
    }, []);

    // 上传图片处理函数
    const handleUpload = useCallback(async () => {
        setIsUploading(true);

        const imagePaths = extractImagePaths(code);

        if (imagePaths.length === 0) {
            toast({
                title: "提示",
                description: "代码中没有找到需要上传的图片。",
            });
            setIsUploading(false);
            return;
        }

        console.log('当前 AssetContext 中的 Keys (推荐方式):', Array.from(imageAssets.keys()));

        const filesToUpload: { file: File, hash: string, decodedPath: string }[] = [];
        const uploadedUrls: { [key: string]: string } = {};

        await Promise.all(imagePaths.map(async (path) => {
            const asset = findImageByPath(path);
            console.log(`检查路径: "${path}", Asset:`, asset, "Hash:", asset?.hash, "Asset.file 存在:", !!asset?.file);

            if (asset?.hash && asset.relativePath) {
                const decodedPath = asset.relativePath;
                try {
                    const cachedUrl = await getUrlByHash(asset.hash);
                    if (cachedUrl) {
                        console.log(`缓存命中: ${decodedPath} (${asset.hash}) -> ${cachedUrl}`);
                        uploadedUrls[decodedPath] = cachedUrl;
                        toast({
                            title: "使用缓存",
                            description: `图片 ${decodedPath.split('/').pop()} 使用缓存`,
                        });
                        return;
                    }
                    console.log(`缓存未命中: ${decodedPath} (${asset.hash})`);
                } catch (error) {
                    console.error(`查找 IndexedDB 缓存时出错 (${decodedPath}, ${asset.hash}):`, error);
                }

                if (asset.file) {
                    filesToUpload.push({ file: asset.file, hash: asset.hash, decodedPath: decodedPath });
                } else {
                    console.warn(`未找到资源 "${decodedPath}" 的文件对象。`);
                    toast({
                        title: "警告",
                        description: `缺少文件对象: ${decodedPath}`,
                        variant: "destructive",
                    });
                }
            } else {
                let reason = !asset ? '未找到资源' : !asset.hash ? '缺少 hash' : '缺少 relativePath';
                console.warn(`资源 "${path}" 信息不完整 (${reason})。`);
                toast({
                    title: "警告",
                    description: `资源信息不完整: ${path}`,
                    variant: "destructive",
                });
            }
        }));

        if (filesToUpload.length === 0 && Object.keys(uploadedUrls).length > 0) {
            toast({
                title: "成功",
                description: "所有图片均已从缓存加载。",
            });
            setIsUploading(false);
            console.log("最终 URL 映射 (仅缓存):", uploadedUrls);
            return;
        } else if (filesToUpload.length === 0) {
            toast({
                title: "提示",
                description: "没有有效的图片文件需要处理。",
            });
            setIsUploading(false);
            return;
        }

        console.log("准备上传的文件 (排除缓存后):", filesToUpload.map(f => f.file.name));
        toast({
            title: "上传提示",
            description: `检测到 ${filesToUpload.length} 张新图片需要上传...`,
        });

        const uploadPromises = filesToUpload.map(item => uploadImage(item.file, item.hash));
        const results = await Promise.all(uploadPromises);

        let successCount = 0;
        let failCount = 0;

        results.forEach(result => {
            if (result.success && result.url && result.hash) {
                successCount++;
                const uploadedItem = filesToUpload.find(item => item.hash === result.hash);
                if (uploadedItem) {
                    const decodedPath = uploadedItem.decodedPath;
                    uploadedUrls[decodedPath] = result.url;
                    toast({
                        title: "上传成功",
                        description: `图片 ${result.path} 上传成功!`,
                    });
                    saveUrlMapping(result.hash, result.url, decodedPath).catch(err => {
                        console.error(`Failed to save mapping to IndexedDB for hash ${result.hash}:`, err);
                    });
                } else {
                    console.warn(`无法找到哈希 ${result.hash} 对应的上传信息。`);
                }
            } else {
                failCount++;
                toast({
                    title: "上传失败",
                    description: `图片 ${result.path} 上传失败: ${result.error}`,
                    variant: "destructive",
                });
            }
        });

        console.log("上传结果:", results);
        console.log("最终 URL 映射 (包含缓存和新上传):", uploadedUrls);

        const totalFound = Object.keys(uploadedUrls).length;
        if (failCount > 0) {
            toast({
                title: "上传部分成功",
                description: `${totalFound - failCount} 张图片处理完成 (缓存或上传成功), ${failCount} 张上传失败。`,
                variant: "destructive",
            });
        } else {
            toast({
                title: "上传完成",
                description: `所有 ${totalFound} 张图片处理完成 (缓存或上传成功)!`,
            });
        }

        setIsUploading(false);
    }, [code, findImageByPath, imageAssets, extractImagePaths, uploadImage, toast]);

    // 手动保存存档
    const handleSaveArchive = async () => {
        if (!rootDirectory) {
            toast({
                title: "警告",
                description: "请先选择一个根目录",
                variant: "destructive",
            });
            return;
        }

        // 如果正在切换目录，不允许保存
        if (isDirectoryChanging) {
            toast({
                title: "警告",
                description: "目录正在切换中，请稍后再试",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "保存中",
            description: `正在保存存档 "${rootDirectory.name}"...`,
        });
        try {
            const archiveId = await manageArchive();
            if (archiveId) {
                toast({
                    title: "保存成功",
                    description: `存档 "${rootDirectory.name}" 保存成功!`,
                });

                // 如果抽屉打开，则刷新存档列表
                if (isDrawerOpen) {
                    loadArchiveList();
                }
            } else {
                toast({
                    title: "保存失败",
                    description: "存档失败,编辑区没有需要保存的组件上下文",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("保存存档失败:", error);
            toast({
                title: "保存失败",
                description: `保存存档失败: ${error?.message || error}`,
                variant: "destructive",
            });
        }
    };

    // 处理存档恢复
    const handleRestoreArchive = async (archiveId: number) => {
        const success = await restoreArchive(archiveId);
        if (success) {
            setIsDrawerOpen(false);
        }
    };

    // 删除存档
    const handleDeleteArchive = async (archiveId: number, archiveName: string) => {
        if (isRestoring || isArchiving) return;

        if (window.confirm(`确定要删除存档 "${archiveName}" 吗？此操作不可撤销。`)) {
            try {
                await deleteArchive(archiveId);
                toast({
                    title: "删除成功",
                    description: `存档 "${archiveName}" 已删除`,
                });

                // 如果删除的是当前存档，清除当前存档ID
                if (archiveId === currentArchiveId) {
                    archiveStorage.saveCurrentId(null);
                }

                // 更新存档列表
                setArchives(prev => prev.filter(a => a.id !== archiveId));
            } catch (error: any) {
                console.error("Failed to delete archive:", error);
                toast({
                    title: "删除失败",
                    description: `删除存档失败: ${error?.message || error}`,
                    variant: "destructive",
                });
            }
        }
    };

    // 处理模板表单字段变化
    const handleTemplateFormChange = (field: string, value: string) => {
        setTemplateFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 保存组件为模板
    const handleSaveTemplate = async () => {
        if (!templateFormData.templateName.trim()) {
            toast({
                title: "错误",
                description: "请输入模板名称",
                variant: "destructive",
            });
            return;
        }

        if (!components.length || !selectedComponentId) {
            toast({
                title: "错误",
                description: "请先选择要保存的组件",
                variant: "destructive",
            });
            return;
        }

        setIsSavingTemplate(true);

        try {
            // 只保存选中的组件
            const selectedComponent = components.find(comp => comp.id === selectedComponentId);
            if (!selectedComponent) {
                toast({
                    title: "错误",
                    description: "未找到选中的组件",
                    variant: "destructive",
                });
                setIsSavingTemplate(false);
                return;
            }

            // 创建模板数据
            const templateData = {
                ...templateFormData,
                component: [JSON.parse(JSON.stringify(selectedComponent))], // 深拷贝选中的组件
                timestamp: Date.now()
            };

            const templateId = await saveCustomTemplate(templateData);
            toast({
                title: "保存成功",
                description: `模板 "${templateFormData.templateName}" 保存成功`,
            });

            // 重置表单
            setTemplateFormData({
                templateName: '',
                category: 'packedTemplate',
                description: '',
                icon: '📄'
            });

            // 关闭对话框
            setIsTemplateDialogOpen(false);
        } catch (error) {
            console.error("保存模板失败:", error);
            toast({
                title: "保存失败",
                description: "保存模板失败",
                variant: "destructive",
            });
        } finally {
            setIsSavingTemplate(false);
        }
    };

    return (
        <div className="h-12 bg-white shadow-sm border-b px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-nowrap overflow-auto">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => resetComponents()}
                            >
                                <LucideRefreshCw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>清空编辑区</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleUpload}
                                disabled={isUploading || !rootDirectory}
                            >
                                <LucideCloudUpload className="h-4 w-4" />
                                {isUploading && <span className="ml-1 text-xs">上传中...</span>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{!rootDirectory ? "请先选择目录" : "上传图片"}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveArchive}
                                disabled={isArchiving || isRestoring || isDirectoryChanging || !rootDirectory}
                            >
                                <LucideSave className="h-4 w-4" />
                                {isArchiving && <span className="ml-1 text-xs">保存中...</span>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{!rootDirectory ? "请先选择目录" : "存档"}</p>
                        </TooltipContent>
                    </Tooltip>

                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DrawerTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={isArchiving || isRestoring || isDirectoryChanging}
                                    >
                                        <LucideHistory className="h-4 w-4" />
                                    </Button>
                                </DrawerTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>切换存档</p>
                            </TooltipContent>
                        </Tooltip>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>存档列表</DrawerTitle>
                                <DrawerDescription>当前 <span className="font-semibold">({rootDirectory?.name ?? '当前未选目录'})</span></DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 max-h-[60vh] overflow-y-auto">
                                {isRestoring && <p className="text-center text-muted-foreground">正在加载/操作...</p>}
                                {!isRestoring && archives.length === 0 && <p className="text-center text-muted-foreground">没有找到存档记录。</p>}
                                {!isRestoring && archives.length > 0 && (
                                    <ul className="space-y-2">
                                        {archives.map((archive) => (
                                            <li key={archive.id} className="flex justify-between items-center p-2 border rounded hover:bg-muted/50">
                                                <div className="flex-1 overflow-hidden mr-2">
                                                    <p className="font-medium truncate" title={archive.name}>{archive.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(archive.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                                                    </p>
                                                    {archive.directoryName && archive.directoryName !== archive.name && (
                                                        <p className="text-xs text-muted-foreground">目录: {archive.directoryName}</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground opacity-50">
                                                        ID: {archive.id}
                                                        {currentArchiveId === archive.id && " (当前)"}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2 flex-shrink-0">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestoreArchive(archive.id)}
                                                        disabled={isRestoring}
                                                        title={`恢复 "${archive.name}"`}
                                                    >
                                                        恢复
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDeleteArchive(archive.id, archive.name)}
                                                        disabled={isRestoring}
                                                        title={`删除 "${archive.name}"`}
                                                    >
                                                        <LucideTrash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <DrawerFooter>
                                <DrawerClose asChild>
                                    <Button variant="outline" disabled={isRestoring}>取消</Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>

                    {/* 保存模板按钮 */}
                    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={!selectedComponentId}
                                    >
                                        <LucideBookTemplate className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{!selectedComponentId ? "请先选择一个组件" : "保存模板"}</p>
                            </TooltipContent>
                        </Tooltip>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader className="pb-1">
                                <DialogTitle>保存自定义模板</DialogTitle>
                                <DialogDescription className="text-xs">
                                    将选中的组件保存为模板
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 py-1">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="templateName" className="text-xs">模板名称 *</Label>
                                        <Input
                                            id="templateName"
                                            value={templateFormData.templateName}
                                            onChange={(e) => handleTemplateFormChange('templateName', e.target.value)}
                                            placeholder="输入模板名称"
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="category" className="text-xs">分类</Label>
                                        <Select
                                            value={templateFormData.category}
                                            onValueChange={(value) => handleTemplateFormChange('category', value)}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue placeholder="选择分类" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COMPONENT_CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {categoryDisplayNames[category]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="icon" className="text-xs">图标选择</Label>
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="h-8 w-8 flex items-center justify-center text-lg border rounded-md"
                                                title="当前选中的图标"
                                            >
                                                {templateFormData.icon}
                                            </div>
                                            <Input
                                                id="customIcon"
                                                value={templateFormData.icon}
                                                onChange={(e) => handleTemplateFormChange('icon', e.target.value)}
                                                placeholder="自定义"
                                                maxLength={2}
                                                className="h-8 w-20"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mb-1 overflow-x-auto py-1">
                                        {Object.keys(PRESET_ICONS).map((category) => (
                                            <Button
                                                key={category}
                                                variant={currentIconCategory === category ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentIconCategory(category)}
                                                className="h-6 whitespace-nowrap text-xs px-2"
                                            >
                                                {category}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-8 gap-1 p-1 border rounded-md h-20 overflow-y-auto">
                                        {PRESET_ICONS[currentIconCategory].map((icon: string, index: number) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleTemplateFormChange('icon', icon)}
                                                className={`h-7 w-7 flex items-center justify-center text-base rounded-md hover:bg-gray-100 transition-colors ${templateFormData.icon === icon
                                                    ? 'bg-primary text-primary-foreground hover:bg-primary ring-1 ring-primary'
                                                    : 'bg-white'
                                                    }`}
                                                title={`选择图标: ${icon}`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="description" className="text-xs">描述</Label>
                                    <Textarea
                                        id="description"
                                        value={templateFormData.description}
                                        onChange={(e) => handleTemplateFormChange('description', e.target.value)}
                                        placeholder="输入模板描述（可选）"
                                        rows={1}
                                        className="resize-none min-h-8"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pt-1">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsTemplateDialogOpen(false)}
                                    disabled={isSavingTemplate}
                                    size="sm"
                                    className="h-7"
                                >
                                    取消
                                </Button>
                                <Button
                                    onClick={handleSaveTemplate}
                                    disabled={isSavingTemplate || !templateFormData.templateName.trim()}
                                    size="sm"
                                    className="h-7"
                                >
                                    {isSavingTemplate ? '保存中...' : '保存模板'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="default"
                    size="sm"
                    onClick={toggleShowCodePreview}
                    title="预览并获取代码"
                >
                    <LucideCode className="h-4 w-4" />
                    查看代码
                </Button>
            </div>
        </div>
    );
} 