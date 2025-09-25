import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Card, Button, Input, toast, Notification } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import NavigationService, { type MenuItem } from '@/services/NavigationService'

interface SubmenuItem {
  id: string
  name: string
  link: string
  children?: MenuItem[]
}

type MenuEditFormSchema = {
  menuName: string
  pageLink: string
  submenuItems: SubmenuItem[]
}

const validationSchema = Yup.object().shape({
  menuName: Yup.string().required('Menu name is required'),
  pageLink: Yup.string().required('Page link is required'),
  submenuItems: Yup.array().min(1, 'At least one submenu item is required'),
})

const MenuEdit = () => {
  const { menuId } = useParams<{ menuId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuData, setMenuData] = useState<MenuItem | null>(null)
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set())

  // Get data from navigation state or fetch from API
  const stateData = location.state as { 
    menuName?: string
    menuId?: string
    children?: MenuItem[]
    newSubmenu?: {
      id: string
      name: string
      link: string
      children: MenuItem[]
    }
    newGrandchild?: {
      id: string
      name: string
      link: string
      parentId: string
      parentName: string
    }
  }

  // Calculate initial values based on current state
  const getInitialValues = (): MenuEditFormSchema => {
    let existingChildren = stateData?.children?.map(child => ({
      id: child.id.toString(),
      name: child.title,
      link: child.url,
      children: child.children
    })) || []

    const newSubmenu = stateData?.newSubmenu ? [stateData.newSubmenu] : []

    // Handle new grandchild - add it to the appropriate parent
    if (stateData?.newGrandchild) {
      const grandchild = stateData.newGrandchild
      existingChildren = existingChildren.map(child => {
        if (child.id === grandchild.parentId) {
          return {
            ...child,
            children: [
              ...(child.children || []),
              {
                id: parseInt(grandchild.id),
                title: grandchild.name,
                url: grandchild.link,
                level: 3,
                page: null,
                specialty: null,
                children: []
              }
            ]
          }
        }
        return child
      })
    }

    const allSubmenuItems = [...existingChildren, ...newSubmenu]
    
    console.log('MenuEdit - State Data:', stateData)
    console.log('MenuEdit - Existing Children:', existingChildren)
    console.log('MenuEdit - New Submenu:', newSubmenu)
    console.log('MenuEdit - New Grandchild:', stateData?.newGrandchild)
    console.log('MenuEdit - All Submenu Items:', allSubmenuItems)

    return {
      menuName: stateData?.menuName || '',
      pageLink: '',
      submenuItems: allSubmenuItems
    }
  }

  const initialValues = getInitialValues()

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!menuId) return
      
      try {
        setLoading(true)
        const response = await NavigationService.getMenuItemById(parseInt(menuId))
        setMenuData(response.data)
      } catch (error) {
        console.error('Error fetching menu data:', error)
      } finally {
        setLoading(false)
      }
    }

    // If we don't have state data, fetch from API
    // Also skip API call if we have newSubmenu or newGrandchild data
    if (!stateData?.menuName && !stateData?.newSubmenu && !stateData?.newGrandchild) {
      fetchMenuData()
    } else {
      setLoading(false)
    }
  }, [menuId, stateData])

  const handleAddNewSubmenu = (currentSubmenuItems: SubmenuItem[]) => {
    // Navigate to the add submenu page with parent menu information
    navigate('/add-submenu', { 
      state: { 
        parentId: menuId, // The current menu ID becomes the parent ID
        parentMenuName: stateData?.menuName || menuData?.title,
        parentMenuId: menuId,
        existingChildren: currentSubmenuItems.map(item => ({
          id: parseInt(item.id),
          title: item.name,
          url: item.link,
          level: 1,
          page: null,
          specialty: null,
          children: item.children || []
        }))
      } 
    })
  }

  const handleAddGrandchild = (childId: string, childName: string, currentSubmenuItems: SubmenuItem[]) => {
    // Navigate to the add grandchild page
    navigate('/add-grandchild', { 
      state: { 
        parentId: childId, // The child menu ID becomes the parent ID for grandchild
        parentMenuName: childName,
        parentMenuId: menuId,
        grandparentMenuName: stateData?.menuName || menuData?.title,
        existingChildren: currentSubmenuItems.map(item => ({
          id: parseInt(item.id),
          title: item.name,
          url: item.link,
          level: 1,
          page: null,
          specialty: null,
          children: item.children || []
        }))
      } 
    })
  }

  const handleEditSubmenu = (id: string, name: string, children?: MenuItem[]) => {
    console.log('Edit submenu:', id)
    // Navigate to edit this submenu (recursive)
    navigate(`/menu-edit/${id}`, { 
      state: { 
        menuName: name, 
        menuId: id,
        children: children || [] 
      } 
    })
  }

  const handleViewSubmenu = (id: string) => {
    console.log('View submenu:', id)
  }

  const handleDeleteSubmenu = async (setFieldValue: any, submenuItems: SubmenuItem[], id: string) => {
    try {
      // Add item to deleting state
      setDeletingItems(prev => new Set(prev).add(id))
      
      // Call delete API
      await NavigationService.deleteMenu(parseInt(id))
      
      // Remove item from local state on successful deletion
      const updatedItems = submenuItems.filter(item => item.id !== id)
      setFieldValue('submenuItems', updatedItems)
      
      console.log(`Submenu item ${id} deleted successfully`)
      
      // Show success toast
      toast.push(
        <Notification type="success" duration={2500} title="Success">
          Submenu item deleted successfully
        </Notification>,
        { placement: 'top-end' }
      )
    } catch (error) {
      console.error('Error deleting submenu item:', error)
      
      // Show error toast
      toast.push(
        <Notification type="danger" duration={3000} title="Delete Failed">
          Failed to delete submenu item. Please try again.
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

  const handleDeleteGrandchild = async (setFieldValue: any, submenuItems: SubmenuItem[], parentId: string, grandchildId: string) => {
    try {
      // Add item to deleting state
      setDeletingItems(prev => new Set(prev).add(grandchildId))
      
      // Call delete API
      await NavigationService.deleteMenu(parseInt(grandchildId))
      
      // Remove grandchild from local state on successful deletion
      const updatedItems = submenuItems.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: item.children?.filter(child => child.id.toString() !== grandchildId) || []
          }
        }
        return item
      })
      setFieldValue('submenuItems', updatedItems)
      
      console.log(`Grandchild item ${grandchildId} deleted successfully`)
      
      // Show success toast
      toast.push(
        <Notification type="success" duration={2500} title="Success">
          Grandchild item deleted successfully
        </Notification>,
        { placement: 'top-end' }
      )
    } catch (error) {
      console.error('Error deleting grandchild item:', error)
      
      // Show error toast
      toast.push(
        <Notification type="danger" duration={3000} title="Delete Failed">
          Failed to delete grandchild item. Please try again.
        </Notification>,
        { placement: 'top-end' }
      )
    } finally {
      // Remove item from deleting state
      setDeletingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(grandchildId)
        return newSet
      })
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

  const handleDrop = (e: React.DragEvent, targetId: string, setFieldValue: any, submenuItems: SubmenuItem[]) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    const newItems = [...submenuItems]
    const draggedIndex = newItems.findIndex(item => item.id === draggedItem)
    const targetIndex = newItems.findIndex(item => item.id === targetId)

    const [draggedItemData] = newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItemData)

    setFieldValue('submenuItems', newItems)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const onSubmit = async (values: MenuEditFormSchema) => {
    try {
      console.log('Menu Edit Form Values:', values)
      
      // Update the main menu item
      if (menuId) {
        await NavigationService.updateMenuItem(parseInt(menuId), {
          title: values.menuName,
          url: values.pageLink
        })
      }

      // Here you would also update the submenu items
      // This would require additional API calls to update each submenu item
      
      console.log('Menu updated successfully')
    } catch (error) {
      console.error('Error updating menu:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading menu data...</div>
      </div>
    )
  }

  return (
    <>
      <p className="text-[#495057] font-inter text-[18px] font-semibold leading-normal mb-3">
        {stateData?.menuName || menuData?.title || 'Menu Edit'}
      </p>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {({ values, setFieldValue, touched, errors, isSubmitting }) => (
          <Form>
            <FormContainer>
              {/* Change Menu Details Section */}
              <Card className="bg-gray-50 rounded-xl mb-6">
                <div className="">
                  <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Change Menu Details</h3>
                  
                  <div className="space-y-4">
                    <FormItem
                      label="Menu Name"
                      labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                      invalid={(errors.menuName && touched.menuName) as boolean}
                      errorMessage={errors.menuName}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="menuName"
                        placeholder="Enter menu name"
                        component={Input}
                        className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        value={values.menuName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('menuName', e.target.value)}
                      />
                    </FormItem>

                    <FormItem
                      label="Page Link"
                      labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                      invalid={(errors.pageLink && touched.pageLink) as boolean}
                      errorMessage={errors.pageLink}
                    >
                      <Field
                        type="text"
                        autoComplete="off"
                        name="pageLink"
                        placeholder="Enter page link"
                        component={Input}
                        className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        value={values.pageLink}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('pageLink', e.target.value)}
                      />
                    </FormItem>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Navbar Submenu Section */}
              <Card className="bg-white rounded-xl">
                <div className="">
                  <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-6">Navbar Submenu</h3>
                  
                  {/* Submenu Items Nested Card */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                      <h4 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-3 sm:mb-0">Submenu Items</h4>
                      <Button
                        type="button"
                        onClick={() => handleAddNewSubmenu(values.submenuItems)}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#D60F8C_-49.54%,#8B5CF6_110.23%)] text-white text-center font-inter text-[14px] font-medium leading-normal !px-4 !py-1"
                      >
                        Add New Menu
                      </Button>
                    </div>

                    <div className="space-y-0">
                      {values.submenuItems.map((item, index) => (
                        <div key={item.id}>
                          {/* Main Menu Item */}
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, item.id, setFieldValue, values.submenuItems)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center justify-between py-3 transition-all duration-200 ${
                              draggedItem === item.id ? 'opacity-50 scale-95' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="cursor-move text-gray-400 hover:text-gray-600">
                                <img src="/img/images/grip-dots.svg" alt="grip-dots" className="w-5 h-5" />
                              </div>
                              <span className="text-gray-700 font-medium">{item.name}</span>
                              {item.children && item.children.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {item.children.length} children
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditSubmenu(item.id, item.name, item.children)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <img src="/img/images/Edittable.svg" alt="edit" className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleViewSubmenu(item.id)}
                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              >
                                <img src="/img/images/viewtable.svg" alt="view" className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubmenu(setFieldValue, values.submenuItems, item.id)}
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
                          
                    
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </Card>
            </FormContainer>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default MenuEdit
