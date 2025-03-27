import { BaseComponentTemplate } from '@/types/component';

export const FO_SVG_TEMPLATE: BaseComponentTemplate = {
    templateName: 'FO SVG',
    description: 'g+fo+svg',
    component: [{
        id: '',
        type: 'g',
        attributes: {
            id: '',
            transform: {
                translate: { x: 0, y: 0 },
                scale: 1,
                rotate: 0
            },
            visibility: 'visible'
        },
        style: {
            opacity: 1
        },
        fixedProperties: [
            'attributes.id'
        ],
        children: [{
            id: '',
            type: 'foreignObject',
            attributes: {
                id: '',
                x: 0,
                y: 0,
                width: '100%',
                height: '100%'
            },
            fixedProperties: [
                'attributes.id',
                'attributes.x',
                'attributes.y',
                'attributes.width',
                'attributes.height'
            ],
            children: [{
                id: '',
                type: 'svg',
                attributes: {
                    id: '',
                    viewBox: {
                        x: 0,
                        y: 0,
                        width: 1080,
                        height: 1920
                    }
                },
                style: {
                    backgroundSize: 'cover',
                    margin: { top: 0, right: 0, bottom: 0, left: 0 },
                    backgroundColor: 'transparent'
                },
                fixedProperties: [
                    'attributes.id',
                    'attributes.viewBox'
                ],
                children: []
            }]
        }]
    }]
};


// export const FO_SVG_TEMPLATE: BaseComponentTemplate = {
//     label: 'SVG图片',
//     icon: '🖼️',
//     description: 'SVG图片容器，可设置背景图和样式',
//     defaultProperties: {
//         attributes: {
//             id: '',
//             viewBox: {
//                 x: 0,
//                 y: 0,
//                 width: 1080,
//                 height: 1920
//             },
//         },
//         style: {
//             backgroundSize: 'cover',
//             margin: { top: 0, right: 0, bottom: 0, left: 0 },
//             backgroundColor: 'transparent'
//         }
//     },
//     fixedProperties: [
//         'attributes.id',
//         'attributes.viewBox'
//     ],
//     propertyStorageName: 'SVG'
// };