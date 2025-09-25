import {
    HiOutlineHome,
    HiOutlineDesktopComputer,
    HiOutlineColorSwatch,
    HiOutlineMenu,
    HiOutlineUser,
    HiOutlineGlobe,
    HiOutlineBriefcase,
    HiOutlineLightBulb,
    HiOutlinePhone,
} from 'react-icons/hi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <img src="/img/images/homedashboard.png" alt="Home" className="w-[18px] h-[18px] object-contain flex-shrink-0" />,
    singleMenu: <img src="/img/images/apartment.svg" alt="property" className="w-[18px] h-[18px] object-contain" />,
    singleMenu1: <img src="/img/images/users.png" alt="users" className="w-[18px] h-[18px] object-contain" />,
    // collapseMenu: <HiOutlineTemplate />,
    // collapseMenu: <HiOutlineTemplate />,

    groupSingleMenu: <HiOutlineDesktopComputer />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
    
    // PriceFaster menu icons with specific images
    building: <img src="/img/images/apartment.png" alt="Property" className="w-[18px] h-[18px] object-contain" />,
    users: <img src="/img/images/users.png" alt="User Management" className="w-[18px] h-[18px] object-contain" />,
    mapPin: <img src="/img/images/loactiontrack.png" alt="Property Tracking" className="w-[18px] h-[18px] object-contain" />,
    priceTag: <img src="/img/images/subscription.png" alt="Subscription" className="w-[18px] h-[18px] object-contain" />,
    barChart: <img src="/img/images/growth-chart-invest.png" alt="Financial Metrics" className="w-[18px] h-[18px] object-contain" />,
    userGear: <img src="/img/images/magnet-user.png" alt="Engagement Metrics" className="w-[18px] h-[18px] object-contain" />,
    logout: <img src="/img/images/user-logout.png" alt="Logout" className="w-[18px] h-[18px] object-contain" />,
    
    // New menu icons for the updated navigation
    menu: <img src="/img/images/menuicon.svg" alt="Menu" className="w-[18px] h-[18px] object-contain flex-shrink-0" />,
    user: <img src="/img/images/Aboutusinfo.svg" alt="About Us" className="w-[18px] h-[18px] object-contain flex-shrink-0" />,
    globe: <img src="/img/images/internationalpatitiont.svg" alt="International Patient" className="w-[18px] h-[18px] object-contain flex-shrink-0" />,
    briefcase: <img src="/img/images/briefcasesidbar.svg" alt="Careers" className="w-[18px] h-[18px] object-contain flex-shrink-0" />,
    lightbulb: <img src="/img/images/whatsnewicon.svg" alt="What's New" className="w-[18px] h-[18px] object-contain flex-shrink-0" />,
    phone: <img src="/img/images/contactusicon.svg" alt="Contact Us" className="w-[18px] h-[18px] object-contain flex-shrink-0" />,
    
    // Icon for Our Specialities main menu
    ourSpecialties: <img src="/img/images/ourspecialisticon.svg" alt="Our Specialities" className="w-[18px] h-[18px] object-contain flex-shrink-0" />,
}

export default navigationIcon
