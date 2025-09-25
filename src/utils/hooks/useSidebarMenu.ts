import { useState, useEffect } from 'react'
import NavigationService, { type NavigationResponse } from '@/services/NavigationService'
import { transformSidebarMenuData } from '@/utils/transformMenuData'
import type { NavigationTree } from '@/@types/navigation'

interface UseSidebarMenuReturn {
    navigationTree: NavigationTree[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export const useSidebarMenu = (): UseSidebarMenuReturn => {
    const [navigationTree, setNavigationTree] = useState<NavigationTree[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSidebarMenu = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response: NavigationResponse = await NavigationService.getSidebarMenu()
            const transformedData = transformSidebarMenuData(response)
            
            setNavigationTree(transformedData)
        } catch (err) {
            console.error('Error fetching sidebar menu:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch sidebar menu')
            
            // Fallback to empty array or default menu structure
            setNavigationTree([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSidebarMenu()
    }, [])

    return {
        navigationTree,
        loading,
        error,
        refetch: fetchSidebarMenu
    }
}
