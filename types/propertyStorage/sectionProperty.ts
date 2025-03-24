/**
 * @description Section标签属性库
 * 用于定义Section元素的属性和样式配置
 */
import { createProperty, propertyStorage } from './types';

// Section标签属性库
export const SECTION_PROPERTY: propertyStorage = {
    attributes: {
        id: createProperty('string', 'ID', {
            defaultValue: '',
            description: '元素唯一标识符',
            placeholder: '输入标识符'
        })
    },
    style: {
        // 尺寸与位置
        width: createProperty('string', 'Width', {
            defaultValue: '100%',
            description: '元素宽度',
            placeholder: '例如: 100%, 200px'
        }),

        height: createProperty('string', 'Height', {
            defaultValue: 'auto',
            description: '元素高度',
            placeholder: '例如: auto, 300px'
        }),

        // 外边距
        margin: createProperty('quadValue', 'Margin', {
            defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
            description: '外边距设置',
            fieldConfig: [
                { key: 'top', label: '上', defaultValue: 0, min: 0, max: 999, step: 1, width: '100%' },
                { key: 'right', label: '右', defaultValue: 0, min: 0, max: 999, step: 1, width: '100%' },
                { key: 'bottom', label: '下', defaultValue: 0, min: 0, max: 999, step: 1, width: '100%' },
                { key: 'left', label: '左', defaultValue: 0, min: 0, max: 999, step: 1, width: '100%' }
            ]
        }),

        // 内边距
        padding: createProperty('quadValue', 'Padding', {
            defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
            description: '内边距设置',
            fieldConfig: [
                { key: 'top', label: '上', defaultValue: 0, min: 0, max: 999, step: 1, width: '100%' },
                { key: 'right', label: '右', defaultValue: 0, min: 0, max: 999, step: 1, width: '100%' },
                { key: 'bottom', label: '下', defaultValue: 0, min: 0, max: 999, step: 1, width: '100%' },
                { key: 'left', label: '左', defaultValue: 0, min: 0, max: 999, step: 1, width: '100%' }
            ]
        }),

        // 显示与布局
        display: createProperty('select', 'Display', {
            defaultValue: 'block',
            description: '显示类型',
            options: [
                { label: 'Block', value: 'block' },
                { label: 'Flex', value: 'flex' },
                { label: 'Inline', value: 'inline' },
                { label: 'Inline Block', value: 'inline-block' },
                { label: 'None', value: 'none' }
            ]
        }),

        flexDirection: createProperty('select', 'Flex Direction', {
            defaultValue: 'row',
            description: 'Flex布局方向',
            options: [
                { label: 'Row', value: 'row' },
                { label: 'Column', value: 'column' }
            ]
        }),

        justifyContent: createProperty('select', 'Justify Content', {
            defaultValue: 'flex-start',
            description: '主轴对齐方式',
            options: [
                { label: 'Flex Start', value: 'flex-start' },
                { label: 'Flex End', value: 'flex-end' },
                { label: 'Center', value: 'center' },
                { label: 'Space Between', value: 'space-between' },
                { label: 'Space Around', value: 'space-around' }
            ]
        }),

        alignItems: createProperty('select', 'Align Items', {
            defaultValue: 'stretch',
            description: '交叉轴对齐方式',
            options: [
                { label: 'Flex Start', value: 'flex-start' },
                { label: 'Flex End', value: 'flex-end' },
                { label: 'Center', value: 'center' },
                { label: 'Baseline', value: 'baseline' },
                { label: 'Stretch', value: 'stretch' }
            ]
        }),

        textAlign: createProperty('select', 'Text Align', {
            defaultValue: 'center',
            description: '文本对齐方式',
            options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
                { label: 'Justify', value: 'justify' }
            ]
        }),

        lineHeight: createProperty('string', 'Line Height', {
            defaultValue: '0',
            description: '行高',
            placeholder: '例如: 1.5, 24px'
        }),

        overflow: createProperty('select', 'Overflow', {
            defaultValue: 'hidden',
            description: '内容溢出处理方式',
            options: [
                { label: 'Visible', value: 'visible' },
                { label: 'Hidden', value: 'hidden' },
                { label: 'Scroll', value: 'scroll' },
                { label: 'Auto', value: 'auto' }
            ]
        }),

        // 背景
        backgroundColor: createProperty('color', 'Background Color', {
            defaultValue: 'transparent',
            description: '背景颜色'
        }),

        backgroundImage: createProperty('image', 'Background Image', {
            defaultValue: 'none',
            description: '背景图片',
            acceptTypes: 'image/*'
        }),

        backgroundSize: createProperty('select', 'Background Size', {
            defaultValue: 'cover',
            description: '背景尺寸',
            options: [
                { label: 'Auto', value: 'auto' },
                { label: 'Cover', value: 'cover' },
                { label: 'Contain', value: 'contain' },
                { label: '100%', value: '100%' },
                { label: '100% Auto', value: '100% auto' }
            ]
        }),

        backgroundRepeat: createProperty('select', 'Background Repeat', {
            defaultValue: 'no-repeat',
            description: '背景重复方式',
            options: [
                { label: 'No Repeat', value: 'no-repeat' },
                { label: 'Repeat', value: 'repeat' },
                { label: 'Repeat X', value: 'repeat-x' },
                { label: 'Repeat Y', value: 'repeat-y' }
            ]
        }),

        backgroundPosition: createProperty('string', 'Background Position', {
            defaultValue: 'center',
            description: '背景位置',
            placeholder: '例如: center, top left'
        }),

        // 交互
        pointerEvents: createProperty('select', 'Pointer Events', {
            defaultValue: 'none',
            description: '指针事件响应方式',
            options: [
                { label: 'None', value: 'none' },
                { label: 'Auto', value: 'auto' }
            ]
        }),

        // 变换
        transform: createProperty('string', 'Transform', {
            defaultValue: 'none',
            description: 'CSS变换',
            placeholder: '例如: rotate(45deg), scale(1.5)'
        }),

        transformOrigin: createProperty('string', 'Transform Origin', {
            defaultValue: 'center center',
            description: '变换原点',
            placeholder: '例如: center center, top left'
        }),

        zIndex: createProperty('number', 'Z-Index', {
            defaultValue: 0,
            min: -999,
            max: 999,
            step: 1,
            description: '层叠顺序'
        }),

        opacity: createProperty('slider', 'Opacity', {
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.01,
            description: '元素透明度'
        }),

        // 位置
        position: createProperty('select', 'Position', {
            defaultValue: 'relative',
            description: '定位方式',
            options: [
                { label: 'Static', value: 'static' },
                { label: 'Relative', value: 'relative' },
                { label: 'Absolute', value: 'absolute' },
                { label: 'Fixed', value: 'fixed' }
            ]
        }),

        // 边框
        border: createProperty('string', 'Border', {
            defaultValue: 'none',
            description: '边框样式',
            placeholder: '例如: 1px solid black'
        }),

        borderRadius: createProperty('string', 'Border Radius', {
            defaultValue: '0',
            description: '边框圆角',
            placeholder: '例如: 5px, 50%'
        })
    }
};
