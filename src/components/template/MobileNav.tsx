import { useState, Suspense, lazy, useRef } from 'react'
import classNames from 'classnames'
import Drawer from '@/components/ui/Drawer'
import {
    NAV_MODE_THEMED,
    NAV_MODE_TRANSPARENT,
    DIR_RTL,
} from '@/constants/theme.constant'
import withHeaderItem, { WithHeaderItemProps } from '@/utils/hoc/withHeaderItem'
import NavToggle from '@/components/shared/NavToggle'
import navigationConfig from '@/configs/navigation.config'
import useResponsive from '@/utils/hooks/useResponsive'
import { useSidebarMenu } from '@/utils/hooks/useSidebarMenu'
import { useAppSelector } from '@/store'
import Logo from '@/components/template/Logo'

const VerticalMenuContent = lazy(
    () => import('@/components/template/VerticalMenuContent')
)

type MobileNavToggleProps = {
    toggled?: boolean
}

const MobileNavToggle = withHeaderItem<
    MobileNavToggleProps & WithHeaderItemProps
>(NavToggle)


const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false)

    const openDrawer = () => {
        setIsOpen(true)
    }

    const onDrawerClose = () => {
        setIsOpen(false)
    }

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

    const { smaller } = useResponsive()
    const sideNavRef = useRef<HTMLDivElement>(null)
    
    // Fetch dynamic sidebar menu data (same as main sidebar)
    const { navigationTree: dynamicNavigationTree, loading, error } = useSidebarMenu()

    const navColor = () => {
        // Use same dark background as desktop sidebar
        return 'side-nav-dark'
    }

    return (
        <>
            {smaller.lg && (
                <>
                    <div className="text-2xl" onClick={openDrawer}>
                        <MobileNavToggle toggled={isOpen} />
                    </div>
                    <Drawer
                        title={<Logo type="pricefaster" mode="dark" className='!py-[0px] !px-0' />}
                        isOpen={isOpen}
                        bodyClass={classNames(navColor(), 'p-0')}
                        className="!bg-[#2A3042] !border-0"
                        headerClass="!bg-[#2A3042] !border-gray-600"
                        width={280}
                        placement={direction === DIR_RTL ? 'right' : 'left'}
                        onClose={onDrawerClose}
                        onRequestClose={onDrawerClose}
                    >
                        <Suspense fallback={<></>}>
                            {isOpen && (
                                <div ref={sideNavRef} className="relative">
                                    <VerticalMenuContent
                                        navMode="pricefaster"
                                        collapsed={sideNavCollapse}
                                        navigationTree={dynamicNavigationTree.length > 0 ? dynamicNavigationTree : navigationConfig}
                                        routeKey={currentRouteKey}
                                        userAuthority={userAuthority as string[]}
                                        direction={direction}
                                        onMenuItemClick={onDrawerClose}
                                    />
                                </div>
                            )}
                        </Suspense>
                    </Drawer>
                </>
            )}
        </>
    )
}

export default MobileNav
