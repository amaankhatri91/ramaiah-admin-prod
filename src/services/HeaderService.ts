import ApiService from './ApiService'

export interface HeaderSettings {
    generalEnquiries: string
    emergencyNumber: string
    preBookAppointments: string
    logoFileName: string
    contentSearchIconFileName: string
    ambulanceLogoFileName: string
}

export interface SettingItem {
    id: number
    setting_key: string
    setting_value: string
    setting_type: string
    header_level: string
    description: string
    is_public: boolean
    status: boolean | null
    created_at: string
    updated_at: string
    deleted_at: string | null
}

export interface HeaderResponse {
    data: SettingItem[]
    message?: string
    success?: boolean
}

export interface UpdateHeaderRequest extends Record<string, unknown> {
    settings: {
        id: number
        setting_value: string
    }[]
}

export interface UpdateHeaderResponse {
    message?: string
    success?: boolean
    data?: any
}

export async function apiGetHeaderSettings() {
    console.log('Making API call to /site/settings')
    try {
        const response = await ApiService.fetchData<HeaderResponse>({
            url: '/site/settings',
            method: 'get',
        })
        console.log('API Response received:', response)
        return response
    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
}

export async function apiUpdateHeaderSettings(data: UpdateHeaderRequest) {
    console.log('Making API call to /site/settings with PUT method')
    try {
        const response = await ApiService.fetchData<UpdateHeaderResponse>({
            url: '/site/settings',
            method: 'put',
            data: data,
        })
        console.log('Update API Response received:', response)
        return response
    } catch (error) {
        console.error('Update API Error:', error)
        throw error
    }
}
