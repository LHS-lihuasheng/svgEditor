import { BaseComponentTemplate } from '@/types/component';

export const FO_PICTURE_TEMPLATE: BaseComponentTemplate = {
    templateName: 'FO 图片',
    description: 'g{fo{svg}}',
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