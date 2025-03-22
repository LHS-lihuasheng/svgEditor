"use client"

import { useMemo } from "react";

interface KeyframesSplinePreviewProps {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}

export function KeyframesSplinePreview({
  x1, y1, x2, y2
}: KeyframesSplinePreviewProps) {
  // 解析为数字
  const points = useMemo(() => {
    return {
      x1: parseFloat(x1) || 0,
      y1: parseFloat(y1) || 0,
      x2: parseFloat(x2) || 1,
      y2: parseFloat(y2) || 1,
    };
  }, [x1, y1, x2, y2]);

  // 生成曲线路径
  const curvePath = useMemo(() => {
    const { x1, y1, x2, y2 } = points;
    // 转换为SVG坐标系（y轴向下为正）
    return `M 0,100 C ${x1 * 100},${(1 - y1) * 100} ${x2 * 100},${(1 - y2) * 100} 100,0`;
  }, [points]);

  // 控制点连线
  const controlLines = useMemo(() => {
    const { x1, y1, x2, y2 } = points;
    return {
      line1: `M 0,100 L ${x1 * 100},${(1 - y1) * 100}`,
      line2: `M 100,0 L ${x2 * 100},${(1 - y2) * 100}`
    };
  }, [points]);

  return (
    <div className="w-full">
      <svg className="w-full" viewBox="0 0 100 100" height="80">
        {/* 背景网格 */}
        <rect width="100" height="100" fill="#f9fafb" />
        <path d="M 0 0 L 100 0" stroke="#e5e7eb" strokeWidth="0.5" />
        <path d="M 0 50 L 100 50" stroke="#e5e7eb" strokeWidth="0.5" />
        <path d="M 0 100 L 100 100" stroke="#e5e7eb" strokeWidth="0.5" />
        <path d="M 0 0 L 0 100" stroke="#e5e7eb" strokeWidth="0.5" />
        <path d="M 50 0 L 50 100" stroke="#e5e7eb" strokeWidth="0.5" />
        <path d="M 100 0 L 100 100" stroke="#e5e7eb" strokeWidth="0.5" />

        {/* 控制点连线 */}
        <path d={controlLines.line1} stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="2,2" />
        <path d={controlLines.line2} stroke="#d1d5db" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* 贝塞尔曲线 */}
        <path d={curvePath} stroke="#3b82f6" strokeWidth="2" fill="none" />

        {/* 控制点 */}
        <circle cx={points.x1 * 100} cy={(1 - points.y1) * 100} r="3" fill="#ef4444" />
        <circle cx={points.x2 * 100} cy={(1 - points.y2) * 100} r="3" fill="#ef4444" />

        {/* 起点和终点 */}
        <circle cx="0" cy="100" r="3" fill="#10b981" />
        <circle cx="100" cy="0" r="3" fill="#10b981" />
      </svg>

      <div className="text-xs text-center text-gray-500 mt-1">
        贝塞尔曲线: {`cubic-bezier(${points.x1}, ${points.y1}, ${points.x2}, ${points.y2})`}
      </div>
    </div>
  );
} 