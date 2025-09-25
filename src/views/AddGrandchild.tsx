import React, { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate, useLocation } from 'react-router-dom'
import { HiArrowLeft } from 'react-icons/hi'
import NavigationService, { type CreateMenuPayload } from '@/services/NavigationService'

interface AddGrandchildFormSchema {
  menuName: string
  pageLink: string
}

const validationSchema = Yup.object().shape({
  menuName: Yup.string().required('Menu name is required'),
  pageLink: Yup.string().required('Page link is required'),
})

const AddGrandchild = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get navigation state to determine parent menu information
  const { 
    parentId, 
    parentMenuName, 
    parentMenuId, 
    grandparentMenuName,
    existingChildren 
  } = location.state || {}

  const initialValues: AddGrandchildFormSchema = {
    menuName: '',
    pageLink: ''
  }

  const onSubmit = async (values: AddGrandchildFormSchema) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('Add Grandchild Form Values:', values)
      
      // Create the grandchild (3rd level)
      const payload: CreateMenuPayload = {
        menu_id: 1,
        parent_id: parentId, // This will be the child menu ID (2nd level)
        title: values.menuName,
        url: values.pageLink,
      }

      // Call the API
      const response = await NavigationService.createNavigationMenu(payload)
      
      console.log('Grandchild API Response:', response)
      
      // Navigate back to the parent menu edit page with the new grandchild data
      const navigationState = {
        menuName: parentMenuName,
        menuId: parentMenuId,
        children: existingChildren || [], // Preserve existing children
        newGrandchild: {
          id: response.data.id.toString(),
          name: values.menuName,
          link: values.pageLink,
          parentId: parentId,
          parentName: parentMenuName
        }
      }
      
      console.log('AddGrandchild - Navigation State:', navigationState)
      console.log('AddGrandchild - Existing Children:', existingChildren)
      console.log('AddGrandchild - New Grandchild:', navigationState.newGrandchild)
      
      navigate(`/menu-edit/${parentMenuId}`, { state: navigationState })
    } catch (error: any) {
      console.error('Error saving grandchild item:', error)
      setError(error.response?.data?.message || 'Failed to save grandchild item. Please try again.')
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
          {grandparentMenuName && parentMenuName && (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">
                Adding grandchild to: <span className="font-medium text-gray-800">{parentMenuName}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Under parent: <span className="font-medium">{grandparentMenuName}</span>
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
            {({ values, errors, touched }) => (
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

export default AddGrandchild
