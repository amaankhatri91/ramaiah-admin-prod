import Topheader from "@/components/template/Headerpage/Topheader"
import SecondHeader from "@/components/template/Headerpage/SecondHeader"
import MainNavbar from "@/components/template/Headerpage/MainNavbar"

const Header = () => {
    
    return (
        <div className="flex flex-col gap-4">
           <Topheader />
           <SecondHeader />
           <MainNavbar />
        </div>
    )
}

export default Header


