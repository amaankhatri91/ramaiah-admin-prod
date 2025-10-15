import { Card, Input, Button } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState, useRef, useEffect } from 'react'
import Modal from 'react-modal'
import { SIDE_NAV_WIDTH } from '@/constants/theme.constant'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { useGetHomeDataQuery, useUpdateHomeSectionMutation } from '@/store/slices/home'
import { parseHeroSection } from '@/services/HomeService'
import { toast, Notification } from '@/components/ui'

interface BannerImage {
    id: string
    name: string
    url?: string
    media_file_id?: number
}

type HeroSectionFormSchema = {
    headerText: string
    subHeaderText: string
    buttonText: string
    buttonLink: string
    bannerImages: BannerImage[]
    smallBannerFile: string
    smallBannerMediaFileId?: number
}

type BannerModalFormSchema = {
    bannerImageName: string
    imageFile: string
    mediaFileId?: number
}

const validationSchema = Yup.object().shape({
    headerText: Yup.string().required('Header text is required'),
    subHeaderText: Yup.string().required('Sub header text is required'),
    buttonText: Yup.string().required('Button text is required'),
    buttonLink: Yup.string().url('Please enter a valid URL').required('Button link is required'),
    bannerImages: Yup.array().min(1, 'At least one banner image is required'),
    smallBannerFile: Yup.string().required('Small banner file is required'),
})

const bannerModalValidationSchema = Yup.object().shape({
    bannerImageName: Yup.string().required('Banner image name is required'),
    imageFile: Yup.string().required('Image file is required'),
})

