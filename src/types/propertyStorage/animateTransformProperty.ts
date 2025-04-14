/**
 * @description AnimateTransform标签属性库
 */
import { createProperty, propertyStorage } from './types';

// AnimateTransform标签属性库
export const ANIMATE_TRANSFORM_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      showLabel: true,
      defaultValue: '',
      description: '元素唯一标识符',
      placeholder: '输入标识符'
    }),

    attributeName: createProperty('string', 'Attribute Name', {
      showLabel: true,
      defaultValue: 'transform',
      description: '要变换的属性名称',
      placeholder: '通常为transform'
    }),

    type: createProperty('select', 'Transform Type', {
      showLabel: true,
      defaultValue: 'translate',
      description: '变换类型',
      options: [
        { label: 'Translate', value: 'translate' },
        { label: 'Scale', value: 'scale' },
        { label: 'Rotate', value: 'rotate' },
        { label: 'SkewX', value: 'skewX' },
        { label: 'SkewY', value: 'skewY' }
      ],
      placeholder: '选择变换类型'
    }),

    from: createProperty('string', 'From Value', {
      defaultValue: '0 0',
      description: '起始变换值',
      placeholder: '例如: 0 0'
    }),

    to: createProperty('string', 'To Value', {
      defaultValue: '10 0',
      description: '结束变换值',
      placeholder: '例如: 10 0'
    }),

    by: createProperty('string', 'By Value', {
      defaultValue: '10 0',
      description: '相对变换值',
      placeholder: '例如: 10 0'
    }),

    values: createProperty('string', 'Values', {
      defaultValue: '0 0;10 0;0 0',
      description: '多个变换关键帧值（分号分隔）',
      placeholder: '例如: 0 0;10 0;0 0'
    }),

    begin: createProperty('trigger', '触发方式', {
      showLabel: true,
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
      showLabel: true,
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
      defaultValue: 'freeze',
      description: '动画完成后效果',
      options: [
        { label: 'Freeze', value: 'freeze' },
        { label: 'Remove', value: 'remove' }
      ],
      placeholder: '选择完成效果'
    }),

    restart: createProperty('select', 'Restart', {
      defaultValue: 'always',
      description: '动画重启行为',
      options: [
        { label: 'Always', value: 'always' },
        { label: 'Never', value: 'never' },
        { label: 'When Not Active', value: 'whenNotActive' }
      ],
      placeholder: '选择重启方式'
    }),

    keyTimes: createProperty('string', 'Key Times', {
      defaultValue: '0;0.5;1',
      description: '关键时间点（与values对应）',
      placeholder: '例如: 0;0.5;1'
    }),

    keySplines: createProperty('string', 'Key Splines', {
      defaultValue: '0.42 0 0.58 1.0; 0.42 0 0.58 1.0',
      description: '贝塞尔控制点（用于spline插值）',
      placeholder: '例如: 0.42 0 0.58 1.0; 0.42 0 0.58 1.0'
    }),

    calcMode: createProperty('select', 'Calculation Mode', {
      defaultValue: 'spline',
      description: '动画插值计算模式',
      options: [
        { label: 'Spline', value: 'spline' },
        { label: 'Linear', value: 'linear' },
        { label: 'Discrete', value: 'discrete' },
        { label: 'Paced', value: 'paced' }
      ],
      placeholder: '选择计算模式'
    })
  },
  style: {}
}; 