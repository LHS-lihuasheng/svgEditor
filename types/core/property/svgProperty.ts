/**
 * @description SVG标签属性库
 */
import { createPropertyControl, PropertyControl } from './utils';

// SVG标签属性库
export const SVG_PROPERTY: Record<string, PropertyControl> = {
    viewBox: createPropertyControl('attributes.viewBox', 'quadValue', 'ViewBox', {
        defaultValue: { x: 0, y: 0, width: 1080, height: 1920 },
        fieldConfig: [
            { key: 'x', label: 'x', defaultValue: 0 },
            { key: 'y', label: 'y', defaultValue: 0 },
            { key: 'width', label: '宽度', defaultValue: 1080 },
            { key: 'height', label: '高度', defaultValue: 1920 }
        ],
        isFixed: true
    }),

    xmlns: createPropertyControl('attributes.xmlns', 'string', 'XML Namespace', {
        defaultValue: 'http://www.w3.org/2000/svg'
    }),

    version: createPropertyControl('attributes.version', 'string', 'SVG Version', {
        defaultValue: '1.1'
    }),

    width: createPropertyControl('style.width', 'string', 'Width', {
        defaultValue: '100%'
    }),

    height: createPropertyControl('style.height', 'string', 'Height', {
        defaultValue: '100%'
    }),

    display: createPropertyControl('style.display', 'select', 'Display', {
        defaultValue: 'inline-block',
        options: [
            { label: 'Block', value: 'block' },
            { label: 'Inline Block', value: 'inline-block' },
            { label: 'Flex', value: 'flex' },
            { label: 'None', value: 'none' }
        ]
    }),

    overflow: createPropertyControl('style.overflow', 'select', 'Overflow', {
        defaultValue: 'visible',
        options: [
            { label: 'Visible', value: 'visible' },
            { label: 'Hidden', value: 'hidden' },
            { label: 'Scroll', value: 'scroll' },
            { label: 'Auto', value: 'auto' }
        ]
    }),

    opacity: createPropertyControl('style.opacity', 'slider', 'Opacity', {
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.01
    }),

    backgroundColor: createPropertyControl('style.backgroundColor', 'color', 'Background Color', {
        defaultValue: 'transparent'
    }),

    backgroundImage: createPropertyControl('style.backgroundImage', 'image', 'Background Image', {
        defaultValue: ''
    }),

    backgroundSize: createPropertyControl('style.backgroundSize', 'select', 'Background Size', {
        defaultValue: 'cover',
        options: [
            { label: 'Cover', value: 'cover' },
            { label: 'Contain', value: 'contain' },
            { label: '100%', value: '100%' },
            { label: '100% auto', value: '100% auto' },
            { label: 'Auto', value: 'auto' }
        ]
    }),

    backgroundRepeat: createPropertyControl('style.backgroundRepeat', 'select', 'Background Repeat', {
        defaultValue: 'no-repeat',
        options: [
            { label: 'No Repeat', value: 'no-repeat' },
            { label: 'Repeat', value: 'repeat' },
            { label: 'Repeat-X', value: 'repeat-x' },
            { label: 'Repeat-Y', value: 'repeat-y' }
        ]
    }),

    backgroundPosition: createPropertyControl('style.backgroundPosition', 'select', 'Background Position', {
        defaultValue: 'center center',
        options: [
            { label: 'Center', value: 'center center' },
            { label: 'Top', value: 'center top' },
            { label: 'Bottom', value: 'center bottom' },
            { label: 'Left', value: 'left center' },
            { label: 'Right', value: 'right center' }
        ]
    }),

    margin: createPropertyControl('style.margin', 'quadValue', 'Margin', {
        defaultValue: { top: 0, right: 0, bottom: 0, left: 0 },
        fieldConfig: [
            { key: 'top', label: '上', defaultValue: 0 },
            { key: 'right', label: '右', defaultValue: 0 },
            { key: 'bottom', label: '下', defaultValue: 0 },
            { key: 'left', label: '左', defaultValue: 0 }
        ]
    }),

    position: createPropertyControl('style.position', 'select', 'Position', {
        defaultValue: 'static',
        options: [
            { label: 'Static', value: 'static' },
            { label: 'Relative', value: 'relative' },
            { label: 'Absolute', value: 'absolute' },
            { label: 'Fixed', value: 'fixed' }
        ]
    }),

    zIndex: createPropertyControl('style.zIndex', 'number', 'Z-Index', {
        defaultValue: 0
    }),

    pointerEvents: createPropertyControl('style.pointerEvents', 'select', 'Pointer Events', {
        defaultValue: 'none',
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

    transform: createPropertyControl('style.transform', 'string', 'CSS Transform', {
        defaultValue: 'scale(1)'
    }),

    transformOrigin: createPropertyControl('style.transformOrigin', 'string', 'Transform Origin', {
        defaultValue: 'center center'
    }),
}; 