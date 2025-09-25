import React, { useState, useEffect } from 'react'
import { Card, Button, Input } from '@/components/ui'
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

type AboutUsMenuFormSchema = {
  menuName: string
  pageLink: string
  submenuItems: SubmenuItem[]
}

const validationSchema = Yup.object().shape({
  menuName: Yup.string().required('Menu name is required'),
  pageLink: Yup.string().required('Page link is required'),
  submenuItems: Yup.array().min(1, 'At least one submenu item is required'),
})

const AboutUsMenuEdit = () => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuData, setMenuData] = useState<MenuItem | null>(null)

  const initialValues: AboutUsMenuFormSchema = {
    menuName: 'About Us',
    pageLink: '/about',
    submenuItems: []
  }

  useEffect(() => {
    const fetchAboutUsMenu = async () => {
      try {
        setLoading(true)
        const response = await NavigationService.getMainHeaderMenu()
        const mainHeaderMenu = response.data[0]
        
        if (mainHeaderMenu && mainHeaderMenu.items) {
          // Find the "About Us" menu item
          const aboutUsItem = mainHeaderMenu.items.find(item => 
            item.title.toLowerCase().includes('about')
          )
          
          if (aboutUsItem) {
            setMenuData(aboutUsItem)
            initialValues.menuName = aboutUsItem.title
            initialValues.pageLink = aboutUsItem.url
            initialValues.submenuItems = aboutUsItem.children?.map(child => ({
              id: child.id.toString(),
              name: child.title,
              link: child.url,
              children: child.children
            })) || []
          }
        }
      } catch (error) {
        console.error('Error fetching About Us menu:', error)
        // Fallback to default values
        initialValues.submenuItems = [
          { id: '1', name: 'About Group', link: '/about-group' },
          { id: '2', name: 'About Hospitalllllll', link: '/about-hospital' },
          { id: '3', name: 'Media & Events', link: '/media-events' },
        ]
      } finally {
        setLoading(false)
      }
    }

    fetchAboutUsMenu()
  }, [])

  const handleAddNewSubmenu = (setFieldValue: any, submenuItems: SubmenuItem[]) => {
    const newItem: SubmenuItem = {
      id: Date.now().toString(),
      name: 'New Submenu',
      link: '/new-submenu'
    }
    setFieldValue('submenuItems', [...submenuItems, newItem])
  }

  const handleEditSubmenu = (id: string, name: string, children?: MenuItem[]) => {
    console.log('Edit submenu:', id)
    // Navigate to edit this submenu (recursive)
    window.location.href = `/menu-edit/${id}`
  }

  const handleViewSubmenu = (id: string) => {
    console.log('View submenu:', id)
  }

  const handleDeleteSubmenu = (setFieldValue: any, submenuItems: SubmenuItem[], id: string) => {
    const updatedItems = submenuItems.filter(item => item.id !== id)
    setFieldValue('submenuItems', updatedItems)
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

  const onSubmit = async (values: AboutUsMenuFormSchema) => {
    try {
      console.log('About Us Menu Form Values:', values)
      
      // Update the main menu item if we have menu data
      if (menuData) {
        await NavigationService.updateMenuItem(menuData.id, {
          title: values.menuName,
          url: values.pageLink
        })
      }

      // Here you would also update the submenu items
      // This would require additional API calls to update each submenu item
      
      console.log('About Us menu updated successfully')
    } catch (error) {
      console.error('Error updating About Us menu:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading About Us menu data...</div>
      </div>
    )
  }

  return (
    <>
      <p className="text-[#495057] font-inter text-[18px] font-semibold leading-normal mb-3">About Us</p>
      
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
                  <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-6">Navbarssss Submenu</h3>
                  
                  {/* Submenu Items Nested Card */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                      <h4 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-3 sm:mb-0">Submenu Items</h4>
                      <Button
                        type="button"
                        onClick={() => handleAddNewSubmenu(setFieldValue, values.submenuItems)}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#D60F8C_-49.54%,#8B5CF6_110.23%)] text-white text-center font-inter text-[14px] font-medium leading-normal !px-4 !py-1"
                      >
                        Add New Menu
                      </Button>
                    </div>

                    <div className="space-y-0">
                      {values.submenuItems.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, item.id, setFieldValue, values.submenuItems)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between py-3 transition-all duration-200 ${
                            draggedItem === item.id ? 'opacity-50 scale-95' : ''
                          } 
                            `}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="cursor-move text-gray-400 hover:text-gray-600">
                              <img src="/img/images/grip-dots.svg" alt="grip-dots" className="w-5 h-5" />
                            </div>
                            <span className="text-gray-700 font-medium">{item.name}</span>
                            {item.children && item.children.length > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {item.children.length} sub-items
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
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <img src="/img/images/deatetable.svg" alt="delete" className="w-5 h-5" />
                            </button>
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

export default AboutUsMenuEdit
