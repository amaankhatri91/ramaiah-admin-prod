import React, { useState, useEffect } from 'react'
import { Card, Button, Input, toast, Notification } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import NavigationService, { type MenuItem } from '@/services/NavigationService'

interface NavigationItem {
  id: string
  name: string
  link: string
  visible: boolean
  children?: MenuItem[]
}

type MainNavbarFormSchema = {
  navigationItems: NavigationItem[]
  userProfileName: string
  userProfileImage: string
}

const validationSchema = Yup.object().shape({
  navigationItems: Yup.array().min(1, 'At least one navigation item is required'),
  userProfileName: Yup.string().required('User profile name is required'),
  userProfileImage: Yup.string().required('User profile image is required'),
})

const MainNavbar = () => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<NavigationItem[]>([])
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const initialValues: MainNavbarFormSchema = {
    navigationItems: menuItems,
    userProfileName: 'John Doe',
    userProfileImage: 'profile-image.jpg'
  }

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true)
        const response = await NavigationService.getMainHeaderMenu()
        const mainHeaderMenu = response.data[0]
        
        if (mainHeaderMenu && mainHeaderMenu.items) {
          const formattedItems: NavigationItem[] = mainHeaderMenu.items.map(item => ({
            id: item.id.toString(),
            name: item.title,
            link: item.url,
            visible: true,
            children: item.children
          }))
          setMenuItems(formattedItems)
        }
      } catch (error) {
        console.error('Error fetching menu items:', error)
        // Fallback to default items if API fails
        setMenuItems([
          { id: '1', name: 'About Us', link: '/about', visible: true },
          { id: '2', name: 'Our Specialities', link: '/specialties', visible: true },
          { id: '3', name: 'International Patient Care', link: '/international_patient_care', visible: true },
          { id: '4', name: 'Careers', link: '/careers', visible: true },
          { id: '5', name: '#What\'s New', link: '/whatsnew', visible: true },
          { id: '6', name: 'Contact Us', link: '/contact', visible: true },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  const handleAddNewNavigation = () => {
    // Navigate to the add navigation page with parent menu flag
    navigate('/add-navigation', { 
      state: { 
        isParentMenu: true,
        parentId: null 
      } 
    })
  }

  const handleEditNavigation = (id: string, name: string, children?: MenuItem[]) => {
    console.log('Edit navigation:', id)
    // Navigate to dynamic menu edit page
    if (children && children.length > 0) {
      navigate(`/menu-edit/${id}`, { 
        state: { 
          menuName: name, 
          menuId: id,
          children: children 
        } 
      })
    } else {
      // For items without children, navigate to a simple edit page
      navigate(`/menu-edit/${id}`, { 
        state: { 
          menuName: name, 
          menuId: id,
          children: [] 
        } 
      })
    }
  }

  const handleToggleVisibility = (setFieldValue: any, navigationItems: NavigationItem[], id: string) => {
    const updatedItems = navigationItems.map(item => 
      item.id === id ? { ...item, visible: !item.visible } : item
    )
    setFieldValue('navigationItems', updatedItems)
  }

  const handleDeleteNavigation = async (setFieldValue: any, navigationItems: NavigationItem[], id: string) => {
    try {
      // Add item to deleting state
      setDeletingItems(prev => new Set(prev).add(id))
      
      // Call delete API
      await NavigationService.deleteMenu(parseInt(id))
      
      // Remove item from local state on successful deletion
      const updatedItems = navigationItems.filter(item => item.id !== id)
      setFieldValue('navigationItems', updatedItems)
      
      // Update menuItems state as well
      setMenuItems(updatedItems)
      
      console.log(`Menu item ${id} deleted successfully`)
      
      // Show success toast
      toast.push(
        <Notification type="success" duration={2500} title="Success">
          Menu item deleted successfully
        </Notification>,
        { placement: 'top-end' }
      )
    } catch (error) {
      console.error('Error deleting menu item:', error)
      
      // Show error toast
      toast.push(
        <Notification type="danger" duration={3000} title="Delete Failed">
          Failed to delete menu item. Please try again.
        </Notification>,
        { placement: 'top-end' }
      )
    } finally {
      // Remove item from deleting state
      setDeletingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleProfileImageUpload = (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFieldValue('userProfileImage', file.name)
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string, setFieldValue: any, navigationItems: NavigationItem[]) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    const newItems = [...navigationItems]
    const draggedIndex = newItems.findIndex(item => item.id === draggedItem)
    const targetIndex = newItems.findIndex(item => item.id === targetId)

    const [draggedItemData] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItemData)

    setFieldValue('navigationItems', newItems)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const onSubmit = (values: MainNavbarFormSchema) => {
    console.log('Main Navbar Form Values:', values)
  }

  if (loading) {
    return (
      <Card className="bg-gray-50 rounded-xl">
        <div className="px-2 py-8">
          <div className="flex justify-center items-center">
            <div className="text-gray-500">Loading menu items...</div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-gray-50 rounded-xl">
        <div className="px-2">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
          >
            {({ values, setFieldValue, touched, errors, isSubmitting }) => (
              <Form>
                <FormContainer>
                  <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Main Navbar</p>
                  
                  {/* Navigation Items Section */}
                  <div className="mb-6 rounded-[24px] border-[0.75px] border-[#CED4DA] p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between !items-baseline mb-4 border-b border-[#CED4DA]">
                      <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Menu Items</h3>
                      <Button
                        type="button"
                        onClick={handleAddNewNavigation}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white text-center font-inter text-[14px] font-medium leading-normal !px-4 !py-1"
                      >
                        Add New Navigation
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {values.navigationItems.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, item.id, setFieldValue, values.navigationItems)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between transition-all duration-200 ${
                            draggedItem === item.id ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="cursor-move text-gray-400 hover:text-gray-600">
                              <img src="/img/images/grip-dots.svg" alt="grip-dots" className="w-5 h-5" />
                            </div>
                            <span className="text-gray-700 font-medium">{item.name}</span>
                            {item.link && <span className="text-gray-500 text-sm">({item.link})</span>}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditNavigation(item.id, item.name, item.children)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <img src="/img/images/Edittable.svg" alt="edit" className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(setFieldValue, values.navigationItems, item.id)}
                              className={`p-1 transition-colors ${
                                item.visible 
                                  ? 'text-gray-400 hover:text-green-600' 
                                  : 'text-gray-300 hover:text-green-600'
                              }`}
                            >
                              <img src="/img/images/viewtable.svg" alt="view" className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNavigation(setFieldValue, values.navigationItems, item.id)}
                              disabled={deletingItems.has(item.id)}
                              className={`p-1 transition-colors ${
                                deletingItems.has(item.id) 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-400 hover:text-red-600'
                              }`}
                            >
                              {deletingItems.has(item.id) ? (
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                              ) : (
                                <img src="/img/images/deatetable.svg" alt="delete" className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </FormContainer>
              </Form>
            )}
          </Formik>
        </div>
      </Card>
    </>
  )
}

export default MainNavbar