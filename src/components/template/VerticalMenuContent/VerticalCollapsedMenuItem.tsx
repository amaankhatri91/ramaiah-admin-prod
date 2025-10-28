import Menu from '@/components/ui/Menu'
import Dropdown from '@/components/ui/Dropdown'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import { Link, useNavigate } from 'react-router-dom'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Trans } from 'react-i18next'
import NavigationService from '@/services/NavigationService'
import { useAppDispatch } from '@/store'
import { setChildrenMenuData, clearChildrenMenuData } from '@/store/slices/base'
import type { CommonProps } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

interface DefaultItemProps extends CommonProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    userAuthority: string[]
    sideCollapsed?: boolean
}

interface CollapsedItemProps extends DefaultItemProps {
    direction: Direction
    sideCollapsed?: boolean
}

interface VerticalCollapsedMenuItemProps extends CollapsedItemProps {
    sideCollapsed?: boolean
}

const { MenuItem, MenuCollapse } = Menu

const DefaultItem = ({ nav, onLinkClick, userAuthority, sideCollapsed }: DefaultItemProps) => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    
    // Function to handle children menu click and navigate to specific menu route
    const handleChildrenMenuClick = (menuId: number) => {
        // Navigate to the specific menu route with the menu ID
        navigate(`/menu/${menuId}`)
        console.log(menuId, 'menuIdeeeeeeeeeeeeeeeeeee')
    }
    const renderSubMenuItem = (subNav: NavigationTree) => {
        // If submenu has children, render as nested collapse
        if (subNav.subMenu && subNav.subMenu.length > 0) {
            return (
                <AuthorityCheck
                    key={subNav.key}
                    userAuthority={userAuthority}
                    authority={subNav.authority}
                >
                    <MenuCollapse
                        key={subNav.key}
                        label={
                            <span>
                                <Trans
                                    i18nKey={subNav.translateKey}
                                    defaults={subNav.title}
                                />
                            </span>
                        }
                        eventKey={subNav.key}
                        expanded={false}
                        className="mb-1"
                    >
                        {subNav.subMenu.map((grandChild) => renderSubMenuItem(grandChild))}
                    </MenuCollapse>
                </AuthorityCheck>
            )
        }
        
        // Regular menu item
        return (
            <AuthorityCheck
                key={subNav.key}
                userAuthority={userAuthority}
                authority={subNav.authority}
            >
                <MenuItem eventKey={subNav.key}>
                    {subNav.path ? (
                        <Link
                            className="h-full w-full flex items-center"
                            to={subNav.path}
                            onClick={(e) => {
                                onLinkClick?.({
                                    key: subNav.key,
                                    title: subNav.title,
                                    path: subNav.path,
                                })
                                
                                // Only prevent default and handle custom logic for dynamic menu items
                                // Extract menu ID from key (assuming format: menu-{id})
                                const menuId = subNav.key.replace('menu-', '')
                                const numericMenuId = parseInt(menuId, 10)
                                
                                // Special handling for Home menu - it should navigate to /home
                                if (subNav.title.toLowerCase() === 'home' && subNav.path === '/home') {
                                    // Let React Router handle Home navigation normally
                                    return
                                }
                                
                                // Special handling for International Patient Care - navigate to /international-patient
                                if (subNav.title.toLowerCase().includes('international patient care') && subNav.path === '/international-patient') {
                                    // Let React Router handle International Patient Care navigation normally
                                    return
                                }
                                
                                if (!isNaN(numericMenuId)) {
                                    e.preventDefault() // Prevent default link navigation only for dynamic menus
                                    handleChildrenMenuClick(numericMenuId)
                                }
                                // For static routes like header/footer/home, let React Router handle navigation
                            }}
                            target={subNav.isExternalLink ? '_blank' :  ''}
                        >
                            <span>
                                <Trans
                                    i18nKey={subNav.translateKey}
                                    defaults={subNav.title}
                                />
                            </span>
                        </Link>
                    ) : (
                        <span
                            className="cursor-pointer"
                            onClick={() => {
                                // Extract menu ID from key (assuming format: menu-{id})
                                const menuId = subNav.key.replace('menu-', '')
                                const numericMenuId = parseInt(menuId, 10)
                                if (!isNaN(numericMenuId)) {
                                    handleChildrenMenuClick(numericMenuId)
                                }
                            }}
                        >
                            <Trans
                                i18nKey={subNav.translateKey}
                                defaults={subNav.title}
                            />
                        </span>
                    )}
                </MenuItem>
            </AuthorityCheck>
        )
    }

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <MenuCollapse
                key={nav.key}
                label={
                    <>
                        <VerticalMenuIcon icon={nav.icon} gutter={sideCollapsed ? false : true} />
                        <span>
                            <Trans
                                i18nKey={nav.translateKey}
                                defaults={nav.title}
                            />
                        </span>
                    </>
                }
                eventKey={nav.key}
                expanded={false}
                className="mb-2"
            >
                {nav.subMenu.map((subNav) => renderSubMenuItem(subNav))}
            </MenuCollapse>
        </AuthorityCheck>
    )
}

