import { Card, Input, Button, Select } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState, useRef, useEffect } from 'react'
import { useGetHomeDataQuery, useUpdateHomeSectionMutation } from '@/store/slices/home'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { parseAccreditationsSection, ContentBlock } from '@/services/HomeService'
import { toast, Notification } from '@/components/ui'

interface Certificate {
    id: string
    name: string
    nameHeadingLevel: string
    image: string
    media_file_id?: number
}

type AccreditationsFormSchema = {
    headerText: string
    headerTextHeadingLevel: string
    certificates: Certificate[]
}

const headingLevelOptions = [
    { value: 'h1', label: 'H1' },
    { value: 'h2', label: 'H2' },
    { value: 'h3', label: 'H3' },
    { value: 'h4', label: 'H4' },
    { value: 'h5', label: 'H5' },
    { value: 'h6', label: 'H6' },
]

const validationSchema = Yup.object().shape({
    headerText: Yup.string().required('Header text is required'),
    headerTextHeadingLevel: Yup.string().required('Header text heading level is required'),
    certificates: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Certificate name is required'),
            nameHeadingLevel: Yup.string().required('Certificate name heading level is required'),
            image: Yup.string().required('Certificate image is required'),
        })
    ).min(1, 'At least one certificate is required'),
})

const AccreditationsSection = () => {
    const [updateHomeSection, { isLoading: isUpdating }] = useUpdateHomeSectionMutation()
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const { data: homeData, isLoading: isLoadingData, error } = useGetHomeDataQuery()
    const [isCertificateUploading, setIsCertificateUploading] = useState<{ [key: string]: boolean }>({})
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
    const [initialFormValues, setInitialFormValues] = useState<AccreditationsFormSchema | null>(null)

    // Store initial values when data is loaded
    useEffect(() => {
        // homeData.data is now the content_blocks array (extracted in API slice)
        const contentBlocks = Array.isArray(homeData?.data) ? homeData.data : []
        if (contentBlocks && contentBlocks.length > 0 && !initialFormValues) {
            const initialValues = getInitialValues()
            setInitialFormValues(initialValues)
            console.log('Initial accreditations form values stored:', initialValues)
        }
    }, [homeData, initialFormValues])

    // Parse heading level from custom_css (e.g., "heading-level:h1") or default
    const getHeadingLevel = (block: ContentBlock | undefined, defaultValue: string): string => {
        if (!block?.custom_css) return defaultValue
        const match = block.custom_css.match(/heading-level:\s*(h[1-6])/i)
        return match ? match[1].toLowerCase() : defaultValue
    }

    const getInitialValues = (): AccreditationsFormSchema => {
        // homeData.data is now the content_blocks array (extracted in API slice)
        const contentBlocks = Array.isArray(homeData?.data) ? homeData.data : []
        
        if (!contentBlocks || contentBlocks.length === 0) {
            return {
                headerText: 'Our Accreditations & Certifications',
                headerTextHeadingLevel: 'h1',
                certificates: [
                    { id: '1', name: 'JCI', nameHeadingLevel: 'h2', image: 'JCI_Certificate.png' },
                    { id: '2', name: 'JCI', nameHeadingLevel: 'h2', image: 'JCI_Certificate.png' },
                    { id: '3', name: 'JCI', nameHeadingLevel: 'h2', image: 'JCI_Certificate.png' },
                    { id: '4', name: 'JCI', nameHeadingLevel: 'h2', image: 'JCI_Certificate.png' }
                ]
            }
        }
        
        // Parse the data based on block types
        const accreditationBlocks = contentBlocks.filter((block: ContentBlock) => block.section_id === 5)
        
        // Get header text from text block type
        const textBlock = accreditationBlocks.find((block: ContentBlock) => block.block_type === 'text')
        const headerText = textBlock?.content || textBlock?.title || 'Our Accreditations & Certifications'
        const headerTextHeadingLevel = getHeadingLevel(textBlock, 'h1')
        
        // Get certificates from image block type
        const imageBlocks = accreditationBlocks.filter((block: ContentBlock) => block.block_type === 'image')
        const certificates = imageBlocks.length > 0 ? imageBlocks.map((block, index) => ({
            id: block.id.toString(),
            name: block.title,
            nameHeadingLevel: getHeadingLevel(block, 'h2'),
            image: block.media_files?.[0]?.media_file?.original_filename || 'certificate.png',
            media_file_id: block.media_files?.[0]?.media_file?.id
        })) : [
            { id: '1', name: 'JCI', nameHeadingLevel: 'h2', image: 'JCI_Certificate.png' },
            { id: '2', name: 'JCI', nameHeadingLevel: 'h2', image: 'JCI_Certificate.png' },
            { id: '3', name: 'JCI', nameHeadingLevel: 'h2', image: 'JCI_Certificate.png' },
            { id: '4', name: 'JCI', nameHeadingLevel: 'h2', image: 'JCI_Certificate.png' }
        ]
        
        return {
            headerText: headerText,
            headerTextHeadingLevel: headerTextHeadingLevel,
            certificates: certificates
        }
    }

    const handleCertificateChange = (setFieldValue: any, certificates: Certificate[], id: string, field: 'name' | 'image' | 'nameHeadingLevel', value: string) => {
        const updatedCertificates = certificates.map(cert => 
            cert.id === id ? { ...cert, [field]: value } : cert
        )
        setFieldValue('certificates', updatedCertificates)
    }

    const handleImageUpload = async (setFieldValue: any, certificates: Certificate[], id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsCertificateUploading(prev => ({ ...prev, [id]: true }))
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the certificate with the original filename and media file ID from the response
                const responseData = result.data as any
                const updatedCertificates = certificates.map(cert => {
                    if (cert.id === id) {
                        const updatedCert = { ...cert }
                        
                        // Update the image filename
                        if (responseData?.savedMedia?.original_filename) {
                            updatedCert.image = responseData.savedMedia.original_filename
                        } else if (responseData?.filePath) {
                            // Fallback to filePath if original_filename is not available
                            updatedCert.image = responseData.filePath
                        }
                        
                        // Set the media file ID for the API call
                        if (responseData?.savedMedia?.id) {
                            updatedCert.media_file_id = responseData.savedMedia.id
                            console.log('Certificate file upload - savedMedia.id:', responseData.savedMedia.id)
                        }
                        
                        return updatedCert
                    }
                    return cert
                })
                
                // Update the form with the new certificate data
                setFieldValue('certificates', updatedCertificates)
                console.log('Updated certificates after upload:', updatedCertificates)
                
                // Reset the file input to allow re-uploading the same file if needed
                if (fileInputRefs.current[id]) {
                    fileInputRefs.current[id].value = ''
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
        } finally {
            setIsCertificateUploading(prev => ({ ...prev, [id]: false }))
        }
    }

    const handleAddCertificate = (setFieldValue: any, certificates: Certificate[]) => {
        const newCertificate: Certificate = {
            id: Date.now().toString(),
            name: 'JCI',
            nameHeadingLevel: 'h2',
            image: 'JCI_Certificate.png'
        }
        setFieldValue('certificates', [...certificates, newCertificate])
    }

    const onSubmit = async (values: AccreditationsFormSchema) => {
        try {
            // homeData.data is now the content_blocks array (extracted in API slice)
            const allContentBlocks = Array.isArray(homeData?.data) ? homeData.data : []
            
            // Get the current accreditations section data to build the update structure
            const accreditationBlocks = allContentBlocks.filter((block: ContentBlock) => block.section_id === 5) || []
            
            // Get initial values to compare changes
            if (!initialFormValues) {
                toast.push(
                    <Notification type="danger" duration={3000} title="Error">
                        Initial values not loaded. Please refresh the page.
                    </Notification>,
                    { placement: 'top-end' }
                )
                return
            }
            const initialValues = initialFormValues
            
            // Build content blocks array - only include changed blocks
            const contentBlocks: any[] = []
            const changedObjects: string[] = []
            
            // Check if certificates changed
            const initialCertificates = initialValues.certificates
            const currentCertificates = values.certificates
            
            // Check if certificates array changed (length, names, nameHeadingLevels, or media_file_ids)
            const certificatesChanged = 
                initialCertificates.length !== currentCertificates.length ||
                initialCertificates.some((initial, index) => {
                    const current = currentCertificates[index]
                    return !current || 
                           initial.name !== current.name || 
                           initial.nameHeadingLevel !== current.nameHeadingLevel ||
                           initial.media_file_id !== current.media_file_id
                })
            
            // Handle header text and heading level changes (text block type)
            const headerTextChanged = values.headerText !== initialValues.headerText
            const headerTextHeadingLevelChanged = values.headerTextHeadingLevel !== initialValues.headerTextHeadingLevel
            
            if (headerTextChanged || headerTextHeadingLevelChanged) {
                console.log('Header text changed:', {
                    initial: initialValues.headerText,
                    current: values.headerText,
                    headingLevelInitial: initialValues.headerTextHeadingLevel,
                    headingLevelCurrent: values.headerTextHeadingLevel
                })
                
                // Find existing text block or create new one
                const existingTextBlock = accreditationBlocks.find((block: ContentBlock) => block.block_type === 'text')
                
                // Build custom_css with heading level, preserving existing custom_css if any
                let customCss = existingTextBlock?.custom_css || ''
                if (headerTextHeadingLevelChanged) {
                    // Replace existing heading-level or add new one
                    if (customCss.match(/heading-level:\s*h[1-6]/i)) {
                        customCss = customCss.replace(/heading-level:\s*h[1-6]/i, `heading-level:${values.headerTextHeadingLevel}`)
                    } else {
                        customCss = customCss ? `${customCss}; heading-level:${values.headerTextHeadingLevel}` : `heading-level:${values.headerTextHeadingLevel}`
                    }
                } else if (!customCss.match(/heading-level:/i) && existingTextBlock) {
                    // Add default if not present and block exists
                    customCss = customCss ? `${customCss}; heading-level:${values.headerTextHeadingLevel}` : `heading-level:${values.headerTextHeadingLevel}`
                }
                
                if (existingTextBlock) {
                    // Update existing text block
                    contentBlocks.push({
                        id: existingTextBlock.id,
                        block_type: existingTextBlock.block_type,
                        title: values.headerText,
                        content: values.headerText,
                        custom_css: customCss,
                        media_files: []
                    })
                } else {
                    // Create new text block
                    contentBlocks.push({
                        block_type: "text",
                        title: values.headerText,
                        content: values.headerText,
                        custom_css: customCss,
                        media_files: []
                    })
                }
                
                changedObjects.push('Header Text')
            }
            
            // Handle certificate changes (image block type)
            if (certificatesChanged) {
                console.log('Certificates changed:', {
                    initial: initialCertificates,
                    current: currentCertificates
                })
                
                // Process each certificate
                values.certificates.forEach((certificate, index) => {
                    const initialCertificate = initialCertificates[index]
                    
                    // Check if this certificate has changed
                    const nameChanged = !initialCertificate || initialCertificate.name !== certificate.name
                    const nameHeadingLevelChanged = !initialCertificate || initialCertificate.nameHeadingLevel !== certificate.nameHeadingLevel
                    const mediaFileIdChanged = !initialCertificate || initialCertificate.media_file_id !== certificate.media_file_id
                    const hasChanges = nameChanged || nameHeadingLevelChanged || mediaFileIdChanged
                    
                    if (hasChanges) {
                        // Find existing image block for this certificate by ID (titles may repeat like "JCI")
                        const existingBlock = accreditationBlocks.find((block: ContentBlock) => 
                            block.block_type === 'image' && 
                            String(block.id) === certificate.id
                        )
                        
                        // Build custom_css with heading level, preserving existing custom_css if any
                        let customCss = existingBlock?.custom_css || ''
                        if (nameHeadingLevelChanged) {
                            // Replace existing heading-level or add new one
                            if (customCss.match(/heading-level:\s*h[1-6]/i)) {
                                customCss = customCss.replace(/heading-level:\s*h[1-6]/i, `heading-level:${certificate.nameHeadingLevel}`)
                            } else {
                                customCss = customCss ? `${customCss}; heading-level:${certificate.nameHeadingLevel}` : `heading-level:${certificate.nameHeadingLevel}`
                            }
                        } else if (!customCss.match(/heading-level:/i) && existingBlock) {
                            // Add default if not present and block exists
                            customCss = customCss ? `${customCss}; heading-level:${certificate.nameHeadingLevel}` : `heading-level:${certificate.nameHeadingLevel}`
                        }
                        
                        const contentBlock: any = {
                            block_type: "image",
                            title: certificate.name,
                            content: certificate.name,
                            custom_css: customCss
                        }
                        
                        // Add ID if updating existing block
                        if (existingBlock) {
                            contentBlock.id = existingBlock.id
                        }
                        
                        // Add media files if media_file_id exists (uploaded image)
                        if (certificate.media_file_id) {
                            // Find the existing media file to get its ID for update
                            const existingMediaFile = existingBlock?.media_files?.[0]
                            
                            contentBlock.media_files = [{
                                id: existingMediaFile?.id || Date.now(), // Use existing ID or generate new one
                                content_block_id: existingBlock?.id || null,
                                media_file_id: certificate.media_file_id,
                                media_type: "primary", // Certificates are used as primary media
                                display_order: index + 1
                            }]
                        }
                        
                        contentBlocks.push(contentBlock)
                        changedObjects.push(`Certificate ${index + 1}`)
                    }
                })
            }
            
            console.log('Changed objects:', changedObjects)
            console.log('Content blocks to update:', contentBlocks)
            
            // Only proceed if there are changes
            // if (contentBlocks.length === 0) {
            //     toast.push(
            //         <Notification type="info" duration={2500} title="No Changes">
            //             No changes detected to save.
            //         </Notification>,
            //         { placement: 'top-end' }
            //     )
            //     return
            // }
            
            // Build the update data structure
            const updateData = {
                id: 5, // Accreditations section ID
                name: "Accreditations Section",
                title: "Accreditations Section",
                content_blocks: contentBlocks
            }
            
            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)
            
            // Make the actual API call
            const result = await updateHomeSection({ 
                sectionId: 5, 
                updateData: updateData 
            }).unwrap()
            
            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Accreditations section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update accreditations section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update accreditations section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const getOrdinalSuffix = (index: number) => {
        if (index === 0) return 'st'
        if (index === 1) return 'nd'
        if (index === 2) return 'rd'
        return 'th'
    }

    return (
        <Card className="bg-gray-50 rounded-xl">
            <div className="px-2">
                {isLoadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading accreditations section data...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error loading accreditations section data</div>
                    </div>
                ) : (
                    <Formik
                        initialValues={getInitialValues()}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                        enableReinitialize={true}
                    >
                    {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                        <Form>
                            <FormContainer>
                                {/* Header Text Field */}
                                <div className="mb-6">
                                    <FormItem
                                        label="Header Text"
                                        labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                        invalid={!!(errors.headerText && touched.headerText)}
                                        errorMessage={errors.headerText}
                                    >
                                        <div className="flex gap-3">
                                            <Field name="headerTextHeadingLevel">
                                                {({ field, form }: any) => (
                                                    <Select
                                                        {...field}
                                                        options={headingLevelOptions}
                                                        className="!w-[100px] !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                        onChange={(option: any) => {
                                                            form.setFieldValue('headerTextHeadingLevel', option?.value || 'h1')
                                                        }}
                                                        value={headingLevelOptions.find(option => option.value === field.value)}
                                                    />
                                                )}
                                            </Field>
                                            <Input
                                                value={values.headerText}
                                                onChange={(e) => setFieldValue('headerText', e.target.value)}
                                                className="flex-1 !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                placeholder="Enter header text"
                                            />
                                        </div>
                                    </FormItem>
                                </div>

                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal">Our Accreditations & Certifications</p>
                                    <Button
                                        type="button"
                                        onClick={() => handleAddCertificate(setFieldValue, values.certificates)}
                                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white text-center font-inter text-[14px] font-medium leading-normal !px-4 !py-1"
                                    >
                                        Add New Certificate
                                    </Button>
                                </div>
                                
                                <div className="">
                                    {values.certificates.map((certificate, index) => (
                                        <div key={certificate.id} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {/* Certificate Name */}
                                            <div>
                                                <FormItem
                                                    label={`${index + 1}${getOrdinalSuffix(index)} Certificate Name`}
                                                    labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                    invalid={(errors.certificates?.[index] && typeof errors.certificates[index] === 'object' && (errors.certificates[index] as any)?.name && touched.certificates?.[index]?.name) as boolean}
                                                    errorMessage={errors.certificates?.[index] && typeof errors.certificates[index] === 'object' ? String((errors.certificates[index] as any)?.name || '') : undefined}
                                                >
                                                    <div className="flex gap-3">
                                                        <Select
                                                            options={headingLevelOptions}
                                                            className="!w-[100px] !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                            onChange={(option: any) => {
                                                                handleCertificateChange(setFieldValue, values.certificates, certificate.id, 'nameHeadingLevel', option?.value || 'h2')
                                                            }}
                                                            value={headingLevelOptions.find(option => option.value === certificate.nameHeadingLevel)}
                                                        />
                                                        <Input
                                                            value={certificate.name}
                                                            onChange={(e) => handleCertificateChange(setFieldValue, values.certificates, certificate.id, 'name', e.target.value)}
                                                            className="flex-1 !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                            placeholder="Enter certificate name"
                                                        />
                                                    </div>
                                                </FormItem>
                                            </div>

                                            {/* Certificate Image */}
                                            <div>
                                                <label className="block text-[#495057] font-inter text-[14px] font-medium leading-normal mb-2">
                                                    Certificate Image
                                                </label>
                                                <div className="flex w-full">
                                                    <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                                        <div className="flex-1 mb-3 sm:mb-0">
                                                            <span className="text-gray-700 font-medium pl-4">{certificate.image}</span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <label className="cursor-pointer">
                                                                <input
                                                                    ref={(el) => fileInputRefs.current[certificate.id] = el}
                                                                    type="file"
                                                                    accept="image/*,.png,.jpg,.jpeg"
                                                                    onChange={(e) => handleImageUpload(setFieldValue, values.certificates, certificate.id, e)}
                                                                    className="hidden"
                                                                />
                                                                <Button 
                                                                    type="button"
                                                                    loading={isCertificateUploading[certificate.id]}
                                                                    onClick={() => fileInputRefs.current[certificate.id]?.click()}
                                                                    className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                                >
                                                                    {isCertificateUploading[certificate.id] ? 'Uploading...' : 'Upload File'}
                                                                </Button>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <Button 
                                        type="submit"
                                        loading={isSubmitting || isUpdating}
                                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                                    >
                                        {isSubmitting || isUpdating ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                    </Formik>
                )}
            </div>
        </Card>
    )
}

export default AccreditationsSection
