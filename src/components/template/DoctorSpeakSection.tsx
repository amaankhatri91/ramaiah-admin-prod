import { Card, Input, Button } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState, useRef } from 'react'
import { useGetHomeDataQuery, useUpdateHomeSectionMutation } from '@/store/slices/home'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { parseDoctorSpeakSection, ContentBlock } from '@/services/HomeService'
import { toast, Notification } from '@/components/ui'

type DoctorSpeakFormSchema = {
    doctorSpeakVideo: string
    mediaFileId?: number
}

const validationSchema = Yup.object().shape({
    doctorSpeakVideo: Yup.string().required('Doctor speak video is required'),
})

const DoctorSpeakSection = () => {
    const [updateHomeSection, { isLoading: isUpdating }] = useUpdateHomeSectionMutation()
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const { data: homeData, isLoading: isLoadingData, error } = useGetHomeDataQuery()
    const [isFileUploading, setIsFileUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const getInitialValues = (): DoctorSpeakFormSchema => {
        // homeData.data is now the content_blocks array (extracted in API slice)
        const contentBlocks = Array.isArray(homeData?.data) ? homeData.data : []
        
        if (!contentBlocks || contentBlocks.length === 0) {
            return {
                doctorSpeakVideo: "",
                mediaFileId: undefined
            }
        }
        
        const doctorData = parseDoctorSpeakSection(contentBlocks)
        const doctorBlock = contentBlocks.find((block: ContentBlock) => block.section_id === 3 && block.title === 'Doctor Speak')
        return {
            doctorSpeakVideo: doctorData.doctorSpeakVideo || "",
            mediaFileId: doctorBlock?.media_files?.[0]?.media_file?.id
        }
    }

    const handleFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsFileUploading(true)
            setFieldValue('doctorSpeakVideo', file.name)
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the form with the original filename and media file ID from the response
                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setFieldValue('doctorSpeakVideo', responseData.savedMedia.original_filename)
                } else if (responseData?.filePath) {
                    // Fallback to filePath if original_filename is not available
                    setFieldValue('doctorSpeakVideo', responseData.filePath)
                }
                
                // Set the media file ID for the API call
                if (responseData?.savedMedia?.id) {
                    setFieldValue('mediaFileId', responseData.savedMedia.id)
                    console.log('Doctor speak file upload - savedMedia.id:', responseData.savedMedia.id)
                }
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to upload file'
            toast.push(
                <Notification type="danger" duration={3000} title="Upload Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
            // Reset the field value on error
            setFieldValue('doctorSpeakVideo', '')
        } finally {
            setIsFileUploading(false)
        }
    }

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click()
    }

    const onSubmit = async (values: DoctorSpeakFormSchema) => {
        try {
            // Check if media file ID is provided
            if (!values.mediaFileId) {
                toast.push(
                    <Notification type="danger" duration={3000} title="Error">
                        Please upload a video file before saving
                    </Notification>,
                    { placement: 'top-end' }
                )
                return
            }

            // homeData.data is now the content_blocks array (extracted in API slice)
            const allContentBlocks = Array.isArray(homeData?.data) ? homeData.data : []
            
            // Find the doctor speak block from the home data
            const doctorBlock = allContentBlocks.find((block: ContentBlock) => block.section_id === 3 && block.title === 'Doctor Speak')
            
            // Handle case where block doesn't exist - use default structure
            const blockId = doctorBlock?.id || 0
            const blockType = doctorBlock?.block_type || 'video'
            const blockTitle = doctorBlock?.title || 'Doctor Speak'
            const existingMediaFileId = doctorBlock?.media_files?.[0]?.id || 0

            // Build the content blocks structure similar to hero section
            const contentBlocks = [{
                id: blockId,
                block_type: blockType,
                title: blockTitle,
                media_files: [{
                    id: existingMediaFileId,
                    content_block_id: blockId,
                    media_file_id: values.mediaFileId,
                    media_type: "primary", // Video updates should be primary
                    display_order: 1
                }]
            }]

            // Build the update data structure similar to hero section
            const updateData = {
                id: 3, // Doctor Speak section ID
                name: "Doctor Speak Section",
                title: "Doctor Speak Section",
                content_blocks: contentBlocks
            }

            console.log('Doctor Speak payload being sent:', updateData)

            const result = await updateHomeSection({
                sectionId: 3,
                updateData: updateData
            }).unwrap()
            
            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Doctor speak section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update doctor speak section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update doctor speak section'
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
                <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Doctor Speak Section</p>

                {isLoadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading doctor speak section data...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error loading doctor speak section data</div>
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
                                <FormItem
                                    label="Doctor Speak Video"
                                    labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                    invalid={(errors.doctorSpeakVideo && touched.doctorSpeakVideo) as boolean}
                                    errorMessage={errors.doctorSpeakVideo}
                                >
                                    <div className="flex w-full">
                                        <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                            <div className="flex-1 mb-3 sm:mb-0">
                                                <span className="text-gray-700 font-medium pl-4">{values.doctorSpeakVideo}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) => handleFileUpload(setFieldValue, e)}
                                                    className="hidden"
                                                />
                                                <Button 
                                                    type="button"
                                                    loading={isFileUploading}
                                                    onClick={handleUploadButtonClick}
                                                    className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                >
                                                    {isFileUploading ? 'Uploading...' : 'Upload File'}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </FormItem>

                                {/* Save Button */}
                                <div className="flex justify-end mt-6">
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

export default DoctorSpeakSection
