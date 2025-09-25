import Tooltip from '@/components/ui/Tooltip'
import Menu from '@/components/ui/Menu'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import VerticalMenuIcon from './VerticalMenuIcon'
import { Link, useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import NavigationService from '@/services/NavigationService'
import { useAppDispatch } from '@/store'
import { setChildrenMenuData, clearChildrenMenuData } from '@/store/slices/base'
import type { CommonProps } from '@/@types/common'
import type { Direction } from '@/@types/theme'
import type { NavigationTree } from '@/@types/navigation'

const { MenuItem } = Menu

interface CollapsedItemProps extends CommonProps {
    title: string
    translateKey: string
    direction?: Direction
}

interface DefaultItemProps {
    nav: NavigationTree
    onLinkClick?: (link: { key: string; title: string; path: string }) => void
    sideCollapsed?: boolean
    userAuthority: string[]
}

interface VerticalMenuItemProps extends CollapsedItemProps, DefaultItemProps {}

const CollapsedItem = ({
    title,
    translateKey,
    children,
    direction,
}: CollapsedItemProps) => {
    const { t } = useTranslation()

    return (
        <Tooltip
            title={t(translateKey) || title}
            placement={direction === 'rtl' ? 'left' : 'right'}
        >
            {children}
        </Tooltip>
    )
}

const DefaultItem = (props: DefaultItemProps) => {
    const { nav, onLinkClick, sideCollapsed, userAuthority } = props
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    // Function to handle menu click and navigate to specific menu route
    const handleMenuClick = (menuId: number) => {
        // Navigate to the specific menu route with the menu ID
        navigate(`/menu/${menuId}`)
    }

    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            <MenuItem key={nav.key} eventKey={nav.key} className="mb-2">
                <Link
                    to={nav.path}
                    className="flex items-center h-full w-full"
                    onClick={(e) => {
                        onLinkClick?.({
                            key: nav.key,
                            title: nav.title,
                            path: nav.path,
                        })
                        
                        // Only prevent default and handle custom logic for dynamic menu items
                        // Extract menu ID from key (assuming format: menu-{id})
                        const menuId = nav.key.replace('menu-', '')
                        const numericMenuId = parseInt(menuId, 10)
                        
                        // Special handling for Home menu - it should navigate to /home
                        if (nav.title.toLowerCase() === 'home' && nav.path === '/home') {
                            // Let React Router handle Home navigation normally
                            return
                        }
                        
                        if (!isNaN(numericMenuId)) {
                            e.preventDefault() // Prevent default link navigation only for dynamic menus
                            handleMenuClick(numericMenuId)
                        }
                        // For static routes like header/footer/home, let React Router handle navigation
                    }}
                    target={nav.isExternalLink ? '_blank' :  ''}
                >
                    <VerticalMenuIcon icon={nav.icon} gutter={!sideCollapsed} />
                    {!sideCollapsed && (
                        <span>
                            <Trans
                                i18nKey={nav.translateKey}
                                defaults={nav.title}
                            />
                        </span>
                    )}
                </Link>
            </MenuItem>
        </AuthorityCheck>
    )
}

const VerticalSingleMenuItem = ({
    nav,
    onLinkClick,
    sideCollapsed,
    userAuthority,
    direction,
}: Omit<VerticalMenuItemProps, 'title' | 'translateKey'>) => {
    return (
        <AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
            {sideCollapsed ? (
                <CollapsedItem
                    title={nav.title}
                    translateKey={nav.translateKey}
                    direction={direction}
                >
                    <DefaultItem
                        nav={nav}
                        sideCollapsed={sideCollapsed}
                        userAuthority={userAuthority}
                        onLinkClick={onLinkClick}
                    />
                </CollapsedItem>
            ) : (
                <DefaultItem
                    nav={nav}
                    sideCollapsed={sideCollapsed}
                    userAuthority={userAuthority}
                    onLinkClick={onLinkClick}
                />
            )}
        </AuthorityCheck>
    )
}

export default VerticalSingleMenuItem
