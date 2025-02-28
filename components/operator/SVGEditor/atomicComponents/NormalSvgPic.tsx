import React, { FC, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface NormalSvgPicProps {
  /**
   * 图片资源配置
   */
  image: {
    /**
     * 图片文件名（用于生成默认ID）
     * @example "7.png"
     */
    fileName: string;
    
    /**
     * 图片相对路径/URL
     * @example "./7.png"
     */
    path: string;
    
    /**
     * 原始图片宽度（单位：像素）
     * @minimum 1
     */
    naturalWidth: number;
    
    /**
     * 原始图片高度（单位：像素）
     * @minimum 1
     */
    naturalHeight: number;
  };

  /**
   * 视图配置
   */
  view?: {
    /**
     * 显示宽度（单位：像素）
     * @default 1080
     */
    displayWidth?: number;
    
    /**
     * 是否保持原始宽高比
     * @default true
     */
    preserveAspectRatio?: boolean;
  };

  /**
   * 样式扩展配置
   */
  style?: React.CSSProperties;

  /**
   * 标识符配置
   */
  identifiers?: {
    /**
     * 用户可见ID（默认使用文件名）
     */
    displayId?: string;
    
    /**
     * 是否生成唯一哈希ID
     * @default true
     */
    useHashId?: boolean;
  };
}

const NormalSvgPic: FC<NormalSvgPicProps> = ({
  image,
  view = {},
  style = {},
  identifiers = {}
}) => {
  // 合并默认配置
  const {
    displayWidth = 1080,
    preserveAspectRatio = true
  } = view;

  const {
    useHashId = true,
    displayId = image.fileName.replace(/\.[^/.]+$/, "") // 移除文件扩展名
  } = identifiers;

  // 计算视图高度
  const viewBoxHeight = useMemo(() => {
    const ratio = image.naturalHeight / image.naturalWidth;
    return preserveAspectRatio 
      ? (displayWidth * ratio).toFixed(2)
      : '100%';
  }, [image, displayWidth, preserveAspectRatio]);

  // 生成唯一ID系统
  const componentId = useMemo(() => {
    const baseId = displayId.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return useHashId ? `${baseId}-${uuidv4().slice(0,8)}` : baseId;
  }, [displayId, useHashId]);

  // 构建最终样式
  const combinedStyle = useMemo(() => ({
    backgroundImage: `url("${image.path}")`,
    lineHeight: 0,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    marginTop: '0px',
    ...style
  }), [image.path, style]);

  return (
    <svg
      id={componentId}
      style={combinedStyle}
      viewBox={`0 0 ${displayWidth} ${viewBoxHeight}`}
      preserveAspectRatio={preserveAspectRatio ? "xMidYMid meet" : "none"}
    />
  );
};

// 使用示例
const Example = () => (
  <NormalSvgPic
    image={{
      fileName: "7.png",
      path: "./7.png",
      naturalWidth: 1080,
      naturalHeight: 2755
    }}
    view={{
      displayWidth: 1200,
      preserveAspectRatio: true
    }}
    identifiers={{
      displayId: "custom-display-name",
      useHashId: false
    }}
    style={{
      border: "1px solid #eee"
    }}
  />
);