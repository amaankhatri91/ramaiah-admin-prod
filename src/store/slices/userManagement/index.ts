import { combineReducers } from '@reduxjs/toolkit'
import list, { UsersListState } from './usersListSlice'

const reducer = combineReducers({
    list,
})

export type UserManagementState = {
    list: UsersListState
}

export * from './usersListSlice'

export default reducer


