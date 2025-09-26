import { Card, FormItem, Input, Select, Upload, Button, FormContainer, Notification } from '@/components/ui'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useState, useEffect, useRef } from 'react'
import { apiGetFooterCategories, apiCreateFooterContent, FooterCategory, FooterContentRequest } from '@/services/FooterService'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import toast from '@/components/ui/toast/toast'

const Footer = () => {
    const [categories, setCategories] = useState<FooterCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isUrlFileUploading, setIsUrlFileUploading] = useState(false)
    const [isIconFileUploading, setIsIconFileUploading] = useState(false)
    
    const urlFileInputRef = useRef<HTMLInputElement>(null)
    const iconFileInputRef = useRef<HTMLInputElement>(null)
    
    const [uploadFile] = useUploadFileMutation()

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true)
                const response = await apiGetFooterCategories()
                setCategories(response.data.data)
                setError(null)
            } catch (err) {
                console.error('Failed to fetch footer categories:', err)
                setError('Failed to load categories')
            } finally {
                setLoading(false)
            }
        }

        fetchCategories()
    }, [])

    // Transform categories to dropdown options
    // The dropdown will display all categories from the API response
    // Based on the API response, the second object (index 1) has name: "RMH Centers of Excellence"
    const categoryOptions = categories.map(category => ({
        value: category.id.toString(),
        label: category.name
    }))

    // Form validation schema
    const validationSchema = Yup.object().shape({
        category: Yup.string().required('Category is required'),
        title: Yup.string().required('Title is required'),
        slug: Yup.string().required('Slug is required'),
        content: Yup.string().required('Content is required'),
        urlFile: Yup.string().optional(),
        iconFile: Yup.string().optional()
    })

    // File upload handlers
    const handleUrlFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsUrlFileUploading(true)
            setFieldValue('urlFile', file.name)
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the field with the file path from the response
                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setFieldValue('urlFile', responseData.savedMedia.original_filename)
                } else if (responseData?.filePath) {
                    setFieldValue('urlFile', responseData.filePath)
                }
                
                // Reset the file input to allow re-uploading the same file if needed
                if (urlFileInputRef.current) {
                    urlFileInputRef.current.value = ''
                }
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'File upload failed'
            toast.push(
                <Notification type="danger" duration={2500} title="Upload Failed">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
            setFieldValue('urlFile', '')
        } finally {
            setIsUrlFileUploading(false)
        }
    }

    const handleIconFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsIconFileUploading(true)
            setFieldValue('iconFile', file.name)
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the field with the file path from the response
                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setFieldValue('iconFile', responseData.savedMedia.original_filename)
                } else if (responseData?.filePath) {
                    setFieldValue('iconFile', responseData.filePath)
                }
                
                // Reset the file input to allow re-uploading the same file if needed
                if (iconFileInputRef.current) {
                    iconFileInputRef.current.value = ''
                }
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'File upload failed'
            toast.push(
                <Notification type="danger" duration={2500} title="Upload Failed">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
            setFieldValue('iconFile', '')
        } finally {
            setIsIconFileUploading(false)
        }
    }

    // Initial form values
    const initialValues = {
        category: '',
        title: '',
        slug: '',
        urlFile: '',
        content: '',
        iconFile: ''
    }

    const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
        try {
        console.log('Form submitted:', values)
            
            // Prepare payload according to API requirements
            const payload: FooterContentRequest = {
                category_id: parseInt(values.category),
                title: values.title,
                slug: values.slug,
                content: values.content,
                url: values.urlFile || null,
                icon: values.iconFile || null
            }
            
            console.log('Sending payload to API:', payload)
            
            const response = await apiCreateFooterContent(payload)
            
            if (response.data.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        {response.data.message || 'Footer content created successfully!'}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Reset form after successful submission
                resetForm()
                
                // Reset file input refs
                if (urlFileInputRef.current) {
                    urlFileInputRef.current.value = ''
                }
                if (iconFileInputRef.current) {
                    iconFileInputRef.current.value = ''
                }
            } else {
                throw new Error(response.data.message || 'Failed to create footer content')
            }
        } catch (error: any) {
            console.error('Footer content creation error:', error)
            const errorMessage = error?.data?.message || error?.message || 'Failed to create footer content'
            toast.push(
                <Notification type="danger" duration={2500} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3 className="text-[#495057] font-inter text-[24px] font-semibold leading-normal">
                    Footer Management
                </h3>
            </div>
            <Card>
                <div className="p-6">
                    <h4 className="mb-6 text-[#495057] font-inter text-[18px] font-semibold leading-normal">
                        Footer Configuration
                    </h4>
                    
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                            <Form>
                                <FormContainer>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Category Dropdown */}
                                        <div>
                                            <FormItem
                                                label="Category"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.category && touched.category) as boolean}
                                                errorMessage={errors.category}
                                            >
                                                <Field name="category">
                                                    {({ field, form }: any) => (
                                                        <Select
                                                            {...field}
                                                            options={categoryOptions}
                                                            className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                            placeholder={loading ? "Loading categories..." : error ? "Error loading categories" : "Select category"}
                                                            isLoading={loading}
                                                            isDisabled={loading || !!error}
                                                            onChange={(option: any) => {
                                                                form.setFieldValue('category', option?.value || '')
                                                            }}
                                                            value={categoryOptions.find(option => option.value === field.value)}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                            {error && (
                                                <div className="text-red-500 text-sm mt-1">
                                                    {error}
                                                </div>
                                            )}
                                        </div>

                                        {/* Title Text Field */}
                                        <div>
                                            <FormItem
                                                label="Title"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.title && touched.title) as boolean}
                                                errorMessage={errors.title}
                                            >
                                                <Field
                                                    name="title"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter title"
                                                />
                                            </FormItem>
                                        </div>

                                        {/* Slug Text Field */}
                                        <div>
                                            <FormItem
                                                label="Slug"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.slug && touched.slug) as boolean}
                                                errorMessage={errors.slug}
                                            >
                                                <Field
                                                    name="slug"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter slug"
                                                />
                                            </FormItem>
                                        </div>

                                        {/* URL File Upload */}
                                        <div>
                                            <FormItem
                                                label="URL File Upload"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                            >
                                                <div className="flex gap-2">
                                                    <input
                                                        ref={urlFileInputRef}
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.svg,.webp"
                                                        onChange={(e) => handleUrlFileUpload(setFieldValue, e)}
                                                        className="hidden"
                                                        disabled={isUrlFileUploading}
                                                    />
                                                    <div className="flex-1">
                                                        <Input
                                                            value={values.urlFile || ''}
                                                            readOnly
                                                            className="w-full !rounded-[24px] border-gray-300 bg-gray-50 text-gray-700"
                                                            placeholder="File path will appear here"
                                                        />
                                                        {values.urlFile && values.urlFile.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i) && (
                                                            <div className="mt-2">
                                                                <img
                                                                    src={values.urlFile.startsWith('http') ? values.urlFile : `/uploads/${values.urlFile}`}
                                                                    alt="Uploaded file preview"
                                                                    className="w-full h-32 object-cover rounded-[12px] border border-gray-200"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none'
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => urlFileInputRef.current?.click()}
                                                        disabled={isUrlFileUploading}
                                                        className="!rounded-[24px] bg-gray-100 border border-gray-300 text-gray-700 px-6 py-2 font-medium hover:bg-gray-200 transition-colors"
                                                    >
                                                        {isUrlFileUploading ? 'Uploading...' : 'Upload File'}
                                                    </Button>
                                                </div>
                                            </FormItem>
                                        </div>

                                        {/* Content Text Field */}
                                        <div className='md:col-span-2'>
                                            <FormItem
                                                label="Content"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.content && touched.content) as boolean}
                                                errorMessage={errors.content}
                                            >
                                                <Field
                                                    name="content"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter content"
                                                />
                                            </FormItem>
                                        </div>

                                        {/* Icon File Upload */}
                                        <div className="md:col-span-2">
                                            <FormItem
                                                label="Icon Upload"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                            >
                                                <div className="flex gap-2">
                                                    <input
                                                        ref={iconFileInputRef}
                                                        type="file"
                                                        accept=".png,.jpg,.jpeg,.svg,.ico"
                                                        onChange={(e) => handleIconFileUpload(setFieldValue, e)}
                                                        className="hidden"
                                                        disabled={isIconFileUploading}
                                                    />
                                                    <Input
                                                        value={values.iconFile || ''}
                                                        readOnly
                                                        className="flex-1 !rounded-[24px] border-gray-300 bg-gray-50 text-gray-700"
                                                        placeholder="Icon file path will appear here"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => iconFileInputRef.current?.click()}
                                                        disabled={isIconFileUploading}
                                                        className="!rounded-[24px] bg-gray-100 border border-gray-300 text-gray-700 px-6 py-2 font-medium hover:bg-gray-200 transition-colors"
                                                    >
                                                        {isIconFileUploading ? 'Uploading...' : 'Upload File'}
                                                    </Button>
                                                </div>
                                            </FormItem>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end mt-6">
                                        <Button 
                                            type="submit"
                                            loading={isSubmitting}
                                            className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-8 py-2 font-medium transition-all duration-200 hover:shadow-lg"
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
        </div>
    )
}

export default Footer
