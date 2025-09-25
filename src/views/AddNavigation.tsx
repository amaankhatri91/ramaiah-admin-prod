import React, { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useNavigate, useLocation } from 'react-router-dom'
import { HiArrowLeft } from 'react-icons/hi'
import NavigationService, { type CreateMenuPayload } from '@/services/NavigationService'

interface AddNavigationFormSchema {
  menuName: string
  pageLink: string
}

const validationSchema = Yup.object().shape({
  menuName: Yup.string().required('Menu name is required'),
  pageLink: Yup.string().required('Page link is required'),
})

const AddNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get navigation state to determine if this is a parent menu
  const { isParentMenu = true, parentId = null } = location.state || {}

  const initialValues: AddNavigationFormSchema = {
    menuName: '',
    pageLink: ''
  }

  const onSubmit = async (values: AddNavigationFormSchema) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      console.log('Add Navigation Form Values:', values)
      
      // Prepare the API payload
      const payload: CreateMenuPayload = {
        menu_id: 1,
        parent_id: isParentMenu ? null : parentId,
        title: values.menuName,
        url: values.pageLink,
      }

      // Call the API
      const response = await NavigationService.createNavigationMenu(payload)
      
      console.log('API Response:', response)
      
      // Navigate back to the header page after successful submission
      navigate('/header')
    } catch (error: any) {
      console.error('Error saving navigation item:', error)
      setError(error.response?.data?.message || 'Failed to save navigation item. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    navigate('/header')
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

export default AddNavigation
