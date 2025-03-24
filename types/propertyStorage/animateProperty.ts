/**
 * @description Animate标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Animate标签属性库
export const ANIMATE_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      defaultValue: '',
      description: '元素唯一标识符',
      placeholder: '输入标识符'
    }),

    attributeName: createProperty('select', 'Target Attribute', {
      defaultValue: 'opacity',
      description: '要动画的目标属性',
      options: [
        { label: 'Opacity', value: 'opacity' },
        { label: 'X Position', value: 'x' },
        { label: 'Y Position', value: 'y' },
        { label: 'Width', value: 'width' },
        { label: 'Height', value: 'height' },
        { label: 'Fill', value: 'fill' },
        { label: 'Stroke', value: 'stroke' },
        { label: 'Transform', value: 'transform' }
      ],
      placeholder: '选择目标属性'
    }),

    from: createProperty('string', 'From Value', {
      defaultValue: '0',
      description: '动画起始值',
      placeholder: '输入起始值'
    }),

    to: createProperty('string', 'To Value', {
      defaultValue: '1',
      description: '动画结束值',
      placeholder: '输入结束值'
    }),

    by: createProperty('string', 'By Value', {
      defaultValue: '1',
      description: '相对变化量',
      placeholder: '输入变化量'
    }),

    values: createProperty('string', 'Values', {
      defaultValue: '',
      description: '多个关键帧值（分号分隔）',
      placeholder: '例如: 0;0.5;1'
    }),

    begin: createProperty('trigger', '触发方式', {
      defaultValue: '0s',
      description: '动画开始触发条件',
      options: [
        { label: "定时开始", value: "time" },
        { label: "Click", value: "click" },
        { label: "TouchStart", value: "touchstart" },
        { label: "TouchEnd", value: "touchend" }
      ]
    }),

    dur: createProperty('string', 'Duration', {
      defaultValue: '1s',
      description: '动画持续时间',
      placeholder: '例如: 1s, 500ms'
    }),

    repeatCount: createProperty('repeatCount', 'Repeat Count', {
      defaultValue: '1',
      description: '动画重复次数',
      options: [
        { label: 'Indefinite', value: 'indefinite' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '5', value: '5' },
        { label: '10', value: '10' }
      ]
    }),

    fill: createProperty('select', 'Fill Mode', {
      defaultValue: 'remove',
      description: '动画完成后效果',
      options: [
        { label: 'Freeze', value: 'freeze' },
        { label: 'Remove', value: 'remove' }
      ],
      placeholder: '选择完成效果'
    }),

    keyTimes: createProperty('string', 'Key Times', {
      defaultValue: '0;1',
      description: '关键时间点（与values对应）',
      placeholder: '例如: 0;0.5;1'
    }),

    keySplines: createProperty('string', 'Key Splines', {
      defaultValue: '0.42 0 0.58 1',
      description: '贝塞尔控制点（用于spline插值）',
      placeholder: '例如: 0.42 0 0.58 1'
    }),

    calcMode: createProperty('select', 'Calc Mode', {
      defaultValue: 'linear',
      description: '动画插值计算模式',
      options: [
        { label: 'Linear', value: 'linear' },
        { label: 'Discrete', value: 'discrete' },
        { label: 'Paced', value: 'paced' },
        { label: 'Spline', value: 'spline' }
      ],
      placeholder: '选择计算模式'
    }),

    restart: createProperty('select', 'Restart', {
      defaultValue: 'always',
      description: '动画重启行为',
      options: [
        { label: 'Always', value: 'always' },
        { label: 'When Not Active', value: 'whenNotActive' },
        { label: 'Never', value: 'never' }
      ],
      placeholder: '选择重启方式'
    })
  },
  style: {}
}; 