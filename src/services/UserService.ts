import ApiService from './ApiService'

export type ListUsersRequest = {
    sort?: string
    sort_order?: 'ASC' | 'DESC'
    // key?: string
    search?: string
    status?: string
    limit?: number
    page?: number
    offset?: number
}

export type UserListItem = {
    id: string
    userName: string
    email: string
    mobileNo: string
    signUpDate: string
    cancelationDate: string
    plan: string
    status: 'Active' | 'Suspended' | 'Inactive'
}

export type ListUsersResponse = {
    data?: {
        rows?: UserListItem[]
        list?: UserListItem[]
        items?: UserListItem[]
        total?: number
    } | UserListItem[]
    total?: number
}

export async function apiListUsers(payload: ListUsersRequest) {
    return ApiService.fetchData<ListUsersResponse, ListUsersRequest>({
        url: '/admin/users/list',
        method: 'post',
        data: payload,
    })
}


