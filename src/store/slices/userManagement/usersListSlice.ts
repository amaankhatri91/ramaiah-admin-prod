import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { apiListUsers, ListUsersRequest, UserListItem } from '@/services/UserService'
import type { OnSortParam } from '@/components/shared/DataTable'

export type UsersListState = {
    loading: boolean
    error?: string
    items: UserListItem[]
    total: number
    pageIndex: number
    pageSize: number
    sort: { key: string; order: 'asc' | 'desc' } | null
    search: string
    status?: string
}

export const initialState: UsersListState = {
    loading: false,
    items: [],
    total: 0,
    pageIndex: 1,
    pageSize: 10,
    sort: { key: 'created_at', order: 'desc' },
    search: '',
}

export const fetchUsers = createAsyncThunk(
    `${SLICE_BASE_NAME}/list/fetchUsers`,
    async (args: void, { getState, rejectWithValue }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = getState() as any
        const slice: UsersListState = state.userManagement?.list || initialState
        const offsetForBackend = slice.pageIndex <= 1 ? 0 : slice.pageIndex
        const payload: ListUsersRequest = {
            sort: slice.sort?.key || 'created_at',
            sort_order: (slice.sort?.order?.toUpperCase?.() as 'ASC' | 'DESC') || 'DESC',
            // key: 'userName',
            search: slice.search ?? '',
            status: slice.status || undefined,
            limit: slice.pageSize,
            page: slice.pageIndex,
            offset: offsetForBackend,
        }

        try {
            const res = await apiListUsers(payload)
            const body = res.data
            let total = 0

            // Normalize rows from various backend shapes
            let rawRows: any[] = []
            if (Array.isArray(body)) {
                rawRows = body
                total = body.length
            } else if ((body as any)?.data) {
                const dataBlock = (body as any).data as any
                // Supports: { data: { total, limit, page, data: [...] } }
                rawRows = dataBlock.data || dataBlock.rows || dataBlock.list || dataBlock.items || []
                total = dataBlock.total ?? (body as any)?.total ?? rawRows.length
            } else {
                rawRows = (body as any)?.rows || (body as any)?.list || (body as any)?.items || []
                total = (body as any)?.total ?? rawRows.length
            }

            const toUserItem = (u: any, index: number): UserListItem => {
                const id = String(u?.id ?? u?._id ?? index)
                const fullName = [u?.first_name, u?.last_name].filter(Boolean).join(' ').trim()
                const userName = fullName || u?.userName || u?.name || '-'
                const email = u?.email || u?.emailAddress || '-'
                const mobileNo = u?.phone || u?.mobile || u?.mobileNo || '-'
                const signUpDate = u?.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : (u?.signUpDate || '-')
                const cancelationDate = u?.cancelationDate
                    || (u?.deleted_at ? new Date(u.deleted_at).toLocaleDateString() : '-')
                const plan = u?.user_subscriptions?.subscription?.title || u?.plan || '-'
                let status: UserListItem['status'] = 'Inactive'
                if (typeof u?.status === 'boolean') {
                    status = u.status ? 'Active' : 'Inactive'
                } else if (typeof u?.status === 'string') {
                    const s = u.status.toLowerCase()
                    status = s === 'active' ? 'Active' : s === 'suspended' ? 'Suspended' : 'Inactive'
                }
                return { id, userName, email, mobileNo, signUpDate, cancelationDate, plan, status }
            }

            const rows: UserListItem[] = Array.isArray(rawRows)
                ? rawRows.map((r, i) => toUserItem(r, i))
                : []

            return { rows, total }
        } catch (err: any) {
            return rejectWithValue(err?.message || 'Failed to fetch users')
        }
    }
)

const usersListSlice = createSlice({
    name: `${SLICE_BASE_NAME}/list`,
    initialState,
    reducers: {
        setPageIndex(state, action: PayloadAction<number>) {
            state.pageIndex = action.payload
        },
        setPageSize(state, action: PayloadAction<number>) {
            state.pageSize = action.payload
            state.pageIndex = 1
        },
        setSearch(state, action: PayloadAction<string>) {
            state.search = action.payload
            state.pageIndex = 1
        },
        setStatus(state, action: PayloadAction<string | undefined>) {
            state.status = action.payload
            state.pageIndex = 1
        },
        setSort(state, action: PayloadAction<OnSortParam>) {
            const order = action.payload.order
            const key = String(action.payload.key || 'created_at')
            if (!order) {
                state.sort = { key: 'created_at', order: 'desc' }
            } else {
                state.sort = { key, order }
            }
            state.pageIndex = 1
        },
        resetUsersState() {
            return initialState
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true
                state.error = undefined
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload.rows
                state.total = action.payload.total
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false
                state.error = (action.payload as string) || 'Failed to fetch users'
            })
    },
})

export const {
    setPageIndex,
    setPageSize,
    setSearch,
    setStatus,
    setSort,
    resetUsersState,
} = usersListSlice.actions

export default usersListSlice.reducer


