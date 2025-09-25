import React, { useState, useEffect, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import { Button, EditableImage } from '@/components/ui'
import { HiPencil, HiArrowLeft, HiXMark, HiPlus } from 'react-icons/hi2'
import { useNavigate } from 'react-router-dom'
import NavigationService from '@/services/NavigationService'
import { setActiveSpeciality, removeFromMenuPathItems } from '@/store/slices/base/commonSlice'
import SpecialityContentSections from './SpecialityContentSections'

const ChildrenMenuDisplay = () => {
    const childrenMenuData = useAppSelector((state) => state.base.common.childrenMenuData)
    const currentMenuPath = useAppSelector((state) => state.base.common.currentMenuPath)
    const menuPathItems = useAppSelector((state) => state.base.common.menuPathItems)
    const activeSpeciality = useAppSelector((state) => state.base.common.activeSpeciality)
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState<string>('')
    const [availableTabs, setAvailableTabs] = useState<Array<{id: number, title: string}>>([])
    const [tabChildrenData, setTabChildrenData] = useState<{[key: number]: any}>({})
    const [loadingTab, setLoadingTab] = useState<number | null>(null)

    // Function to load tab data
    const loadTabData = useCallback(async (tabId: number) => {
        // If we already have data for this tab, don't fetch again
        if (tabChildrenData[tabId]) {
            return
        }
        
        setLoadingTab(tabId)
        try {
            const response = await NavigationService.getChildrenMenu(tabId)
            if (response.data) {
                setTabChildrenData(prev => ({
                    ...prev,
                    [tabId]: response.data
                }))
            }
        } catch (error) {
            console.error('Error fetching tab children data:', error)
        } finally {
            setLoadingTab(null)
        }
    }, [tabChildrenData])

    // Update tabs when children menu data changes
    useEffect(() => {
        if (childrenMenuData && childrenMenuData.children) {
            const tabs = childrenMenuData.children.map(child => ({
                id: child.id,
                title: child.title
            }))
            setAvailableTabs(tabs)
            
            // Set the first tab as active if no active tab is set
            if (tabs.length > 0 && !activeTab) {
                setActiveTab(tabs[0].title)
                dispatch(setActiveSpeciality(tabs[0].title))
                // Automatically load the first tab's data
                loadTabData(tabs[0].id)
            }
        }
    }, [childrenMenuData, activeTab, dispatch, loadTabData])

    const handleMenuItemClick = (menuId: number) => {
        navigate(`/menu/${menuId}`)
    }

    const handleEditClick = async (e: React.MouseEvent, item: any) => {
        e.stopPropagation()
        setLoading(item.id)
        
        try {
            const response = await NavigationService.getChildrenMenu(item.id)
            if (response.data && response.data.children && response.data.children.length > 0) {
                // Navigate to the route for this menu item's children
                navigate(`/menu/${item.id}`)
            }
        } catch (error) {
            console.error('Error fetching children menu:', error)
        } finally {
            setLoading(null)
        }
    }

    const handleBackClick = () => {
        // Navigate back to the previous menu in the path
        if (currentMenuPath.length > 1) {
            const parentMenuId = currentMenuPath[currentMenuPath.length - 2]
            navigate(`/menu/${parentMenuId}`)
        } else {
            // If no parent, go to home
            navigate('/home')
        }
    }

    const handleTabClick = async (tabName: string, tabId: number) => {
        setActiveTab(tabName)
        dispatch(setActiveSpeciality(tabName))
        await loadTabData(tabId)
    }

    // const handleCloseTab = (tabName: string) => {
    //     if (activeTab === tabName) {
    //         // If closing active tab, switch to first available tab
    //         const remainingTabs = availableTabs.filter(tab => tab.title !== tabName)
    //         if (remainingTabs.length > 0) {
    //             setActiveTab(remainingTabs[0].title)
    //             dispatch(setActiveSpeciality(remainingTabs[0].title))
    //         }
    //     }
    //     // Remove the tab from available tabs
    //     setAvailableTabs(prev => prev.filter(tab => tab.title !== tabName))
    // }

    const handleAddNewSpeciality = () => {
        // Handle adding new speciality
        console.log('Add new speciality')
    }

    // Handle navigation to children menu
    const handleNavigateToChildren = (menuId: number) => {
        navigate(`/menu/${menuId}`)
    }

    // Handle navigation to grandchild menu
    const handleNavigateToGrandchild = (menuId: number) => {
        navigate(`/grandchild/${menuId}`)
    }

    if (!childrenMenuData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading menu data...</div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                    {currentMenuPath.length > 1 && (
                        <button
                            onClick={handleBackClick}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <HiArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                    <h1 className="text-2xl font-bold text-gray-800">
                        Maintain Specialities of Excellence
                    </h1>
                    <EditableImage />
                </div>
                
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span 
                        className="hover:text-gray-700 cursor-pointer"
                        onClick={() => navigate('/home')}
                    >
                        The Specialities
                    </span>
                    {menuPathItems.length > 0 && (
                        <>
                            <span className="mx-2">/</span>
                            <span className="hover:text-gray-700 cursor-pointer">
                                Centers of Excellence
                    </span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 font-medium">
                                Maintain Specialities of Excellence
                    </span>
                        </>
                    )}
                </div>
            </div>

            {/* Speciality Tabs */}
            <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                    {availableTabs.map((tab) => (
                        <div
                            key={tab.id}
                            className={`flex items-center gap-2 px-4 py-4 rounded-[20px] cursor-pointer transition-all ${
                                activeTab === tab.title
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => handleTabClick(tab.title, tab.id)}
                        >
                            <span className={`font-inter text-[16px] font-semibold leading-normal ${
                                activeTab === tab.title ? 'text-white' : 'text-[#495057]'
                            }`}>{tab.title}</span>
                            {loadingTab === tab.id && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    // handleCloseTab(tab.title)
                                }}
                                className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-1"
                            >
                                <EditableImage color={activeTab === tab.title ? 'white' : 'default'} />
                            </button>
                        </div>
                    ))}
                    {/* <button
                        onClick={handleAddNewSpeciality}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <HiPlus className="w-4 h-4" />
                        <span className="text-sm font-medium">Add New</span>
                    </button> */}
                    </div>
            </div>

            {/* Main Content Area */}
            {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"> */}
                <SpecialityContentSections 
                    activeTab={activeTab} 
                    childrenMenuData={childrenMenuData}
                    availableTabs={availableTabs}
                    tabChildrenData={tabChildrenData}
                    onNavigateToChildren={handleNavigateToChildren}
                    onNavigateToGrandchild={handleNavigateToGrandchild}
                />
            {/* </div> */}
        </div>
    )
}

export default ChildrenMenuDisplay
