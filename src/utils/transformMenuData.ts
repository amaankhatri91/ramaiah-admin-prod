import type { NavigationTree } from '@/@types/navigation'
import type { MenuItem } from '@/services/NavigationService'
import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'

/**
 * Transform API menu item to NavigationTree format
 */
export const transformMenuItemToNavigationTree = (item: MenuItem): NavigationTree => {
    const hasChildren = item.children && item.children.length > 0
    
    // Special handling for Home menu - ensure it has the correct path
    let path = item.url || ''
    if (item.title.toLowerCase() === 'home') {
        path = '/home'
    }
    
    return {
        key: `menu-${item.id}`,
        path: path,
        title: item.title,
        translateKey: `nav.${item.title.toLowerCase().replace(/\s+/g, '')}`,
        icon: getIconForMenuItem(item.title),
        type: hasChildren ? NAV_ITEM_TYPE_COLLAPSE : NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: hasChildren ? item.children.map(transformMenuItemToNavigationTree) : []
    }
}

/**
 * Get appropriate icon for menu item based on title
 */
const getIconForMenuItem = (title: string): string => {
    const titleLower = title.toLowerCase()
    
    if (titleLower.includes('home')) return 'home'
    if (titleLower.includes('about')) return 'user'
    if (titleLower.includes('specialt') || titleLower.includes('specialist')) return 'ourSpecialties'
    if (titleLower.includes('international')) return 'globe'
    if (titleLower.includes('career')) return 'briefcase'
    if (titleLower.includes('what') && titleLower.includes('new')) return 'lightbulb'
    if (titleLower.includes('contact')) return 'phone'
    if (titleLower.includes('menu')) return 'menu'
    
    return 'menu' // default icon
}

/**
 * Transform API response to NavigationTree array
 */
export const transformSidebarMenuData = (apiResponse: any): NavigationTree[] => {
    if (!apiResponse?.data || !Array.isArray(apiResponse.data)) {
        return []
    }
    
    // Find the sidebar menu (assuming it's the first one or has location 'sidebar')
    const sidebarMenu = apiResponse.data.find((menu: any) => 
        menu.location === 'sidebar' || menu.location === 'header'
    )
    
    if (!sidebarMenu?.items || !Array.isArray(sidebarMenu.items)) {
        return []
    }
    
    // Keep Menu dropdown as static
    const menuDropdown: NavigationTree = {
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
    }
    
    // Transform all dynamic menu items from API (including Home)
    const dynamicItems = sidebarMenu.items.map(transformMenuItemToNavigationTree)
    
    return [menuDropdown, ...dynamicItems]
}
