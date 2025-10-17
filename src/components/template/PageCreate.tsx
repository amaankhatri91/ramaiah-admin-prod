import React, { useState, useRef } from 'react'
import { HiArrowLeft, HiPlus, HiPencil, HiXMark } from 'react-icons/hi2'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, EditableImage, Card, Input } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { RichTextEditor } from '@/components/shared'
import { apiCreateSection } from '@/services/HomeService'

const PageCreate = () => {
    const navigate = useNavigate()
    const location = useLocation()
    // console.log("location",location);
    const pageData = location.state?.pageData
    console.log("pageDatadaynamic", pageData?.data?.[0]);
    
    // Early return if pageData is not available
    if (!pageData?.data?.[0]) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">No Page Data Available</h2>
                        <p className="text-gray-600 mb-4">Please navigate back and try again.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    
    // Local state for overview section instead of Redux store
    const [overviewSection, setOverviewSection] = useState({
        headerText: '',
        overview: '',
        image: null as File | null,
        imageFileName: '',
        imageMediaFileId: undefined as number | undefined
    })
    
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    
    // Individual loading states for each Save button
    const [isHeroSectionSaving, setIsHeroSectionSaving] = useState(false)
    const [isOverviewSectionSaving, setIsOverviewSectionSaving] = useState(false)
    const [isCoursesSectionSaving, setIsCoursesSectionSaving] = useState(false)
    const [isServicesSectionSaving, setIsServicesSectionSaving] = useState(false)
    const [isWhyChooseUsSectionSaving, setIsWhyChooseUsSectionSaving] = useState(false)
    
    // Separate loading states for each upload button
    const [isHeroImageUploading, setIsHeroImageUploading] = useState(false)
    const [isHeroBgImageUploading, setIsHeroBgImageUploading] = useState(false)

    // Form states for different sections
    const [heroSection, setHeroSection] = useState({
        headerText: '',
        descriptionText: '',
        buttonText: '',
        buttonLink: '',
        heroImage: null as File | null,
        heroImageFileName: '',
        heroImageMediaFileId: undefined as number | undefined,
        heroBgImage: null as File | null,
        heroBgImageFileName: '',
        heroBgImageMediaFileId: undefined as number | undefined,
        heroVideo: ''
    })

    const [audioSection, setAudioSection] = useState({
        headerText: '',
        descriptionText: '',
        audioFile: null as File | null
    })

    const [coursesSection, setCoursesSection] = useState({
        headerText: '',
        courses: [] as Array<{ id: number; text: string; link: string }>
    })

    const [expertsSection, setExpertsSection] = useState({
        headerText: '',
        subHeaderText: ''
    })

    const [servicesFacilitiesSection, setServicesFacilitiesSection] = useState({
        headerText: '',
        services: [] as Array<{ id: number; text: string }>
    })

    const [enquiryFormSection, setEnquiryFormSection] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        message: ''
    })

    const [whyChooseUsSection, setWhyChooseUsSection] = useState({
        headerText: '',
        subHeaderText: '',
        rows: [] as Array<{ id: string; header: string; subHeader: string; icon: string; mediaFileId?: number }>
    })

    const [uploadingBoxId, setUploadingBoxId] = useState<string | null>(null)
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    // Validation schema for Why Choose Us Section
    const whyChooseUsValidationSchema = Yup.object().shape({
        headerText: Yup.string().required('Header text is required'),
        subHeaderText: Yup.string(),
        rows: Yup.array().of(
            Yup.object().shape({
                header: Yup.string().required('Header is required'),
                subHeader: Yup.string(),
                icon: Yup.string().required('Icon is required'),
            })
        ).min(1, 'At least one row is required'),
    })

    const handleBackClick = () => {
        navigate(-1)
    }

    // Save handlers for each section
    const handleSaveHeroSection = async () => {
        setIsHeroSectionSaving(true)
        try {
            console.log('Saving hero section:', heroSection)
            
            // Static payload for creating section
            const sectionData = {
                "name": pageData?.data?.[0]?.name || '',
                "title": pageData?.data?.[0]?.title || '',
                "section_type": pageData?.data?.[0]?.section_type || '',
                "page_id": pageData?.data?.[0]?.page_id || '',
                "display_order": pageData?.data?.[0]?.display_order || 0
            }
            
            // Call the API to create section
            const response = await apiCreateSection(sectionData)
            console.log("responsekkkkkk",response);
            
            if (response.status === 200) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Hero section saved successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(response.data.message || 'Failed to save hero section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to save hero section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setIsHeroSectionSaving(false)
        }
    }

    const handleSaveAudioSection = () => {
        console.log('Saving audio section:', audioSection)
        alert('Audio section saved successfully!')
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const result = await uploadFile({ file }).unwrap()

            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )

                // Update the overview section with the uploaded file info
                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setOverviewSection({
                        ...overviewSection,
                        image: file,
                        imageFileName: responseData.savedMedia.original_filename,
                        imageMediaFileId: responseData.savedMedia.id
                    })
                } else if (responseData?.filePath) {
                    setOverviewSection({
                        ...overviewSection,
                        image: file,
                        imageFileName: responseData.filePath,
                        imageMediaFileId: responseData.savedMedia?.id
                    })
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
        }
    }

    const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsHeroImageUploading(true)
        try {
            const result = await uploadFile({ file }).unwrap()

            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )

                // Update the hero section with the uploaded file info
                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setHeroSection({
                        ...heroSection,
                        heroImage: file,
                        heroImageFileName: responseData.savedMedia.original_filename,
                        heroImageMediaFileId: responseData.savedMedia.id
                    })
                } else if (responseData?.filePath) {
                    setHeroSection({
                        ...heroSection,
                        heroImage: file,
                        heroImageFileName: responseData.filePath,
                        heroImageMediaFileId: responseData.savedMedia?.id
                    })
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
        } finally {
            setIsHeroImageUploading(false)
        }
    }

    const handleHeroBgImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsHeroBgImageUploading(true)
        try {
            const result = await uploadFile({ file }).unwrap()

            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )

                // Update the hero section with the uploaded background image file info
                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setHeroSection({
                        ...heroSection,
                        heroBgImage: file,
                        heroBgImageFileName: responseData.savedMedia.original_filename,
                        heroBgImageMediaFileId: responseData.savedMedia.id
                    })
                } else if (responseData?.filePath) {
                    setHeroSection({
                        ...heroSection,
                        heroBgImage: file,
                        heroBgImageFileName: responseData.filePath,
                        heroBgImageMediaFileId: responseData.savedMedia?.id
                    })
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
        } finally {
            setIsHeroBgImageUploading(false)
        }
    }

    const handleSaveOverviewSection = async () => {
        setIsOverviewSectionSaving(true)
        try {
            console.log('Saving overview section:', overviewSection)
            // TODO: Implement actual API call for overview section
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.push(
                <Notification type="success" duration={2500} title="Success">
                    Overview section saved successfully
                </Notification>,
                { placement: 'top-end' }
            )
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to save overview section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setIsOverviewSectionSaving(false)
        }
    }

    const handleCourseTextChange = (courseId: number, newText: string) => {
        setCoursesSection({
            ...coursesSection,
            courses: coursesSection.courses.map(course =>
                course.id === courseId ? { ...course, text: newText } : course
            )
        })
    }

    const handleCourseLinkChange = (courseId: number, newLink: string) => {
        setCoursesSection({
            ...coursesSection,
            courses: coursesSection.courses.map(course =>
                course.id === courseId ? { ...course, link: newLink } : course
            )
        })
    }

    const addNewCourse = () => {
        const newCourseId = coursesSection.courses.length > 0 ? Math.max(...coursesSection.courses.map(course => course.id), 0) + 1 : 1
        const newCourse = {
            id: newCourseId,
            text: '',
            link: ''
        }
        setCoursesSection({
            ...coursesSection,
            courses: [...coursesSection.courses, newCourse]
        })
    }

    const handleSaveCoursesSection = async () => {
        setIsCoursesSectionSaving(true)
        try {
            console.log('Saving courses section:', coursesSection)
            // TODO: Implement actual API call for courses section
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.push(
                <Notification type="success" duration={2500} title="Success">
                    Our Specialities section saved successfully
                </Notification>,
                { placement: 'top-end' }
            )
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to save our specialities section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setIsCoursesSectionSaving(false)
        }
    }

    const handleSaveExpertsSection = () => {
        console.log('Saving experts section:', expertsSection)
        alert('Experts section saved successfully!')
    }

    const handleServiceTextChange = (serviceId: number, newText: string) => {
        setServicesFacilitiesSection({
            ...servicesFacilitiesSection,
            services: servicesFacilitiesSection.services.map(service =>
                service.id === serviceId ? { ...service, text: newText } : service
            )
        })
    }

    const addNewService = () => {
        const newServiceId = servicesFacilitiesSection.services.length > 0 ? Math.max(...servicesFacilitiesSection.services.map(service => service.id), 0) + 1 : 1
        const newService = {
            id: newServiceId,
            text: ''
        }
        setServicesFacilitiesSection({
            ...servicesFacilitiesSection,
            services: [...servicesFacilitiesSection.services, newService]
        })
    }

    const handleDeleteService = (serviceId: number) => {
        setServicesFacilitiesSection({
            ...servicesFacilitiesSection,
            services: servicesFacilitiesSection.services.filter(service => service.id !== serviceId)
        })
    }

    const handleSaveServicesFacilitiesSection = async () => {
        setIsServicesSectionSaving(true)
        try {
            console.log('Saving services & facilities section:', servicesFacilitiesSection)
            // TODO: Implement actual API call for services & facilities section
            await new Promise(resolve => setTimeout(resolve, 1000))
            toast.push(
                <Notification type="success" duration={2500} title="Success">
                    Services & Facilities section saved successfully
                </Notification>,
                { placement: 'top-end' }
            )
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to save services & facilities section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setIsServicesSectionSaving(false)
        }
    }

    const handleSaveEnquiryFormSection = () => {
        console.log('Saving enquiry form section:', enquiryFormSection)
        alert('Enquiry form section saved successfully!')
    }

    const handleWhyChooseUsRowChange = (setFieldValue: any, rows: any[], id: string, field: 'header' | 'subHeader' | 'icon', value: string) => {
        const updatedRows = rows.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        )
        setFieldValue('rows', updatedRows)
    }

    const handleWhyChooseUsIconUpload = async (setFieldValue: any, rows: any[], id: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            setUploadingBoxId(id)
            setFieldValue('rows', rows.map(row =>
                row.id === id ? { ...row, icon: file.name } : row
            ))

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
                    handleWhyChooseUsRowChange(setFieldValue, rows, id, 'icon', responseData.savedMedia.original_filename)
                } else if (responseData?.filePath) {
                    // Fallback to filePath if original_filename is not available
                    handleWhyChooseUsRowChange(setFieldValue, rows, id, 'icon', responseData.filePath)
                }

                // Set the media file ID for the API call
                if (responseData?.savedMedia?.id) {
                    const updatedRows = rows.map(row =>
                        row.id === id ? { ...row, mediaFileId: responseData.savedMedia.id } : row
                    )
                    setFieldValue('rows', updatedRows)
                    console.log('Why Choose Us icon upload - savedMedia.id:', responseData.savedMedia.id)
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
            handleWhyChooseUsRowChange(setFieldValue, rows, id, 'icon', 'icon_01.svg')
        } finally {
            setUploadingBoxId(null)
        }
    }

    const handleWhyChooseUsFileInputClick = (rowId: string) => {
        const fileInput = fileInputRefs.current[rowId]
        if (fileInput) {
            fileInput.click()
        }
    }

    const getOrdinalSuffix = (index: number) => {
        if (index === 0) return 'st'
        if (index === 1) return 'nd'
        if (index === 2) return 'rd'
        return 'th'
    }

    const addNewWhyChooseUsRow = () => {
        const newRowId = whyChooseUsSection.rows.length > 0 ? Math.max(...whyChooseUsSection.rows.map(row => parseInt(row.id)), 0) + 1 : 1
        const newRow: { id: string; header: string; subHeader: string; icon: string; mediaFileId?: number } = {
            id: `${newRowId}`,
            header: '',
            subHeader: '',
            icon: '',
            mediaFileId: undefined
        }
        setWhyChooseUsSection({
            ...whyChooseUsSection,
            rows: [...whyChooseUsSection.rows, newRow]
        })
    }

    const handleSaveWhyChooseUsSection = async () => {
        setIsWhyChooseUsSectionSaving(true)
        try {
            console.log('Saving why choose us section:', whyChooseUsSection)
            // TODO: Implement actual API call for Why Choose Us section
            await new Promise(resolve => setTimeout(resolve, 1000))
            alert('Why Choose Us section saved successfully!')
        } catch (error) {
            console.error('Error saving Why Choose Us section:', error)
            alert('Failed to save Why Choose Us section')
        } finally {
            setIsWhyChooseUsSectionSaving(false)
        }
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header with Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                    {/* <button
                        onClick={handleBackClick}
                        className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back
                    </button> */}
                    <h1 className="text-2xl font-bold text-gray-800">
                        Page Create
                    </h1>
                </div>
                
            
            </div>

            {/* Hero Section */}
            <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Hero Section</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Header Text</label>
                    <input
                        type="text"
                        value={heroSection.headerText}
                        onChange={(e) => setHeroSection({ ...heroSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px]  "
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload image</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={heroSection.heroImageFileName}
                            readOnly
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                        />
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleHeroImageUpload}
                            className="hidden"
                            id="hero-image-upload"
                            disabled={isHeroImageUploading}
                        />
                        <label
                            htmlFor="hero-image-upload"
                            className={`px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors cursor-pointer ${isHeroImageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isHeroImageUploading ? 'Uploading...' : 'Upload File'}
                        </label>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bg image</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={heroSection.heroBgImageFileName}
                            readOnly
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                        />
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleHeroBgImageUpload}
                            className="hidden"
                            id="hero-bg-image-upload"
                            disabled={isHeroBgImageUploading}
                        />
                        <label
                            htmlFor="hero-bg-image-upload"
                            className={`px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors cursor-pointer ${isHeroBgImageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isHeroBgImageUploading ? 'Uploading...' : 'Upload File'}
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSaveHeroSection}
                        loading={isHeroSectionSaving}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isHeroSectionSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Speciality Overview Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Overview Section</h3>

                {/* Header Text */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={overviewSection.headerText}
                        onChange={(e) => setOverviewSection({ ...overviewSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                {/* Content */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <RichTextEditor
                        value={overviewSection.overview}
                        onChange={(value) => setOverviewSection({ ...overviewSection, overview: value })}
                        placeholder="Enter content here..."
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
                        }}
                    />
                </div>

                {/* Upload Image */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={overviewSection.imageFileName}
                            readOnly
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="overview-image-upload"
                        />
                        <label
                            htmlFor="overview-image-upload"
                            className="px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors"
                        >
                            Upload File
                        </label>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button
                        onClick={handleSaveOverviewSection}
                        loading={isOverviewSectionSaving}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isOverviewSectionSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Our Specialities */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Our Specialities</h3>

                {/* Header Text */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={coursesSection.headerText}
                        onChange={(e) => setCoursesSection({ ...coursesSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                {/* Course Management */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">Manage Courses</label>
                        <button
                            onClick={addNewCourse}
                            className="flex items-center gap-2 px-4 py-2 !rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white transition-colors"
                        >
                            Add New Course
                        </button>
                    </div>
                    <div className="">
                        {coursesSection.courses.map((course) => (
                            <div key={course.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Button Text</label>
                                    <input
                                        type="text"
                                        value={course.text}
                                        onChange={(e) => handleCourseTextChange(course.id, e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                        placeholder="Enter button text..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Button Link</label>
                                    <input
                                        type="url"
                                        value={course.link}
                                        onChange={(e) => handleCourseLinkChange(course.id, e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                        placeholder="Enter button link..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSaveCoursesSection}
                        loading={isCoursesSectionSaving}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isCoursesSectionSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Services & Facilities Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Services & Facilities Section</h3>

                {/* Header Text */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={servicesFacilitiesSection.headerText}
                        onChange={(e) => setServicesFacilitiesSection({ ...servicesFacilitiesSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                {/* Services Management */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">Services & Facilities</label>
                        <Button
                            onClick={addNewService}
                            className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white text-center font-inter text-[14px] font-medium leading-normal !px-4 !py-1"
                        >
                            Add New Service
                        </Button>
                    </div>
                    <div className="">
                        {servicesFacilitiesSection.services.map((service) => (
                            <div key={service.id} className="p-4 pb-0 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-600">
                                        Service {service.id}
                                    </label>
                                    <button
                                        onClick={() => handleDeleteService(service.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <img src="/img/images/deatetable.svg" alt="delete" className="w-5 h-5" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={service.text}
                                    onChange={(e) => handleServiceTextChange(service.id, e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                    placeholder="Enter service name..."
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSaveServicesFacilitiesSection}
                        loading={isServicesSectionSaving}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isServicesSectionSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Why Choose Us Section */}
            <Card className="bg-white rounded-xl">
                <div className="px-2">
                    <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Why Choose Us Section</p>

                    <Formik
                        initialValues={whyChooseUsSection}
                        validationSchema={whyChooseUsValidationSchema}
                        onSubmit={handleSaveWhyChooseUsSection}
                        enableReinitialize={true}
                    >
                        {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                            <Form>
                                <FormContainer>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
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
                                        <div>
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

                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Why Choose Us Items</label>
                                            <button
                                                type="button"
                                                onClick={addNewWhyChooseUsRow}
                                                className="flex items-center gap-2 px-4 py-2 !rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white transition-colors"
                                            >
                                                Add New Item
                                            </button>
                                        </div>
                                    </div>

                                    <div className="">
                                        {values.rows.map((row, index) => (
                                            <div key={row.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <FormItem
                                                        label={`Header of ${index + 1}${getOrdinalSuffix(index)} Box`}
                                                        labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                        invalid={(errors.rows?.[index] && typeof errors.rows[index] === 'object' && (errors.rows[index] as any)?.header && touched.rows?.[index]?.header) as boolean}
                                                        errorMessage={errors.rows?.[index] && typeof errors.rows[index] === 'object' ? String((errors.rows[index] as any)?.header || '') : undefined}
                                                    >
                                                        <Input
                                                            value={row.header}
                                                            onChange={(e) => handleWhyChooseUsRowChange(setFieldValue, values.rows, row.id, 'header', e.target.value)}
                                                            className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                            placeholder="Enter header"
                                                        />
                                                    </FormItem>
                                                </div>

                                                <div>
                                                    <FormItem
                                                        label={`Sub header of ${index + 1}${getOrdinalSuffix(index)} Box`}
                                                        labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                        invalid={(errors.rows?.[index] && typeof errors.rows[index] === 'object' && (errors.rows[index] as any)?.subHeader && touched.rows?.[index]?.subHeader) as boolean}
                                                        errorMessage={errors.rows?.[index] && typeof errors.rows[index] === 'object' ? String((errors.rows[index] as any)?.subHeader || '') : undefined}
                                                    >
                                                        <Input
                                                            value={row.subHeader}
                                                            onChange={(e) => handleWhyChooseUsRowChange(setFieldValue, values.rows, row.id, 'subHeader', e.target.value)}
                                                            className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                            placeholder="Enter sub header"
                                                        />
                                                    </FormItem>
                                                </div>

                                                <div>
                                                    <label className="block text-[#495057] font-inter text-[14px] font-medium leading-normal mb-2">
                                                        {index + 1}{getOrdinalSuffix(index)} Box Icon
                                                    </label>
                                                    <div className="flex w-full">
                                                        <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                                                            <div className="flex-1 mb-3 sm:mb-0">
                                                                <span className="text-gray-700 font-medium pl-4">{row.icon}</span>
                                                            </div>
                                                            <div className="flex flex-col sm:flex-row gap-3">
                                                                <input
                                                                    ref={(el) => fileInputRefs.current[row.id] = el}
                                                                    type="file"
                                                                    accept="image/*,.svg"
                                                                    onChange={(e) => handleWhyChooseUsIconUpload(setFieldValue, values.rows, row.id, e)}
                                                                    className="hidden"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    loading={uploadingBoxId === row.id && isUploading}
                                                                    onClick={() => handleWhyChooseUsFileInputClick(row.id)}
                                                                    className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                                                                >
                                                                    {uploadingBoxId === row.id && isUploading ? 'Uploading...' : 'Upload File'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            loading={isWhyChooseUsSectionSaving}
                                            className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                                        >
                                            {isWhyChooseUsSectionSaving ? 'Saving...' : 'Save'}
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

export default PageCreate