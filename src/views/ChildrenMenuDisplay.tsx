import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { 
    setChildrenMenuData, 
    clearChildrenMenuData, 
    pushToMenuPath, 
    setCurrentMenuPath,
    addToMenuPathItems,
    setMenuPathItems
} from '@/store/slices/base/commonSlice'
import NavigationService from '@/services/NavigationService'
import ChildrenMenuDisplayComponent from '@/components/template/ChildrenMenuDisplay'

const ChildrenMenuDisplay = () => {
    const { menuId } = useParams<{ menuId: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const childrenMenuData = useAppSelector((state) => state.base.common.childrenMenuData)
    const currentMenuPath = useAppSelector((state) => state.base.common.currentMenuPath)

    useEffect(() => {
        const fetchMenuData = async () => {
            if (!menuId) {
                navigate('/home')
                return
            }

            try {
                const numericMenuId = parseInt(menuId, 10)
                if (isNaN(numericMenuId)) {
                    navigate('/home')
                    return
                }

                console.log(`Fetching menu data for ID: ${numericMenuId}`)
                const response = await NavigationService.getChildrenMenu(numericMenuId)
                console.log('Menu data response:', response)
                
                // Update menu path
                dispatch(pushToMenuPath(numericMenuId))
                
                // Add to menu path items for breadcrumb navigation
                dispatch(addToMenuPathItems({
                    id: numericMenuId,
                    title: response.data.title,
                    level: response.data.level || 0
                }))
                
                if (response.data) {
                    // Convert MenuItem to ChildrenMenuData format
                    const childrenMenuData = {
                        id: response.data.id,
                        menu_id: response.data.id,
                        parent_id: 0, // We'll need to track this differently since MenuItem doesn't have parent_id
                        title: response.data.title,
                        url: response.data.url,
                        page_id: response.data.page?.id || null,
                        specialty_id: response.data.specialty?.id || null,
                        target: '_self',
                        icon_class: null,
                        display_order: 0,
                        is_active: true,
                        status: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        page: response.data.page,
                        specialty: response.data.specialty,
                        children: (response.data.children || []).map(child => ({
                            id: child.id,
                            menu_id: child.id,
                            parent_id: response.data.id,
                            title: child.title,
                            url: child.url,
                            page_id: child.page?.id || null,
                            specialty_id: child.specialty?.id || null,
                            target: '_self',
                            icon_class: null,
                            display_order: 0,
                            is_active: true,
                            status: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            page: child.page,
                            specialty: child.specialty
                        }))
                    }
                    dispatch(setChildrenMenuData(childrenMenuData))
                } else {
                    // If no data found, redirect to home
                    navigate('/home')
                }
            } catch (error) {
                console.error('Error fetching menu data:', error)
                navigate('/home')
            }
        }

        fetchMenuData()

        // Cleanup function to clear menu data when component unmounts
        return () => {
            dispatch(clearChildrenMenuData())
        }
    }, [menuId, dispatch, navigate])

    // Show loading state while fetching data
    if (!childrenMenuData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading menu data...</div>
            </div>
        )
    }

    return <ChildrenMenuDisplayComponent />
}

export default ChildrenMenuDisplay
