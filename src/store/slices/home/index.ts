import { combineReducers } from '@reduxjs/toolkit'

const reducer = combineReducers({
    // Add any home-related reducers here in the future
})

export type HomeState = {
    // Add any home-related state types here in the future
}

export * from './homeApiSlice'
