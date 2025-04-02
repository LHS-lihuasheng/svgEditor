/**
 * 将 ArrayBuffer 转换为十六进制字符串。
 * @param {ArrayBuffer} buffer 要转换的 buffer。
 * @returns {string} 十六进制字符串表示。
 */
function bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

self.onmessage = async (event) => {
    const { file, relativePath } = event.data;

    if (!file || !relativePath) {
        self.postMessage({ error: '无效的数据', relativePath });
        return;
    }

    try {
        const buffer = await file.arrayBuffer();

        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);

        const hashHex = bufferToHex(hashBuffer);

        self.postMessage({ hash: hashHex, relativePath });

    } catch (error) {
        console.error(`[Worker] 计算 ${file.name} 的哈希时出错:`, error);
        self.postMessage({ error: error.message || '计算哈希失败', relativePath });
    }
};