import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    id?: number | string
    avatar?: string
    userName?: string
    email?: string
    authority?: string[]
    first_name?: string
    last_name?: string
    phone?: string
}

const initialState: UserState = {
    id: '',
    avatar: '',
    userName: '',
    email: '',
    authority: [],
    first_name: '',
    last_name: '',
    phone: '',
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.id = action.payload?.id
            state.avatar = action.payload?.avatar
            state.email = action.payload?.email
            state.userName = action.payload?.userName
            state.authority = action.payload?.authority
            state.first_name = action.payload?.first_name
            state.last_name = action.payload?.last_name
            state.phone = action.payload?.phone
        },
    },
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
