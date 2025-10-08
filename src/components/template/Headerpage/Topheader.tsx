import { Card, Input, Button } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState, useEffect, useRef } from 'react'
import { apiGetHeaderSettings, type HeaderSettings, type SettingItem } from '@/services/HeaderService'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { useUpdateHeaderSettingsMutation } from '@/store/slices/header'
import { toast, Notification } from '@/components/ui'

type HeaderFormSchema = {
    generalEnquiries: string
    emergencyNumber: string
    preBookAppointments: string
    logoFileName: string
    contentSearchIconFileName: string
    ambulanceLogoFileName: string
}

const validationSchema = Yup.object().shape({
    generalEnquiries: Yup.string().required('General enquiries number is required'),
    emergencyNumber: Yup.string().required('Emergency number is required'),
    preBookAppointments: Yup.string().required('Pre-book appointments number is required'),
    logoFileName: Yup.string().required('Logo file is required'),
    contentSearchIconFileName: Yup.string().required('Content search icon file is required'),
    ambulanceLogoFileName: Yup.string().required('Ambulance logo file is required'),
})

const Topheader = () => {
    const [logoFile, setLogoFile] = useState<string>('In affiliation logo.png')
    const [contentSearchIconFile, setContentSearchIconFile] = useState<string>('content_search_icon.png')
    const [ambulanceLogoFile, setAmbulanceLogoFile] = useState<string>('ambulance_logo.png')
    
    // State for API data
    const [headerSettings, setHeaderSettings] = useState<HeaderSettings | null>(null)
    const [settingsData, setSettingsData] = useState<SettingItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    
    // Upload mutation
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const [updateHeaderSettings, { isLoading: isUpdating }] = useUpdateHeaderSettingsMutation()
    const logoFileRef = useRef<HTMLInputElement>(null)
    const contentSearchIconFileRef = useRef<HTMLInputElement>(null)
    const ambulanceLogoFileRef = useRef<HTMLInputElement>(null)
    
    // Individual loading states for each upload button
    const [isLogoUploading, setIsLogoUploading] = useState(false)
    const [isContentSearchIconUploading, setIsContentSearchIconUploading] = useState(false)
    const [isAmbulanceLogoUploading, setIsAmbulanceLogoUploading] = useState(false)

    // Fetch header settings using useEffect
    useEffect(() => {
        const fetchHeaderSettings = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const response = await apiGetHeaderSettings()
                console.log('Header API Response:', response)
                
                // Handle array response structure
                let headerData: HeaderSettings | null = null
                if (response.data) {
                    const settingsArray = response.data.data || response.data
                    
                    // Store the raw settings data for update API
                    setSettingsData(settingsArray)
                    
                    // If it's an array, map the settings by key
                    if (Array.isArray(settingsArray)) {
                        const settingsMap = settingsArray.reduce((acc: any, setting: any) => {
                            acc[setting.setting_key] = setting.setting_value
                            return acc
                        }, {})
                        
                        // Map the settings to our HeaderSettings interface
                        headerData = {
                            generalEnquiries: settingsMap.general_enquiries || '+91 80 6215 3300',
                            emergencyNumber: settingsMap.emergency_number || '1800 123 1133',
                            preBookAppointments: settingsMap.pre_book_your_appointments || '+91 80 6215 3400',
                            logoFileName: settingsMap.in_affiliation_with ? settingsMap.in_affiliation_with.split('/').pop() : 'In affiliation logo.png',
                            contentSearchIconFileName: settingsMap.content_search_icon ? settingsMap.content_search_icon.split('/').pop() : 'content_search_icon.png',
                            ambulanceLogoFileName: settingsMap.ambulance_logo ? settingsMap.ambulance_logo.split('/').pop() : 'ambulance_logo.png'
                        }
                        
                        console.log('Settings map:', settingsMap)
                        console.log('Mapped header data:', headerData)
                    } else {
                        // If it's not an array, use as is
                        headerData = settingsArray
                    }
                } else {
                    // If response is direct data
                    headerData = response as unknown as HeaderSettings
                }
                
                console.log('Extracted header data:', headerData)
                setHeaderSettings(headerData)
            } catch (err) {
                console.error('Error fetching header settings:', err)
                setError('Failed to load header settings')
            } finally {
                setIsLoading(false)
            }
        }

        fetchHeaderSettings()
    }, [])

    const initialValues: HeaderFormSchema = {
        generalEnquiries: headerSettings?.generalEnquiries || '+91 80 6215 3300',
        emergencyNumber: headerSettings?.emergencyNumber || '1800 123 1133',
        preBookAppointments: headerSettings?.preBookAppointments || '+91 80 6215 3400',
        logoFileName: headerSettings?.logoFileName || logoFile,
        contentSearchIconFileName: headerSettings?.contentSearchIconFileName || contentSearchIconFile,
        ambulanceLogoFileName: headerSettings?.ambulanceLogoFileName || ambulanceLogoFile
    }
    

    const handleLogoFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsLogoUploading(true)
            setLogoFile(file.name)
            setFieldValue('logoFileName', file.name)
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the logo with the uploaded file path
                if (result.data?.filePath) {
                    setFieldValue('logoFileName', result.data.filePath)
                }
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'File upload failed'
            toast.push(
                <Notification type="danger" duration={3000} title="Upload Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
            
            // Reset the field value on error
            setFieldValue('logoFileName', '')
        } finally {
            setIsLogoUploading(false)
        }
    }

    const handleContentSearchIconFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsContentSearchIconUploading(true)
            setContentSearchIconFile(file.name)
            setFieldValue('contentSearchIconFileName', file.name)
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the content search icon with the uploaded file path
                if (result.data?.filePath) {
                    setFieldValue('contentSearchIconFileName', result.data.filePath)
                }
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'File upload failed'
            toast.push(
                <Notification type="danger" duration={3000} title="Upload Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
            
            // Reset the field value on error
            setFieldValue('contentSearchIconFileName', '')
        } finally {
            setIsContentSearchIconUploading(false)
        }
    }

    const handleAmbulanceLogoFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsAmbulanceLogoUploading(true)
            setAmbulanceLogoFile(file.name)
            setFieldValue('ambulanceLogoFileName', file.name)
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the ambulance logo with the uploaded file path
                if (result.data?.filePath) {
                    setFieldValue('ambulanceLogoFileName', result.data.filePath)
                }
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'File upload failed'
            toast.push(
                <Notification type="danger" duration={3000} title="Upload Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
            
            // Reset the field value on error
            setFieldValue('ambulanceLogoFileName', '')
        } finally {
            setIsAmbulanceLogoUploading(false)
        }
    }

    const onSubmit = async (values: HeaderFormSchema) => {
        console.log('Header Form Values:', values)
        
        try {
            // Create the payload for the update API
            const updatePayload = {
                settings: [
                    {
                        id: settingsData.find(s => s.setting_key === 'general_enquiries')?.id || 0,
                        setting_value: values.generalEnquiries
                    },
                    {
                        id: settingsData.find(s => s.setting_key === 'emergency_number')?.id || 0,
                        setting_value: values.emergencyNumber
                    },
                    {
                        id: settingsData.find(s => s.setting_key === 'pre_book_your_appointments')?.id || 0,
                        setting_value: values.preBookAppointments
                    },
                    {
                        id: settingsData.find(s => s.setting_key === 'in_affiliation_with')?.id || 0,
                        setting_value:  `${values.logoFileName}`
                    },
                    {
                        id: settingsData.find(s => s.setting_key === 'content_search_icon')?.id || 0,
                        setting_value:`${values.contentSearchIconFileName}`
                    },
                    {
                        id: settingsData.find(s => s.setting_key === 'ambulance_logo')?.id || 0,
                        setting_value: `${values.ambulanceLogoFileName}`
                    }
                ]
            }

            console.log('Update payload:', updatePayload)
            
            const result = await updateHeaderSettings(updatePayload).unwrap()
            
            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Update Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update header settings'
            toast.push(
                <Notification type="danger" duration={3000} title="Update Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }
 
  return (
    <>
         <p className="text-[#495057] font-inter text-[18px] font-semibold leading-normal">Header</p>
            <Card className="bg-gray-50 rounded-xl">
                <div className="px-2">

                    <Formik
                        key={headerSettings ? 'loaded' : 'loading'}
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                        enableReinitialize={true}
                    >
                        {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                            <Form>
                                <FormContainer>
                                    {/* Top Header Section */}
                                    <div className="">
                                        <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Top Header</h3>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <FormItem
                                                label="General Enquiries"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.generalEnquiries && touched.generalEnquiries) as boolean}
                                                errorMessage={errors.generalEnquiries}
                                            >
                                                <Field
                                                    name="generalEnquiries"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter general enquiries number"
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Emergency Number"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.emergencyNumber && touched.emergencyNumber) as boolean}
                                                errorMessage={errors.emergencyNumber}
                                            >
                                                <Field
                                                    name="emergencyNumber"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter emergency number"
                                                />
                                            </FormItem>

                                            <FormItem
                                                label="Pre-Book Your Appointments"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.preBookAppointments && touched.preBookAppointments) as boolean}
                                                errorMessage={errors.preBookAppointments}
                                            >
                                                <Field
                                                    name="preBookAppointments"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter pre-book appointments number"
                                                />
                                            </FormItem>
                                        </div>
                                    </div>

                                    {/* Upload Logo Section */}
                                    <div className="mb-6">
                                        <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">In Affiliation Logo</h3>

                                        <div className="flex w-full">
                                            <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                                <div className="flex-1 mb-3 sm:mb-0">
                                                    <span className="text-gray-700 font-medium pl-4">{values.logoFileName}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <label className="cursor-pointer">
                                                        <input
                                                            ref={logoFileRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleLogoFileUpload(setFieldValue, e)}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            loading={isLogoUploading}
                                                            onClick={() => logoFileRef.current?.click()}
                                                            className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                        >
                                                            {isLogoUploading ? 'Uploading...' : 'Upload File'}
                                                        </Button>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Content Search Icon Section */}
                                    {/* <div className="mb-6">
                                        <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Upload Logo 2</h3>

                                        <div className="flex w-full">
                                            <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                                <div className="flex-1 mb-3 sm:mb-0">
                                                    <span className="text-gray-700 font-medium pl-4">{values.contentSearchIconFileName}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <label className="cursor-pointer">
                                                        <input
                                                            ref={contentSearchIconFileRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleContentSearchIconFileUpload(setFieldValue, e)}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            loading={isContentSearchIconUploading}
                                                            onClick={() => contentSearchIconFileRef.current?.click()}
                                                            className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                        >
                                                            {isContentSearchIconUploading ? 'Uploading...' : 'Upload File'}
                                                        </Button>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}

                                    {/* Upload Ambulance Logo Section */}
                                    {/* <div className="mb-6">
                                        <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Upload Logo 3</h3>

                                        <div className="flex w-full">
                                            <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                                <div className="flex-1 mb-3 sm:mb-0">
                                                    <span className="text-gray-700 font-medium pl-4">{values.ambulanceLogoFileName}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <label className="cursor-pointer">
                                                        <input
                                                            ref={ambulanceLogoFileRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleAmbulanceLogoFileUpload(setFieldValue, e)}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            loading={isAmbulanceLogoUploading}
                                                            onClick={() => ambulanceLogoFileRef.current?.click()}
                                                            className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                        >
                                                            {isAmbulanceLogoUploading ? 'Uploading...' : 'Upload File'}
                                                        </Button>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}

                                    {/* Save Button */}
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            loading={isSubmitting || isUpdating}
                                            className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                                        >
                                            {(isSubmitting || isUpdating) ? 'Saving...' : 'Save'}
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

export default Topheader