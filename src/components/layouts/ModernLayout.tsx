import Header from '@/components/template/Header'
import SidePanel from '@/components/template/SidePanel'
import UserDropdown from '@/components/template/UserDropdown'
import SideNavToggle from '@/components/template/SideNavToggle'
import MobileNav from '@/components/template/MobileNav'
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

const ModernLayout = () => {
    const sideNavCollapse = useAppSelector(
        (state) => state.theme.layout.sideNavCollapse
    )

    return (
        <div className="app-layout-modern flex flex-auto flex-col">
            <div className="flex flex-auto min-w-0">
                <SideNav />
                <div
                    className={`flex flex-col flex-auto min-h-screen min-w-0 relative w-full bg-[#F5F6FA] dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 ${sideNavCollapse ? 'ml-[0px] lg:ml-[80px]' : 'ml-[0px] lg:ml-[280px]'}`}
                >
                    <Header
                        className="border-b border-gray-200 dark:border-gray-700"
                        headerEnd={<HeaderActionsEnd />}
                        headerStart={<HeaderActionsStart />}
                    />
                    <View />
                </div>
            </div>
        </div>
    )
}

export default ModernLayout
