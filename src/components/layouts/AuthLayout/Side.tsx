import type { CommonProps } from '@/@types/common'

interface SideProps extends CommonProps {
    content?: React.ReactNode
}

const Side = ({ children, content, ...rest }: SideProps) => {
    console.log('Side component rendered', { children, content })

    return (
        <div className="h-full w-full relative flex items-center justify-center">
            {/* Full-screen blurred background */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat filter opacity-50 bg-gradient-to-r from-[#F2D5CF] to-[#E2EEFE] flex-shrink-0"
                style={{
                    backgroundImage: `url('/img/images/Ramaiahbackgroundadmin_main.svg')`,
                }}
            />
            {/* Overlay for better contrast */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Centered login form */}
            <div className="relative z-10 w-full max-w-md px-4 sm:px-6 md:px-8">
                {content && <div className="mb-6 sm:mb-8">{content}</div>}
                {children}
            </div>
        </div>
    )
}

export default Side
