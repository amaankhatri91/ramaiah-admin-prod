import classNames from 'classnames'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline' | 'pricefaster'
    mode?: 'light' | 'dark' | 'pricefaster'
    imgClass?: string
    logoWidth?: number | string
    collapsed?: boolean
}

const LOGO_SRC_PATH = '/img/logo/'

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth = 'auto',
        collapsed = false,
    } = props

    // Custom PriceFaster logo with specific styling
    if (type === 'pricefaster') {
        return (
            <div
                className=''

            >
                <div className="flex items-center pt-[22px] pl-[22px]">
                    <img
                        src="/img/images/rahmaihahlogosidbaronlyicon.svg"
                        alt="Ramaiah Logo"
                        // className={classNames('w-8 h-8 object-contain', imgClass)}
                        // style={{ padding: '0px 1px 0px 17px' }}
                    />
                    {!collapsed && (
                        <div className="ml-3 flex items-center">
                            <img
                                src="/img/images/Rahmaiahtextlogo.svg"
                                alt="Ramaiah Logo"
                                className="w-[130px]"
                            />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            className={classNames('logo', className)}
            style={{
                ...style,
                ...{ width: logoWidth },
            }}
        >
            <img
                className={imgClass}
                src={`${LOGO_SRC_PATH}logo-${mode}-${type}.png`}
                alt={`${APP_NAME} logo`}
            />
        </div>
    )
}

export default Logo
