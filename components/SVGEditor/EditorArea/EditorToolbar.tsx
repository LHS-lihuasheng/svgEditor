/**
 * @description 编辑器顶部工具栏组件
 * 管理编辑器顶部的操作按钮
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
    LucideRefreshCw,
    LucideEye,
    LucideCode,
    LucideCloudUpload,
    LucideSave,
    LucideHistory,
    LucideTrash2,
    LucideBookTemplate,
} from "lucide-react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { usePanel } from '@/contexts/PanelContext';
import { useEditor } from '@/contexts/EditorContext';
import { useCode } from '@/contexts/CodeContext';
import { useAssets } from '@/contexts/AssetContext';
import { saveUrlMapping, getUrlByHash, initDB, saveArchive, listArchives, getArchive, deleteArchive, getLatestArchiveId, saveCustomTemplate } from '@/utils/indexedDBUtils';
import { toast } from "sonner";
import { format } from 'date-fns';
import { DIRECTORY_CHANGE_EVENT } from '@/components/svgEditor/SideBarMenu/menuTab/items/AssetsTab';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPONENT_CATEGORIES, categoryDisplayNames } from "@/types/component";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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

// 自动存档的时间间隔（5分钟）
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

interface ArchiveItem {
    id: number;
    name: string;
    timestamp: number;
    directoryName?: string;
}

// 存档ID在localStorage中的键名
const ARCHIVE_ID_KEY = 'svgEditor_currentArchiveId';

export function EditorToolbar() {
    const { toggleShowCodePreview } = usePanel();
    const { resetComponents, components, selectedComponentId, restoreState } = useEditor();
    const { code, extractImagePaths } = useCode();
    const { findImageByPath, imageAssets, rootDirectory, loadAssets } = useAssets();
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [archives, setArchives] = useState<ArchiveItem[]>([]);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateFormData, setTemplateFormData] = useState({
        templateName: '',
        category: 'packedTemplate',
        description: '',
        icon: '📄'
    });
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    // 自动存档定时器引用
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    // 最后一次存档的时间戳
    const lastSaveTimestampRef = useRef<number>(0);
    // 是否已经从自动存档恢复
    const hasAutoRestoredRef = useRef<boolean>(false);
    // 页面最后离开的时间戳
    const lastLeaveTimestampRef = useRef<number>(0);
    // 当前项目的存档ID
    const currentArchiveIdRef = useRef<number | null>(null);
    // 当前选择的图标类别
    const [currentIconCategory, setCurrentIconCategory] = useState<string>("常用");

    // 初始化时从localStorage加载存档ID并添加目录变更事件监听器
    useEffect(() => {
        try {
            const savedId = localStorage.getItem(ARCHIVE_ID_KEY);
            if (savedId) {
                currentArchiveIdRef.current = parseInt(savedId, 10);
                console.log(`从本地存储加载存档ID: ${currentArchiveIdRef.current}`);
            }
        } catch (error) {
            console.error("读取本地存储的存档ID失败:", error);
        }

        // 初始化 IndexedDB
        initDB().catch(err => console.error("Failed to init DB on mount:", err));

        // 添加目录切换事件监听器
        const directoryChangeHandler = (event: Event) => {
            const customEvent = event as CustomEvent<{
                directory: string,
                isRootDirectoryChange?: boolean,
                rootDirectoryName?: string
            }>;
            const newDirectory = customEvent.detail.directory;

            if (customEvent.detail.isRootDirectoryChange) {
                const rootDirectoryName = customEvent.detail.rootDirectoryName;
                console.log(`监听到根目录变化事件: 根目录名称 "${rootDirectoryName}"`);

                // 根目录变化时，会触发 rootDirectory 的 useEffect，
                // 那里会处理存档ID的清除，所以这里不需要重复处理
            } else {
                console.log(`监听到普通目录切换事件: 当前目录切换到 "${newDirectory}"`);
                // 普通的目录切换不影响存档ID
            }
        };

        window.addEventListener(DIRECTORY_CHANGE_EVENT, directoryChangeHandler);

        return () => {
            window.removeEventListener(DIRECTORY_CHANGE_EVENT, directoryChangeHandler);
        };
    }, []);

    // 保存当前存档ID到localStorage
    const saveCurrentArchiveId = useCallback((id: number | null) => {
        try {
            if (id !== null) {
                localStorage.setItem(ARCHIVE_ID_KEY, id.toString());
                console.log(`存档ID ${id} 已保存到本地存储`);
            } else {
                localStorage.removeItem(ARCHIVE_ID_KEY);
                console.log("已清除本地存储的存档ID");
            }
        } catch (error) {
            console.error("保存存档ID到本地存储失败:", error);
        }
    }, []);

    // 监听页面可见性变化
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // 页面隐藏时记录时间戳
                lastLeaveTimestampRef.current = Date.now();
                console.log(`页面离开，记录时间戳: ${new Date(lastLeaveTimestampRef.current).toLocaleString()}`);
            } else if (document.visibilityState === 'visible') {
                // 页面重新可见时，检查时间间隔
                const now = Date.now();
                const timeSinceLastLeave = now - lastLeaveTimestampRef.current;
                console.log(`页面重新进入，离开时长: ${Math.round(timeSinceLastLeave / 1000)}秒`);

                // 如果离开时间超过了自动保存周期，且有根目录和组件，则进行一次覆盖保存
                if (timeSinceLastLeave > AUTO_SAVE_INTERVAL && rootDirectory && components.length > 0 && !isSaving && !isRestoring) {
                    console.log('离开时间超过自动保存周期，执行存档');
                    handleAutoSaveArchive();
                }
            }
        };

        // 添加监听器
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 清理函数
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [rootDirectory, components, isSaving, isRestoring]);

    const loadArchiveList = useCallback(async () => {
        if (!isDrawerOpen) return;

        console.log("加载存档列表...");
        setIsRestoring(true);
        try {
            const archiveList = await listArchives();
            setArchives(archiveList);
            console.log("存档已加载:", archiveList);
        } catch (error) {
            console.error("加载存档列表失败:", error);
            toast.error("加载存档列表失败");
            setArchives([]);
        } finally {
            setIsRestoring(false);
        }
    }, [isDrawerOpen]);

    useEffect(() => {
        if (isDrawerOpen) {
            loadArchiveList();
        }
    }, [isDrawerOpen, loadArchiveList]);

    useEffect(() => {
        // 清理旧的定时器
        if (autoSaveTimerRef.current) {
            clearInterval(autoSaveTimerRef.current);
        }

        // 当有根目录且有组件时，设置自动存档定时器
        if (rootDirectory && components.length > 0) {
            // 先执行一次自动存档（但与上次存档时间至少需间隔1分钟）
            const now = Date.now();
            if (now - lastSaveTimestampRef.current > 60000) {
                handleAutoSaveArchive();
            }

            // 设置定时自动存档
            autoSaveTimerRef.current = setInterval(() => {
                handleAutoSaveArchive();
            }, AUTO_SAVE_INTERVAL);
        }

        // 组件卸载时清理
        return () => {
            if (autoSaveTimerRef.current) {
                clearInterval(autoSaveTimerRef.current);
                autoSaveTimerRef.current = null;
            }
        };
    }, [rootDirectory, components]);

    useEffect(() => {
        // 只在组件第一次挂载时执行一次自动恢复
        if (!hasAutoRestoredRef.current) {
            hasAutoRestoredRef.current = true;

            const autoRestore = async () => {
                try {
                    // 优先使用localStorage中保存的存档ID
                    if (currentArchiveIdRef.current !== null) {
                        // 尝试使用保存的ID恢复
                        console.log(`尝试使用保存的存档ID恢复: ${currentArchiveIdRef.current}`);
                        const archiveExists = await getArchive(currentArchiveIdRef.current);

                        if (archiveExists) {
                            toast.info("正在恢复上次的编辑状态...");
                            await handleRestoreArchive(currentArchiveIdRef.current, true);
                            return;
                        } else {
                            console.log(`保存的存档ID ${currentArchiveIdRef.current} 不存在，清除引用`);
                            currentArchiveIdRef.current = null;
                            saveCurrentArchiveId(null);
                        }
                    }

                    // 如果没有保存的ID或者ID无效，则获取最新的存档
                    const latestArchiveId = await getLatestArchiveId();
                    if (latestArchiveId !== null) {
                        console.log("找到最新存档，ID:", latestArchiveId);
                        toast.info("正在自动恢复最近一次的存档...");
                        await handleRestoreArchive(latestArchiveId, true);

                        // 更新当前存档ID
                        currentArchiveIdRef.current = latestArchiveId;
                        saveCurrentArchiveId(latestArchiveId);
                    } else {
                        console.log("没有找到可恢复的存档");
                    }
                } catch (error) {
                    console.error("自动恢复存档失败:", error);
                }
            };

            autoRestore();
        }
    }, [saveCurrentArchiveId]);

    // 监听目录变化，当选择新目录时清除当前存档ID
    useEffect(() => {
        // 只有当rootDirectory发生变化且不为空时执行
        if (rootDirectory) {
            // 检查该目录名是否与上次存档的目录名不同
            // 如果当前存档ID存在，尝试获取其对应的存档
            const checkAndClearArchiveId = async () => {
                if (currentArchiveIdRef.current !== null) {
                    try {
                        console.log(`检查存档ID ${currentArchiveIdRef.current} 与当前目录 "${rootDirectory.name}" 的关系...`);
                        const archive = await getArchive(currentArchiveIdRef.current);

                        if (!archive) {
                            console.log(`存档 ID: ${currentArchiveIdRef.current} 不存在，清除当前存档ID引用`);
                            currentArchiveIdRef.current = null;
                            saveCurrentArchiveId(null);
                            return;
                        }

                        // 从archive中获取目录名
                        // 目录名可能存储在不同位置，根据存档结构判断
                        const archiveDirectoryName = archive.directoryName ||
                            (archive.rootDirectory && archive.rootDirectory.name) ||
                            (archive.name);

                        console.log(`存档目录名: "${archiveDirectoryName}", 当前目录名: "${rootDirectory.name}"`);

                        // 如果存档存在且目录名不同，则清除当前存档ID
                        if (!archiveDirectoryName) {
                            console.log(`存档 ID: ${currentArchiveIdRef.current} 中没有目录名信息，清除当前存档ID引用`);
                            currentArchiveIdRef.current = null;
                            saveCurrentArchiveId(null);
                        } else if (archiveDirectoryName !== rootDirectory.name) {
                            console.log(`检测到目录变化: 从 "${archiveDirectoryName}" 到 "${rootDirectory.name}", 清除当前存档ID`);
                            currentArchiveIdRef.current = null;
                            saveCurrentArchiveId(null);
                            toast.info(`已切换到新目录 "${rootDirectory.name}"，将创建新的存档`);
                        } else {
                            console.log(`当前目录 "${rootDirectory.name}" 与存档目录匹配，保留存档ID: ${currentArchiveIdRef.current}`);
                        }
                    } catch (error) {
                        console.error(`检查存档ID: ${currentArchiveIdRef.current} 信息时出错:`, error);
                        // 出错时也重置ID
                        currentArchiveIdRef.current = null;
                        saveCurrentArchiveId(null);
                        toast.error(`读取存档信息出错，已重置存档关联`);
                    }
                } else {
                    console.log(`当前无存档ID与目录 "${rootDirectory.name}" 关联`);
                }
            };

            checkAndClearArchiveId();
        }
    }, [rootDirectory, saveCurrentArchiveId]);

    const handleAutoSaveArchive = async () => {
        if (!rootDirectory || components.length === 0 || isSaving || isRestoring) {
            return;
        }

        try {
            const componentsToSave = JSON.parse(JSON.stringify(components));
            let archiveId;

            // 检查是否已有存档ID
            if (currentArchiveIdRef.current !== null) {
                // 检查存档是否存在
                try {
                    const existingArchive = await getArchive(currentArchiveIdRef.current);
                    if (existingArchive) {
                        // 存在则先删除旧存档
                        console.log(`发现已有存档ID: ${currentArchiveIdRef.current}，进行覆盖保存`);
                        await deleteArchive(currentArchiveIdRef.current);
                        console.log(`旧存档 ID: ${currentArchiveIdRef.current} 已删除`);
                    } else {
                        console.log(`存档ID ${currentArchiveIdRef.current} 不存在，将创建新存档`);
                        currentArchiveIdRef.current = null;
                    }
                } catch (error) {
                    console.error(`检查存档ID ${currentArchiveIdRef.current} 时出错:`, error);
                    // 出错时也重置ID
                    currentArchiveIdRef.current = null;
                }
            }

            // 保存存档
            archiveId = await saveArchive(
                rootDirectory.name,
                {
                    components: componentsToSave,
                    selectedComponentId: selectedComponentId,
                    rootDirectory: rootDirectory
                }
            );

            // 更新和保存当前存档ID
            currentArchiveIdRef.current = archiveId;
            saveCurrentArchiveId(archiveId);

            console.log(`存档成功保存，ID: ${archiveId}, 目录: ${rootDirectory.name}`);
            // 更新最后存档时间戳
            lastSaveTimestampRef.current = Date.now();

            // 不需要每次都显示吐司提示，避免干扰用户
            // toast.success(`自动存档成功`, { duration: 2000 });
        } catch (error) {
            console.error("存档失败:", error);
        }
    };

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

    const handleUpload = useCallback(async () => {
        setIsUploading(true);
        toast.info("开始上传图片...");

        const imagePaths = extractImagePaths(code);
        console.log('提取到的图片路径:', imagePaths);

        if (imagePaths.length === 0) {
            toast.info("代码中没有找到需要上传的图片。");
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
                        toast.info(`图片 ${decodedPath.split('/').pop()} 使用缓存`);
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
                    toast.warning(`缺少文件对象: ${decodedPath}`);
                }
            } else {
                let reason = !asset ? '未找到资源' : !asset.hash ? '缺少 hash' : '缺少 relativePath';
                console.warn(`资源 "${path}" 信息不完整 (${reason})。`);
                toast.warning(`资源信息不完整: ${path}`);
            }
        }));

        if (filesToUpload.length === 0 && Object.keys(uploadedUrls).length > 0) {
            toast.success("所有图片均已从缓存加载。");
            setIsUploading(false);
            console.log("最终 URL 映射 (仅缓存):", uploadedUrls);
            return;
        } else if (filesToUpload.length === 0) {
            toast.info("没有有效的图片文件需要处理。");
            setIsUploading(false);
            return;
        }

        console.log("准备上传的文件 (排除缓存后):", filesToUpload.map(f => f.file.name));
        toast.info(`检测到 ${filesToUpload.length} 张新图片需要上传...`);

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
                    toast.success(`图片 ${result.path} 上传成功!`);
                    saveUrlMapping(result.hash, result.url, decodedPath).catch(err => {
                        console.error(`Failed to save mapping to IndexedDB for hash ${result.hash}:`, err);
                    });
                } else {
                    console.warn(`无法找到哈希 ${result.hash} 对应的上传信息。`);
                }
            } else {
                failCount++;
                toast.error(`图片 ${result.path} 上传失败: ${result.error}`);
            }
        });

        console.log("上传结果:", results);
        console.log("最终 URL 映射 (包含缓存和新上传):", uploadedUrls);

        const totalFound = Object.keys(uploadedUrls).length;
        if (failCount > 0) {
            toast.warning(`${totalFound - failCount} 张图片处理完成 (缓存或上传成功), ${failCount} 张上传失败。`);
        } else {
            toast.success(`所有 ${totalFound} 张图片处理完成 (缓存或上传成功)!`);
        }

        setIsUploading(false);
    }, [code, findImageByPath, imageAssets, extractImagePaths, uploadImage]);

    const handleSaveArchive = async () => {
        if (!rootDirectory) {
            toast.warning("请先选择一个根目录");
            return;
        }

        setIsSaving(true);
        toast.info(`正在保存存档 "${rootDirectory.name}"...`);

        try {
            const componentsToSave = JSON.parse(JSON.stringify(components));
            let archiveId;

            // 检查是否有已保存的存档ID
            if (currentArchiveIdRef.current !== null) {
                try {
                    const existingArchive = await getArchive(currentArchiveIdRef.current);
                    if (existingArchive) {
                        // 先删除旧存档
                        await deleteArchive(currentArchiveIdRef.current);
                        console.log(`覆盖保存：已删除旧存档 ID: ${currentArchiveIdRef.current}`);
                    } else {
                        console.log(`存档ID ${currentArchiveIdRef.current} 不存在，将创建新存档`);
                    }
                } catch (error) {
                    console.error(`检查存档ID ${currentArchiveIdRef.current} 时出错:`, error);
                }
            }

            // 保存新存档
            archiveId = await saveArchive(
                rootDirectory.name,
                {
                    components: componentsToSave,
                    selectedComponentId: selectedComponentId,
                    rootDirectory: rootDirectory
                }
            );

            // 更新和保存当前存档ID
            currentArchiveIdRef.current = archiveId;
            saveCurrentArchiveId(archiveId);

            toast.success(`存档 "${rootDirectory.name}" 保存成功!`);
            console.log(`手动存档成功，ID: ${archiveId}, 目录: ${rootDirectory.name}`);

            // 更新最后存档时间戳
            lastSaveTimestampRef.current = Date.now();

            if (isDrawerOpen) {
                loadArchiveList();
            }
        } catch (error: any) {
            console.error("保存存档失败:", error);
            toast.error(`保存存档失败: ${error?.message || error}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestoreArchive = async (archiveId: number, isAutoRestore = false) => {
        setIsRestoring(true);
        if (!isAutoRestore) {
            toast.info("正在恢复存档...");
        }

        try {
            const archiveData = await getArchive(archiveId);
            if (!archiveData) {
                toast.error("无法加载存档数据");
                setIsRestoring(false);
                return;
            }
            console.log("已加载存档数据:", archiveData);

            restoreState(archiveData.components, archiveData.selectedComponentId);
            if (!isAutoRestore) {
                toast.success("编辑器状态已恢复");
            } else {
                toast.success("已自动恢复最近一次的编辑状态");
            }

            if (!archiveData.rootDirectory) {
                toast.error("存档中不包含目录句柄信息");
                setIsRestoring(false);
                return;
            }

            // 更新当前存档ID
            currentArchiveIdRef.current = archiveId;
            saveCurrentArchiveId(archiveId);

            const storedDirectoryHandle = archiveData.rootDirectory;
            try {
                // 使用File System Access API的标准方法检查权限
                const permissionStatus = await (storedDirectoryHandle as any).queryPermission({ mode: 'readwrite' }) as 'granted' | 'denied' | 'prompt';

                if (permissionStatus === 'granted' ||
                    (permissionStatus === 'prompt' &&
                        await (storedDirectoryHandle as any).requestPermission({ mode: 'readwrite' }) === 'granted')) {

                    if (!isAutoRestore) {
                        toast.success(`已获取目录 "${storedDirectoryHandle.name}" 的读写权限`);
                    }
                    await loadAssets(storedDirectoryHandle);
                    if (!isAutoRestore) {
                        toast.success("资源加载完成!");
                        setIsDrawerOpen(false);
                    } else {
                        toast.success("自动恢复资源成功");
                    }
                } else {
                    toast.error(`未获取目录 "${storedDirectoryHandle.name}" 的读写权限`);

                    toast.info("请手动选择目录", { duration: 5000 });
                    try {
                        const newDirectoryHandle = await window.showDirectoryPicker();
                        if (newDirectoryHandle.name !== storedDirectoryHandle.name) {
                            toast.warning(`选择的目录名 "${newDirectoryHandle.name}" 与存档中的 "${storedDirectoryHandle.name}" 不匹配`);
                        }
                        await loadAssets(newDirectoryHandle);
                        toast.success("资源加载完成!");
                        if (!isAutoRestore) {
                            setIsDrawerOpen(false);
                        }
                    } catch (pickerError: any) {
                        if (pickerError.name === 'AbortError') {
                            toast.warning('用户取消了目录选择');
                        } else {
                            toast.error(`选择目录失败: ${pickerError?.message || "未知错误"}`);
                        }
                    }
                }
            } catch (permissionError: any) {
                console.error("Permission error:", permissionError);
                toast.error(`权限处理错误: ${permissionError?.message || "未知错误"}`);

                try {
                    toast.info("尝试手动选择目录", { duration: 5000 });
                    const newDirectoryHandle = await window.showDirectoryPicker();
                    await loadAssets(newDirectoryHandle);
                    toast.success("资源加载完成!");
                    if (!isAutoRestore) {
                        setIsDrawerOpen(false);
                    }
                } catch (fallbackError: any) {
                    if (fallbackError.name !== 'AbortError') {
                        toast.error(`选择目录失败: ${fallbackError?.message || "未知错误"}`);
                    }
                }
            }

        } catch (error: any) {
            console.error("Failed to restore archive:", error);
            toast.error(`恢复存档失败: ${error?.message || error}`);
        } finally {
            setIsRestoring(false);
        }
    };

    const handleDeleteArchive = async (archiveId: number, archiveName: string) => {
        if (isRestoring || isSaving) return;

        if (window.confirm(`确定要删除存档 "${archiveName}" 吗？此操作不可撤销。`)) {
            setIsRestoring(true);
            try {
                await deleteArchive(archiveId);
                toast.success(`存档 "${archiveName}" 已删除`);

                // 如果删除的是当前存档，清除当前存档ID
                if (archiveId === currentArchiveIdRef.current) {
                    currentArchiveIdRef.current = null;
                    saveCurrentArchiveId(null);
                    console.log("当前存档已删除，已清除存档ID引用");
                }

                // 更新存档列表
                setArchives(prev => prev.filter(a => a.id !== archiveId));
            } catch (error: any) {
                console.error("Failed to delete archive:", error);
                toast.error(`删除存档失败: ${error?.message || error}`);
            } finally {
                setIsRestoring(false);
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
            toast.error("请输入模板名称");
            return;
        }

        if (!components.length || !selectedComponentId) {
            toast.error("请先选择要保存的组件");
            return;
        }

        setIsSavingTemplate(true);

        try {
            // 只保存选中的组件
            const selectedComponent = components.find(comp => comp.id === selectedComponentId);
            if (!selectedComponent) {
                toast.error("未找到选中的组件");
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
            toast.success(`模板 "${templateFormData.templateName}" 保存成功`);

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
            toast.error("保存模板失败");
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
                                disabled={isSaving || isRestoring || !rootDirectory}
                            >
                                <LucideSave className="h-4 w-4" />
                                {isSaving && <span className="ml-1 text-xs">保存中...</span>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{!rootDirectory ? "请先选择目录" : "存档"}</p>
                        </TooltipContent>
                    </Tooltip>

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

                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DrawerTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={isSaving || isRestoring}
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
                                                        {currentArchiveIdRef.current === archive.id && " (当前)"}
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