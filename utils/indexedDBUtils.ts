const DB_NAME = 'svgEditorDB';
const DB_VERSION = 2;
const STORE_NAME = 'uploadedImages';
const ARCHIVE_STORE_NAME = 'archivesStore';
const STORE_URL_MAPPING = 'url_mapping';
const STORE_ARCHIVES = 'archives';
const STORE_CUSTOM_TEMPLATES = 'custom_templates';

let db: IDBDatabase | null = null;

/**
 * 初始化 IndexedDB 数据库和对象存储空间
 */
export const initDB = async (): Promise<IDBDatabase> => {
    console.log('Initializing IndexedDB...');

    const db = await openDB();
    const existingStores = Array.from(db.objectStoreNames);
    let upgraded = false;

    db.close();

    // 检查并创建缺失的存储
    if (!existingStores.includes(STORE_URL_MAPPING)) {
        console.log(`Creating store: ${STORE_URL_MAPPING}`);
        upgraded = true;
    }

    if (!existingStores.includes(STORE_ARCHIVES)) {
        console.log(`Creating store: ${STORE_ARCHIVES}`);
        upgraded = true;
    }

    if (!existingStores.includes(STORE_CUSTOM_TEMPLATES)) {
        console.log(`Creating store: ${STORE_CUSTOM_TEMPLATES}`);
        upgraded = true;
    }

    if (upgraded) {
        console.log('Upgrading database...');
        // 需要升级数据库
        const newVersion = DB_VERSION + 1;
        const newDb = await openDB(newVersion);
        console.log(`Database upgraded to version ${newVersion}`);
        return newDb;
    } else {
        console.log('Database stores are all set.');
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
        const transaction = currentDb.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
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
        const transaction = currentDb.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
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

/**
 * 保存编辑器状态存档
 * @param name 存档名称 (通常为目录名)
 * @param data 存档数据 { components, selectedComponentId, rootDirectory }
 */
export const saveArchive = async (
    name: string,
    data: {
        components: any[],
        selectedComponentId: string | null,
        rootDirectory: FileSystemDirectoryHandle,
        directoryName?: string
    }
): Promise<number> => {
    if (!name || !data) {
        return Promise.reject('Missing name or data for archive');
    }

    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([ARCHIVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(ARCHIVE_STORE_NAME);

        // 使用目录名称作为directoryName，确保兼容性
        const directoryName = data.rootDirectory?.name || data.directoryName || name;

        const archiveRecord = {
            name: name,
            timestamp: Date.now(),
            directoryName,
            ...data,
            // 确保 rootDirectory 被正确保存
            rootDirectory: data.rootDirectory
        };

        const request = store.add(archiveRecord);
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log(`Archive '${name}' saved successfully with ID: ${request.result}`);
                resolve(request.result as number);
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
export const listArchives = async (): Promise<{ id: number, name: string, timestamp: number, directoryName?: string }[]> => {
    try {
        const currentDb = await initDB();
        const transaction = currentDb.transaction([ARCHIVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(ARCHIVE_STORE_NAME);
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
        const transaction = currentDb.transaction([ARCHIVE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(ARCHIVE_STORE_NAME);
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
        const transaction = currentDb.transaction([ARCHIVE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(ARCHIVE_STORE_NAME);
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

            // 创建存档存储
            if (!db.objectStoreNames.contains(STORE_ARCHIVES)) {
                const store = db.createObjectStore(STORE_ARCHIVES, { keyPath: 'id', autoIncrement: true });
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