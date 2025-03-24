import type { propertyConfig } from '@/types';

type ControlRegistry = {
  [key: string]: React.ComponentType<any>;
};

const standardControls: ControlRegistry = {};

import { StringControl } from './basic/StringControl';
import { NumberControl } from './basic/NumberControl';
import { ColorControl } from './basic/ColorControl';
import { SelectControl } from './basic/SelectControl';
import { SliderWithInput } from './basic/SliderWithInput';
import { MultiValueControl } from './basic/MultiValueControl';
import { ImageControl } from './special/ImageControl';
import { TriggerControl } from './animation/TriggerControl';
import { RepeatCountControl } from './animation/RepeatCountControl';
import { TransformTypeControl } from './animation/TransformTypeControl';

// 注册所有标准控件
standardControls['string'] = StringControl;
standardControls['number'] = NumberControl;
standardControls['color'] = ColorControl;
standardControls['select'] = SelectControl;
standardControls['slider'] = SliderWithInput;
standardControls['quadValue'] = MultiValueControl;
standardControls['image'] = ImageControl;
standardControls['trigger'] = TriggerControl;
standardControls['repeatCount'] = RepeatCountControl;
standardControls['transform'] = TransformTypeControl;

// 查找属性对应的控件
export function findControlForProperty(propertyConfig: propertyConfig): React.ComponentType<any> | null {
  return propertyConfig.controlType && standardControls[propertyConfig.controlType] || null;
}