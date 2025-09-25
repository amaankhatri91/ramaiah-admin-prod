import classNames from 'classnames'
import ScrollBar from '@/components/ui/ScrollBar'
import {
    SIDE_NAV_WIDTH,
    SIDE_NAV_COLLAPSED_WIDTH,
    NAV_MODE_DARK,
    NAV_MODE_THEMED,
    NAV_MODE_TRANSPARENT,
    SIDE_NAV_CONTENT_GUTTER,
    LOGO_X_GUTTER,
} from '@/constants/theme.constant'
import Logo from '@/components/template/Logo'
import navigationConfig from '@/configs/navigation.config'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import useResponsive from '@/utils/hooks/useResponsive'
import { useSidebarMenu } from '@/utils/hooks/useSidebarMenu'
import { useAppSelector } from '@/store'
import { useRef } from 'react'

const sideNavStyle = {
    width: SIDE_NAV_WIDTH,
    minWidth: SIDE_NAV_WIDTH,
}

const sideNavCollapseStyle = {
    width: SIDE_NAV_COLLAPSED_WIDTH,
    minWidth: SIDE_NAV_COLLAPSED_WIDTH,
}


const SideNav = () => {
    const themeColor = useAppSelector((state) => state.theme.themeColor)
    const primaryColorLevel = useAppSelector(
        (state) => state.theme.primaryColorLevel
    )
    const navMode = useAppSelector((state) => state.theme.navMode)
    const mode = useAppSelector((state) => state.theme.mode)
    const direction = useAppSelector((state) => state.theme.direction)
    const currentRouteKey = useAppSelector(
        (state) => state.base.common.currentRouteKey
    )
    const sideNavCollapse = useAppSelector(
        (state) => state.theme.layout.sideNavCollapse
    )
    const userAuthority = useAppSelector((state) => state.auth.user.authority)

    const { larger } = useResponsive()
    const sideNavRef = useRef<HTMLDivElement>(null)
    
    // Fetch dynamic sidebar menu data
    const { navigationTree: dynamicNavigationTree, loading, error } = useSidebarMenu()

    const sideNavColor = () => {
        // Use dark background color #2A3042 as shown in the image
        return 'side-nav-dark'
    }

    const logoMode = () => {
        if (navMode === NAV_MODE_THEMED) {
            return NAV_MODE_DARK
        }

        if (navMode === NAV_MODE_TRANSPARENT) {
            return mode
        }

        if (navMode === 'pricefaster') {
            return 'light'
        }

        return navMode
    }

    // Use dynamic navigation tree if available, otherwise fallback to static config
    const navigationTree = dynamicNavigationTree.length > 0 ? dynamicNavigationTree : navigationConfig

    const menuContent = (
        <VerticalMenuContent
            navMode="pricefaster"
            collapsed={sideNavCollapse}
            navigationTree={navigationTree}
            routeKey={currentRouteKey}
            userAuthority={userAuthority as string[]}
            direction={direction}
        />
    )

    return (
        <>
            {larger.lg && (
                <div
                    ref={sideNavRef}
                    style={
                        sideNavCollapse ? sideNavCollapseStyle : sideNavStyle
                    }
                    className={classNames(
                        'side-nav',
                        sideNavColor(),
                        !sideNavCollapse && 'side-nav-expand',
                        sideNavCollapse && 'side-nav-collapsed',
                        // 'relative'
                    )}
                >
                    <div className="side-nav-header">
                        <Logo
                            mode={logoMode()}
                            type="pricefaster"
                            collapsed={sideNavCollapse}
                            className={
                                sideNavCollapse
                                    ? SIDE_NAV_CONTENT_GUTTER
                                    : LOGO_X_GUTTER
                            }
                        />
                    </div>
                    {sideNavCollapse ? (
                        menuContent
                    ) : (
                        <div className="side-nav-content">
                            <ScrollBar autoHide direction={direction}>
                                {menuContent}
                            </ScrollBar>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default SideNav
