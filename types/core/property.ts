/**
 * @description 属性控制相关类型定义
 */

// 属性控制器类型
export interface PropertyControl {
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'image' | 'opacity' | 'viewbox' | 'margin';
  label: string;
  property: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  isDefault?: boolean; // 标记是否为预定属性(默认就有但可删除)
  isFixed?: boolean;   // 标记是否为固定属性(不可删除)
  isOptional?: boolean; // 标记是否为可选属性(可添加)
  category?: string;    // 属性分类，如"尺寸"、"样式"等
}

// 属性选项定义
export interface PropertyOption {
  label: string;
  value: any;
}

// SVG属性库 - 包含所有可能用到的SVG属性
export const SVG_CONTROLS = {
  // 基础属性
  x: {
    type: 'number',
    label: 'X坐标',
    property: 'attributes.x',
    defaultValue: 0,
    category: '位置',
    isOptional: true
  } as PropertyControl,

  y: {
    type: 'number',
    label: 'Y坐标',
    property: 'attributes.y',
    defaultValue: 0,
    category: '位置',
    isOptional: true
  } as PropertyControl,

  width: {
    type: 'string',
    label: '宽度',
    property: 'attributes.width',
    defaultValue: '100%',
    category: '尺寸',
    isOptional: true
  } as PropertyControl,

  height: {
    type: 'string',
    label: '高度',
    property: 'attributes.height',
    defaultValue: '100%',
    category: '尺寸',
    isOptional: true
  } as PropertyControl,

  // 视图属性
  viewBox: {
    type: 'viewbox',
    label: '视图框',
    property: 'viewBox',
    defaultValue: { x: 0, y: 0, width: 0, height: 0 },
    category: '视图',
    isOptional: true
  } as PropertyControl,

  // 样式属性
  fill: {
    type: 'color',
    label: '填充颜色',
    property: 'style.fill',
    defaultValue: 'none',
    category: '样式',
    isOptional: true
  } as PropertyControl,

  stroke: {
    type: 'color',
    label: '描边颜色',
    property: 'style.stroke',
    defaultValue: 'black',
    category: '样式',
    isOptional: true
  } as PropertyControl,

  strokeWidth: {
    type: 'number',
    label: '描边宽度',
    property: 'style.strokeWidth',
    defaultValue: 1,
    min: 0,
    category: '样式',
    isOptional: true
  } as PropertyControl,

  opacity: {
    type: 'opacity',
    label: '不透明度',
    property: 'style.opacity',
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 1,
    category: '样式',
    isOptional: true
  } as PropertyControl,

  backgroundColor: {
    type: 'color',
    label: '背景颜色',
    property: 'style.backgroundColor',
    defaultValue: 'transparent',
    category: '样式',
    isOptional: true
  } as PropertyControl,

  // 背景图片相关
  backgroundImage: {
    type: 'image',
    label: '背景图片',
    property: 'style.backgroundImage',
    defaultValue: '',
    category: '背景',
    isOptional: true
  } as PropertyControl,

  backgroundSize: {
    type: 'select',
    label: '背景大小',
    property: 'style.backgroundSize',
    options: [
      { label: 'cover', value: 'cover' },
      { label: 'contain', value: 'contain' },
      { label: '100%', value: '100% 100%' }
    ],
    defaultValue: 'cover',
    category: '背景',
    isOptional: true
  } as PropertyControl,

  backgroundRepeat: {
    type: 'select',
    label: '背景重复',
    property: 'style.backgroundRepeat',
    options: [
      { label: 'no-repeat', value: 'no-repeat' },
      { label: 'repeat', value: 'repeat' },
      { label: 'repeat-x', value: 'repeat-x' },
      { label: 'repeat-y', value: 'repeat-y' }
    ],
    defaultValue: 'no-repeat',
    category: '背景',
    isOptional: true
  } as PropertyControl,

  // 边距相关
  margin: {
    type: 'margin',
    label: '边距',
    property: 'style.margin',
    defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
    category: '布局',
    isOptional: true
  } as PropertyControl,

  // 交互属性
  pointerEvents: {
    type: 'select',
    label: '鼠标事件',
    property: 'style.pointerEvents',
    options: [
      { label: 'visible', value: 'visible' },
      { label: 'none', value: 'none' },
      { label: 'visiblePainted', value: 'visiblePainted' }
    ],
    defaultValue: 'visible',
    category: '交互',
    isOptional: true
  } as PropertyControl,

  // 变换属性
  translateX: {
    type: 'number',
    label: '平移X',
    property: 'transform.translate.x',
    defaultValue: 0,
    category: '变换',
    isOptional: true
  } as PropertyControl,

  translateY: {
    type: 'number',
    label: '平移Y',
    property: 'transform.translate.y',
    defaultValue: 0,
    category: '变换',
    isOptional: true
  } as PropertyControl,

  scale: {
    type: 'number',
    label: '缩放',
    property: 'transform.scale',
    min: 0.1,
    max: 10,
    step: 0.1,
    defaultValue: 1,
    category: '变换',
    isOptional: true
  } as PropertyControl,

  rotate: {
    type: 'number',
    label: '旋转(度)',
    property: 'transform.rotate',
    min: 0,
    max: 360,
    defaultValue: 0,
    category: '变换',
    isOptional: true
  } as PropertyControl,

  // 动画属性
  animateAttribute: {
    type: 'select',
    label: '目标属性',
    property: 'attributes.attributeName',
    options: [
      { label: 'opacity', value: 'opacity' },
      { label: 'x', value: 'x' },
      { label: 'y', value: 'y' },
      { label: 'width', value: 'width' },
      { label: 'height', value: 'height' },
      { label: 'fill', value: 'fill' },
      { label: 'stroke', value: 'stroke' }
    ],
    defaultValue: 'opacity',
    category: '动画',
    isOptional: true
  } as PropertyControl,

  from: {
    type: 'string',
    label: '起始值',
    property: 'attributes.from',
    defaultValue: '0',
    category: '动画',
    isOptional: true
  } as PropertyControl,

  to: {
    type: 'string',
    label: '结束值',
    property: 'attributes.to',
    defaultValue: '1',
    category: '动画',
    isOptional: true
  } as PropertyControl,

  dur: {
    type: 'string',
    label: '持续时间',
    property: 'attributes.dur',
    defaultValue: '1s',
    category: '动画',
    isOptional: true
  } as PropertyControl,

  repeatCount: {
    type: 'select',
    label: '重复次数',
    property: 'attributes.repeatCount',
    options: [
      { label: 'indefinite', value: 'indefinite' },
      { label: '1', value: '1' },
      { label: '2', value: '2' },
      { label: '3', value: '3' }
    ],
    defaultValue: '1',
    category: '动画',
    isOptional: true
  } as PropertyControl,

  begin: {
    type: 'select',
    label: '触发方式',
    property: 'attributes.begin',
    options: [
      { label: 'click', value: 'click' },
      { label: 'mouseover', value: 'mouseover' },
      { label: '0s', value: '0s' }
    ],
    defaultValue: 'click',
    category: '动画',
    isOptional: true
  } as PropertyControl,

  // 变换动画特有属性
  transformType: {
    type: 'select',
    label: '变换类型',
    property: 'attributes.type',
    options: [
      { label: 'rotate', value: 'rotate' },
      { label: 'scale', value: 'scale' },
      { label: 'translate', value: 'translate' },
      { label: 'skewX', value: 'skewX' },
      { label: 'skewY', value: 'skewY' }
    ],
    defaultValue: 'rotate',
    category: '动画',
    isOptional: true
  } as PropertyControl,

  additive: {
    type: 'select',
    label: '叠加方式',
    property: 'attributes.additive',
    options: [
      { label: 'sum', value: 'sum' },
      { label: 'replace', value: 'replace' }
    ],
    defaultValue: 'sum',
    category: '动画',
    isOptional: true
  } as PropertyControl
} as const; 