import axios from 'axios'
import appConfig from '@/configs/app.config'
import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import { PERSIST_STORE_NAME } from '@/constants/app.constant'
import deepParseJson from '@/utils/deepParseJson'
import store, { signOutSuccess } from '../store'

const unauthorizedCode = [401]

const BaseService = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
})

const apiurl = appConfig.apiPrefix
console.log(apiurl,"aaaaapiii");



BaseService.interceptors.request.use(
    (config) => {
        console.log('Making request to:', (config.baseURL || '') + (config.url || ''))
        console.log('Request config:', config)
        
        const rawPersistData = localStorage.getItem(PERSIST_STORE_NAME)
        const persistData = deepParseJson(rawPersistData)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let accessToken = (persistData as any).auth.session.token

        if (!accessToken) {
            const { auth } = store.getState()
            accessToken = auth.session.token
        }

        if (accessToken) {
            config.headers[
                REQUEST_HEADER_AUTH_KEY
            ] = `${TOKEN_TYPE}${accessToken}`
        }

        // Add ngrok-skip-browser-warning header to bypass ngrok security warning
        config.headers['ngrok-skip-browser-warning'] = 'true'

        return config
    },
    (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
    }
)

BaseService.interceptors.response.use(
    (response) => {
        console.log('Response received:', response)
        return response
    },
    (error) => {
        console.error('Response error:', error)
        const { response } = error

        if (response && unauthorizedCode.includes(response.status)) {
            store.dispatch(signOutSuccess())
        }

        return Promise.reject(error)
    }
)

export default BaseService
