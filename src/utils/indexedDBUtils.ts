const DB_NAME = 'WaveSvgDB';
const DB_VERSION = 2;
const STORE_URL_MAPPING = 'url_mapping';
const STORE_ARCHIVES = 'archives';
const STORE_CUSTOM_TEMPLATES = 'custom_templates';

// 存档ID在localStorage中的键名
export const ARCHIVE_ID_KEY = 'svgEditor_currentArchiveId';

let db: IDBDatabase | null = null;

/**
 * 初始化 IndexedDB 数据库和对象存储空间
 */
export const initDB = async (): Promise<IDBDatabase> => {
    // console.log('Initializing IndexedDB...');

    const db = await openDB();
    const existingStores = Array.from(db.objectStoreNames);
    let upgraded = false;

    db.close();

    // 检查并创建缺失的存储
    if (!existingStores.includes(STORE_URL_MAPPING)) {
        upgraded = true;
    }

    if (!existingStores.includes(STORE_ARCHIVES)) {
        upgraded = true;
    }

    if (!existingStores.includes(STORE_CUSTOM_TEMPLATES)) {
        upgraded = true;
    }

    if (upgraded) {

        const newVersion = DB_VERSION + 1;
        const newDb = await openDB(newVersion);
        return newDb;
    }

    // 返回新的数据库连接
    return await openDB();
};

/**
 * 将图片哈希、上传后的 URL 和相对路径存储到 IndexedDB
 * @param hash 图片的哈希值 (将作为键)
 * @param url 上传后得到的 URL
 * @param relativePath 图片的原始相对路径
 */
export const saveUrlMapping = async (hash: string, url: string, relativePath: string): Promise<void> => {
    if (!hash || !url || !relativePath) {
        console.warn('Hash, URL, or relativePath is missing, skipping save to IndexedDB.');
        return;
    }
    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_URL_MAPPING], 'readwrite');
        const store = transaction.objectStore(STORE_URL_MAPPING);
        const request = store.put({ relativePath, url, hash });

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log(`Mapping saved to IndexedDB: ${hash} -> ${url}`);
                resolve();
            };
            request.onerror = () => {
                console.error('Error saving mapping to IndexedDB:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Failed to save URL mapping to IndexedDB:', error);
        throw error;
    }
};

/**
 * 根据图片哈希从 IndexedDB 获取上传后的 URL
 * @param hash 图片的哈希值
 * @returns 返回存储的 URL，如果未找到则返回 undefined
 */
export const getUrlByHash = async (hash: string): Promise<string | undefined> => {
    if (!hash) return undefined;

    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_URL_MAPPING], 'readonly');
        const store = transaction.objectStore(STORE_URL_MAPPING);
        const request = store.get(hash);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.url);
                } else {
                    resolve(undefined);
                }
            };
            request.onerror = () => {
                console.error('Error getting URL from IndexedDB:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Failed to get URL by hash from IndexedDB:', error);
        return undefined;
    }
};

// ---------- 存档管理相关功能 ----------

export interface ArchiveData {
    components: any[];
    selectedComponentId: string | null;
    rootDirectory: FileSystemDirectoryHandle;
    directoryName?: string;
}

export interface ArchiveRecord extends ArchiveData {
    id: number;
    name: string;
    timestamp: number;
    directoryName: string;
}

export interface ArchiveItem {
    id: number;
    name: string;
    timestamp: number;
    directoryName?: string;
}

/**
 * 生成随机ID
 * 生成一个随机的数字ID，用于存档唯一标识
 * @returns 返回随机生成的数字ID
 */
const generateRandomId = (): number => {
    // 生成一个10位数的随机ID
    return Math.floor(Math.random() * 9000000000) + 1000000000;
};

/**
 * 从localStorage保存或读取当前存档ID
 */
