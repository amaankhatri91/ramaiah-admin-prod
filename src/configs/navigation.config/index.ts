import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import type { NavigationTree } from '@/@types/navigation'

// Static navigation config - only Menu dropdown
// Dynamic menu items (including Home) will be fetched from API and merged with this
const navigationConfig: NavigationTree[] = [
    {
        key: 'menu',
        path: '',
        title: 'Menu',
        translateKey: 'nav.menu',
        icon: 'menu',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'header',
                path: '/header',
                title: 'Header',
                translateKey: 'nav.header',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'footer',
                path: '/footer',
                title: 'Footer',
                translateKey: 'nav.footer',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'pageCreate',
                path: '/page-create',
                title: 'Page Create',
                translateKey: 'nav.pageCreate',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
