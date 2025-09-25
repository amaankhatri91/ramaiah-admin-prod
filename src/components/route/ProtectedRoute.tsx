import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@/utils/hooks/useAuth'

const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const { authenticated } = useAuth()

    const location = useLocation()

    if (!authenticated) {
        const currentPath = location.pathname
        const isRoot = currentPath === '/'
        const isAuthPath = currentPath === unAuthenticatedEntryPath

        const shouldAttachRedirect = !isRoot && !isAuthPath

        const to = shouldAttachRedirect
            ? `${unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${encodeURIComponent(currentPath)}`
            : unAuthenticatedEntryPath

        return <Navigate replace to={to} />
    }

    return <Outlet />
}

export default ProtectedRoute


// if (!authenticated) {
//     return (
//                 <Navigate
//                     replace
//                     to={`${unAuthenticatedEntryPath}?${REDIRECT_URL_KEY}=${location.pathname}`}
//                 />
//             )
//     }