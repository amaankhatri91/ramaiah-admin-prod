import Header from '@/components/template/Header'
import SideNavToggle from '@/components/template/SideNavToggle'
import SidePanel from '@/components/template/SidePanel'
import MobileNav from '@/components/template/MobileNav'
import UserDropdown from '@/components/template/UserDropdown'
import SideNav from '@/components/template/SideNav'
import View from '@/views'
import { useAppSelector } from '@/store'
import { SIDE_NAV_WIDTH, SIDE_NAV_COLLAPSED_WIDTH } from '@/constants/theme.constant'

const HeaderActionsStart = () => {
    return (
        <>
            <MobileNav />
            <SideNavToggle />
        </>
    )
}

const HeaderActionsEnd = () => {
    return (
        <>
            <UserDropdown hoverable={false} />
        </>
    )
}

const ClassicLayout = () => {
    const sideNavCollapse = useAppSelector(
        (state) => state.theme.layout.sideNavCollapse
    )
    
    const mainContentStyle = {
        marginLeft: sideNavCollapse ? SIDE_NAV_COLLAPSED_WIDTH : SIDE_NAV_WIDTH,
    }

    return (
        <div className="app-layout-classic flex flex-auto flex-col">
            <div className="flex flex-auto min-w-0">
                <SideNav />
                <div 
                    className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full"
                    style={mainContentStyle}
                >
                    <Header
                        className="shadow dark:shadow-2xl"
                        headerStart={<HeaderActionsStart />}
                        headerEnd={<HeaderActionsEnd />}
                    />
                    <div className="h-full flex flex-auto flex-col">
                        <View />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClassicLayout
