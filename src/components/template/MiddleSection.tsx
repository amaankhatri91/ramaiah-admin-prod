import { Card, Input, Button } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState, useRef, useEffect } from 'react'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { useGetHomeDataQuery, useUpdateHomeSectionMutation } from '@/store/slices/home'
import { parseMiddleSection } from '@/services/HomeService'
import { toast, Notification } from '@/components/ui'

type MiddleSectionFormSchema = {
    headerText: string
    subHeaderText: string
    doctorSpeakVideo: string
    doctorSpeakVideoMediaFileId?: number
}

const validationSchema = Yup.object().shape({
    headerText: Yup.string().required('Header text is required'),
    subHeaderText: Yup.string().required('Sub header text is required'),
    doctorSpeakVideo: Yup.string().required('Doctor speak video is required'),
})

interface MiddleSectionProps {
    sectionId: number
}

const MiddleSection = ({ sectionId }: MiddleSectionProps) => {
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const [updateHomeSection, { isLoading: isUpdating }] = useUpdateHomeSectionMutation()
    const { data: homeData, isLoading: isLoadingData, error } = useGetHomeDataQuery()
    const doctorSpeakVideoFileRef = useRef<HTMLInputElement>(null)
    const [initialFormValues, setInitialFormValues] = useState<MiddleSectionFormSchema | null>(null)
    const [isVideoUploading, setIsVideoUploading] = useState(false)

    // Store initial values when data is loaded
    useEffect(() => {
        if (homeData?.data && !initialFormValues) {
            const initialValues = getInitialValues()
            setInitialFormValues(initialValues)
            console.log('Initial form values stored:', initialValues)
        }
    }, [homeData, initialFormValues])

    const getInitialValues = (): MiddleSectionFormSchema => {
        if (!homeData?.data) {
            return {
                headerText: "Our 20+ Years of Legacy & Clinical Excellence",
                subHeaderText: "With over two decades of dedicated service, we have built a legacy of clinical excellence that continues to transform lives. Our commitment to providing world-class healthcare has made us a trusted name in medical care.",
                doctorSpeakVideo: "Doctor_Speak_Video.mp4"
            }
        }
        
        // Parse the data based on the three objects structure
        const middleBlocks = homeData.data.filter(block => block.section_id === sectionId)
        
        // First object: Text block with title (Header Text)
        const headerBlock = middleBlocks.find(block => 
            block.block_type === 'text' && 
            block.title && 
            block.title.includes('Legacy & Clinical Excellence')
        )
        const headerText = headerBlock?.title 
        
        // Second object: Text block with content (Sub Header Text)
        const contentBlock = middleBlocks.find(block => 
            block.block_type === 'text' && 
            block.content && 
            block.content.includes('Ramaiah Memorial Hospital')
        )
        const subHeaderText = contentBlock?.content || "With over two decades of dedicated service, we have built a legacy of clinical excellence that continues to transform lives. Our commitment to providing world-class healthcare has made us a trusted name in medical care."
        
        // Third object: Video block with media file (Doctor Speak Video)
        const videoBlock = middleBlocks.find(block => block.block_type === 'video')
        const doctorSpeakVideo = videoBlock?.media_files?.[0]?.media_file?.original_filename || "Doctor_Speak_Video.mp4"
        const doctorSpeakVideoMediaFileId = videoBlock?.media_files?.[0]?.media_file?.id
        
        return {
            headerText: headerText,
            subHeaderText: subHeaderText,
            doctorSpeakVideo: doctorSpeakVideo,
            doctorSpeakVideoMediaFileId: doctorSpeakVideoMediaFileId
        }
    }

    const handleVideoUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsVideoUploading(true)
            setFieldValue('doctorSpeakVideo', file.name)
            
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
                if (responseData?.savedMedia?.original_filename) {
                    setFieldValue('doctorSpeakVideo', responseData.savedMedia.original_filename)
                } else if (responseData?.filePath) {
                    // Fallback to filePath if original_filename is not available
                    setFieldValue('doctorSpeakVideo', responseData.filePath)
                }
                
                // Set the media file ID for the API call
                if (responseData?.savedMedia?.id) {
                    setFieldValue('doctorSpeakVideoMediaFileId', responseData.savedMedia.id)
                    console.log('Doctor speak video upload - savedMedia.id:', responseData.savedMedia.id)
                }
                
                // Reset the file input to allow re-uploading the same file if needed
                if (doctorSpeakVideoFileRef.current) {
                    doctorSpeakVideoFileRef.current.value = ''
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
            
            // Reset the field values on error
            setFieldValue('doctorSpeakVideo', '')
            setFieldValue('doctorSpeakVideoMediaFileId', undefined)
        } finally {
            setIsVideoUploading(false)
        }
    }

    const onSubmit = async (values: MiddleSectionFormSchema) => {
        try {
            // Get the current middle section data to build the update structure
            const middleBlocks = homeData?.data?.filter(block => block.section_id === sectionId) || []
            console.log('Middle blocks:', middleBlocks)
            
            // Find existing content blocks based on the three objects structure
            // const headerBlock = middleBlocks.find(block => 
            //     block.block_type === 'text' && 
            //     block.title && 
            //     block.title.includes('Legacy & Clinical Excellence')
            // )
            // const contentBlock = middleBlocks.find(block => 
            //     block.block_type === 'text' && 
            //     block.content && 
            //     block.content.includes('Ramaiah Memorial Hospital')
            // )
            // console.log('Content block:', contentBlock)
            const headerBlock = middleBlocks.find(block => block.block_type === 'text')
            const contentBlock = middleBlocks.find(block => block.block_type === 'custom')
            const videoBlock = middleBlocks.find(block => block.block_type === 'video')
            console.log('Header block:', headerBlock)
            console.log('Content block:', contentBlock)
            console.log('Video block:', videoBlock)
            
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
            const contentBlocks = []
            const changedObjects = []
            
            // 1. Check if Header Text changed
            const headerTextChanged = values.headerText !== initialValues.headerText
            console.log('Header Text comparison:', {
                current: values.headerText,
                initial: initialValues.headerText,
                changed: headerTextChanged
            })
            
            if (headerTextChanged) {
                if (headerBlock) {
                    // Update existing header block
                    contentBlocks.push({
                        id: headerBlock.id,
                        block_type: headerBlock.block_type,
                        title: values.headerText,
                        content: values.headerText,
                        display_order: headerBlock.display_order
                    })
                    console.log('Header block updated:', contentBlocks)
                } else {
                    // Create new header block
                contentBlocks.push({
                    block_type: "text",
                        title: values.headerText,
                    content: values.headerText
                })
                }
                changedObjects.push('Header Text')
            }
            
            // 2. Check if Sub Header Text (Content) changed
            const subHeaderTextChanged = values.subHeaderText !== initialValues.subHeaderText
            console.log('Sub Header Text comparison:', {
                current: values.subHeaderText,
                initial: initialValues.subHeaderText,
                changed: subHeaderTextChanged
            })
            
            if (subHeaderTextChanged) {
                if (contentBlock) {
                    // Update existing content block
                    contentBlocks.push({
                        id: contentBlock.id,
                        block_type: contentBlock.block_type,
                        title: contentBlock.title,
                        content: values.subHeaderText,
                        display_order: contentBlock.display_order
                    })
                } else {
                    // Create new content block
                contentBlocks.push({
                        block_type: "text",
                        title: null,
                    content: values.subHeaderText
                })
                }
                changedObjects.push('Sub Header Text')
            }
            
            // 3. Check if Doctor Speak Video changed
            const videoFileChanged = values.doctorSpeakVideo !== initialValues.doctorSpeakVideo
            const videoMediaFileIdChanged = values.doctorSpeakVideoMediaFileId !== initialValues.doctorSpeakVideoMediaFileId
            const videoChanged = videoFileChanged || videoMediaFileIdChanged
            
            console.log('Doctor Speak Video comparison:', {
                file: { current: values.doctorSpeakVideo, initial: initialValues.doctorSpeakVideo, changed: videoFileChanged },
                mediaFileId: { current: values.doctorSpeakVideoMediaFileId, initial: initialValues.doctorSpeakVideoMediaFileId, changed: videoMediaFileIdChanged },
                overallChanged: videoChanged
            })
            
            if (videoChanged) {
                if (videoBlock) {
                    // Update existing video block
                contentBlocks.push({
                    id: videoBlock.id,
                    block_type: videoBlock.block_type,
                    title: videoBlock.title,
                    content: videoBlock.content,
                    display_order: videoBlock.display_order,
                    media_files: values.doctorSpeakVideoMediaFileId ? [{
                        id: videoBlock.media_files?.[0]?.id || Date.now(),
                        content_block_id: videoBlock.id,
                        media_file_id: values.doctorSpeakVideoMediaFileId,
                        media_type: "primary", // Video should be primary
                        display_order: 1
                    }] : []
                })
                console.log('Video block updated:', contentBlocks)
                } else {
                    // Create new video block
                    contentBlocks.push({
                        block_type: "video",
                        title: null,
                        media_files: values.doctorSpeakVideoMediaFileId ? [{
                            media_file_id: values.doctorSpeakVideoMediaFileId,
                            media_type: "primary", // Video should be primary
                            display_order: 1
                        }] : []
                    })
                }
                changedObjects.push('Doctor Speak Video')
            }
            
            console.log('Changed objects:', changedObjects)
            console.log('Content blocks to update:', contentBlocks)
            
            // // Only proceed if there are changes
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
                id: sectionId, // Dynamic section ID
                name: "Middle Section",
                title: "Middle Section",
                content_blocks: contentBlocks
            }
            
            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)
            
            // Make the actual API call
            const result = await updateHomeSection({ sectionId, updateData }).unwrap()
            
            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Middle section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update middle section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update middle section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    return (
        <Card className="bg-gray-50 rounded-xl">
            <div className="px-2">
                <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Middle Section</p>

                {isLoadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading middle section data...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error loading middle section data</div>
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
                                {/* Header and Sub Header Text Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
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

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                        <FormItem
                                            label="Sub Header Text"
                                            labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                            invalid={(errors.subHeaderText && touched.subHeaderText) as boolean}
                                            errorMessage={errors.subHeaderText}
                                        >
                                            <Field
                                                name="subHeaderText"
                                                component={Input}
                                                className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                placeholder="Enter sub header text"
                                            />
                                        </FormItem>
                                    </div>
                                </div>

                                {/* Doctor Speak Video Section */}
                                <div className="mb-6">
                                    <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[8px]">Doctor Speak Video</h3>
                                    <div className="flex w-full">
                                        <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                            <div className="flex-1 mb-3 sm:mb-0">
                                                <span className="text-gray-700 font-medium pl-4">{values.doctorSpeakVideo}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <label className="cursor-pointer">
                                                    <input
                                                        ref={doctorSpeakVideoFileRef}
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => handleVideoUpload(setFieldValue, e)}
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        loading={isVideoUploading}
                                                        onClick={() => doctorSpeakVideoFileRef.current?.click()}
                                                        className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                    >
                                                        {isVideoUploading ? 'Uploading...' : 'Upload Video'}
                                                    </Button>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
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

export default MiddleSection
