"use client"

import { useEffect, useRef, useMemo } from "react";

interface KeyframesSplinePreviewProps {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  width?: number;
  height?: number;
}

export function KeyframesSplinePreview({
  x1, y1, x2, y2,
  width = 100,
  height = 60
}: KeyframesSplinePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 添加参数引用以跟踪当前渲染的参数
  const paramsRef = useRef({ x1, y1, x2, y2 });

  // 使用useMemo缓存解析后的参数
  const splineParams = useMemo(() => ({
    x1Value: parseFloat(x1) || 0,
    y1Value: parseFloat(y1) || 0,
    x2Value: parseFloat(x2) || 1,
    y2Value: parseFloat(y2) || 1
  }), [x1, y1, x2, y2]);

  // 立即更新参数引用
  useEffect(() => {
    paramsRef.current = { x1, y1, x2, y2 };
  }, [x1, y1, x2, y2]);

  // 绘制函数 - 提取为单独函数便于复用
  const drawSpline = (
    ctx: CanvasRenderingContext2D,
    params: { x1Value: number, y1Value: number, x2Value: number, y2Value: number }
  ) => {
    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 绘制参考网格
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;

    // 水平线
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, 0);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.stroke();

    // 垂直线
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(width, height);
    ctx.stroke();

    // 绘制贝塞尔曲线
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.bezierCurveTo(
      params.x1Value * width, height - params.y1Value * height,
      params.x2Value * width, height - params.y2Value * height,
      width, 0
    );
    ctx.stroke();

    // 绘制控制点
    ctx.fillStyle = '#ef4444';

    // 起点
    ctx.beginPath();
    ctx.arc(0, height, 3, 0, Math.PI * 2);
    ctx.fill();

    // 终点
    ctx.beginPath();
    ctx.arc(width, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    // 控制点1
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(params.x1Value * width, height - params.y1Value * height, 3, 0, Math.PI * 2);
    ctx.fill();

    // 控制点2
    ctx.beginPath();
    ctx.arc(params.x2Value * width, height - params.y2Value * height, 3, 0, Math.PI * 2);
    ctx.fill();

    // 控制线
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(params.x1Value * width, height - params.y1Value * height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(params.x2Value * width, height - params.y2Value * height);
    ctx.stroke();

    ctx.setLineDash([]);
  };

  // 更新canvas绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除任何现有的动画帧
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // 立即绘制当前状态，不依赖动画帧，避免闪回
    drawSpline(ctx, splineParams);

    // 使用requestAnimationFrame作为备份确保绘制完成
    const drawFrame = () => {
      // 检查当前参数是否与最新请求的参数一致
      const currentParams = paramsRef.current;
      if (
        currentParams.x1 === x1 &&
        currentParams.y1 === y1 &&
        currentParams.x2 === x2 &&
        currentParams.y2 === y2
      ) {
        drawSpline(ctx, splineParams);
      }
      // 不再请求下一帧，避免无限循环
    };

    // 存储动画帧ID以便清理
    animationFrameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [splineParams, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-slate-200 rounded"
    />
  );
} 