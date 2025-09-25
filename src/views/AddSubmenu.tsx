import React, { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate, useLocation } from 'react-router-dom'
import { HiArrowLeft } from 'react-icons/hi'
import NavigationService, { type CreateMenuPayload } from '@/services/NavigationService'

interface AddSubmenuFormSchema {
  menuName: string
  pageLink: string
  children: Array<{
    id: string
    name: string
    link: string
  }>
}

const validationSchema = Yup.object().shape({
  menuName: Yup.string().required('Menu name is required'),
  pageLink: Yup.string().required('Page link is required'),
})

const AddSubmenu = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get navigation state to determine parent menu information
  const { parentId, parentMenuName, parentMenuId, existingChildren } = location.state || {}

  const initialValues: AddSubmenuFormSchema = {
    menuName: '',
    pageLink: '',
    children: []
  }

  const handleAddChild = (setFieldValue: any, children: any[]) => {
    const newChild = {
      id: Date.now().toString(),
      name: '',
      link: ''
    }
    setFieldValue('children', [...children, newChild])
  }

  const handleRemoveChild = (setFieldValue: any, children: any[], index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index)
    setFieldValue('children', updatedChildren)
  }

  const handleChildChange = (setFieldValue: any, children: any[], index: number, field: string, value: string) => {
    const updatedChildren = children.map((child, i) => 
      i === index ? { ...child, [field]: value } : child
    )
    setFieldValue('children', updatedChildren)
  }

  const onSubmit = async (values: AddSubmenuFormSchema) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('Add Submenu Form Values:', values)
      
      // Create the main submenu first
      const mainPayload: CreateMenuPayload = {
        menu_id: 1,
        parent_id: parentId, // This will be the parent menu ID
        title: values.menuName,
        url: values.pageLink,
      }

      // Call the API for main submenu
      const mainResponse = await NavigationService.createNavigationMenu(mainPayload)
      console.log('Main Submenu API Response:', mainResponse)

      // Create children if any
      const childrenData = []
      if (values.children && values.children.length > 0) {
        for (const child of values.children) {
          if (child.name.trim() && child.link.trim()) {
            const childPayload: CreateMenuPayload = {
              menu_id: 1,
              parent_id: mainResponse.data.id, // Parent is the main submenu we just created
              title: child.name,
              url: child.link,
            }
            
            const childResponse = await NavigationService.createNavigationMenu(childPayload)
            console.log('Child API Response:', childResponse)
            
            childrenData.push({
              id: childResponse.data.id,
              title: child.name,
              url: child.link,
              level: 2,
              page: null,
              specialty: null,
              children: []
            })
          }
        }
      }
      
      // Navigate back to the parent menu edit page with the new submenu data
      const navigationState = {
        menuName: parentMenuName,
        menuId: parentMenuId,
        children: existingChildren || [], // Preserve existing children
        newSubmenu: {
          id: mainResponse.data.id.toString(),
          name: values.menuName,
          link: values.pageLink,
          children: childrenData
        }
      }
      
      console.log('AddSubmenu - Navigation State:', navigationState)
      console.log('AddSubmenu - Existing Children:', existingChildren)
      console.log('AddSubmenu - New Submenu:', navigationState.newSubmenu)
      
      navigate(`/menu-edit/${parentMenuId}`, { state: navigationState })
    } catch (error: any) {
      console.error('Error saving submenu item:', error)
      setError(error.response?.data?.message || 'Failed to save submenu item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    // Navigate back to the parent menu edit page
    navigate(`/menu-edit/${parentMenuId}`)
  }

  return (
    <div className=" bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full  bg-white rounded-xl shadow-lg">
        <div className="p-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-8">
            Change Menu Details
          </h1>

          {/* Context Information */}
          {parentMenuName && (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Adding submenu to: <span className="font-medium text-gray-800">{parentMenuName}</span>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form>
                <div className="space-y-6">
                  {/* Menu Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Menu Name
                    </label>
                    <Field name="menuName">
                      {({ field, form }: any) => (
                        <Input
                          {...field}
                          placeholder="Enter menu name"
                          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      )}
                    </Field>
                    {errors.menuName && touched.menuName && (
                      <p className="mt-1 text-sm text-red-600">{errors.menuName}</p>
                    )}
                  </div>

                  {/* Page Link Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Link
                    </label>
                    <Field name="pageLink">
                      {({ field, form }: any) => (
                        <Input
                          {...field}
                          placeholder="Enter page link"
                          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      )}
                    </Field>
                    {errors.pageLink && touched.pageLink && (
                      <p className="mt-1 text-sm text-red-600">{errors.pageLink}</p>
                    )}
                  </div>
                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-8 py-2 font-medium transition-all duration-200 hover:shadow-lg"
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default AddSubmenu
