import React, { useState, useEffect, useRef } from 'react'
import { HiPlus, HiPencil, HiXMark } from 'react-icons/hi2'
import FileUpload from '@/components/ui/FileUpload'
import { Button, Card, Input } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { ChildrenMenuItem, ChildrenMenuData } from '@/store/slices/base/commonSlice'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { useUpdatePageSectionMutation } from '@/store/slices/pageSections/pageSectionsApiSlice'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { PageSectionsData, apiGetPageSections } from '@/services/HomeService'
import { RichTextEditor } from '@/components/shared'

interface SpecialityContentSectionsProps {
    activeTab: string
    childrenMenuData?: ChildrenMenuData | null
    availableTabs?: Array<{ id: number, title: string }>
    tabChildrenData?: { [key: number]: any }
    pageData?: { [key: string]: PageSectionsData }
    onNavigateToChildren?: (menuId: number) => void
    onNavigateToGrandchild?: (menuId: number) => void
    pageId?: number | null
}

const SpecialityContentSections: React.FC<SpecialityContentSectionsProps> = ({
    activeTab,
    childrenMenuData,
    availableTabs,
    tabChildrenData,
    pageData,
    onNavigateToChildren,
    onNavigateToGrandchild,
    pageId
}) => {
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const [updatePageSection, { isLoading: isUpdating }] = useUpdatePageSectionMutation()
    
    // Separate loading states for each section
    const [isHeroSaving, setIsHeroSaving] = useState(false)
    const [isOverviewSaving, setIsOverviewSaving] = useState(false)
    
    // Separate loading states for each upload button
    const [isHeroImageUploading, setIsHeroImageUploading] = useState(false)
    const [isHeroBgImageUploading, setIsHeroBgImageUploading] = useState(false)
    const [isOverviewImageUploading, setIsOverviewImageUploading] = useState(false)
    console.log("activeTab",pageId);
    // Get the current active tab's data
    const getCurrentTabData = () => {
        if (!childrenMenuData || !availableTabs) return null
        const currentTab = availableTabs.find(tab => tab.title === activeTab)
        if (!currentTab) return null
        return childrenMenuData.children.find(child => child.id === currentTab.id)
    }

    // Get the current tab's children data from API response
    const getCurrentTabChildrenData = () => {
        if (!availableTabs || !tabChildrenData) return null
        const currentTab = availableTabs.find(tab => tab.title === activeTab)
        if (!currentTab) return null
        return tabChildrenData[currentTab.id]
    }

    // Get the current page data from API response
    const getCurrentPageData = () => {
        if (!pageData || !activeTab) return null
        return pageData[activeTab]
    }
console.log("pageDataaaaaaa",pageData);

    const currentTabData = getCurrentTabData()
    const currentTabChildrenData = getCurrentTabChildrenData()
    const currentPageData = getCurrentPageData()

    // Use only dynamic pages from API with IDs for drag and drop
    const [pages, setPages] = useState<Array<{ id: number, title: string }>>([])
    const [draggedItem, setDraggedItem] = useState<number | null>(null)

    const [courses, setCourses] = useState(
        Array.from({ length: 10 }, (_, index) => `Duration Assistance And Response ${index + 1}`)
    )

    const [experts, setExperts] = useState(
        Array.from({ length: 10 }, (_, index) => `Dr. Anura D. Ramesh (Cardiology, Emergency) ${index + 1}`)
    )

    // Update pages when activeTab changes or tab children data changes
    useEffect(() => {
        if (currentTabChildrenData && currentTabChildrenData.children && currentTabChildrenData.children.length > 0) {
            setPages(currentTabChildrenData.children.map((child: any, index: number) => ({
                id: child.id || index + 1,
                title: child.title
            })))
        } else {
            // Show empty array if no children found
            setPages([])
        }
    }, [activeTab, currentTabChildrenData])

    // Log page data when it changes
    // useEffect(() => {
    //     if (currentPageData && activeTab) {
    //         console.log('=== CURRENT PAGE DATA IN SPECIALITY CONTENT ===')
    //         console.log('Active Tab:', activeTab)
    //         console.log('Page Data:', currentPageData)
    //         console.log('Hero Section:', currentPageData.heroSection)
    //         console.log('Sections:', currentPageData.sections)
    //         console.log('===============================================')
    //     }
    // }, [currentPageData, activeTab])

    // Update Hero Section content when active tab changes
    console.log("currentTabData",currentTabData);
    useEffect(() => {
        if (pageData && activeTab) {
            // const currentPageData = pageData[activeTab]
            console.log("pageDatassssss",pageData[pageId || '']?.data);
            // console.log("currentPageDatassss",currentPageData);g
            if (pageId && pageData[pageId]?.data && Array.isArray(pageData[pageId]?.data)) {
                // Find the hero section
                const heroSection = pageData[pageId]?.data.find((section: any) => section.title === 'Hero')
                console.log("heroSection found:", heroSection);
                if (heroSection && heroSection.content_blocks) {
                    // Find the text block with title in hero section
                    const heroTextBlock = heroSection.content_blocks.find((block: any) => 
                        block.block_type === 'text' && block.title
                    )
                    console.log("heroTextBlockkkkkk", heroTextBlock);
                    
                    // Find the image block for hero image
                    const heroImageBlock = heroSection.content_blocks.find((block: any) => 
                        block.block_type === 'image' && block.media_files && block.media_files.length > 0
                    )

                    const heroBgImageBlock = heroSection.content_blocks.find((block: any) => 
                        block.block_type === 'custom' && block.media_files && block.media_files.length > 0
                    )
                    console.log("heroImageBlock", heroImageBlock);
                    
                    if (heroTextBlock) {
                        setHeroSection(prev => ({
                            ...prev,
                            headerText: heroTextBlock.title,
                            descriptionText: `Comprehensive healthcare services for ${activeTab}`,
                            buttonText: 'Book Appointment',
                            buttonLink: `https://www.ramaiah.com/${currentTabData?.url || 'appointment'}`,
                            heroImageFileName: heroImageBlock?.media_files?.[0]?.media_file?.original_filename || '',
                            heroBgImageFileName :heroBgImageBlock?.media_files?.[0]?.media_file?.original_filename || ''
                        }))
                    }
                }
            }

            // Update overview section with tab-specific content
            if (pageId && pageData[pageId]?.data && Array.isArray(pageData[pageId]?.data)) {
                const overviewSection = pageData[pageId]?.data.find((section: any) => section.name === 'overview')
                if (overviewSection && overviewSection.content_blocks) {
                    // Find the content block with actual content
                    const overviewContenttitle = overviewSection.content_blocks.find((block: any) => block.title)
                    const overviewContentBlock = overviewSection.content_blocks.find((block: any) => block.content)
                    
                    // Find the image block for overview image
                    const overviewImageBlock = overviewSection.content_blocks.find((block: any) => 
                        block.block_type === 'image' && block.media_files && block.media_files.length > 0
                    )
                    console.log("overviewContentBlock", overviewContentBlock);
                    
                    if (overviewContentBlock) {
                        setOverviewSection(prev => ({
                            ...prev,
                            headerText: overviewContenttitle.title,
                            overview: overviewContentBlock.content,
                            imageFileName: overviewImageBlock?.media_files?.[0]?.media_file?.original_filename || ''
                        }))
                    }
                }
            }

            // Update courses section with tab-specific content
            if (pageId && pageData[pageId]?.data && Array.isArray(pageData[pageId]?.data)) {
                const specialitiesSection = pageData[pageId]?.data.find((section: any) => section.name === 'our specialities')
                if (specialitiesSection && specialitiesSection.content_blocks) {
                    // Find the content block with specialties
                    const specialitiesDataBlock = specialitiesSection.content_blocks.find((block: any) => 
                        block.specialties && block.specialties.length > 0
                    )
                    
                    if (specialitiesDataBlock?.specialties) {
                        const courses = specialitiesDataBlock.specialties.map((specialty: any, index: number) => ({
                            id: specialty.id || index + 1,
                            text: specialty.name || '',
                            link: ''
                        }))
                        
                        setCoursesSection(prev => ({
                            ...prev,
                            headerText: 'Our Specialities',
                            courses: courses
                        }))
                    }
                }
            }

            // Update services section with tab-specific content
            if (pageId && pageData[pageId]?.data && Array.isArray(pageData[pageId]?.data)) {
                const servicesSection = pageData[pageId]?.data.find((section: any) => section.name === 'service & facilities')
                if (servicesSection && servicesSection.content_blocks) {
                    // Find the content block with facility specialties
                    const servicesDataBlock = servicesSection.content_blocks.find((block: any) => 
                        block.facilitySpecialties && block.facilitySpecialties.length > 0
                    )
                    
                    if (servicesDataBlock?.facilitySpecialties) {
                        const services = servicesDataBlock.facilitySpecialties.map((facilitySpecialty: any, index: number) => ({
                            id: facilitySpecialty.id || index + 1,
                            text: facilitySpecialty.facility?.name || ''
                        }))
                        
                        setServicesFacilitiesSection(prev => ({
                            ...prev,
                            headerText: 'Services & Facilities',
                            services: services
                        }))
                    }
                }
            }
        }
    }, [pageData, activeTab, currentTabData, pageId])

    // Form states for different sections - now dynamic based on active tab
    const [heroSection, setHeroSection] = useState({
        headerText: '',
        descriptionText: '',
        buttonText: 'Book Appointment',
        buttonLink: 'https://www.somepagelink.com',
        heroImage: null as File | null,
        heroImageFileName: '',
        heroImageMediaFileId: undefined as number | undefined,
        heroBgImage: null as File | null,
        heroBgImageFileName: '',
        heroBgImageMediaFileId: undefined as number | undefined
    })
console.log("heroSectionddd",heroSection);

    const [audioSection, setAudioSection] = useState({
        headerText: '',
        descriptionText: '',
        audioFile: null as File | null
    })

    const [overviewSection, setOverviewSection] = useState({
        headerText: '',
        overview: '',
        image: null as File | null,
        imageFileName: 'In affiliation.jpeg',
        imageMediaFileId: undefined as number | undefined
    })
console.log("overviewSection",overviewSection);

    const [coursesSection, setCoursesSection] = useState({
        headerText: 'Our Specialities',
        courses: [] as Array<{ id: number, text: string, link: string }>
    })

    const [expertsSection, setExpertsSection] = useState({
        headerText: '',
        subHeaderText: ''
    })

    const [servicesFacilitiesSection, setServicesFacilitiesSection] = useState({
        headerText: 'Services & Facilities',
        services: [] as Array<{ id: number, text: string }>
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
        rows: Array.from({ length: 8 }, (_, index) => ({
            id: `${index + 1}`,
            header: `Header of ${index + 1}st Box`,
            subHeader: `Sub Header of ${index + 1}st Box`,
            icon: 'icon_01.svg',
            mediaFileId: undefined as number | undefined
        }))
    })

    const [uploadingBoxId, setUploadingBoxId] = useState<string | null>(null)
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
    
    // State for API response data
    const [apiResponseData, setApiResponseData] = useState<any>(null)
    const [showApiLog, setShowApiLog] = useState<boolean>(false)

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

    const handleAddPage = () => {
        const newPage = prompt('Enter new page name:')
        if (newPage) {
            const newId = Math.max(...pages.map(p => p.id), 0) + 1
            setPages([...pages, { id: newId, title: newPage }])
        }
    }

    const handleDeletePage = (id: number) => {
        setPages(pages.filter(page => page.id !== id))
    }

    const handleEditPage = async (id: number) => {
        try {
            // First, get the page_id from the current tab children data
            let pageId = id // Default to the menu item ID
            
            if (currentTabChildrenData && currentTabChildrenData.children) {
                const pageItem = currentTabChildrenData.children.find((child: any) => child.id === id)
                if (pageItem && pageItem.page_id) {
                    pageId = pageItem.page_id
                    console.log(`Found page_id: ${pageId} for menu item ID: ${id}`)
                } else {
                    console.log(`No page_id found for menu item ID: ${id}, using menu item ID as fallback`)
                }
            }
            
            // Call the API to get page sections data using the correct page_id
            console.log(`Calling API /home/sections/${pageId}`)
            const response = await apiGetPageSections(pageId.toString())
            
            // Store the response data
            setApiResponseData(response)
            setShowApiLog(true)
            
            // Log the response data
            console.log('=== API RESPONSE DATA ===')
            console.log('Menu Item ID:', id)
            console.log('Page ID used:', pageId)
            console.log('Full Response:', response)
            console.log('Response Data:', response.data)
            console.log('========================')
            
            // Show success notification
            toast.push(
                <Notification type="success" duration={3000} title="API Call Successful">
                    Successfully fetched page sections data for page ID: {pageId}
                </Notification>,
                { placement: 'top-end' }
            )
            
        } catch (error: any) {
            console.error('Error fetching page sections:', error)
            
            // Show error notification
            const errorMessage = error?.data?.message || error?.message || 'Failed to fetch page sections data'
            toast.push(
                <Notification type="danger" duration={3000} title="API Call Failed">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        }
        
        // Also handle the original navigation logic
        // Check if the page has children
        if (currentTabChildrenData && currentTabChildrenData.children) {
            const pageItem = currentTabChildrenData.children.find((child: any) => child.id === id)
            if (pageItem && pageItem.children && pageItem.children.length > 0) {
                // If page has children, navigate to children menu
                if (onNavigateToChildren) {
                    onNavigateToChildren(id)
                }
            } else {
                // If no children, navigate to grandchild page for editing
                if (onNavigateToGrandchild) {
                    onNavigateToGrandchild(id)
                }
            }
        } else {
            // Fallback to grandchild navigation
            if (onNavigateToGrandchild) {
                onNavigateToGrandchild(id)
            }
        }
    }

    const handleViewPage = (id: number) => {
        // Handle viewing page
        console.log('View page:', id)
    }

    const handlePageClick = (page: { id: number, title: string }) => {
        if (currentTabChildrenData && currentTabChildrenData.children) {
            const pageItem = currentTabChildrenData.children.find((child: any) => child.id === page.id)
            if (pageItem) {
                // Navigate to the page's children if it has any
                if (pageItem.children && pageItem.children.length > 0) {
                    console.log(`Loading children for page: ${page.title}`, pageItem)
                    // Navigate to the children menu
                    if (onNavigateToChildren) {
                        onNavigateToChildren(pageItem.id)
                    }
                } else {
                    // Navigate to the grandchild page if no children
                    if (onNavigateToGrandchild) {
                        onNavigateToGrandchild(pageItem.id)
                    }
                }
            }
        }
    }

    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedItem(id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, targetId: number) => {
        e.preventDefault()
        if (!draggedItem || draggedItem === targetId) return

        const newPages = [...pages]
        const draggedIndex = newPages.findIndex(page => page.id === draggedItem)
        const targetIndex = newPages.findIndex(page => page.id === targetId)

        // Remove dragged item and insert at target position
        const [draggedPage] = newPages.splice(draggedIndex, 1)
        newPages.splice(targetIndex, 0, draggedPage)

        setPages(newPages)
        setDraggedItem(null)
    }

    const handleDragEnd = () => {
        setDraggedItem(null)
    }

    const handleAddCourse = () => {
        const newCourse = prompt('Enter new course name:')
        if (newCourse) {
            setCourses([...courses, newCourse])
        }
    }

    const handleDeleteCourse = (index: number) => {
        setCourses(courses.filter((_: string, i: number) => i !== index))
    }

    const handleAddExpert = () => {
        const newExpert = prompt('Enter new expert name:')
        if (newExpert) {
            setExperts([...experts, newExpert])
        }
    }

    const handleDeleteExpert = (index: number) => {
        setExperts(experts.filter((_: string, i: number) => i !== index))
    }


    // Save handlers for each section
    const handleSaveHeroSection = async () => {
        if (!pageId) {
            toast.push(
                <Notification type="danger" duration={2500} title="Error">
                    Page ID is required to save hero section
                </Notification>,
                { placement: 'top-end' }
            )
            return
        }

        setIsHeroSaving(true)
        try {
            // Get current page data to find hero section
            const currentPageData = pageData?.[pageId]?.data
            if (!currentPageData || !Array.isArray(currentPageData)) {
                throw new Error('No page data available')
            }

            const heroSectionData = currentPageData.find((section: any) => section.title === 'Hero')
            if (!heroSectionData) {
                throw new Error('Hero section not found')
            }

            const contentBlocks: any[] = []
            const changedObjects: string[] = []

            // Update text block if header text changed
            const heroTextBlock = heroSectionData.content_blocks?.find((block: any) => 
                block.block_type === 'text' && block.title
            )
            if (heroTextBlock && heroSection.headerText !== heroTextBlock.title) {
                contentBlocks.push({
                    id: heroTextBlock.id,
                    block_type: heroTextBlock.block_type,
                    title: heroSection.headerText
                })
                changedObjects.push('Hero Header Text')
            }

            // Update hero image if changed
            const heroImageBlock = heroSectionData.content_blocks?.find((block: any) => 
                block.block_type === 'image' && block.media_files && block.media_files.length > 0
            )
            if (heroImageBlock && heroSection.heroImageMediaFileId) {
                contentBlocks.push({
                    id: heroImageBlock.id,
                    block_type: heroImageBlock.block_type,
                    media_files: [{
                        id: heroImageBlock.media_files[0].id,
                        content_block_id: heroImageBlock.id,
                        media_file_id: heroSection.heroImageMediaFileId,
                        media_type: "primary",
                        display_order: 1
                    }]
                })
                changedObjects.push('Hero Image')
            }

            // Update hero background image if changed
            const heroBgImageBlock = heroSectionData.content_blocks?.find((block: any) => 
                block.block_type === 'custom' && block.media_files && block.media_files.length > 0
            )
            if (heroBgImageBlock && heroSection.heroBgImageMediaFileId) {
                contentBlocks.push({
                    id: heroBgImageBlock.id,
                    block_type: heroBgImageBlock.block_type,
                    media_files: [{
                        id: heroBgImageBlock.media_files[0].id,
                        content_block_id: heroBgImageBlock.id,
                        media_file_id: heroSection.heroBgImageMediaFileId,
                        media_type: "primary",
                        display_order: 1
                    }]
                })
                changedObjects.push('Hero Background Image')
            }

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
                id: heroSectionData.id,
                name: heroSectionData.name,
                title: heroSectionData.title,
                content_blocks: contentBlocks
            }

            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)

            // Make the actual API call
            const result = await updatePageSection({ 
                pageId: pageId.toString(), 
                sectionId: heroSectionData.id, 
                updateData 
            }).unwrap()

            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Hero section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update hero section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update hero section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setIsHeroSaving(false)
        }
    }

    const handleSaveAudioSection = () => {
        console.log('Saving audio section:', audioSection)
        alert('Audio section saved successfully!')
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsOverviewImageUploading(true)
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
        } finally {
            setIsOverviewImageUploading(false)
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
        if (!pageId) {
            toast.push(
                <Notification type="danger" duration={2500} title="Error">
                    Page ID is required to save overview section
                </Notification>,
                { placement: 'top-end' }
            )
            return
        }

        setIsOverviewSaving(true)
        try {
            // Get current page data to find overview section
            const currentPageData = pageData?.[pageId]?.data
            if (!currentPageData || !Array.isArray(currentPageData)) {
                throw new Error('No page data available')
            }

            const overviewSectionData = currentPageData.find((section: any) => section.name === 'overview')
            if (!overviewSectionData) {
                throw new Error('Overview section not found')
            }

            const contentBlocks: any[] = []
            const changedObjects: string[] = []

            // Update title block if header text changed
            const overviewTitleBlock = overviewSectionData.content_blocks?.find((block: any) => 
                block.block_type === 'text' && block.title
            )
            if (overviewTitleBlock && overviewSection.headerText !== overviewTitleBlock.title) {
                contentBlocks.push({
                    id: overviewTitleBlock.id,
                    block_type: overviewTitleBlock.block_type,
                    title: overviewSection.headerText
                })
                changedObjects.push('Overview Header Text')
            }

            // Update content block if overview text changed
            const overviewContentBlock = overviewSectionData.content_blocks?.find((block: any) => block.content)
            if (overviewContentBlock && overviewSection.overview !== overviewContentBlock.content) {
                contentBlocks.push({
                    id: overviewContentBlock.id,
                    block_type: overviewContentBlock.block_type,
                    content: overviewSection.overview
                })
                changedObjects.push('Overview Content')
            }

            // Update image block if image changed
            const overviewImageBlock = overviewSectionData.content_blocks?.find((block: any) => 
                block.block_type === 'image' && block.media_files && block.media_files.length > 0
            )
            if (overviewImageBlock && overviewSection.imageMediaFileId) {
                contentBlocks.push({
                    id: overviewImageBlock.id,
                    block_type: overviewImageBlock.block_type,
                    media_files: [{
                        id: overviewImageBlock.media_files[0].id,
                        content_block_id: overviewImageBlock.id,
                        media_file_id: overviewSection.imageMediaFileId,
                        media_type: "primary",
                        display_order: 1
                    }]
                })
                changedObjects.push('Overview Image')
            }

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
                id: overviewSectionData.id,
                name: overviewSectionData.name,
                title: overviewSectionData.title,
                content_blocks: contentBlocks
            }

            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)

            // Make the actual API call
            const result = await updatePageSection({ 
                pageId: pageId.toString(), 
                sectionId: overviewSectionData.id, 
                updateData 
            }).unwrap()

            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Overview section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update overview section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update overview section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setIsOverviewSaving(false)
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
        const newCourseId = Math.max(...coursesSection.courses.map(course => course.id), 0) + 1
        const newCourse = {
            id: newCourseId,
            text: `New Course ${newCourseId}`,
            link: ''
        }
        setCoursesSection({
            ...coursesSection,
            courses: [...coursesSection.courses, newCourse]
        })
    }

    const handleSaveCoursesSection = async () => {
        if (!pageId) {
            toast.push(
                <Notification type="danger" duration={2500} title="Error">
                    Page ID is required to save courses section
                </Notification>,
                { placement: 'top-end' }
            )
            return
        }

        try {
            // Get current page data to find specialities section
            const currentPageData = pageData?.[pageId]?.data
            if (!currentPageData || !Array.isArray(currentPageData)) {
                throw new Error('No page data available')
            }

            const specialitiesSectionData = currentPageData.find((section: any) => section.name === 'our specialities')
            if (!specialitiesSectionData) {
                throw new Error('Our Specialities section not found')
            }

            const contentBlocks: any[] = []
            const changedObjects: string[] = []

            // Update title block if header text changed
            const specialitiesTitleBlock = specialitiesSectionData.content_blocks?.find((block: any) => 
                block.block_type === 'text' && block.title
            )
            if (specialitiesTitleBlock && coursesSection.headerText !== specialitiesTitleBlock.title) {
                contentBlocks.push({
                    id: specialitiesTitleBlock.id,
                    block_type: specialitiesTitleBlock.block_type,
                    title: coursesSection.headerText
                })
                changedObjects.push('Our Specialities Header Text')
            }

            // Update specialities data block if courses changed
            const specialitiesDataBlock = specialitiesSectionData.content_blocks?.find((block: any) => 
                block.specialties && block.specialties.length > 0
            )
            
            if (specialitiesDataBlock) {
                // Convert courses to specialties format
                const specialties = coursesSection.courses.map(course => ({
                    id: course.id,
                    name: course.text,
                    link: course.link
                }))

                contentBlocks.push({
                    id: specialitiesDataBlock.id,
                    block_type: specialitiesDataBlock.block_type,
                    specialties: specialties
                })
                changedObjects.push('Our Specialities')
            }

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
                id: specialitiesSectionData.id,
                name: specialitiesSectionData.name,
                title: specialitiesSectionData.title,
                content_blocks: contentBlocks
            }

            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)

            // Make the actual API call
            const result = await updatePageSection({ 
                pageId: pageId.toString(), 
                sectionId: specialitiesSectionData.id, 
                updateData 
            }).unwrap()

            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Our Specialities section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update our specialities section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update our specialities section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
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
        const newServiceId = Math.max(...servicesFacilitiesSection.services.map(service => service.id), 0) + 1
        const newService = {
            id: newServiceId,
            text: `New Service ${newServiceId}`
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
        if (!pageId) {
            toast.push(
                <Notification type="danger" duration={2500} title="Error">
                    Page ID is required to save services & facilities section
                </Notification>,
                { placement: 'top-end' }
            )
            return
        }

        try {
            // Get current page data to find services section
            const currentPageData = pageData?.[pageId]?.data
            if (!currentPageData || !Array.isArray(currentPageData)) {
                throw new Error('No page data available')
            }

            const servicesSectionData = currentPageData.find((section: any) => section.name === 'service & facilities')
            if (!servicesSectionData) {
                throw new Error('Services & Facilities section not found')
            }

            const contentBlocks: any[] = []
            const changedObjects: string[] = []

            // Update title block if header text changed
            const servicesTitleBlock = servicesSectionData.content_blocks?.find((block: any) => 
                block.block_type === 'text' && block.title
            )
            if (servicesTitleBlock && servicesFacilitiesSection.headerText !== servicesTitleBlock.title) {
                contentBlocks.push({
                    id: servicesTitleBlock.id,
                    block_type: servicesTitleBlock.block_type,
                    title: servicesFacilitiesSection.headerText
                })
                changedObjects.push('Services & Facilities Header Text')
            }

            // Update services data block if services changed
            const servicesDataBlock = servicesSectionData.content_blocks?.find((block: any) => 
                block.facilitySpecialties && block.facilitySpecialties.length > 0
            )
            
            if (servicesDataBlock) {
                // Convert services to facility specialties format
                const facilitySpecialties = servicesFacilitiesSection.services.map(service => ({
                    id: service.id,
                    facility: {
                        name: service.text
                    }
                }))

                contentBlocks.push({
                    id: servicesDataBlock.id,
                    block_type: servicesDataBlock.block_type,
                    facilitySpecialties: facilitySpecialties
                })
                changedObjects.push('Services & Facilities')
            }

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
                id: servicesSectionData.id,
                name: servicesSectionData.name,
                title: servicesSectionData.title,
                content_blocks: contentBlocks
            }

            console.log('Final payload being sent:', updateData)
            console.log('Only these objects are being updated:', changedObjects)

            // Make the actual API call
            const result = await updatePageSection({ 
                pageId: pageId.toString(), 
                sectionId: servicesSectionData.id, 
                updateData 
            }).unwrap()

            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        Services & Facilities section updated successfully
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message || 'Failed to update services & facilities section')
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update services & facilities section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
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

    const handleSaveWhyChooseUsSection = () => {
        console.log('Saving why choose us section:', whyChooseUsSection)
        alert('Why Choose Us section saved successfully!')
    }

    return (
        <div className="mb-8">
            {/* <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{activeTab}</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <HiPlus className="w-4 h-4" />
                    Add New Page
                </button>
            </div> */}

            {/* Pages List - Only show if there are pages */}
            {pages.length > 0 && (
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal">Inner Pages</h2>
                        <Button
                            onClick={handleAddPage}
                            className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white text-center font-inter text-[14px] font-medium leading-normal !px-4 !py-1"
                        >
                            Add New Page
                        </Button>
                    </div>

                    {pages.length > 0 ? (
                        <div className="space-y-3">
                            {pages.map((page) => (
                                <div
                                    key={page.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, page.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, page.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 ${draggedItem === page.id ? 'opacity-50 scale-95' : ''
                                        }`}
                                    onClick={() => handlePageClick(page)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="cursor-move text-gray-400 hover:text-gray-600">
                                            <img src="/img/images/grip-dots.svg" alt="grip-dots" className="w-5 h-5" />
                                        </div>
                                        <span className="text-[#495057] font-inter text-[16px] font-semibold leading-normal">{page.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleEditPage(page.id)
                                            }}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <img src="/img/images/Edittable.svg" alt="edit" className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleViewPage(page.id)
                                            }}
                                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                        >
                                            <img src="/img/images/viewtable.svg" alt="view" className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDeletePage(page.id)
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <img src="/img/images/deatetable.svg" alt="delete" className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-4">No pages available for this tab</div>
                            <Button
                                onClick={handleAddPage}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg transition-all"
                            >
                                <HiPlus className="w-4 h-4 mr-2" />
                                Add New Page
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* API Response Log Section */}
            {showApiLog && apiResponseData && (
                <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal">API Response Log</h2>
                        <button
                            onClick={() => setShowApiLog(false)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                            <HiXMark className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(apiResponseData, null, 2)}
                        </pre>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                        <p><strong>API Endpoint:</strong> /home/sections/{apiResponseData?.data?.id || 'N/A'}</p>
                        <p><strong>Status:</strong> {apiResponseData?.status || 'N/A'}</p>
                        <p><strong>Message:</strong> {apiResponseData?.message || 'N/A'}</p>
                        <p><strong>Page ID Used:</strong> {apiResponseData?.data?.id || 'N/A'}</p>
                    </div>
                </div>
            )}

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
                        loading={isHeroSaving}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isHeroSaving ? 'Saving...' : 'Save'}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px]   bg-white"
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
                            disabled={isOverviewImageUploading}
                        />
                        <label
                            htmlFor="overview-image-upload"
                            className={`px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors cursor-pointer ${isOverviewImageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isOverviewImageUploading ? 'Uploading...' : 'Upload File'}
                        </label>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button
                        onClick={handleSaveOverviewSection}
                        loading={isOverviewSaving}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isOverviewSaving ? 'Saving...' : 'Save'}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px]   bg-white"
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
                            <div key={course.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4  rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Button Text</label>
                                    <input
                                        type="text"
                                        value={course.text}
                                        onChange={(e) => handleCourseTextChange(course.id, e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px]   bg-white"
                                        placeholder="Enter button text..."
                                    />
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Button Link</label>
                                    <input
                                        type="url"
                                        value={course.link}
                                        onChange={(e) => handleCourseLinkChange(course.id, e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px]   bg-white"
                                        placeholder="Enter button link..."
                                    />
                                </div> */}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={handleSaveCoursesSection}
                        loading={isUpdating}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Services & Facilities Section */}
            <div className="mb-6 p-6 !bg-white border border-gray-200 rounded-lg shadow-sm">
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
                        loading={isUpdating}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
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
                                    {/* Header and Sub Header */}
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

                                    {/* Why Choose Us Rows */}
                                    <div className="">
                                        {values.rows.map((row, index) => (
                                            <div key={row.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                {/* Header of Row */}
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

                                                {/* Sub Header of Row */}
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

                                                {/* Row Icon */}
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

                                    {/* Save Button */}
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            loading={isSubmitting}
                                            className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
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

export default SpecialityContentSections

