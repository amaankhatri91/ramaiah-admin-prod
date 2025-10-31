import { Card, Input, Button, Select } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState, useEffect } from 'react'
import { useGetHomeDataQuery, useUpdateHomeSectionMutation } from '@/store/slices/home'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { parseQuickLinksSection, ContentBlock } from '@/services/HomeService'
import { toast, Notification } from '@/components/ui'

interface QuickLink {
    id: string
    name: string
    link: string
    icon: string
    mediaFileId?: number
    headingLevel?: string
    altText?: string
}

type QuickLinksFormSchema = {
    quickLinks: QuickLink[]
}

const validationSchema = Yup.object().shape({
    quickLinks: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Name is required'),
            link: Yup.string().url('Please enter a valid URL'),
            icon: Yup.string().required('Icon is required'),
            headingLevel: Yup.string().required('Heading level is required'),
        })
    ).min(1, 'At least one quick link is required'),
})

const headingLevelOptions = [
    { value: 'h1', label: 'H1' },
    { value: 'h2', label: 'H2' },
    { value: 'h3', label: 'H3' },
    { value: 'h4', label: 'H4' },
    { value: 'h5', label: 'H5' },
    { value: 'h6', label: 'H6' },
]

const QuickLinksSection = () => {
    const [updateHomeSection, { isLoading: isUpdating }] = useUpdateHomeSectionMutation()
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const { data: homeData, isLoading: isLoadingData, error } = useGetHomeDataQuery()
    const [uploadingStates, setUploadingStates] = useState<{ [key: string]: boolean }>({})
    const [initialFormValues, setInitialFormValues] = useState<QuickLinksFormSchema | null>(null)

    // Store initial values when data is loaded
    useEffect(() => {
        // homeData.data is now the content_blocks array (extracted in API slice)
        const contentBlocks = Array.isArray(homeData?.data) ? homeData.data : []
        if (contentBlocks && contentBlocks.length > 0 && !initialFormValues) {
            const initialValues = getInitialValues()
            setInitialFormValues(initialValues)
            console.log('Initial form values stored:', initialValues)
        }
    }, [homeData, initialFormValues])

    const getInitialValues = (): QuickLinksFormSchema => {
        // homeData.data is now the content_blocks array (extracted in API slice)
        const contentBlocks = Array.isArray(homeData?.data) ? homeData.data : []
        
        // Helper function to parse heading level from custom_css
        const getHeadingLevel = (block: ContentBlock | undefined, defaultValue: string): string => {
            if (!block?.custom_css) return defaultValue
            const match = block.custom_css.match(/heading-level:\s*(h[1-6])/i)
            return match ? match[1].toLowerCase() : defaultValue
        }

        if (!contentBlocks || contentBlocks.length === 0) {
            return {
                quickLinks: [
                    { id: '1', name: 'Book OPD Appointments (9 am - 5 pm)', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                    { id: '2', name: 'Book Prime Clinic Appointments (5 pm - 8 pm)', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                    { id: '3', name: 'Book Video Consultation', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                    { id: '4', name: 'Book Radiology Tests', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                    { id: '5', name: 'Book Home Sample Collection', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                    { id: '6', name: 'Book Home Physiotherapy', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' }
                ]
            }
        }
        
        const quickLinkBlocks = contentBlocks.filter((block: ContentBlock) => block.section_id === 2) || []
        const quickLinksData = parseQuickLinksSection(contentBlocks)
        
        // Map quick links with heading levels and alt text from blocks
        const quickLinksWithHeadingLevels = quickLinksData.map((link, index) => {
            const block = quickLinkBlocks[index]
            const altText = block?.media_files?.[0]?.media_file?.alt_text || ''
            const mediaFileId = block?.media_files?.[0]?.media_file?.id
            return {
                ...link,
                headingLevel: getHeadingLevel(block, 'h3'),
                altText: altText,
                mediaFileId: mediaFileId
            }
        })
        
        return {
            quickLinks: quickLinksWithHeadingLevels.length > 0 ? quickLinksWithHeadingLevels : [
                { id: '1', name: 'Book OPD Appointments (9 am - 5 pm)', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                { id: '2', name: 'Book Prime Clinic Appointments (5 pm - 8 pm)', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                { id: '3', name: 'Book Video Consultation', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                { id: '4', name: 'Book Radiology Tests', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                { id: '5', name: 'Book Home Sample Collection', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' },
                { id: '6', name: 'Book Home Physiotherapy', link: '', icon: 'icon_01.svg', mediaFileId: undefined, headingLevel: 'h3', altText: '' }
            ]
        }
    }

    const handleQuickLinkChange = (setFieldValue: any, quickLinks: QuickLink[], id: string, field: 'name' | 'link' | 'icon' | 'headingLevel' | 'altText', value: string) => {
        const updatedLinks = quickLinks.map(link => 
            link.id === id ? { ...link, [field]: value } : link
        )
        setFieldValue('quickLinks', updatedLinks)
    }

    const handleIconUpload = async (setFieldValue: any, quickLinks: QuickLink[], id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            // Set uploading state for this specific quick link
            setUploadingStates(prev => ({ ...prev, [id]: true }))
            
            // Update the icon field with the file name immediately for UI feedback
            const updatedLinks = quickLinks.map(link => 
                link.id === id ? { ...link, icon: file.name } : link
            )
            setFieldValue('quickLinks', updatedLinks)
            
            // Call the upload API
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the field with the original filename from the response
                const responseData = result.data as any
                let finalIconName = file.name // Default to the uploaded file name
                
                if (responseData?.savedMedia?.original_filename) {
                    finalIconName = responseData.savedMedia.original_filename
                } else if (responseData?.filePath) {
                    // Fallback to filePath if original_filename is not available
                    finalIconName = responseData.filePath
                }
                
                // Update the icon name, media file ID, and preserve alt text in one operation
                const finalUpdatedLinks = quickLinks.map(link => 
                    link.id === id ? { 
                        ...link, 
                        icon: finalIconName,
                        mediaFileId: responseData?.savedMedia?.id,
                        altText: responseData?.savedMedia?.alt_text || link.altText || ''
                    } : link
                )
                setFieldValue('quickLinks', finalUpdatedLinks)
                
                if (responseData?.savedMedia?.id) {
                    console.log('Quick link icon upload - savedMedia.id:', responseData.savedMedia.id)
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
            
            // Reset the icon field on error
            const resetLinks = quickLinks.map(link => 
                link.id === id ? { ...link, icon: 'icon_01.svg' } : link
            )
            setFieldValue('quickLinks', resetLinks)
        } finally {
            // Clear uploading state
            setUploadingStates(prev => ({ ...prev, [id]: false }))
        }
    }

    const onSubmit = async (values: QuickLinksFormSchema) => {
        try {
            // homeData.data is now the content_blocks array (extracted in API slice)
            const allContentBlocks = Array.isArray(homeData?.data) ? homeData.data : []
            
            // Get the current quick links section data to build the update structure
            const quickLinkBlocks = allContentBlocks.filter((block: ContentBlock) => block.section_id === 2) || []
            
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
            
            // Check each quick link for changes
            values.quickLinks.forEach((link, index) => {
                const initialLink = initialValues.quickLinks[index]
                const existingBlock = quickLinkBlocks[index]
                
                if (!existingBlock) return
                
                // Check if name changed
                const nameChanged = link.name !== initialLink?.name
                // Check if link changed
                const linkChanged = link.link !== initialLink?.link
                // Check if icon/media file changed
                const iconChanged = link.mediaFileId !== initialLink?.mediaFileId
                // Check if heading level changed
                const headingLevelChanged = link.headingLevel !== initialLink?.headingLevel
                // Check if alt text changed
                const altTextChanged = link.altText !== initialLink?.altText
                
                if (nameChanged || linkChanged || iconChanged || headingLevelChanged || altTextChanged) {
                    console.log(`Quick Link ${index + 1} changed:`, {
                        name: { current: link.name, initial: initialLink?.name, changed: nameChanged },
                        link: { current: link.link, initial: initialLink?.link, changed: linkChanged },
                        icon: { current: link.mediaFileId, initial: initialLink?.mediaFileId, changed: iconChanged },
                        headingLevel: { current: link.headingLevel, initial: initialLink?.headingLevel, changed: headingLevelChanged },
                        altText: { current: link.altText, initial: initialLink?.altText, changed: altTextChanged }
                    })
                    
                    const contentBlock: any = {
                        id: existingBlock.id,
                        block_type: existingBlock.block_type,
                        title: link.name, // Update the title with new name
                    }
                    
                    // Add custom_css with heading level if heading level changed or name changed (to preserve heading level)
                    if ((headingLevelChanged || nameChanged) && link.headingLevel) {
                        let customCss = existingBlock.custom_css || ''
                        // Replace existing heading-level or add new one
                        if (customCss.match(/heading-level:\s*h[1-6]/i)) {
                            customCss = customCss.replace(/heading-level:\s*h[1-6]/i, `heading-level:${link.headingLevel}`)
                        } else {
                            customCss = customCss ? `${customCss}; heading-level:${link.headingLevel}` : `heading-level:${link.headingLevel}`
                        }
                        contentBlock.custom_css = customCss
                    }
                    
                    // Add content if link changed
                    if (linkChanged) {
                        contentBlock.content = link.link
                    }
                    
                    // Add media files if icon changed or alt text changed
                    if ((iconChanged || altTextChanged) && link.mediaFileId) {
                        // Find the existing media file to get its ID for update
                        const existingMediaFile: any = existingBlock.media_files?.[0] // Quick links typically have one media file
                        
                        contentBlock.media_files = [{
                            id: existingMediaFile?.id, // Use existing media file ID for update (like banner images)
                            content_block_id: existingBlock.id,
                            media_file_id: link.mediaFileId,
                            media_type: "icon", // Quick link icons are used as icons
                            display_order: 1,
                            alt_text: link.altText || '' // Include alt text in the update
                        }]
                    }
                    
                    // Add statistics if link changed
                    if (linkChanged && link.link) {
                        contentBlock.statistics = [{
                            statistic_text: link.link
                        }]
                    }
                    
                    contentBlocks.push(contentBlock)
                    changedObjects.push(`Quick Link ${index + 1}`)
                }
            })
            
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
                id: 2, // Quick Links section ID
                name: "Quick Links Section",
                title: "Quick Links Section",
                content_blocks: contentBlocks
            }
            
            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)
            
            // Make the actual API call
            const result = await updateHomeSection({
                sectionId: 2,
                updateData: updateData
            }).unwrap()
            
            if (result.success) {
                // Update initial values to current values after successful update
                setInitialFormValues(values)
                console.log('Initial values updated after successful save:', values)
                
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Quick links updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update quick links')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update quick links'
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
                <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Quick Links</p>
                
                {isLoadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading quick links data...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error loading quick links data</div>
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
                                <div className="">
                                    {values.quickLinks.map((link, index) => (
                                        <div key={link.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-0">
                                            {/* Name of Box */}
                                            <div>
                                                <FormItem
                                                    label={`Name of ${index + 1}${getOrdinalSuffix(index)} Box`}
                                                    labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                    invalid={(errors.quickLinks?.[index] && typeof errors.quickLinks[index] === 'object' && (errors.quickLinks[index] as any)?.name && touched.quickLinks?.[index]?.name) as boolean}
                                                    errorMessage={errors.quickLinks?.[index] && typeof errors.quickLinks[index] === 'object' ? String((errors.quickLinks[index] as any)?.name || '') : undefined}
                                                >
                                                    <div className="flex gap-3">
                                                        <Select
                                                            options={headingLevelOptions}
                                                            className="!w-[100px] !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 flex-shrink-0"
                                                            onChange={(option: any) => {
                                                                handleQuickLinkChange(setFieldValue, values.quickLinks, link.id, 'headingLevel', option?.value || 'h3')
                                                            }}
                                                            value={headingLevelOptions.find(option => option.value === (link.headingLevel || 'h3'))}
                                                        />
                                                        <Input
                                                            value={link.name}
                                                            onChange={(e) => handleQuickLinkChange(setFieldValue, values.quickLinks, link.id, 'name', e.target.value)}
                                                            className="flex-1 !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                            placeholder="Enter box name"
                                                        />
                                                    </div>
                                                </FormItem>
                                            </div>

                                            {/* Box Link */}
                                            <div>
                                                <FormItem
                                                    label={`${index + 1}${getOrdinalSuffix(index)} Box Link`}
                                                    labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                    invalid={(errors.quickLinks?.[index] && typeof errors.quickLinks[index] === 'object' && (errors.quickLinks[index] as any)?.link && touched.quickLinks?.[index]?.link) as boolean}
                                                    errorMessage={errors.quickLinks?.[index] && typeof errors.quickLinks[index] === 'object' ? String((errors.quickLinks[index] as any)?.link || '') : undefined}
                                                >
                                                    <Input
                                                        value={link.link}
                                                        onChange={(e) => handleQuickLinkChange(setFieldValue, values.quickLinks, link.id, 'link', e.target.value)}
                                                        className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                        placeholder="Enter statistic text or URL"
                                                    />
                                                </FormItem>
                                            </div>

                                            {/* Box Icon */}
                                            <div>
                                                <label className="block text-[#495057] font-inter text-[14px] font-medium leading-normal mb-2">
                                                    {index + 1}{getOrdinalSuffix(index)} Box Icon
                                                </label>
                                                <div className="flex w-full">
                                                    <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                                        <div className="flex-1 mb-3 sm:mb-0">
                                                            <span className="text-gray-700 font-medium pl-4">{link.icon}</span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                            <input
                                                                type="file"
                                                                accept="image/*,.svg"
                                                                onChange={(e) => handleIconUpload(setFieldValue, values.quickLinks, link.id, e)}
                                                                className="hidden"
                                                                id={`file-upload-${link.id}`}
                                                            />
                                                            <Button 
                                                                type="button"
                                                                loading={uploadingStates[link.id] || false}
                                                                disabled={uploadingStates[link.id] || false}
                                                                onClick={() => document.getElementById(`file-upload-${link.id}`)?.click()}
                                                                className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal disabled:opacity-50 cursor-pointer"
                                                            >
                                                                {uploadingStates[link.id] ? 'Uploading...' : 'Upload File'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Alt Text Input */}
                                                <FormItem
                                                    label="Alt Text"
                                                    labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal mt-3"
                                                >
                                                    <Input
                                                        value={link.altText || ''}
                                                        onChange={(e) => handleQuickLinkChange(setFieldValue, values.quickLinks, link.id, 'altText', e.target.value)}
                                                        className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                        placeholder="Enter image alt text"
                                                    />
                                                </FormItem>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end ">
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

export default QuickLinksSection