const CollapsedItem = ({
    nav,
    onLinkClick,
    userAuthority,
    direction,
    sideCollapsed,
}: CollapsedItemProps) => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    
    // Function to handle children menu click and navigate to specific menu route
    const handleChildrenMenuClick = (menuId: number) => {
        // Navigate to the specific menu route with the menu ID
        navigate(`/menu/${menuId}`)
        console.log(menuId, 'menuId')
    }

    const menuItem = (
        <MenuItem key={nav.key} eventKey={nav.key} className="mb-2">
            <VerticalMenuIcon icon={nav.icon} gutter={sideCollapsed ? false : true} />
        </MenuItem>
    )

    const renderDropdownItem = (subNav: NavigationTree) => {
        // If submenu has children, render as nested dropdown
        if (subNav.subMenu && subNav.subMenu.length > 0) {
            return (
                <AuthorityCheck
                    key={subNav.key}
                    userAuthority={userAuthority}
                    authority={subNav.authority}
                >
                    <Dropdown
                        trigger="hover"
                        renderTitle={
                            <Dropdown.Item eventKey={subNav.key}>
                                <span>
                                    <Trans
                                        i18nKey={subNav.translateKey}
                                        defaults={subNav.title}
                                    />
                                </span>
                            </Dropdown.Item>
                        }
                        placement={
                            direction === 'rtl' ? 'middle-end-top' : 'middle-start-top'
                        }
                    >
                        {subNav.subMenu.map((grandChild) => renderDropdownItem(grandChild))}
                    </Dropdown>
                </AuthorityCheck>
            )
        }
        
        // Regular dropdown item
        return (
            <AuthorityCheck
                key={subNav.key}
                userAuthority={userAuthority}
                authority={subNav.authority}
            >
                <Dropdown.Item eventKey={subNav.key}>
                    {subNav.path ? (
                        <Link
                            className="h-full w-full flex items-center"
                            to={subNav.path}
                            onClick={(e) => {
                                onLinkClick?.({
                                    key: subNav.key,
                                    title: subNav.title,
                                    path: subNav.path,
                                })
                                
                                // Only prevent default and handle custom logic for dynamic menu items
                                // Extract menu ID from key (assuming format: menu-{id})
                                const menuId = subNav.key.replace('menu-', '')
                                const numericMenuId = parseInt(menuId, 10)
                                
                                // Special handling for Home menu - it should navigate to /home
                                if (subNav.title.toLowerCase() === 'home' && subNav.path === '/home') {
                                    // Let React Router handle Home navigation normally
                                    return
                                }
                                
                                // Special handling for International Patient Care - navigate to /international-patient
                                if (subNav.title.toLowerCase().includes('international patient care') && subNav.path === '/international-patient') {
                                    // Let React Router handle International Patient Care navigation normally
                                    return
                                }
                                
                                if (!isNaN(numericMenuId)) {
                                    e.preventDefault() // Prevent default link navigation only for dynamic menus
                                    handleChildrenMenuClick(numericMenuId)
                                }
                                // For static routes like header/footer/home, let React Router handle navigation
                            }}
                            target={subNav.isExternalLink ? '_blank' :  ''}
                        >
                            <span>
                                <Trans
                                    i18nKey={subNav.translateKey}
                                    defaults={subNav.title}
                                />
                            </span>
                        </Link>
                    ) : (
                        <span
                            className="cursor-pointer"
                            onClick={() => {
                                // Extract menu ID from key (assuming format: menu-{id})
                                const menuId = subNav.key.replace('menu-', '')
                                const numericMenuId = parseInt(menuId, 10)
                                if (!isNaN(numericMenuId)) {
                                    handleChildrenMenuClick(numericMenuId)
                                }
                            }}
                        >
                            <Trans
                                i18nKey={subNav.translateKey}
                                defaults={subNav.title}
                            />
                        </span>
                    )}
                </Dropdown.Item>
            </AuthorityCheck>
        )
    }

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <Dropdown
                trigger="hover"
                renderTitle={menuItem}
                placement={
                    direction === 'rtl' ? 'middle-end-top' : 'middle-start-top'
                }
            >
                {nav.subMenu.map((subNav) => renderDropdownItem(subNav))}
            </Dropdown>
        </AuthorityCheck>
    )
}

const VerticalCollapsedMenuItem = ({
    sideCollapsed,
    ...rest
}: VerticalCollapsedMenuItemProps) => {
    return sideCollapsed ? (
        <CollapsedItem {...rest} sideCollapsed={sideCollapsed} />
    ) : (
        <DefaultItem {...rest} sideCollapsed={sideCollapsed} />
    )
}

export default VerticalCollapsedMenuItem