export const archiveStorage = {
    /**
     * 保存当前存档ID到localStorage
     * @param id 存档ID或null
     */
    saveCurrentId: (id: number | null): void => {
        try {
            if (id !== null) {
                localStorage.setItem(ARCHIVE_ID_KEY, id.toString());
            } else {
                localStorage.removeItem(ARCHIVE_ID_KEY);
            }
        } catch (error) {
            console.error("保存存档ID到本地存储失败:", error);
        }
    },

    /**
     * 从localStorage读取当前存档ID
     * @returns 存档ID或null
     */
    getCurrentId: (): number | null => {
        try {
            const savedId = localStorage.getItem(ARCHIVE_ID_KEY);
            if (savedId) {
                return parseInt(savedId, 10);
            }
        } catch (error) {
            console.error("读取本地存储的存档ID失败:", error);
        }
        return null;
    },

    /**
     * 为页面退出时的临时存档设置标记
     */
    setNeedSaveFlag: (): void => {
        localStorage.setItem('NEED_SAVE_ON_RELOAD', 'true');
    },

    /**
     * 检查是否需要在重新加载后执行存档
     */
    checkNeedSaveFlag: (): boolean => {
        return localStorage.getItem('NEED_SAVE_ON_RELOAD') === 'true';
    },

    /**
     * 清除需要存档的标记
     */
    clearNeedSaveFlag: (): void => {
        localStorage.removeItem('NEED_SAVE_ON_RELOAD');
        localStorage.removeItem('TEMPORARY_SAVE_DATA');
        localStorage.removeItem('TEMPORARY_SAVE_TIME');
        localStorage.removeItem('TEMPORARY_SAVE_DIRECTORY');
        localStorage.removeItem('TEMPORARY_SELECTED_ID');
    },

    /**
     * 保存临时组件数据到localStorage (用于页面意外关闭时)
     */
    saveTemporaryData: (
        components: any[],
        directoryName: string,
        selectedComponentId?: string | null
    ): void => {
        try {
            localStorage.setItem('TEMPORARY_SAVE_DATA', JSON.stringify(components));
            localStorage.setItem('TEMPORARY_SAVE_TIME', Date.now().toString());
            localStorage.setItem('TEMPORARY_SAVE_DIRECTORY', directoryName);
            if (selectedComponentId) {
                localStorage.setItem('TEMPORARY_SELECTED_ID', selectedComponentId);
            }
        } catch (e) {
            console.error('无法保存临时数据到localStorage:', e);
        }
    },

    /**
     * 从localStorage获取临时保存的数据
     */
    getTemporaryData: (): {
        components: any[] | null,
        timestamp: number | null,
        directoryName: string | null,
        selectedComponentId: string | null
    } => {
        try {
            const dataStr = localStorage.getItem('TEMPORARY_SAVE_DATA');
            const timeStr = localStorage.getItem('TEMPORARY_SAVE_TIME');
            const directoryName = localStorage.getItem('TEMPORARY_SAVE_DIRECTORY');
            const selectedId = localStorage.getItem('TEMPORARY_SELECTED_ID');

            return {
                components: dataStr ? JSON.parse(dataStr) : null,
                timestamp: timeStr ? parseInt(timeStr, 10) : null,
                directoryName,
                selectedComponentId: selectedId
            };
        } catch (e) {
            console.error('解析临时数据失败:', e);
            return {
                components: null,
                timestamp: null,
                directoryName: null,
                selectedComponentId: null
            };
        }
    }
};

/**
 * 检查存档是否与当前目录匹配
 * @param archiveId 存档ID
 * @param currentDirectoryName 当前目录名称
 * @returns 如果匹配返回true，否则返回false
 */
export const checkArchiveDirectoryMatch = async (
    archiveId: number | null,
    currentDirectoryName: string
): Promise<boolean> => {
    if (archiveId === null) return false;

    try {
        const existingArchive = await getArchive(archiveId);
        if (!existingArchive) return false;

        // 获取存档中的目录名
        const archiveDirectoryName = existingArchive.directoryName ||
            (existingArchive.rootDirectory && existingArchive.rootDirectory.name) ||
            existingArchive.name;

        return archiveDirectoryName === currentDirectoryName;
    } catch (error) {
        console.error(`检查存档ID ${archiveId} 与目录 "${currentDirectoryName}" 匹配时出错:`, error);
        return false;
    }
};