const HeroSection = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBanner, setEditingBanner] = useState<BannerImage | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [bannerToDelete, setBannerToDelete] = useState<BannerImage | null>(null)
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const [updateHomeSection, { isLoading: isUpdating }] = useUpdateHomeSectionMutation()
    const { data: homeData, isLoading: isLoadingData, error } = useGetHomeDataQuery()
    const bannerFileRef = useRef<HTMLInputElement>(null)
    const smallBannerFileRef = useRef<HTMLInputElement>(null)
    const [initialFormValues, setInitialFormValues] = useState<HeroSectionFormSchema | null>(null)

    // Set app element for react-modal accessibility
    Modal.setAppElement('#root')

    // Store initial values when data is loaded
    useEffect(() => {
        if (homeData?.data && !initialFormValues) {
            const initialValues = getInitialValues()
            setInitialFormValues(initialValues)
            console.log('Initial form values stored:', initialValues)
        }
    }, [homeData, initialFormValues])

    const getInitialValues = (): HeroSectionFormSchema => {
        if (!homeData?.data) {
            return {
                headerText: "Our Decades Of Legacy & Clinical Excellence Has...",
                subHeaderText: "#LifeGetsBetter",
                buttonText: "Book Appointment",
                buttonLink: "https://www.somepagelink.com",
                bannerImages: [
                    { id: '1', name: 'Main Banner Image.jpg' },
                    { id: '2', name: 'Second Banner Image.jpg' },
                    { id: '3', name: 'Third Banner Image.jpg' }
                ],
                smallBannerFile: "Ramaiah_introduction Video.mp4"
            }
        }
        
        const heroData = parseHeroSection(homeData.data)
        
        // Extract banner images with proper media_file_id from the banner block
        // Look for blocks with media_files that contain banner images
        const bannerBlock = homeData.data.find(block => 
            block.section_id === 1 && 
            block.media_files && 
            block.media_files.length > 0 &&
            (block.title === 'Banner Images' || block.title === 'joint commission international' || block.block_type === 'image')
        )
        const bannerImages = bannerBlock?.media_files?.map((mediaFile, index) => ({
            id: (index + 1).toString(),
            name: mediaFile.media_file.original_filename,
            media_file_id: mediaFile.media_file.id
        })) || [
            { id: '1', name: 'Main Banner Image.jpg' },
            { id: '2', name: 'Second Banner Image.jpg' },
            { id: '3', name: 'Third Banner Image.jpg' }
        ]
        
        return {
            headerText: heroData.headerText || "Our Decades Of Legacy & Clinical Excellence Has...",
            subHeaderText: heroData.subHeaderText || "#LifeGetsBetter",
            buttonText: "Book Appointment",
            buttonLink: "https://www.somepagelink.com",
            bannerImages: bannerImages,
            smallBannerFile: heroData.smallBannerFile || "Ramaiah_introduction Video.mp4",
            smallBannerMediaFileId: (heroData as any).smallBannerMediaFileId
        }
    }

    const getBannerModalInitialValues = (): BannerModalFormSchema => {
        if (editingBanner) {
            return {
                bannerImageName: editingBanner.name,
                imageFile: editingBanner.name, // Assuming the name includes the file extension
                mediaFileId: editingBanner.media_file_id
            }
        }
        return {
            bannerImageName: "JCI Accreditation",
            imageFile: "JCI Accreditation.png"
        }
    }

    const handleAddBanner = () => {
        setEditingBanner(null)
        setIsModalOpen(true)
    }

    const handleEditBanner = (banner: BannerImage) => {
        setEditingBanner(banner)
        setIsModalOpen(true)
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditingBanner(null)
    }

    const handleBannerModalSubmit = (values: BannerModalFormSchema, mainSetFieldValue: any, mainBannerImages: BannerImage[]) => {
        if (editingBanner) {
            // Update existing banner - use the uploaded file name if available, otherwise use the banner image name
            const updatedBanners = mainBannerImages.map(banner =>
                banner.id === editingBanner.id
                    ? { 
                        ...banner, 
                        name: values.imageFile || values.bannerImageName, // Use uploaded file name if available
                        media_file_id: values.mediaFileId 
                    }
                    : banner
            )
            mainSetFieldValue('bannerImages', updatedBanners)
        } else {
            // Add new banner - use the uploaded file name if available, otherwise use the banner image name
            const newBanner: BannerImage = {
                id: Date.now().toString(),
                name: values.imageFile || values.bannerImageName, // Use uploaded file name if available
                media_file_id: values.mediaFileId
            }
            mainSetFieldValue('bannerImages', [...mainBannerImages, newBanner])
        }
        setIsModalOpen(false)
        setEditingBanner(null)
    }

    const handleBannerFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setFieldValue('imageFile', file.name)
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the banner with the original filename and media file ID from the response
                // Access savedMedia from result.data.savedMedia based on the response structure
                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setFieldValue('imageFile', responseData.savedMedia.original_filename)
                } else if (responseData?.filePath) {
                    // Fallback to filePath if original_filename is not available
                    setFieldValue('imageFile', responseData.filePath)
                }
                
                // Set the media file ID for the API call - this is the key part
                if (responseData?.savedMedia?.id) {
                    setFieldValue('mediaFileId', responseData.savedMedia.id)
                    console.log('Banner file upload - savedMedia.id:', responseData.savedMedia.id)
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
            setFieldValue('imageFile', '')
            setFieldValue('mediaFileId', undefined)
        }
    }

    const handleDeleteBanner = (setFieldValue: any, bannerImages: BannerImage[], id: string) => {
        setFieldValue('bannerImages', bannerImages.filter(banner => banner.id !== id))
    }

    const handleDeleteClick = (banner: BannerImage) => {
        setBannerToDelete(banner)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = (setFieldValue: any, bannerImages: BannerImage[]) => {
        if (bannerToDelete) {
            setFieldValue('bannerImages', bannerImages.filter(banner => banner.id !== bannerToDelete.id))
        }
        setIsDeleteModalOpen(false)
        setBannerToDelete(null)
    }

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false)
        setBannerToDelete(null)
    }

    const handleFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setFieldValue('smallBannerFile', file.name)
            
            const result = await uploadFile({ file }).unwrap()
            
            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                
                // Update the field with the original filename from the response
                // Access savedMedia from result.data.savedMedia based on the response structure
                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setFieldValue('smallBannerFile', responseData.savedMedia.original_filename)
                } else if (responseData?.filePath) {
                    // Fallback to filePath if original_filename is not available
                    setFieldValue('smallBannerFile', responseData.filePath)
                }
                
                // Set the media file ID for the API call - this is the key part
                if (responseData?.savedMedia?.id) {
                    setFieldValue('smallBannerMediaFileId', responseData.savedMedia.id)
                    console.log('Small banner file upload - savedMedia.id:', responseData.savedMedia.id)
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
            setFieldValue('smallBannerFile', '')
            setFieldValue('smallBannerMediaFileId', undefined)
        }
    }

    const onSubmit = async (values: HeroSectionFormSchema) => {
        try {
            // Get the current hero section data to build the update structure
            const heroBlocks = homeData?.data?.filter(block => block.section_id === 1) || []
            
            // Find existing content blocks
            const headlineBlock = heroBlocks.find(block => block.title === 'Hero Headline')
            const subtitleBlock = heroBlocks.find(block => block.title === 'Hero Subtitle')
            const bannerBlock = heroBlocks.find(block => 
                block.media_files && 
                block.media_files.length > 0 &&
                (block.title === 'Banner Images' || block.title === 'joint commission international' || block.block_type === 'image')
            )
            const smallBannerBlock = heroBlocks.find(block => block.title === 'Small Banner')
            
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
            // Available media types: ['primary', 'background', 'icon', 'thumbnail', 'gallery', 'slider']
            const contentBlocks = []
            const changedObjects = []
            
            // 1. Check if Hero Text (Header Text) changed
            const headerTextChanged = headlineBlock && values.headerText !== initialValues.headerText
            console.log('Header Text comparison:', {
                current: values.headerText,
                initial: initialValues.headerText,
                changed: headerTextChanged
            })
            
            if (headerTextChanged) {
                contentBlocks.push({
                    id: headlineBlock.id,
                    block_type: headlineBlock.block_type,
                    title: headlineBlock.title,
                    content: values.headerText
                })
                changedObjects.push('Hero Text')
            }
            
            // 2. Check if Sub Header Text changed
            const subHeaderTextChanged = subtitleBlock && values.subHeaderText !== initialValues.subHeaderText
            console.log('Sub Header Text comparison:', {
                current: values.subHeaderText,
                initial: initialValues.subHeaderText,
                changed: subHeaderTextChanged
            })
            
            if (subHeaderTextChanged) {
                contentBlocks.push({
                    id: subtitleBlock.id,
                    block_type: subtitleBlock.block_type,
                    title: subtitleBlock.title,
                    content: values.subHeaderText
                })
                changedObjects.push('Sub Header Text')
            }
            
            // 3. Check if Banner Images changed
            if (bannerBlock) {
                const initialBannerImages = initialValues.bannerImages
                const currentBannerImages = values.bannerImages
                
                // Check if banner images array changed (length, names, or media_file_ids)
                const bannerImagesChanged = 
                    initialBannerImages.length !== currentBannerImages.length ||
                    initialBannerImages.some((initial, index) => {
                        const current = currentBannerImages[index]
                        return !current || 
                               initial.name !== current.name || 
                               initial.media_file_id !== current.media_file_id
                    })
                
                if (bannerImagesChanged) {
                    console.log('Banner Images changed:', {
                        initial: initialBannerImages,
                        current: currentBannerImages
                    })
                    
                    // Update existing media files instead of adding new ones
                    const mediaFiles = values.bannerImages
                        .map((banner, index) => {
                            const initialBanner = initialBannerImages[index]
                            const existingMediaFile = bannerBlock.media_files[index]
                            
                            // Check if this media file has changed
                            const hasChanged = !initialBanner || 
                                initialBanner.media_file_id !== banner.media_file_id ||
                                !banner.media_file_id // If no media_file_id, it's a new upload
                            
                            if (hasChanged && banner.media_file_id && existingMediaFile) {
                                return {
                                    id: existingMediaFile.id, // Use existing media file ID for update
                                    content_block_id: bannerBlock.id,
                                    media_file_id: banner.media_file_id,
                                    media_type: "background", // Banner images are used as background
                                    display_order: index + 1
                                }
                            }
                            return null
                        })
                        .filter(media => media !== null) // Remove null entries
                    
                    // Only add to contentBlocks if there are actual media file changes
                    if (mediaFiles.length > 0) {
                        contentBlocks.push({
                            id: bannerBlock.id,
                            block_type: bannerBlock.block_type,
                            title: bannerBlock.title,
                            media_files: mediaFiles
                        })
                        changedObjects.push('Banner Images')
                    }
                }
            }
            
            // 4. Check if Small Banner changed
            const smallBannerFileChanged = values.smallBannerFile !== initialValues.smallBannerFile
            const smallBannerMediaFileIdChanged = values.smallBannerMediaFileId !== initialValues.smallBannerMediaFileId
            const smallBannerChanged = smallBannerBlock && (smallBannerFileChanged || smallBannerMediaFileIdChanged)
            
            console.log('Small Banner comparison:', {
                file: { current: values.smallBannerFile, initial: initialValues.smallBannerFile, changed: smallBannerFileChanged },
                mediaFileId: { current: values.smallBannerMediaFileId, initial: initialValues.smallBannerMediaFileId, changed: smallBannerMediaFileIdChanged },
                overallChanged: smallBannerChanged
            })
            
            if (smallBannerChanged) {
                contentBlocks.push({
                    id: smallBannerBlock.id,
                    block_type: smallBannerBlock.block_type,
                    title: smallBannerBlock.title,
                    media_files: [{
                        id: smallBannerBlock.media_files[0].id,
                        content_block_id: smallBannerBlock.id,
                        media_file_id: values.smallBannerMediaFileId,
                        media_type: "primary", // Video updates should be primary
                        display_order: 1
                    }]
                })
                changedObjects.push('Small Banner')
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
                id: 1, // Hero section ID
                name: "Hero Section",
                title: "Hero Section",
                content_blocks: contentBlocks
            }
            
            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)
            
            const result = await updateHomeSection({
                sectionId: 1,
                updateData: updateData
            }).unwrap()
            
            if (result.success) {
                // Update initial values to current values after successful update
                setInitialFormValues(values)
                console.log('Initial values updated after successful save:', values)
                
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update hero section'
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
                <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Hero Section</p>

                {isLoadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading hero section data...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error loading hero section data</div>
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
                                {/* Header and Button Text Section */}
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

                                {/* Banner Images Section */}
                                <div className="mb-6 rounded-[24px] border-[0.75px] border-[#CED4DA] p-4">
                                    <div className="flex flex-col sm:flex-row  sm:justify-between !items-baseline mb-4 border-b border-[#CED4DA]">
                                        <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Banner Images</h3>
                                        <Button
                                            type="button"
                                            onClick={handleAddBanner}
                                            className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)]  text-white text-center font-inter text-[14px] font-medium leading-normal  !px-4 !py-1 "
                                        >
                                            Add New Banner
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {values.bannerImages.map((banner, index) => (
                                            <div key={banner.id} className="flex items-center justify-between ">
                                                <div className="flex items-center space-x-3">
                                                    <div className="cursor-move text-gray-400 hover:text-gray-600">
                                                        <img src="/img/images/grip-dots.svg" alt="grip-dots" className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-gray-700 font-medium">{banner.name}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditBanner(banner)}
                                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <img src="/img/images/Edittable.svg" alt="grip-dots" className="w-5 h-5" />
                                                    </button>
                                                    <button type="button" className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                                                        <img src="/img/images/viewtable.svg" alt="grip-dots" className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteClick(banner)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <img src="/img/images/deatetable.svg" alt="grip-dots" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>



                                {/* Small Banner Section */}
                                <div className="mb-6">
                                    <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[8px]">Small Banner</h3>
                                    <div className="flex w-full">
                                        <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                            <div className="flex-1 mb-3 sm:mb-0">
                                                <span className="text-gray-700 font-medium pl-4">{values.smallBannerFile}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <label className="cursor-pointer">
                                                    <input
                                                        ref={smallBannerFileRef}
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => handleFileUpload(setFieldValue, e)}
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        type="button"
                                                        loading={isUploading}
                                                        onClick={() => smallBannerFileRef.current?.click()}
                                                        className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                    >
                                                        {isUploading ? 'Uploading...' : 'Upload File'}
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

                            {/* Banner Modal */}
                            <Modal
                                isOpen={isModalOpen}
                                onRequestClose={handleModalClose}
                                contentLabel="Hero Section Banner Image Modal"
                                className="modal-content"
                                overlayClassName="modal-overlay"
                                style={{
                                    content: {
                                        position: 'fixed',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: window.innerWidth >= 1024 ? '60%' : '95%',
                                        maxWidth: '90vw',
                                        maxHeight: '90vh',
                                        borderRadius: '32px',
                                        border: 'none',
                                        padding: 0,
                                        backgroundColor: 'white',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        overflow: 'auto',
                                        margin: window.innerWidth >= 1024 ? `0 0 0 ${SIDE_NAV_WIDTH / 2}px` : '0'
                                    },
                                    overlay: {
                                        position: 'fixed',
                                        top: 0,
                                        left: window.innerWidth >= 1024 ? `${SIDE_NAV_WIDTH}px` : '0',
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        zIndex: 50
                                    }
                                }}
                            >
                                <div className="p-3 sm:p-4 md:p-6">
                                    <div className="flex items-center relative mb-4 sm:mb-6">
                                        <h3 className="text-[#495057] font-inter text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-normal flex-1 pr-8">
                                            {editingBanner ? 
                                                (editingBanner.id === '1' ? 'Edit Banner Video' : 'Edit Banner Image') : 
                                                'Add New Banner Image'
                                            }
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={handleModalClose}
                                            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        >
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <Formik
                                        key={editingBanner?.id || 'new'} // Force re-render when editing different banner
                                        initialValues={getBannerModalInitialValues()}
                                        validationSchema={bannerModalValidationSchema}
                                        onSubmit={(modalValues) => handleBannerModalSubmit(modalValues, setFieldValue, values.bannerImages)}
                                    >
                                        {({ values: modalValues, setFieldValue: modalSetFieldValue, touched, errors, isSubmitting }) => (
                                            <Form>
                                                <FormContainer>
                                                    <div className="space-y-4 sm:space-y-6">
                                                        <FormItem
                                                            label={editingBanner && editingBanner.id === '1' ? "Banner Video Name" : "Banner Image Name"}
                                                            labelClass="text-[#495057] font-inter text-[12px] sm:text-[14px] font-medium leading-normal"
                                                            invalid={(errors.bannerImageName && touched.bannerImageName) as boolean}
                                                            errorMessage={errors.bannerImageName}
                                                        >
                                                            <Field
                                                                name="bannerImageName"
                                                                component={Input}
                                                                className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-[12px] sm:text-[14px]"
                                                                placeholder={editingBanner && editingBanner.id === '1' ? "Enter banner video name" : "Enter banner image name"}
                                                            />
                                                        </FormItem>

                                                        <FormItem
                                                            label={editingBanner && editingBanner.id === '1' ? "Video File" : "Image File"}
                                                            labelClass="text-[#495057] font-inter text-[12px] sm:text-[14px] font-medium leading-normal"
                                                            invalid={(errors.imageFile && touched.imageFile) as boolean}
                                                            errorMessage={errors.imageFile}
                                                        >
                                                            <div className="w-full">
                                                                <div className="flex flex-col w-full rounded-[24px] border-[0.75px] border-[#CED4DA] p-2 sm:p-3">
                                                                    <div className="flex-1 mb-2">
                                                                        <span className="text-gray-700 font-medium text-[12px] sm:text-[14px] break-all">{modalValues.imageFile}</span>
                                                                    </div>
                                                                    <div className="flex justify-end">
                                                                        <label className="cursor-pointer">
                                                                            <input
                                                                                ref={bannerFileRef}
                                                                                type="file"
                                                                                accept={editingBanner && editingBanner.id === '1' ? "video/*" : "image/*"}
                                                                                onChange={(e) => handleBannerFileUpload(modalSetFieldValue, e)}
                                                                                className="hidden"
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                loading={isUploading}
                                                                                onClick={() => bannerFileRef.current?.click()}
                                                                                className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[12px] sm:text-[14px] font-medium leading-normal !px-3 !py-1 sm:!px-4"
                                                                            >
                                                                                {isUploading ? 'Uploading...' : 'Upload File'}
                                                                            </Button>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </FormItem>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                                                        <Button
                                                            type="button"
                                                            onClick={handleModalClose}
                                                            className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[12px] sm:text-[14px] font-medium leading-normal !px-3 !py-2 sm:!px-4 w-full sm:w-auto order-2 sm:order-1"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            loading={isSubmitting}
                                                            className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white !px-3 !py-2 sm:!px-4 font-medium transition-all duration-200 text-[12px] sm:text-[14px] w-full sm:w-auto order-1 sm:order-2"
                                                        >
                                                            {isSubmitting ? (editingBanner ? 'Updating...' : 'Adding...') : (editingBanner ? 'Update' : 'Add')}
                                                        </Button>
                                                    </div>
                                                </FormContainer>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </Modal>

                            {/* Delete Confirmation Modal */}
                            <Modal
                                isOpen={isDeleteModalOpen}
                                onRequestClose={handleDeleteCancel}
                                contentLabel="Delete Banner Image Confirmation Modal"
                                className="modal-content"
                                overlayClassName="modal-overlay"
                                style={{
                                    content: {
                                        position: 'fixed',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: window.innerWidth >= 1024 ? '690px' : '90%',
                                        maxWidth: '90vw',
                                        maxHeight: '90vh',
                                        borderRadius: '32px',
                                        border: 'none',
                                        padding: 0,
                                        backgroundColor: 'white',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        overflow: 'auto',
                                        margin: window.innerWidth >= 1024 ? `0 0 0 ${SIDE_NAV_WIDTH / 2}px` : '0'
                                    },
                                    overlay: {
                                        position: 'fixed',
                                        top: 0,
                                        left: window.innerWidth >= 1024 ? `${SIDE_NAV_WIDTH}px` : '0',
                                        right: 0,
                                        bottom: 0,
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        zIndex: 50
                                    }
                                }}
                            >
                                <div className="p-6 sm:p-8">
                                    <div className="text-center">
                                        <h3 className="text-[#495057] font-inter text-[18px] sm:text-[20px] font-semibold leading-normal mb-4">
                                            Remove Banner Image
                                        </h3>
                                        <p className="text-[#6B7280] font-inter text-[14px] sm:text-[16px] leading-normal mb-6">
                                            Could you please confirm if you want to remove this Banner Image?
                                        </p>

                                        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                                            <Button
                                                type="button"
                                                onClick={handleDeleteCancel}
                                                className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal !px-6 !py-2 w-full sm:w-auto order-2 sm:order-1"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => handleDeleteConfirm(setFieldValue, values.bannerImages)}
                                                className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white !px-6 !py-2 font-medium transition-all duration-200 text-[14px] w-full sm:w-auto order-1 sm:order-2"
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Modal>
                        </Form>
                    )}
                    </Formik>
                )}
            </div>
        </Card>
    )
}

export default HeroSection
