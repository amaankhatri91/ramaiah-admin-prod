import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export interface ChildrenMenuItem {
    id: number
    menu_id: number
    parent_id: number
    title: string
    url: string
    page_id: number | null
    specialty_id: number | null
    target: string
    icon_class: string | null
    display_order: number
    is_active: boolean
    status: boolean
    created_at: string
    updated_at: string
    children?: ChildrenMenuItem[]
    page?: any
    specialty?: any
}

export interface ChildrenMenuData {
    id: number
    menu_id: number
    parent_id: number
    title: string
    url: string
    page_id: number | null
    specialty_id: number | null
    target: string
    icon_class: string | null
    display_order: number
    is_active: boolean
    status: boolean
    created_at: string
    updated_at: string
    page: any
    specialty: any
    children: ChildrenMenuItem[]
}

export interface MenuPathItem {
    id: number
    title: string
    level: number
}

export interface OverviewSectionState {
    headerText: string
    overview: string
    image: File | null
    imageFileName: string
    imageMediaFileId: number | undefined
}

export type CommonState = {
    currentRouteKey: string
    childrenMenuData: ChildrenMenuData | null
    childrenMenuStack: ChildrenMenuData[]
    currentMenuPath: number[]
    menuPathItems: MenuPathItem[]
    activeSpeciality: string | null
    overviewSection: OverviewSectionState
}

export const initialState: CommonState = {
    currentRouteKey: '',
    childrenMenuData: null,
    childrenMenuStack: [],
    currentMenuPath: [],
    menuPathItems: [],
    activeSpeciality: null,
    overviewSection: {
        headerText: '',
        overview: '',
        image: null,
        imageFileName: '',
        imageMediaFileId: undefined
    }
}

export const commonSlice = createSlice({
    name: `${SLICE_BASE_NAME}/common`,
    initialState,
    reducers: {
        setCurrentRouteKey: (state, action: PayloadAction<string>) => {
            state.currentRouteKey = action.payload
        },
        setChildrenMenuData: (state, action: PayloadAction<ChildrenMenuData>) => {
            state.childrenMenuData = action.payload
        },
        clearChildrenMenuData: (state) => {
            state.childrenMenuData = null
        },
        pushChildrenMenuData: (state, action: PayloadAction<ChildrenMenuData>) => {
            if (state.childrenMenuData) {
                state.childrenMenuStack.push(state.childrenMenuData)
            }
            state.childrenMenuData = action.payload
        },
        popChildrenMenuData: (state) => {
            if (state.childrenMenuStack.length > 0) {
                state.childrenMenuData = state.childrenMenuStack.pop() || null
            } else {
                state.childrenMenuData = null
            }
        },
        clearChildrenMenuStack: (state) => {
            state.childrenMenuStack = []
            state.childrenMenuData = null
        },
        setCurrentMenuPath: (state, action: PayloadAction<number[]>) => {
            state.currentMenuPath = action.payload
        },
        pushToMenuPath: (state, action: PayloadAction<number>) => {
            state.currentMenuPath.push(action.payload)
        },
        popFromMenuPath: (state) => {
            state.currentMenuPath.pop()
        },
        setMenuPathItems: (state, action: PayloadAction<MenuPathItem[]>) => {
            state.menuPathItems = action.payload
        },
        addToMenuPathItems: (state, action: PayloadAction<MenuPathItem>) => {
            state.menuPathItems.push(action.payload)
        },
        removeFromMenuPathItems: (state, action: PayloadAction<number>) => {
            const index = state.menuPathItems.findIndex(item => item.id === action.payload)
            if (index !== -1) {
                state.menuPathItems.splice(index, 1)
            }
        },
        setActiveSpeciality: (state, action: PayloadAction<string | null>) => {
            state.activeSpeciality = action.payload
        },
        setOverviewSection: (state, action: PayloadAction<OverviewSectionState>) => {
            state.overviewSection = action.payload
        },
        updateOverviewSection: (state, action: PayloadAction<Partial<OverviewSectionState>>) => {
            state.overviewSection = { ...state.overviewSection, ...action.payload }
        },
        clearOverviewSection: (state) => {
            state.overviewSection = {
                headerText: '',
                overview: '',
                image: null,
                imageFileName: '',
                imageMediaFileId: undefined
            }
        },
    },
})

export const { 
    setCurrentRouteKey, 
    setChildrenMenuData, 
    clearChildrenMenuData,
    pushChildrenMenuData,
    popChildrenMenuData,
    clearChildrenMenuStack,
    setCurrentMenuPath,
    pushToMenuPath,
    popFromMenuPath,
    setMenuPathItems,
    addToMenuPathItems,
    removeFromMenuPathItems,
    setActiveSpeciality,
    setOverviewSection,
    updateOverviewSection,
    clearOverviewSection
} = commonSlice.actions

export default commonSlice.reducer
