import { Card, Input, Button } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState, useRef, useEffect } from 'react'
import { useGetHomeDataQuery, useUpdateHomeSectionMutation } from '@/store/slices/home'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { parseOurJourneySection } from '@/services/HomeService'
import { toast, Notification } from '@/components/ui'
import { RichTextEditor } from '@/components/shared'

type OurJourneyFormSchema = {
    headerText: string
    content: string
    uploadFile: string
    uploadFileMediaId?: number
}

const validationSchema = Yup.object().shape({
    headerText: Yup.string().required('Header text is required'),
    content: Yup.string().required('Content is required'),
    uploadFile: Yup.string().required('Upload file is required'),
})

const OurJourneySection = () => {
    const [updateHomeSection, { isLoading: isUpdating }] = useUpdateHomeSectionMutation()
    const { data: homeData, isLoading: isLoadingData, error } = useGetHomeDataQuery()
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const uploadFileRef = useRef<HTMLInputElement>(null)
    const [isFileUploading, setIsFileUploading] = useState(false)
    const [initialFormValues, setInitialFormValues] = useState<OurJourneyFormSchema | null>(null)

    // Store initial values when data is loaded
    useEffect(() => {
        if (homeData?.data) {
            const initialValues = getInitialValues()
            setInitialFormValues(initialValues)
            console.log('Initial form values stored:', initialValues)
        }
    }, [homeData])

    const getInitialValues = (): OurJourneyFormSchema => {
        if (!homeData?.data) {
            console.log('No home data available for initial values')
            return {
                headerText: "",
                content: "",
                uploadFile: "",
                uploadFileMediaId: undefined
            }
        }
        
        console.log('Raw home data for Our Journey:', homeData.data)
        const journeyData = parseOurJourneySection(homeData.data)
        console.log('Parsed journey data:', journeyData)
        
        const initialValues = {
            headerText: journeyData.headerText || "",
            content: journeyData.content || "",
            uploadFile: journeyData.uploadFile || "",
            uploadFileMediaId: (journeyData as any).uploadFileMediaId
        }
        
        console.log('Final initial values:', initialValues)
        return initialValues
    }

    const handleFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setIsFileUploading(true)
            setFieldValue('uploadFile', file.name)
            
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
                    setFieldValue('uploadFile', responseData.savedMedia.original_filename)
                } else if (responseData?.filePath) {
                    // Fallback to filePath if original_filename is not available
                    setFieldValue('uploadFile', responseData.filePath)
                }
                
                // Set the media file ID for the API call
                if (responseData?.savedMedia?.id) {
                    setFieldValue('uploadFileMediaId', responseData.savedMedia.id)
                    console.log('Our Journey file upload - savedMedia.id:', responseData.savedMedia.id)
                }
                
                // Reset the file input to allow re-uploading the same file if needed
                if (uploadFileRef.current) {
                    uploadFileRef.current.value = ''
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
            setFieldValue('uploadFile', '')
            setFieldValue('uploadFileMediaId', undefined)
        } finally {
            setIsFileUploading(false)
        }
    }

    const onSubmit = async (values: OurJourneyFormSchema) => {
        try {
            console.log('=== ONSUBMIT START ===')
            console.log('Form values:', values)
            console.log('Initial form values:', initialFormValues)
            
            // Get the current our journey section data to build the update structure
            const journeyContentBlocks = homeData?.data?.filter(block => block.section_id === 7) || []
            console.log('Journey content blocks:', journeyContentBlocks)
            
            // Sort by display_order to ensure correct order
            const sortedBlocks = journeyContentBlocks.sort((a, b) => a.display_order - b.display_order)
            console.log('Sorted blocks:', sortedBlocks)
            
            // Find existing content blocks based on the new structure
            const titleBlock = sortedBlocks.find(block => block.display_order === 1 && block.block_type === 'text')
            const contentBlock = sortedBlocks.find(block => block.display_order === 2 && block.content)
            const imageBlock = sortedBlocks.find(block => block.display_order === 3 && block.block_type === 'image')
            
            console.log('Found blocks:', {
                titleBlock,
                contentBlock,
                imageBlock
            })
            
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
            
            // 1. Check if Header Text (title) changed
            const headerTextChanged = titleBlock && values.headerText !== initialValues.headerText
            console.log('Header Text comparison:', {
                current: values.headerText,
                initial: initialValues.headerText,
                changed: headerTextChanged,
                titleBlock: titleBlock
            })
            
            if (headerTextChanged) {
                contentBlocks.push({
                    id: titleBlock.id,
                    block_type: titleBlock.block_type,
                    title: values.headerText, // Update the title field
                    content: titleBlock.content,
                    display_order: titleBlock.display_order
                })
                changedObjects.push('Header Text')
            }
            
            // 2. Check if Content changed
            const contentChanged = contentBlock && values.content !== initialValues.content
            console.log('Content comparison:', {
                current: values.content,
                initial: initialValues.content,
                changed: contentChanged
            })
            
            if (contentChanged) {
                contentBlocks.push({
                    id: contentBlock.id,
                    block_type: contentBlock.block_type,
                    title: contentBlock.title,
                    content: values.content,
                    display_order: contentBlock.display_order
                })
                changedObjects.push('Content')
            }
            
            // 3. Check if Upload File changed
            const uploadFileChanged = values.uploadFile !== initialValues.uploadFile
            const uploadFileMediaIdChanged = values.uploadFileMediaId !== initialValues.uploadFileMediaId
            const uploadFileOverallChanged = imageBlock && (uploadFileChanged || uploadFileMediaIdChanged)
            
            console.log('Upload File comparison:', {
                file: { current: values.uploadFile, initial: initialValues.uploadFile, changed: uploadFileChanged },
                mediaFileId: { current: values.uploadFileMediaId, initial: initialValues.uploadFileMediaId, changed: uploadFileMediaIdChanged },
                overallChanged: uploadFileOverallChanged
            })
            
            if (uploadFileOverallChanged && values.uploadFileMediaId) {
                contentBlocks.push({
                    id: imageBlock.id,
                    block_type: imageBlock.block_type,
                    title: imageBlock.title,
                    content: imageBlock.content,
                    display_order: imageBlock.display_order,
                    media_files: [{
                        id: imageBlock.media_files[0]?.id || Date.now(),
                        content_block_id: imageBlock.id,
                        media_file_id: values.uploadFileMediaId,
                        media_type: "primary",
                        display_order: 1
                    }]
                })
                changedObjects.push('Upload File')
            }
            
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
            
            // Update section 7 with all changes (since all blocks are in section 7 now)
            const updateData7 = {
                id: 7,
                name: "Our Journey Content Section",
                title: "Our Journey Content Section",
                content_blocks: contentBlocks
            }
            
            console.log('Updating section 7 with:', updateData7)
            const result = await updateHomeSection({ 
                sectionId: 7, 
                updateData: updateData7 
            }).unwrap()
            
            console.log('Update result:', result)
            console.log('Only these objects are being updated:', changedObjects)
            
            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Our Journey section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update our journey section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update our journey section'
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
                <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Our Journey Section</p>
                
                {isLoadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading our journey section data...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error loading our journey section data</div>
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
                                {/* Header Text Section */}
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

                                {/* Content Section */}
                                <div className="mb-6">
                                    <FormItem
                                        label="Content"
                                        labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                        invalid={(errors.content && touched.content) as boolean}
                                        errorMessage={errors.content}
                                    >
                                        <Field name="content">
                                            {({ field, form }: any) => (
                                                <RichTextEditor
                                                    value={field.value || ''}
                                                    onChange={(value) => form.setFieldValue('content', value)}
                                                    placeholder="Enter content text"
                                                    theme="snow"
                                                    modules={{
                                                        toolbar: [
                                                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                                            ['bold', 'italic', 'underline', 'strike'],
                                                            [{ 'color': ['#305FC2','#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#00ADEF', '#D60F8C'] }, { 'background': ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#00ADEF', '#D60F8C'] }],
                                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                                                            [{ 'align': [] }],
                                                            ['link', 'image'],
                                                            ['clean']
                                                        ],
                                                        clipboard: {
                                                            matchVisual: false
                                                        }
                                                    }}
                                                    formats={[
                                                        'header', 'bold', 'italic', 'underline', 'strike',
                                                        'color', 'background', 'list', 'bullet', 'indent',
                                                        'align', 'link', 'image'
                                                    ]}
                                                    style={{
                                                        minHeight: '200px',
                                                        borderRadius: '24px',
                                                        border: '0.75px solid #CED4DA'
                                                    }}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Upload File Section */}
                                <div className="mb-6">
                                    <FormItem
                                        label="Upload File"
                                        labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                        invalid={(errors.uploadFile && touched.uploadFile) as boolean}
                                        errorMessage={errors.uploadFile}
                                    >
                                        <div className="flex w-full">
                                            <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                                <div className="flex-1 mb-3 sm:mb-0">
                                                    <span className="text-gray-700 font-medium pl-4">{values.uploadFile}</span>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <label className="cursor-pointer">
                                                        <input
                                                            ref={uploadFileRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileUpload(setFieldValue, e)}
                                                            className="hidden"
                                                        />
                                                        <Button 
                                                            type="button"
                                                            loading={isFileUploading}
                                                            onClick={() => uploadFileRef.current?.click()}
                                                            className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                        >
                                                            {isFileUploading ? 'Uploading...' : 'Upload File'}
                                                        </Button>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </FormItem>
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

export default OurJourneySection