/**
 * 保存或更新存档
 * 统一的存档函数，根据提供的ID决定是更新还是创建新存档
 * 
 * @param name 存档名称 (通常为目录名)
 * @param data 存档数据 { components, selectedComponentId, rootDirectory }
 * @param existingId 可选的现有存档ID，如果提供则更新该ID的存档
 * @returns 返回存档ID
 */
export const saveArchive = async (
    name: string,
    data: ArchiveData,
    existingId?: number
): Promise<number> => {
    if (!name || !data) {
        return Promise.reject('Missing name or data for archive');
    }

    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_ARCHIVES], 'readwrite');
        const store = transaction.objectStore(STORE_ARCHIVES);

        // 使用目录名称作为directoryName，确保兼容性
        const directoryName = data.rootDirectory?.name || data.directoryName || name;

        // 定义包含可选id字段的记录类型
        const archiveRecord: ArchiveRecord = {
            // 使用现有ID或生成新的随机ID
            id: existingId || generateRandomId(),
            name: name,
            timestamp: Date.now(),
            directoryName,
            ...data,
            // 确保 rootDirectory 被正确保存
            rootDirectory: data.rootDirectory
        };

        // 使用put方法，更新或添加记录
        const request = store.put(archiveRecord);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(archiveRecord.id);
            };
            request.onerror = () => {
                console.error('Error saving archive:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Failed to save archive:', error);
        throw error;
    }
};

/**
 * 列出所有存档 (仅元数据)
 * @returns 返回 { id, name, timestamp, directoryName } 列表，按时间戳降序
 */
export const listArchives = async (): Promise<ArchiveItem[]> => {
    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_ARCHIVES], 'readonly');
        const store = transaction.objectStore(STORE_ARCHIVES);
        const index = store.index('timestamp');
        const request = index.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const results = request.result.map(item => ({
                    id: item.id,
                    name: item.name,
                    timestamp: item.timestamp,
                    directoryName: item.directoryName || item.name
                })).sort((a, b) => b.timestamp - a.timestamp);
                resolve(results);
            };
            request.onerror = () => {
                console.error('Error listing archives:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('Failed to list archives:', error);
        return [];
    }
};

/**
 * 获取最新的存档记录
 * @returns 返回最新的存档ID或null
 */
export const getLatestArchiveId = async (): Promise<number | null> => {
    try {
        const archives = await listArchives();
        if (archives.length > 0) {
            // 列表已经按时间戳降序排序，第一个就是最新的
            return archives[0].id;
        }
        return null;
    } catch (error) {
        console.error('Failed to get latest archive ID:', error);
        return null;
    }
};

/**
 * 根据 ID 获取单个存档的完整数据
 * @param id 存档 ID
 * @returns 返回存档数据或 null
 */
export const getArchive = async (id: number): Promise<{
    components: any[],
    selectedComponentId: string | null,
    directoryName: string,
    rootDirectory: FileSystemDirectoryHandle,
    name: string,
    timestamp: number
} | null> => {
    if (typeof id !== 'number') return null;
    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_ARCHIVES], 'readonly');
        const store = transaction.objectStore(STORE_ARCHIVES);
        const request = store.get(id);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                if (request.result) {
                    const { id: _id, ...archiveData } = request.result;
                    resolve(archiveData);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => {
                console.error(`Error getting archive ID ${id}:`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`Failed to get archive ID ${id}:`, error);
        return null;
    }
};

/**
 * 根据 ID 删除存档
 * @param id 存档 ID
 */
export const deleteArchive = async (id: number): Promise<void> => {
    if (typeof id !== 'number') return Promise.reject('Invalid ID for deletion');
    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_ARCHIVES], 'readwrite');
        const store = transaction.objectStore(STORE_ARCHIVES);
        const request = store.delete(id);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log(`Archive ID ${id} deleted successfully.`);
                resolve();
            };
            request.onerror = () => {
                console.error(`Error deleting archive ID ${id}:`, request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error(`Failed to delete archive ID ${id}:`, error);
        throw error;
    }
};

