import { Card, Input, Button } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState, useRef, useEffect } from 'react'
import { useGetHomeDataQuery, useUpdateHomeSectionMutation } from '@/store/slices/home'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { parseOurStorySection } from '@/services/HomeService'
import { toast, Notification } from '@/components/ui'

interface StoryBox {
    id: string
    header: string
    subHeader: string
    icon: string
    mediaFileId?: number
}

type OurStoryFormSchema = {
    headerText: string
    subHeaderText: string
    storyBoxes: StoryBox[]
}

const validationSchema = Yup.object().shape({
    headerText: Yup.string().required('Header text is required'),
    subHeaderText: Yup.string(),
    storyBoxes: Yup.array().of(
        Yup.object().shape({
            header: Yup.string().required('Header is required'),
            subHeader: Yup.string(),
            icon: Yup.string().required('Icon is required'),
        })
    ).min(1, 'At least one story box is required'),
})

const OurStorySection = () => {
    const [updateHomeSection, { isLoading: isUpdating }] = useUpdateHomeSectionMutation()
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const { data: homeData, isLoading: isLoadingData, error } = useGetHomeDataQuery()
    const [uploadingBoxId, setUploadingBoxId] = useState<string | null>(null)
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
    const [initialFormValues, setInitialFormValues] = useState<OurStoryFormSchema | null>(null)

    // Store initial values when data is loaded
    useEffect(() => {
        if (homeData?.data && !initialFormValues) {
            const initialValues = getInitialValues()
            setInitialFormValues(initialValues)
            console.log('Initial form values stored:', initialValues)
        }
    }, [homeData, initialFormValues])

    const getInitialValues = (): OurStoryFormSchema => {
        if (!homeData?.data) {
            return {
                headerText: "Our Story",
                subHeaderText: "",
                storyBoxes: [
                    { id: '1', header: '550+', subHeader: 'Beds', icon: 'icon_01.svg' },
                    { id: '2', header: '550+', subHeader: 'Beds', icon: 'icon_01.svg' },
                    { id: '3', header: '550+', subHeader: 'Beds', icon: 'icon_01.svg' },
                    { id: '4', header: '550+', subHeader: 'Beds', icon: 'icon_01.svg' }
                ]
            }
        }
        
        // Parse the data based on block types
        const storyBlocks = homeData.data.filter(block => block.section_id === 4)
        
        // Get header text from text block type
        const textBlock = storyBlocks.find(block => block.block_type === 'text')
        const headerText = textBlock?.content || textBlock?.title || "Our Story"
        
        // Get story boxes from statistic block type
        const statisticBlocks = storyBlocks.filter(block => block.block_type === 'statistic')
        const storyBoxes = statisticBlocks.map((block, index) => ({
            id: (index + 1).toString(),
            header: block.statistics?.[0]?.statistic_value || block.content || '550+',
            subHeader: block.statistics?.[0]?.statistic_text || 'Beds',
            icon: block.media_files?.[0]?.media_file?.original_filename || 'icon_01.svg',
            mediaFileId: block.media_files?.[0]?.media_file_id
        }))
        
        return {
            headerText: headerText,
            subHeaderText: "", // No sub header for now
            storyBoxes: storyBoxes.length > 0 ? storyBoxes : [
                { id: '1', header: '550+', subHeader: 'Beds', icon: 'icon_01.svg' },
                { id: '2', header: '550+', subHeader: 'Beds', icon: 'icon_01.svg' },
                { id: '3', header: '550+', subHeader: 'Beds', icon: 'icon_01.svg' },
                { id: '4', header: '550+', subHeader: 'Beds', icon: 'icon_01.svg' }
            ]
        }
    }

    const handleStoryBoxChange = (setFieldValue: any, storyBoxes: StoryBox[], id: string, field: 'header' | 'subHeader' | 'icon', value: string) => {
        const updatedBoxes = storyBoxes.map(box => 
            box.id === id ? { ...box, [field]: value } : box
        )
        setFieldValue('storyBoxes', updatedBoxes)
    }

    const handleIconUpload = async (setFieldValue: any, storyBoxes: StoryBox[], id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setUploadingBoxId(id)
            
            // Update the icon field with the file name immediately for UI feedback
            const updatedBoxes = storyBoxes.map(box => 
                box.id === id ? { ...box, icon: file.name } : box
            )
            setFieldValue('storyBoxes', updatedBoxes)
            
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
                
                // Update the icon name and media file ID in one operation
                const finalUpdatedBoxes = storyBoxes.map(box => 
                    box.id === id ? { 
                        ...box, 
                        icon: finalIconName,
                        mediaFileId: responseData?.savedMedia?.id 
                    } : box
                )
                setFieldValue('storyBoxes', finalUpdatedBoxes)
                
                if (responseData?.savedMedia?.id) {
                    console.log('Story box icon upload - savedMedia.id:', responseData.savedMedia.id)
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
            const resetBoxes = storyBoxes.map(box => 
                box.id === id ? { ...box, icon: 'icon_01.svg' } : box
            )
            setFieldValue('storyBoxes', resetBoxes)
        } finally {
            setUploadingBoxId(null)
        }
    }

    const handleFileInputClick = (boxId: string) => {
        const fileInput = fileInputRefs.current[boxId]
        if (fileInput) {
            fileInput.click()
        }
    }

    const onSubmit = async (values: OurStoryFormSchema) => {
        try {
            // Get the current Our Story section data to build the update structure
            const storyBlocks = homeData?.data?.filter(block => block.section_id === 4) || []
            
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
            
            // Find existing content blocks by block type
            const headerBlock = storyBlocks.find(block => block.block_type === 'text')
            const statisticBlocks = storyBlocks.filter(block => block.block_type === 'statistic')
            
            // Build content blocks array - only include changed blocks
            const contentBlocks: any[] = []
            const changedObjects: string[] = []
            
            // 1. Check if Header Text changed (for text block type)
            if (headerBlock && values.headerText !== initialValues.headerText) {
                contentBlocks.push({
                    id: headerBlock.id,
                    block_type: 'text',
                    title: values.headerText, // Use the header text as the title
                    content: values.headerText
                })
                changedObjects.push('Header Text')
            }
            
            // 2. Check story boxes for changes (statistic block type)
            values.storyBoxes.forEach((box, index) => {
                const correspondingBlock = statisticBlocks[index]
                const initialBox = initialValues.storyBoxes[index]
                
                if (!correspondingBlock || !initialBox) return
                
                // Check if any field changed
                const headerChanged = box.header !== initialBox.header
                const subHeaderChanged = box.subHeader !== initialBox.subHeader
                const iconChanged = box.mediaFileId !== initialBox.mediaFileId
                
                if (headerChanged || subHeaderChanged || iconChanged) {
                    console.log(`Story Box ${index + 1} changed:`, {
                        header: { current: box.header, initial: initialBox.header, changed: headerChanged },
                        subHeader: { current: box.subHeader, initial: initialBox.subHeader, changed: subHeaderChanged },
                        icon: { current: box.mediaFileId, initial: initialBox.mediaFileId, changed: iconChanged }
                    })
                    
                    const contentBlock: any = {
                        id: correspondingBlock.id,
                        block_type: 'statistic',
                        title: box.header, // Use the box header as the title
                        content: box.header, // Update the content with new header
                        statistics: [{
                            id: correspondingBlock.statistics?.[0]?.id || 0,
                            content_block_id: correspondingBlock.id,
                            statistic_text: box.subHeader,
                            statistic_value: box.header,
                            display_order: 1
                        }]
                    }
                    
                    // Add media files if icon changed
                    if (iconChanged && box.mediaFileId) {
                        // Find the existing media file to get its ID for update
                        const existingMediaFile: any = correspondingBlock.media_files?.[0] // Story boxes typically have one media file
                        
                        contentBlock.media_files = [{
                            id: existingMediaFile?.id, // Use existing media file ID for update (like banner images)
                            content_block_id: correspondingBlock.id,
                            media_file_id: box.mediaFileId,
                            media_type: "icon", // Story box icons are used as icons
                            display_order: 1
                        }]
                    }
                    
                    contentBlocks.push(contentBlock)
                    changedObjects.push(`Story Box ${index + 1}`)
                }
            })
            
            console.log('Changed objects:', changedObjects)
            console.log('Content blocks to update:', contentBlocks)
            
            // Only proceed if there are changes
            if (contentBlocks.length === 0) {
                toast.push(
                    <Notification type="info" duration={2500} title="No Changes">
                        No changes detected to save.
                    </Notification>,
                    { placement: 'top-end' }
                )
                return
            }
            
            // Build the update data structure
            const updateData = {
                id: 4, // Our Story section ID
                name: "Our Story Section",
                title: "Our Story Section",
                content_blocks: contentBlocks
            }
            
            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)
            
            // Make the actual API call
            const result = await updateHomeSection({ 
                sectionId: 4, 
                updateData: updateData 
            }).unwrap()
            
            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Our Story section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update our story section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update our story section'
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
                <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Our Story Section</p>
                
                {isLoadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading our story section data...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error loading our story section data</div>
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
                                {/* Header Text - for text block type */}
                                <div className="mb-6">
                                        <FormItem
                                            label="Header Text"
                                            labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                            invalid={(errors.headerText && touched.headerText) as boolean}
                                            errorMessage={errors.headerText}
                                        >
                                            <Field
                                                name="headerText"
                                                component={Input}
                                                className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                placeholder="Enter header text"
                                            />
                                        </FormItem>
                                </div>

                                {/* Story Boxes - for statistic block type */}
                                <div className="">
                                    {values.storyBoxes.map((box, index) => (
                                        <div key={box.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            {/* Header of Box */}
                                            <div>
                                                <FormItem
                                                    label={`Header of ${index + 1}${getOrdinalSuffix(index)} Box`}
                                                    labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                    invalid={(errors.storyBoxes?.[index] && typeof errors.storyBoxes[index] === 'object' && (errors.storyBoxes[index] as any)?.header && touched.storyBoxes?.[index]?.header) as boolean}
                                                    errorMessage={errors.storyBoxes?.[index] && typeof errors.storyBoxes[index] === 'object' ? String((errors.storyBoxes[index] as any)?.header || '') : undefined}
                                                >
                                                    <Input
                                                        value={box.header}
                                                        onChange={(e) => handleStoryBoxChange(setFieldValue, values.storyBoxes, box.id, 'header', e.target.value)}
                                                        className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                        placeholder="Enter header"
                                                    />
                                                </FormItem>
                                            </div>

                                            {/* Sub Header of Box */}
                                            <div>
                                                <FormItem
                                                    label={`Sub header of ${index + 1}${getOrdinalSuffix(index)} Box`}
                                                    labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                    invalid={(errors.storyBoxes?.[index] && typeof errors.storyBoxes[index] === 'object' && (errors.storyBoxes[index] as any)?.subHeader && touched.storyBoxes?.[index]?.subHeader) as boolean}
                                                    errorMessage={errors.storyBoxes?.[index] && typeof errors.storyBoxes[index] === 'object' ? String((errors.storyBoxes[index] as any)?.subHeader || '') : undefined}
                                                >
                                                    <Input
                                                        value={box.subHeader}
                                                        onChange={(e) => handleStoryBoxChange(setFieldValue, values.storyBoxes, box.id, 'subHeader', e.target.value)}
                                                        className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                        placeholder="Enter sub header"
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
                                                            <span className="text-gray-700 font-medium pl-4">{box.icon}</span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                                <input
                                                                ref={(el) => fileInputRefs.current[box.id] = el}
                                                                    type="file"
                                                                    accept="image/*,.svg"
                                                                    onChange={(e) => handleIconUpload(setFieldValue, values.storyBoxes, box.id, e)}
                                                                    className="hidden"
                                                                />
                                                                <Button 
                                                                    type="button"
                                                                loading={uploadingBoxId === box.id && isUploading}
                                                                onClick={() => handleFileInputClick(box.id)}
                                                                    className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                                >
                                                                {uploadingBoxId === box.id && isUploading ? 'Uploading...' : 'Upload File'}
                                                                </Button>
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

export default OurStorySection
