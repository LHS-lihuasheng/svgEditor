/**
 * @description 存档管理组件
 * 管理编辑器的存档功能，统一处理存档的创建、更新和恢复
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { useAssets } from '@/contexts/AssetContext';
import { useToast } from "@/hooks/use-toast";
import {
    saveArchive,
    getArchive,
    archiveStorage,
    checkArchiveDirectoryMatch,
    getLatestArchiveId
} from '@/utils/indexedDBUtils';
import { DIRECTORY_CHANGE_EVENT } from '@/components/svgEditor/SideBarMenu/menuTab/items/AssetsTab';

// 自动存档的时间间隔（5分钟）
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

export interface ArchiveManagerProps {
    onArchiveIdChange?: (id: number | null) => void; // 存档ID变化的回调
}

export function useArchiveManager({ onArchiveIdChange }: ArchiveManagerProps = {}) {
    const { components, selectedComponentId, restoreState } = useEditor();
    const { rootDirectory, loadAssets } = useAssets();
    const { toast } = useToast();

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
    // 标记目录是否正在变化中
    const directoryChangingRef = useRef<boolean>(false);

    const [isArchiving, setIsArchiving] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    /**
     * 创建或更新存档
     * 核心功能：根据是否有ID决定创建新存档或更新现有存档
     */
    const manageArchive = useCallback(async (forceCreate: boolean = false): Promise<number | null> => {
        // 如果目录正在变化中，不执行存档操作
        if (!rootDirectory || components.length === 0 || isArchiving || isRestoring || directoryChangingRef.current) {
            return null;
        }

        setIsArchiving(true);
        try {
            const componentsToSave = JSON.parse(JSON.stringify(components));
            let archiveId;
            let isNewArchive = forceCreate;

            // 检查是否已有存档ID且是否匹配当前目录
            if (!forceCreate && currentArchiveIdRef.current !== null) {
                const isMatch = await checkArchiveDirectoryMatch(
                    currentArchiveIdRef.current,
                    rootDirectory.name
                );

                if (!isMatch) {
                    currentArchiveIdRef.current = null;
                    isNewArchive = true;
                }
            } else if (currentArchiveIdRef.current === null) {
                isNewArchive = true;
            }

            archiveId = await saveArchive(
                rootDirectory.name,
                {
                    components: componentsToSave,
                    selectedComponentId: selectedComponentId,
                    rootDirectory: rootDirectory
                },
                isNewArchive ? undefined : (currentArchiveIdRef.current || undefined)
            );

            currentArchiveIdRef.current = archiveId;
            archiveStorage.saveCurrentId(archiveId);

            if (onArchiveIdChange) {
                onArchiveIdChange(archiveId);
            }

            // 更新最后存档时间戳
            lastSaveTimestampRef.current = Date.now();

            return archiveId;
        } catch (error) {
            console.error("存档管理失败:", error);
            return null;
        } finally {
            // console.log('存档操作完成，重置状态');
            setIsArchiving(false);
        }
    }, [rootDirectory, components, selectedComponentId, onArchiveIdChange, isArchiving, isRestoring]);

    /**
     * 恢复存档
     * @param archiveId 要恢复的存档ID
     * @param isAutoRestore 是否为自动恢复
     */
    const restoreArchive = useCallback(async (archiveId: number, isAutoRestore = false): Promise<boolean> => {
        if (isRestoring || isArchiving) return false;

        setIsRestoring(true);
        if (!isAutoRestore) {
            toast({
                title: "正在恢复存档...",
                description: "",
            });
        }

        try {
            const archiveData = await getArchive(archiveId);
            if (!archiveData) {
                toast({
                    title: "无法加载存档数据",
                    description: "请检查存档是否已被删除",
                    variant: "destructive",
                });
                return false;
            }

            restoreState(archiveData.components, archiveData.selectedComponentId);
            if (!isAutoRestore) {
                toast({
                    title: "恢复成功",
                    description: "编辑器状态已恢复",
                });
            } else {
                toast({
                    title: "自动恢复成功",
                    description: "已自动恢复最近一次的编辑状态",
                });
            }

            if (!archiveData.rootDirectory) {
                toast({
                    title: "错误",
                    description: "存档中不包含目录句柄信息",
                    variant: "destructive",
                });
                return false;
            }

            currentArchiveIdRef.current = archiveId;
            archiveStorage.saveCurrentId(archiveId);

            if (onArchiveIdChange) {
                onArchiveIdChange(archiveId);
            }

            const storedDirectoryHandle = archiveData.rootDirectory;
            try {
                // 使用File System Access API的标准方法检查权限
                const permissionStatus = await (storedDirectoryHandle as any).queryPermission({ mode: 'readwrite' }) as 'granted' | 'denied' | 'prompt';

                if (permissionStatus === 'granted' ||
                    (permissionStatus === 'prompt' &&
                        await (storedDirectoryHandle as any).requestPermission({ mode: 'readwrite' }) === 'granted')) {

                    if (!isAutoRestore) {
                        toast({
                            title: "权限获取成功",
                            description: `已获取目录 "${storedDirectoryHandle.name}" 的读写权限`,
                        });
                    }
                    await loadAssets(storedDirectoryHandle);
                    if (!isAutoRestore) {
                        toast({
                            title: "资源加载完成",
                            description: "所有资源已加载完成",
                        });
                    } else {
                        toast({
                            title: "资源恢复成功",
                            description: "自动恢复资源成功",
                        });
                    }
                    return true;
                } else {
                    toast({
                        title: "权限错误",
                        description: `未获取目录 "${storedDirectoryHandle.name}" 的读写权限`,
                        variant: "destructive",
                    });

                    toast({
                        title: "请手动选择目录",
                        description: "需要选择目录继续操作",
                        duration: 5000,
                    });
                    try {
                        const newDirectoryHandle = await window.showDirectoryPicker();
                        if (newDirectoryHandle.name !== storedDirectoryHandle.name) {
                            toast({
                                title: "目录不匹配",
                                description: `选择的目录名 "${newDirectoryHandle.name}" 与存档中的 "${storedDirectoryHandle.name}" 不匹配`,
                                variant: "destructive",
                            });
                        }
                        await loadAssets(newDirectoryHandle);
                        toast({
                            title: "资源加载成功",
                            description: "资源加载完成!",
                        });
                        return true;
                    } catch (pickerError: any) {
                        if (pickerError.name === 'AbortError') {
                            toast({
                                title: "操作取消",
                                description: "用户取消了目录选择",
                                variant: "destructive",
                            });
                        } else {
                            toast({
                                title: "选择目录失败",
                                description: `选择目录失败: ${pickerError?.message || "未知错误"}`,
                                variant: "destructive",
                            });
                        }
                        return false;
                    }
                }
            } catch (permissionError: any) {
                console.error("Permission error:", permissionError);
                toast({
                    title: "权限错误",
                    description: `权限处理错误: ${permissionError?.message || "未知错误"}`,
                    variant: "destructive",
                });

                try {
                    toast({
                        title: "尝试手动选择",
                        description: "尝试手动选择目录",
                        duration: 5000,
                    });
                    const newDirectoryHandle = await window.showDirectoryPicker();
                    await loadAssets(newDirectoryHandle);
                    toast({
                        title: "资源加载成功",
                        description: "资源加载完成!",
                    });
                    return true;
                } catch (fallbackError: any) {
                    if (fallbackError.name !== 'AbortError') {
                        toast({
                            title: "选择目录失败",
                            description: `选择目录失败: ${fallbackError?.message || "未知错误"}`,
                            variant: "destructive",
                        });
                    }
                    return false;
                }
            }
        } catch (error: any) {
            console.error("Failed to restore archive:", error);
            toast({
                title: "恢复失败",
                description: `恢复存档失败: ${error?.message || error}`,
                variant: "destructive",
            });
            return false;
        } finally {
            setIsRestoring(false);
        }
    }, [restoreState, loadAssets, onArchiveIdChange, isArchiving, isRestoring, toast]);

    // 初始化时从localStorage加载存档ID
    useEffect(() => {
        // 从localStorage读取存档ID
        const savedId = archiveStorage.getCurrentId();
        if (savedId !== null) {
            currentArchiveIdRef.current = savedId;

            // 调用ID变化回调
            if (onArchiveIdChange) {
                onArchiveIdChange(savedId);
            }
        }
    }, [onArchiveIdChange]);

    // 添加目录变更事件监听器
    useEffect(() => {
        // 添加目录切换事件监听器
        const directoryChangeHandler = (event: Event) => {
            const customEvent = event as CustomEvent<{
                directory: string,
                isRootDirectoryChange?: boolean,
                rootDirectoryName?: string
            }>;

            if (customEvent.detail.isRootDirectoryChange) {
                const rootDirectoryName = customEvent.detail.rootDirectoryName;
                console.log(`监听到根目录变化事件: 根目录名称 "${rootDirectoryName}"`);

                directoryChangingRef.current = true;

                const checkAndClearArchiveId = async () => {
                    if (!rootDirectoryName || currentArchiveIdRef.current === null) return;

                    const isMatch = await checkArchiveDirectoryMatch(
                        currentArchiveIdRef.current,
                        rootDirectoryName
                    );

                    if (!isMatch) {
                        currentArchiveIdRef.current = null;
                        archiveStorage.saveCurrentId(null);

                        if (onArchiveIdChange) {
                            onArchiveIdChange(null);
                        }

                        console.log(`根目录变化: 目录 "${rootDirectoryName}" 与当前存档不匹配，已清除存档ID`);
                    }
                };

                checkAndClearArchiveId();
            }
        };

        window.addEventListener(DIRECTORY_CHANGE_EVENT, directoryChangeHandler);

        return () => {
            window.removeEventListener(DIRECTORY_CHANGE_EVENT, directoryChangeHandler);
        };
    }, [onArchiveIdChange]);

    // 监听页面可见性变化
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // 页面隐藏时记录时间戳并立即执行存档
                lastLeaveTimestampRef.current = Date.now();
                console.log(`页面离开，记录时间戳: ${new Date(lastLeaveTimestampRef.current).toLocaleString()}`);

                // 无论何时离开页面，只要有组件和根目录，都立即执行存档
                if (rootDirectory && components.length > 0 && !isArchiving && !isRestoring && !directoryChangingRef.current) {
                    console.log('页面离开，立即执行存档');
                    manageArchive();
                }
            }
        };

        // 添加监听器
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // 添加beforeunload事件监听器，在页面关闭前执行存档
        const handleBeforeUnload = () => {
            if (rootDirectory && components.length > 0 && !isArchiving && !isRestoring && !directoryChangingRef.current) {
                console.log('页面即将关闭，执行最终存档');

                // 设置需要在重载后保存的标记
                archiveStorage.setNeedSaveFlag();

                // 尝试直接保存临时数据到localStorage
                try {
                    archiveStorage.saveTemporaryData(
                        components,
                        rootDirectory.name,
                        selectedComponentId
                    );
                } catch (e) {
                    console.error('无法在beforeunload中保存临时数据', e);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // 检查是否需要在重新加载后进行存档
        if (archiveStorage.checkNeedSaveFlag() && rootDirectory) {
            console.log('检测到页面重载前的存档请求，执行存档');

            // 尝试从localStorage恢复临时保存的数据
            const tempData = archiveStorage.getTemporaryData();

            if (tempData.directoryName === rootDirectory.name && tempData.timestamp) {
                try {
                    if (tempData.components && components.length === 0) {
                        console.log('发现临时保存的组件数据，时间:',
                            new Date(tempData.timestamp).toLocaleString());
                    }
                } catch (e) {
                    console.error('无法解析临时保存的数据', e);
                }
            }

            // 执行存档并清除标记
            manageArchive();
            archiveStorage.clearNeedSaveFlag();
        }

        // 清理函数
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // 在组件卸载时无条件执行最后一次自动存档
            if (rootDirectory && components.length > 0 && !directoryChangingRef.current) {
                manageArchive();
            }
        };
    }, [rootDirectory, components, selectedComponentId, manageArchive]);

    // 组件变化时自动存档
    useEffect(() => {
        // 当有根目录且有组件时，立即执行一次存档（与上次间隔至少30秒）
        if (rootDirectory && components.length > 0) {
            const now = Date.now();
            if (now - lastSaveTimestampRef.current > 30000 && !isArchiving && !isRestoring && !directoryChangingRef.current) {
                manageArchive();
            }
        }
    }, [components, rootDirectory, manageArchive]);

    // 设置自动存档定时器
    useEffect(() => {
        // 清理旧的定时器
        if (autoSaveTimerRef.current) {
            clearInterval(autoSaveTimerRef.current);
            autoSaveTimerRef.current = null;
        }

        // 当有根目录且有组件时，设置自动存档定时器
        if (rootDirectory && components.length > 0) {
            // 设置定时自动存档
            autoSaveTimerRef.current = setInterval(() => {
                if (!isArchiving && !isRestoring && !directoryChangingRef.current) {
                    manageArchive();
                }
            }, AUTO_SAVE_INTERVAL);
        }

        // 组件卸载时清理
        return () => {
            if (autoSaveTimerRef.current) {
                clearInterval(autoSaveTimerRef.current);
                autoSaveTimerRef.current = null;
            }
        };
    }, [rootDirectory, components, manageArchive]);

    // 自动恢复最近存档
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
                            toast({
                                title: "自动恢复",
                                description: "正在恢复上次的编辑状态...",
                            });
                            await restoreArchive(currentArchiveIdRef.current, true);
                            return;
                        } else {
                            console.log(`保存的存档ID ${currentArchiveIdRef.current} 不存在，清除引用`);
                            currentArchiveIdRef.current = null;
                            archiveStorage.saveCurrentId(null);

                            // 调用ID变化回调
                            if (onArchiveIdChange) {
                                onArchiveIdChange(null);
                            }
                        }
                    }

                    // 如果没有保存的ID或者ID无效，则获取最新的存档
                    const latestArchiveId = await getLatestArchiveId();
                    if (latestArchiveId !== null) {
                        console.log("找到最新存档，ID:", latestArchiveId);
                        toast({
                            title: "自动恢复",
                            description: "正在自动恢复最近一次的存档...",
                        });
                        await restoreArchive(latestArchiveId, true);

                        // 更新当前存档ID
                        currentArchiveIdRef.current = latestArchiveId;
                        archiveStorage.saveCurrentId(latestArchiveId);

                        // 调用ID变化回调
                        if (onArchiveIdChange) {
                            onArchiveIdChange(latestArchiveId);
                        }
                    } else {
                        console.log("没有找到可恢复的存档");
                    }
                } catch (error) {
                    console.error("自动恢复存档失败:", error);
                    toast({
                        title: "恢复失败",
                        description: "自动恢复存档失败",
                        variant: "destructive",
                    });
                }
            };

            // 自动恢复
            autoRestore();
        }
    }, [restoreArchive, onArchiveIdChange, toast]);

    // 监听rootDirectory变化
    useEffect(() => {
        // 只有当rootDirectory发生变化且不为空时执行
        if (rootDirectory) {
            // 重置目录变化标记
            directoryChangingRef.current = false;

            // 检查该目录名是否与当前存档ID关联的目录匹配
            const checkAndHandleArchive = async () => {
                // 如果正在保存或恢复，不执行存档操作
                if (isArchiving || isRestoring) return;

                if (currentArchiveIdRef.current !== null) {
                    const isMatch = await checkArchiveDirectoryMatch(
                        currentArchiveIdRef.current,
                        rootDirectory.name
                    );

                    if (!isMatch) {
                        console.log(`检测到目录变化: 从存档ID ${currentArchiveIdRef.current} 到新目录 "${rootDirectory.name}"`);
                        // 目录变化时，先清除当前存档ID
                        currentArchiveIdRef.current = null;
                        archiveStorage.saveCurrentId(null);

                        // 调用ID变化回调
                        if (onArchiveIdChange) {
                            onArchiveIdChange(null);
                        }

                        toast({
                            title: "目录切换",
                            description: `已切换到新目录 "${rootDirectory.name}"，将创建新的存档`,
                        });

                        // 为新目录创建存档
                        if (components.length > 0) {
                            // 目录变化且有组件时，强制创建新存档
                            const newArchiveId = await manageArchive(true);
                            console.log(`为新目录 "${rootDirectory.name}" 创建了存档，ID: ${newArchiveId}`);
                        }
                    }
                } else if (components.length > 0) {
                    // 没有当前存档ID但有组件，为新目录创建存档
                    console.log(`当前无存档ID与目录 "${rootDirectory.name}" 关联，创建新存档`);
                    const newArchiveId = await manageArchive(true);
                    console.log(`为目录 "${rootDirectory.name}" 创建了存档，ID: ${newArchiveId}`);
                }
            };

            // 添加短暂延迟，确保目录变化事件处理完毕
            setTimeout(() => {
                checkAndHandleArchive();
            }, 100);
        }
    }, [rootDirectory, components, manageArchive, onArchiveIdChange, isArchiving, isRestoring, toast]);

    return {
        currentArchiveId: currentArchiveIdRef.current,
        manageArchive,
        restoreArchive,
        isArchiving,
        isRestoring,
        isDirectoryChanging: directoryChangingRef.current
    };
} 