// ---------- 自定义模板相关操作 ----------

/**
 * 保存自定义模板
 * @param templateData 模板数据 (包含 templateName, category, description, icon, component)
 * @returns 返回保存的模板ID
 */
export const saveCustomTemplate = async (templateData: any): Promise<number> => {
    if (!templateData || !templateData.templateName || !templateData.component) {
        return Promise.reject('模板数据不完整，必须包含名称和组件数据');
    }

    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_CUSTOM_TEMPLATES], 'readwrite');
        const store = transaction.objectStore(STORE_CUSTOM_TEMPLATES);

        const templateRecord = {
            ...templateData,
            timestamp: Date.now()
        };

        const request = store.add(templateRecord);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log(`模板 '${templateData.templateName}' 保存成功，ID: ${request.result}`);
                resolve(request.result as number);
            };
            request.onerror = () => {
                console.error('保存模板时出错:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('保存模板失败:', error);
        throw error;
    }
};

/**
 * 获取所有自定义模板
 * @returns 返回自定义模板列表
 */
export const listCustomTemplates = async (): Promise<any[]> => {
    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_CUSTOM_TEMPLATES], 'readonly');
        const store = transaction.objectStore(STORE_CUSTOM_TEMPLATES);

        // 获取所有记录
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const templates = request.result
                    .map(({ id, templateName, category, description, icon, component, timestamp }) => ({
                        id,
                        templateName,
                        category,
                        description,
                        icon,
                        component,
                        timestamp
                    }))
                    .sort((a, b) => b.timestamp - a.timestamp);
                resolve(templates);
            };
            request.onerror = () => {
                console.error('获取模板列表时出错:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('获取模板列表失败:', error);
        return [];
    }
};

/**
 * 删除自定义模板
 * @param id 模板ID
 */
export const deleteCustomTemplate = async (id: number): Promise<void> => {
    if (typeof id !== 'number') return Promise.reject('无效的模板ID');

    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([STORE_CUSTOM_TEMPLATES], 'readwrite');
        const store = transaction.objectStore(STORE_CUSTOM_TEMPLATES);

        const deleteRequest = store.delete(id);
        return new Promise((resolve, reject) => {
            deleteRequest.onsuccess = () => {
                console.log(`成功删除模板，ID: ${id}`);
                resolve();
            };
            deleteRequest.onerror = () => {
                console.error(`删除模板时出错，ID: ${id}:`, deleteRequest.error);
                reject(deleteRequest.error);
            };
        });
    } catch (error) {
        console.error('删除模板操作失败:', error);
        throw error;
    }
};

// ---------- 打开数据库连接 ----------
const openDB = async (version?: number): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, version);

        request.onupgradeneeded = (event) => {
            const db = request.result;
            console.log(`Database upgrade event, oldVersion: ${event.oldVersion}, newVersion: ${(event.target as any).result.version}`);

            // 创建 URL 映射存储
            if (!db.objectStoreNames.contains(STORE_URL_MAPPING)) {
                const store = db.createObjectStore(STORE_URL_MAPPING, { keyPath: 'hash' });
                store.createIndex('path', 'path', { unique: false });
                console.log(`Store created: ${STORE_URL_MAPPING}`);
            }

            // 创建存档存储，使用id作为键但不自动递增（将由代码生成随机ID）
            if (!db.objectStoreNames.contains(STORE_ARCHIVES)) {
                const store = db.createObjectStore(STORE_ARCHIVES, { keyPath: 'id' });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                console.log(`Store created: ${STORE_ARCHIVES}`);
            }

            // 创建自定义模板存储
            if (!db.objectStoreNames.contains(STORE_CUSTOM_TEMPLATES)) {
                const store = db.createObjectStore(STORE_CUSTOM_TEMPLATES, { keyPath: 'id', autoIncrement: true });
                store.createIndex('templateName', 'templateName', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                console.log(`Store created: ${STORE_CUSTOM_TEMPLATES}`);
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};