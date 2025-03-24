"use client"

import { propertyConfig, PropertyControlType } from "@/types";
import { StringControl } from "./basic/StringControl";
import { NumberControl } from "./basic/NumberControl";
import { SelectControl } from "./basic/SelectControl";
import { ColorControl } from "./basic/ColorControl";
import { SliderWithInput } from "./basic/SliderWithInput";
import { MultiValueControl } from "./basic/MultiValueControl";
import { ImageControl } from "./special/ImageControl";
import { TriggerControl } from "./animation/TriggerControl";
import { RepeatCountControl } from "./animation/RepeatCountControl";
import { TransformTypeControl } from './animation/TransformTypeControl';

// 控件类型到组件的映射
const CONTROL_MAP = {
  'string': StringControl,
  'number': NumberControl,
  'boolean': null, // 待实现
  'select': SelectControl,
  'color': ColorControl,
  'slider': SliderWithInput,
  'quadValue': MultiValueControl,
  'image': ImageControl,
  'trigger': TriggerControl,
  'repeatCount': RepeatCountControl,
  'transform': TransformTypeControl
};

// 根据属性配置查找对应的控件组件
export function findControlForProperty(config: propertyConfig) {
  if (!config || !config.controlType) {
    console.error('无效的属性配置', config);
    return null;
  }

  const controlType = config.controlType as PropertyControlType;
  return CONTROL_MAP[controlType] || null;
}