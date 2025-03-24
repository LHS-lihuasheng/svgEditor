/**
 * @description SVG标签属性库
 */
import { createProperty, propertyStorage } from './types';

// SVG标签属性库
export const SVG_PROPERTY: propertyStorage = {
    attributes: {
        id: createProperty('string', 'ID', {
            defaultValue: '',
            description: '元素唯一标识符',
            placeholder: '输入标识符',
            showLabel: true
        }),

        viewBox: createProperty('quadValue', 'ViewBox', {
            defaultValue: { x: 0, y: 0, width: 1080, height: 1920 },
            description: 'SVG视图区域定义',
            fieldConfig: [
                { key: 'x', label: 'x', defaultValue: 0, min: -9999, max: 9999, step: 1, width: '100%' },
                { key: 'y', label: 'y', defaultValue: 0, min: -9999, max: 9999, step: 1, width: '100%' },
                { key: 'width', label: '宽度', defaultValue: 1080, min: 1, max: 9999, step: 1, width: '100%' },
                { key: 'height', label: '高度', defaultValue: 1920, min: 1, max: 9999, step: 1, width: '100%' }
            ],
            layout: 'grid',
            gridCols: 2,
            groupLabel: 'SVG视图区域'
        }),

        xmlns: createProperty('string', 'XML Namespace', {
            defaultValue: 'http://www.w3.org/2000/svg',
            description: 'SVG命名空间',
            placeholder: 'http://www.w3.org/2000/svg'
        }),

        version: createProperty('string', 'SVG Version', {
            defaultValue: '1.1',
            description: 'SVG版本',
            placeholder: '1.1'
        }),
    },
    style: {
        width: createProperty('string', 'Width', {
            defaultValue: '100%',
            description: '元素宽度',
            placeholder: '例如: 100%, 800px'
        }),

        height: createProperty('string', 'Height', {
            defaultValue: '100%',
            description: '元素高度',
            placeholder: '例如: 100%, 600px'
        }),

        display: createProperty('select', 'Display', {
            defaultValue: 'inline-block',
            description: '显示类型',
            options: [
                { label: 'Block', value: 'block' },
                { label: 'Inline Block', value: 'inline-block' },
                { label: 'Flex', value: 'flex' },
                { label: 'None', value: 'none' }
            ],
            placeholder: '选择显示类型'
        }),

        overflow: createProperty('select', 'Overflow', {
            defaultValue: 'visible',
            options: [
                { label: 'Visible', value: 'visible' },
                { label: 'Hidden', value: 'hidden' },
                { label: 'Scroll', value: 'scroll' },
                { label: 'Auto', value: 'auto' }
            ],
            description: '溢出处理方式',
            placeholder: '选择溢出处理方式'
        }),

        opacity: createProperty('slider', 'Opacity', {
            defaultValue: 1,
            min: 0,
            max: 1,
            step: 0.01,
            description: '透明度',
            inputWidth: '60px'
        }),

        backgroundColor: createProperty('color', 'Background Color', {
            defaultValue: 'transparent',
            description: '背景颜色'
        }),

        backgroundImage: createProperty('image', 'Background Image', {
            defaultValue: '',
            description: '背景图片',
        }),

        backgroundSize: createProperty('select', 'Background Size', {
            defaultValue: 'cover',
            description: '背景尺寸',
            options: [
                { label: 'Cover', value: 'cover' },
                { label: 'Contain', value: 'contain' },
                { label: '100%', value: '100%' },
                { label: '100% auto', value: '100% auto' },
                { label: 'Auto', value: 'auto' }
            ]
        }),

        backgroundRepeat: createProperty('select', 'Background Repeat', {
            defaultValue: 'no-repeat',
            description: '背景重复方式',
            options: [
                { label: 'No Repeat', value: 'no-repeat' },
                { label: 'Repeat', value: 'repeat' },
                { label: 'Repeat-X', value: 'repeat-x' },
                { label: 'Repeat-Y', value: 'repeat-y' }
            ]
        }),

        backgroundPosition: createProperty('select', 'Background Position', {
            defaultValue: 'center center',
            description: '背景位置',
            options: [
                { label: 'Center', value: 'center center' },
                { label: 'Top', value: 'center top' },
                { label: 'Bottom', value: 'center bottom' },
                { label: 'Left', value: 'left center' },
                { label: 'Right', value: 'right center' }
            ]
        }),

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

        position: createProperty('select', 'Position', {
            defaultValue: 'static',
            description: '定位方式',
            options: [
                { label: 'Static', value: 'static' },
                { label: 'Relative', value: 'relative' },
                { label: 'Absolute', value: 'absolute' },
                { label: 'Fixed', value: 'fixed' }
            ]
        }),

        zIndex: createProperty('number', 'Z-Index', {
            defaultValue: 0,
            min: -999,
            max: 999,
            step: 1,
            description: '层叠顺序'
        }),

        pointerEvents: createProperty('select', 'Pointer Events', {
            defaultValue: 'none',
            description: '指针事件响应方式',
            options: [
                { label: 'None', value: 'none' },
                { label: 'Visible', value: 'visible' },
                { label: 'Painted', value: 'painted' },
                { label: 'VisiblePainted', value: 'visiblePainted' },
                { label: 'All', value: 'all' },
                { label: 'Fill', value: 'fill' },
                { label: 'Stroke', value: 'stroke' }
            ]
        }),

        // transform: createProperty('string', 'CSS Transform', {
        //     defaultValue: 'scale(1)'
        // }),

        transformOrigin: createProperty('string', 'Transform Origin', {
            defaultValue: 'center center',
            description: '变换原点',
            placeholder: '例如: center center, 50% 50%'
        }),
    }
}; 