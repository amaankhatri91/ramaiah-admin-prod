import ApiService from './ApiService'

export interface FooterCategory {
    id: number
    name: string
    slug: string
    display_order: number
    created_at: string
    updated_at: string
    contents: FooterContent[]
}

export interface FooterContent {
    id: number
    title: string
    slug: string | null
    url: string | null
    content: string | null
    icon: string | null
    created_at: string
    updated_at: string
}

export interface FooterCategoriesResponse {
    status: number
    message: string
    data: FooterCategory[]
}

export interface FooterContentRequest extends Record<string, unknown> {
    category_id: number
    title: string
    slug: string
    content: string
    url: string | null
    icon: string | null
}

export interface FooterContentResponse {
    status: number
    message: string
    data: any
}

export async function apiGetFooterCategories() {
    console.log('Making API call to /footer/category')
    try {
        const response = await ApiService.fetchData<FooterCategoriesResponse>({
            url: '/footer/category',
            method: 'get',
        })
        console.log('Footer Categories API Response received:', response)
        return response
    } catch (error) {
        console.error('Footer Categories API Error:', error)
        throw error
    }
}

export async function apiCreateFooterContent(payload: FooterContentRequest) {
    console.log('Making API call to /footer/content with payload:', payload)
    try {
        const response = await ApiService.fetchData<FooterContentResponse>({
            url: '/footer/content',
            method: 'post',
            data: payload,
        })
        console.log('Footer Content API Response received:', response)
        return response
    } catch (error) {
        console.error('Footer Content API Error:', error)
        throw error
    }
}
