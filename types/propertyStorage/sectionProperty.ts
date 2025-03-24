/**
 * @description Section标签属性库
 * 用于定义Section元素的属性和样式配置
 */
import { createProperty, propertyStorage } from './types';

// Section标签属性库
export const SECTION_PROPERTY: propertyStorage = {
    attributes: {
        id: createProperty('string', 'ID', {
            defaultValue: ''
        })
    },
    style: {
        // 尺寸与位置
        width: createProperty('string', 'Width', {
            defaultValue: '100%'
        }),
        height: createProperty('string', 'Height', {
            defaultValue: 'auto'
        }),

        // 外边距
        margin: createProperty('quadValue', 'Margin', {
            defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
            fieldConfig: [
                { key: 'top', label: '上', defaultValue: 0 },
                { key: 'right', label: '右', defaultValue: 0 },
                { key: 'bottom', label: '下', defaultValue: 0 },
                { key: 'left', label: '左', defaultValue: 0 }
            ]
        }),

        // 内边距
        padding: createProperty('quadValue', 'Padding', {
            defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
            fieldConfig: [
                { key: 'top', label: '上', defaultValue: 0 },
                { key: 'right', label: '右', defaultValue: 0 },
                { key: 'bottom', label: '下', defaultValue: 0 },
                { key: 'left', label: '左', defaultValue: 0 }
            ]
        }),

        // 显示与布局
        display: createProperty('select', 'Display', {
            defaultValue: 'block',
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
            options: [
                { label: 'Row', value: 'row' },
                { label: 'Column', value: 'column' }
            ]
        }),

        justifyContent: createProperty('select', 'Justify Content', {
            defaultValue: 'flex-start',
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
            options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
                { label: 'Justify', value: 'justify' }
            ]
        }),

        lineHeight: createProperty('string', 'Line Height', {
            defaultValue: '0'
        }),

        fontSize: createProperty('string', 'Font Size', {
            defaultValue: '0'
        }),

        overflow: createProperty('select', 'Overflow', {
            defaultValue: 'hidden',
            options: [
                { label: 'Visible', value: 'visible' },
                { label: 'Hidden', value: 'hidden' },
                { label: 'Scroll', value: 'scroll' },
                { label: 'Auto', value: 'auto' }
            ]
        }),

        // 背景
        backgroundColor: createProperty('color', 'Background Color', {
            defaultValue: 'transparent'
        }),

        backgroundImage: createProperty('image', 'Background Image', {
            defaultValue: 'none'
        }),

        backgroundSize: createProperty('select', 'Background Size', {
            defaultValue: 'cover',
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
            options: [
                { label: 'No Repeat', value: 'no-repeat' },
                { label: 'Repeat', value: 'repeat' },
                { label: 'Repeat X', value: 'repeat-x' },
                { label: 'Repeat Y', value: 'repeat-y' }
            ]
        }),

        backgroundPosition: createProperty('string', 'Background Position', {
            defaultValue: 'center'
        }),

        // 交互
        pointerEvents: createProperty('select', 'Pointer Events', {
            defaultValue: 'none',
            options: [
                { label: 'None', value: 'none' },
                { label: 'Auto', value: 'auto' }
            ]
        }),

        // 变换
        transform: createProperty('string', 'Transform', {
            defaultValue: 'none'
        }),

        transformOrigin: createProperty('string', 'Transform Origin', {
            defaultValue: 'center center'
        }),

        zIndex: createProperty('number', 'Z-Index', {
            defaultValue: 0,
            min: -999,
            max: 999,
            step: 1
        }),

        opacity: createProperty('slider', 'Opacity', {
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.01
        }),

        // 位置
        position: createProperty('select', 'Position', {
            defaultValue: 'relative',
            options: [
                { label: 'Static', value: 'static' },
                { label: 'Relative', value: 'relative' },
                { label: 'Absolute', value: 'absolute' },
                { label: 'Fixed', value: 'fixed' }
            ]
        }),

        // 边框
        border: createProperty('string', 'Border', {
            defaultValue: 'none'
        }),

        borderRadius: createProperty('string', 'Border Radius', {
            defaultValue: '0'
        })
    }
};
