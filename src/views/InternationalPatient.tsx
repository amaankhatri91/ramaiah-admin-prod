import React, { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setOverviewSection as setOverviewSectionRedux, updateOverviewSection as updateOverviewSectionRedux, OverviewSectionState } from '@/store/slices/base/commonSlice'
import { Card, Button, Input } from '@/components/ui'
import { HiXMark } from 'react-icons/hi2'
import { apiGetPageSections, PageSectionsResponse, PageSectionsData } from '@/services/HomeService'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { useUpdatePageSectionMutation } from '@/store/slices/pageSections/pageSectionsApiSlice'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { RichTextEditor } from '@/components/shared'

const InternationalPatient = () => {
    const dispatch = useAppDispatch()
    const overviewSectionFromRedux = useAppSelector((state) => state.base.common.overviewSection)

    // State for API response data
    const [apiResponseData, setApiResponseData] = useState<any>(null)
    const [showApiLog, setShowApiLog] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [pageData, setPageData] = useState<any>(null)

    // API hooks
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
    const [updatePageSection, { isLoading: isUpdating }] = useUpdatePageSectionMutation()

    // Separate loading states for each section
    const [isHeroSaving, setIsHeroSaving] = useState(false)
    const [isOverviewSaving, setIsOverviewSaving] = useState(false)

    // Separate loading states for each upload button
    const [isHeroImageUploading, setIsHeroImageUploading] = useState(false)
    const [isHeroBgImageUploading, setIsHeroBgImageUploading] = useState(false)
    const [isOverviewImageUploading, setIsOverviewImageUploading] = useState(false)
    const [isWhyChooseUploadingIndex, setIsWhyChooseUploadingIndex] = useState<number | null>(null)

    // Form states for different sections
    const [heroSection, setHeroSection] = useState({
        headerText: '',
        descriptionText: '',
        buttonText: 'Book Appointment',
        buttonLink: 'https://www.ramaiah.com/international-patient-care',
        heroImage: null as File | null,
        heroImageFileName: '',
        heroImageMediaFileId: undefined as number | undefined,
        heroBgImage: null as File | null,
        heroBgImageFileName: '',
        heroBgImageMediaFileId: undefined as number | undefined
    })
    console.log("heroSectionnnnnnnnnnnnnnnnnnnnnnn", heroSection);

    const [overviewSection, setOverviewSection] = useState({
        headerText: '',
        overview: '',
        image: null as File | null,
        imageFileName: '',
        imageMediaFileId: undefined as number | undefined
    })
    console.log("overviewSectionnnnnnnnnnnnnnnnnnnnnnn", overviewSection);

    const [coursesSection, setCoursesSection] = useState({
        headerText: 'Our Services',
        courses: [] as Array<{ id: number, text: string, link: string }>
    })

    const [servicesFacilitiesSection, setServicesFacilitiesSection] = useState({
        headerText: 'Services & Facilities',
        services: [] as Array<{ id: number, text: string }>
    })

    const [whyChooseUsSection, setWhyChooseUsSection] = useState({
        headerText: '',
        items: [
            { id: 1, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 2, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 3, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 4, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined }
        ]
    })

    const [exclusiveServicesSection, setExclusiveServicesSection] = useState({
        headerText: '',
        leftColumn: [
            '',
            '',
            '',
            '',
            '',
            ''
        ],
        rightColumn: [
            '',
            '',
            '',
            '',
            '',
            ''
        ]
    })
    console.log(exclusiveServicesSection.leftColumn, "exclusiveServicesSectionexclusiveServicesSectionexclusiveServicesSection");


    const [preDepartureSection, setPreDepartureSection] = useState({
        headerText: '',
        services: [
            { id: 1, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 2, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 3, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 4, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 5, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined }
        ]
    })

    const [travelAccommodationSection, setTravelAccommodationSection] = useState({
        headerText: '',
        services: [
            { id: 1, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 2, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 3, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 4, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 5, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 6, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined },
            { id: 7, title: '', image: null as File | null, imageFileName: '', imageMediaFileId: undefined as number | undefined }
        ]
    })

    const [contactDetailsSection, setContactDetailsSection] = useState({
        headerText: '',
        contactPersons: [
            {
                id: 1,
                name: 'Mr. Anoop Kumar',
                title: 'Deputy General Manager',
                phone: '+91-XXXXXXXXXX',
                email: 'anoop.kumar@ramaiah.com',
                image: null as File | null,
                imageFileName: '',
                imageMediaFileId: undefined as number | undefined
            },
            {
                id: 2,
                name: 'Mr. Zail',
                title: 'Head - International Marketing',
                phone: '+91-XXXXXXXXXX',
                email: 'zail@ramaiah.com',
                image: null as File | null,
                imageFileName: '',
                imageMediaFileId: undefined as number | undefined
            }
        ],
        enquiryForm: {
            fullName: '',
            email: '',
            country: '',
            phone: '',
            gender: '',
            product: '',
            message: ''
        }
    })

    const [statisticsSection, setStatisticsSection] = useState({
        headerText: '',
        subHeader: '',
        boxes: [
            { id: 1, header: '', subHeader: '', icon: null as File | null, iconFileName: '', iconMediaFileId: undefined as number | undefined },
            { id: 2, header: '', subHeader: '', icon: null as File | null, iconFileName: '', iconMediaFileId: undefined as number | undefined },
            { id: 3, header: '', subHeader: '', icon: null as File | null, iconFileName: '', iconMediaFileId: undefined as number | undefined },
            { id: 4, header: '', subHeader: '', icon: null as File | null, iconFileName: '', iconMediaFileId: undefined as number | undefined },
            { id: 5, header: '', subHeader: '', icon: null as File | null, iconFileName: '', iconMediaFileId: undefined as number | undefined },
            { id: 6, header: '', subHeader: '', icon: null as File | null, iconFileName: '', iconMediaFileId: undefined as number | undefined },
            { id: 7, header: '', subHeader: '', icon: null as File | null, iconFileName: '', iconMediaFileId: undefined as number | undefined },
            { id: 8, header: '', subHeader: '', icon: null as File | null, iconFileName: '', iconMediaFileId: undefined as number | undefined }
        ]
    })

    // Function to make API call with page_id 4
    const handleApiCall = async () => {
        setLoading(true)
        try {
            console.log('Calling API /home/sections/4 for International Patient Care')
            const response = await apiGetPageSections('4')

            // Store the response data
            setApiResponseData(response)
            setShowApiLog(true)

            // Log the response data
            console.log('=== API RESPONSE DATA FOR INTERNATIONAL PATIENT CARE ===')
            console.log('Page ID used: 4')
            console.log('Full Response:', response)
            console.log('Response Data:', response.data)
            console.log('====================================================')

            // Show success notification
            toast.push(
                <Notification type="success" duration={3000} title="API Call Successful">
                    Successfully fetched page sections data for International Patient Care (Page ID: 4)
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
        } finally {
            setLoading(false)
        }
    }

    // useEffect to automatically fetch section-wise data on page load
    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true)
            try {
                console.log('Auto-fetching page sections data for International Patient Care (Page ID: 4)')
                const response = await apiGetPageSections('4')

                if (response.data) {
                    setPageData(response.data)
                    console.log('Page sections data loaded:', response.data)

                    // Parse and set section data
                    // parseAndSetSectionData(response.data)
                    const sectionsPayload = response?.data
                    const sectionsData = Array.isArray(sectionsPayload)
                        ? sectionsPayload
                        : (Array.isArray(sectionsPayload?.data) ? sectionsPayload.data : [])
                    if (!Array.isArray(sectionsData)) {
                        console.warn('Sections data is not an array:', sectionsPayload)
                        return
                    }
                    const heroSectionData = sectionsData.find((section: any) => section.title === 'Hero')

                    if (heroSectionData && heroSectionData.content_blocks) {
                        const heroTextBlock = heroSectionData.content_blocks.find((block: any) =>
                            block.block_type === 'text' && block.title
                        )
                        const heroImageBlock = heroSectionData.content_blocks.find((block: any) =>
                            block.block_type === 'image' && block.media_files && block.media_files.length > 0
                        )
                        const heroBgImageBlock = heroSectionData.content_blocks.find((block: any) =>
                            block.block_type === 'custom' && block.media_files && block.media_files.length > 0
                        )

                        if (heroTextBlock) {
                            setHeroSection(prev => ({
                                ...prev,
                                headerText: heroTextBlock.title,
                                descriptionText: 'Comprehensive international patient care services',
                                heroImageFileName: heroImageBlock?.media_files?.[0]?.media_file?.original_filename || '',
                                heroBgImageFileName: heroBgImageBlock?.media_files?.[0]?.media_file?.original_filename || ''
                            }))
                        }
                    }

                    const overviewSectionData = sectionsData.find((section: any) => section.section_type === 'overview')
                    if (overviewSectionData && overviewSectionData.content_blocks) {
                        const overviewContentTitle = overviewSectionData.content_blocks.find((block: any) => block.title)
                        const overviewContentBlock = overviewSectionData.content_blocks.find((block: any) => block.content)
                        const overviewImageBlock = overviewSectionData.content_blocks.find((block: any) =>
                            block.block_type === 'image' && block.media_files && block.media_files.length > 0
                        )
                        console.log("overviewImageBlock", overviewImageBlock);

                        if (overviewContentBlock || overviewContentTitle || overviewImageBlock) {
                            const newOverview: OverviewSectionState = {
                                headerText: overviewContentTitle?.title || '',
                                overview: overviewContentBlock?.content || '',
                                image: null,
                                imageFileName: overviewImageBlock?.media_files?.[0]?.media_file?.original_filename || '',
                                imageMediaFileId: overviewImageBlock?.media_files?.[0]?.media_file?.id
                            }
                            // Local state (to keep current form working)
                            setOverviewSection(prev => ({
                                ...prev,
                                ...newOverview
                            }))
                            // Redux state (shared across pages)
                            dispatch(setOverviewSectionRedux(newOverview))
                        }
                    }

                    const whyChooseUsSectionData = sectionsData.find((section: any) => section.name === 'Why Choose RMH')
                    console.log("whyChooseUsSectionDatas", whyChooseUsSectionData);
                    if (whyChooseUsSectionData && whyChooseUsSectionData.content_blocks) {
                        const whyChooseUsDataBlock = whyChooseUsSectionData.content_blocks.find((block: any) =>
                            block.items && block.items.length > 0
                        )

                        console.log("whyChooseUsDataBlocksssss", whyChooseUsDataBlock);
                        if (whyChooseUsSectionData.content_blocks) {
                            const items = whyChooseUsSectionData.content_blocks.map((item: any, index: number) => ({
                                id: item.id || index + 1,
                                title: item.title || '',
                                imageFileName: item?.media_files?.[0]?.media_file?.original_filename || ''
                            }))

                            console.log("items", items);

                            setWhyChooseUsSection(prev => ({
                                ...prev,
                                headerText: whyChooseUsSectionData.title || '',
                                items: items
                            }))
                        }
                    }

                    const exclusiveServicesSectionData = sectionsData.find((section: any) => section.name === 'Exclusive Services For Our International Patients')
                    if (exclusiveServicesSectionData && exclusiveServicesSectionData.content_blocks) {
                        const exclusiveServicesDataBlock = exclusiveServicesSectionData.content_blocks.find((block: any) =>
                            block.leftColumn && block.rightColumn
                        )
                        console.log(exclusiveServicesSectionData, "exclusiveServicesSectionData");



                        if (exclusiveServicesDataBlock || exclusiveServicesSectionData || exclusiveServicesSectionData.content_blocks) {
                            const leftColumn = exclusiveServicesSectionData.content_blocks.map((item: any, index: number) => ({
                                id: item.id || index + 1,
                                title: item.title || '',
                                // imageFileName: item?.media_files?.[0]?.media_file?.original_filename || ''
                            }))
                            console.log(exclusiveServicesSectionData.content_blocks, "leftColumn");

                            setExclusiveServicesSection(prev => ({
                                ...prev,
                                headerText: exclusiveServicesSectionData.title || '',
                                leftColumn: leftColumn,
                                // rightColumn: exclusiveServicesDataBlock.rightColumn || []
                            }))
                        }
                    }

                    const preDepartureSectionData = sectionsData.find((section: any) => section.name === 'Pre-Departure Services')
                    if (preDepartureSectionData && preDepartureSectionData.content_blocks) {
                        // Find the header/title from the first text block or fall back to section title
                        const headerBlock = preDepartureSectionData.content_blocks.find(
                            (block: any) => block.block_type === 'text'
                        )
                        // All image blocks represent service items
                        const serviceBlocks = preDepartureSectionData.content_blocks.filter(
                            (block: any) => block.block_type === 'image'
                        )
                        const services = serviceBlocks.map((block: any, index: number) => ({
                            id: block.id || index + 1,
                            title: block.title || '',
                            image: null as File | null,
                            imageFileName: block.media_files?.[0]?.media_file?.original_filename || '',
                            imageMediaFileId: block.media_files?.[0]?.media_file?.id
                        }))
                        setPreDepartureSection({
                            headerText: headerBlock?.title || preDepartureSectionData.title || '',
                            services
                        })
                    }
                    const travelAccommodationSectionData = sectionsData.find(
                        (section: any) => section.name === "Travel & Accommodation"
                      );
                      
                      if (travelAccommodationSectionData && travelAccommodationSectionData.content_blocks?.length > 0) {
                        const services = travelAccommodationSectionData.content_blocks.map(
                          (block: any, index: number) => ({
                            id: block.id || index + 1,
                            title: block.title || "",
                            image: null as File | null,
                            imageFileName:
                              block?.media_files?.[0]?.media_file?.original_filename || "",
                            imageMediaFileId: block?.media_files?.[0]?.media_file?.id as
                              | number
                              | undefined,
                          })
                        );
                      
                        setTravelAccommodationSection((prev) => ({
                          ...prev,
                          headerText: travelAccommodationSectionData.title || "",
                          services: services,
                        }));
                      }
                      

                      const contactDetailsSectionData = sectionsData.find(
                        (section: any) => section.name === "Contact Details"
                      );
                      
                      if (contactDetailsSectionData && contactDetailsSectionData.content_blocks?.length > 0) {
                        const contactPersons = contactDetailsSectionData.content_blocks.map(
                          (block: any, index: number) => {
                            // Extract phone & email from statistics array
                            let phone = "";
                            let email = "";
                      
                            if (Array.isArray(block.statistics) && block.statistics.length > 0) {
                              block.statistics.forEach((stat: any) => {
                                if (stat.statistic_text?.includes("@")) {
                                  email = stat.statistic_text;
                                } else if (stat.statistic_text?.match(/^[+0-9\s-]+$/)) {
                                  phone = stat.statistic_text;
                                }
                              });
                            }
                      
                            return {
                              id: block.id || index + 1,
                              name: block.title || "",
                              title: block.content || "",
                              phone,
                              email,
                              image: null as File | null,
                              imageFileName:
                                block?.media_files?.[0]?.media_file?.original_filename || "",
                              imageMediaFileId: block?.media_files?.[0]?.media_file?.id as
                                | number
                                | undefined,
                            };
                          }
                        );
                      
                        setContactDetailsSection((prev) => ({
                          ...prev,
                          headerText: contactDetailsSectionData.title || "Contact Details",
                          contactPersons,
                        }));
                      }
                      
                      

                      const ramaiahStatsSection = sectionsData.find(
                        (section: any) => section.name === "Ramaiah Memorial Hospital, Bengaluru"
                      );
                      
                      if (ramaiahStatsSection && ramaiahStatsSection.content_blocks?.length > 0) {
                        const block = ramaiahStatsSection.content_blocks[0];
                      
                        // Set Header Text and Sub Header Text
                        const headerText = block.title || ramaiahStatsSection.title || '';
                        const subHeaderText = block.content || ramaiahStatsSection.subtitle || '';
                      
                        // Map statistics into boxes
                        const boxes = block.statistics?.slice(0, 8).map((stat: any, index: number) => ({
                          id: stat.id || index + 1,
                          header: stat.number || stat.statistic_text || '',        // main number
                          subHeader: stat.label || '',      // label
                          suffix: stat.suffix || '',        // optional
                          icon: null as File | null,
                          iconFileName: stat.statistics_image?.split('/').pop() || '',
                          iconMediaUrl: stat.statistics_image || '',
                        }));
                      
                        // Set everything into state
                        setStatisticsSection((prev: any) => ({
                          ...prev,
                          headerText,
                          subHeader: subHeaderText,
                          boxes: boxes || [],
                        }));
                      }
                      

                }
            } catch (error: any) {
                console.error('Error fetching page sections:', error)
                const errorMessage = error?.data?.message || error?.message || 'Failed to fetch page sections data'
                toast.push(
                    <Notification type="danger" duration={3000} title="Data Load Failed">
                        {errorMessage}
                    </Notification>,
                    { placement: 'top-end' }
                )
            } finally {
                setLoading(false)
            }
        }

        fetchPageData()
    }, [])

    // Function to parse and set section data
    const parseAndSetSectionData = (sectionsData: any) => {
        try {
            if (!sectionsData || !Array.isArray(sectionsData)) {
                console.log('No valid sections data found')
                return
            }
            console.log("sectionsData", sectionsData);
            console.log('📝 Section Names:', sectionsData.map((section: any) => section.name))
            sectionsData.forEach((section: any, index: number) => {
                console.log(`   Section ${index + 1}: ${section.name} (ID: ${section.id})`)
            })

        
            // Parse Statistics Section
            const ramaiahStatsSection = sectionsData.find(
                (section: any) => section.name === "Ramaiah Memorial Hospital, Bengaluru"
              );
              
              if (ramaiahStatsSection && ramaiahStatsSection.content_blocks?.length > 0) {
                const block = ramaiahStatsSection.content_blocks[0];
              
                // Map statistics array into boxes (like hospital stats)
                const boxes = block.statistics?.slice(0, 8).map((stat: any, index: number) => ({
                  id: stat.id || index + 1,
                  header: stat.number || '', // main number value
                  subHeader: stat.label || '', // label text e.g. "Beds"
                  suffix: stat.suffix || '', // e.g. "+"
                  icon: null as File | null,
                  iconFileName:
                    stat.statistics_image?.split('/').pop() || '', // extract image name
                  iconMediaUrl: stat.statistics_image || '', // full image URL
                }));
              
                // Set state for the section
                setStatisticsSection((prev: any) => ({
                  ...prev,
                  headerText: ramaiahStatsSection.title || 'Ramaiah Memorial Hospital, Bengaluru',
                  subHeader: ramaiahStatsSection.subtitle || '',
                  boxes: boxes || [],
                }));
              }
              

        } catch (error) {
            console.error('Error parsing section data:', error)
        }
    }

    // Handler functions for different sections
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

                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setHeroSection({
                        ...heroSection,
                        heroImage: file,
                        heroImageFileName: responseData.savedMedia.original_filename,
                        heroImageMediaFileId: responseData.savedMedia.id
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

                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setHeroSection({
                        ...heroSection,
                        heroBgImage: file,
                        heroBgImageFileName: responseData.savedMedia.original_filename,
                        heroBgImageMediaFileId: responseData.savedMedia.id
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

    const handleOverviewImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    setOverviewSection({
                        ...overviewSection,
                        image: file,
                        imageFileName: responseData.savedMedia.original_filename,
                        imageMediaFileId: responseData.savedMedia.id
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

    const handleWhyChooseImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        itemIndex: number
    ) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsWhyChooseUploadingIndex(itemIndex)
        try {
            const result = await uploadFile({ file }).unwrap()

            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )

                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    const updatedItems = whyChooseUsSection.items.map((itm, idx) =>
                        idx === itemIndex
                            ? {
                                ...itm,
                                image: file,
                                imageFileName: responseData.savedMedia.original_filename,
                                imageMediaFileId: responseData.savedMedia.id,
                            }
                            : itm
                    )
                    setWhyChooseUsSection({ ...whyChooseUsSection, items: updatedItems })
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
            setIsWhyChooseUploadingIndex(null)
        }
    }

    const [isPreDepartureUploadingIndex, setIsPreDepartureUploadingIndex] = useState<number | null>(null)

    const handlePreDepartureImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        itemIndex: number
    ) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsPreDepartureUploadingIndex(itemIndex)
        try {
            const result = await uploadFile({ file }).unwrap()

            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )

                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    const updated = preDepartureSection.services.map((itm, idx) =>
                        idx === itemIndex
                            ? {
                                ...itm,
                                image: file,
                                imageFileName: responseData.savedMedia.original_filename,
                                imageMediaFileId: responseData.savedMedia.id,
                            }
                            : itm
                    )
                    setPreDepartureSection({ ...preDepartureSection, services: updated })
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
            setIsPreDepartureUploadingIndex(null)
        }
    }

    const [isTravelAccUploadingIndex, setIsTravelAccUploadingIndex] = useState<number | null>(null)

    const handleTravelAccommodationImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        itemIndex: number
    ) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsTravelAccUploadingIndex(itemIndex)
        try {
            const result = await uploadFile({ file }).unwrap()

            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )

                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    const updated = travelAccommodationSection.services.map((itm, idx) =>
                        idx === itemIndex
                            ? {
                                ...itm,
                                image: file,
                                imageFileName: responseData.savedMedia.original_filename,
                                imageMediaFileId: responseData.savedMedia.id,
                            }
                            : itm
                    )
                    setTravelAccommodationSection({ ...travelAccommodationSection, services: updated })
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
            setIsTravelAccUploadingIndex(null)
        }
    }

    const [isStatsUploadingIndex, setIsStatsUploadingIndex] = useState<number | null>(null)

    const handleStatsIconUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        boxIndex: number
    ) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsStatsUploadingIndex(boxIndex)
        try {
            const result = await uploadFile({ file }).unwrap()

            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )

                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    const updated = statisticsSection.boxes.map((b, idx) =>
                        idx === boxIndex
                            ? {
                                ...b,
                                icon: file,
                                iconFileName: responseData.savedMedia.original_filename,
                                iconMediaFileId: responseData.savedMedia.id,
                            }
                            : b
                    )
                    setStatisticsSection({ ...statisticsSection, boxes: updated })
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
            setIsStatsUploadingIndex(null)
        }
    }

    const [isContactUploadingIndex, setIsContactUploadingIndex] = useState<number | null>(null)

    const handleContactPersonImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        personIndex: number
    ) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsContactUploadingIndex(personIndex)
        try {
            const result = await uploadFile({ file }).unwrap()

            if (result.status === 1) {
                toast.push(
                    <Notification type="success" duration={2500} title="Upload Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )

                const responseData = result.data as any
                if (responseData?.savedMedia?.original_filename) {
                    const updated = contactDetailsSection.contactPersons.map((p, idx) =>
                        idx === personIndex
                            ? {
                                ...p,
                                image: file,
                                imageFileName: responseData.savedMedia.original_filename,
                                imageMediaFileId: responseData.savedMedia.id,
                            }
                            : p
                    )
                    setContactDetailsSection({ ...contactDetailsSection, contactPersons: updated })
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
            setIsContactUploadingIndex(null)
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

    const handleServiceTextChange = (serviceId: number, newText: string) => {
        setServicesFacilitiesSection({
            ...servicesFacilitiesSection,
            services: servicesFacilitiesSection.services.map(service =>
                service.id === serviceId ? { ...service, text: newText } : service
            )
        })
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    International Patient Care
                </h1>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="hover:text-gray-700 cursor-pointer">
                        The Specialities
                    </span>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 font-medium">
                        International Patient Care
                    </span>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-gray-600">Loading page sections data...</span>
                    </div>
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
                        <p><strong>API Endpoint:</strong> /home/sections/4</p>
                        <p><strong>Status:</strong> {apiResponseData?.status || 'N/A'}</p>
                        <p><strong>Message:</strong> {apiResponseData?.message || 'N/A'}</p>
                        <p><strong>Page ID Used:</strong> 4 (International Patient Care)</p>
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px]"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Hero Image</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Background Image</label>
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
                        onClick={() => {
                            toast.push(
                                <Notification type="success" duration={2500} title="Success">
                                    Hero section updated successfully
                                </Notification>,
                                { placement: 'top-end' }
                            )
                        }}
                        loading={isHeroSaving}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isHeroSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Overview Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Overview Section</h3>

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
                                [{ 'color': ['#305FC2', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#00ADEF', '#D60F8C'] }, { 'background': ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#00ADEF', '#D60F8C'] }],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                [{ 'indent': '-1' }, { 'indent': '+1' }],
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

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={overviewSectionFromRedux.imageFileName || ''}
                            readOnly
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleOverviewImageUpload}
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
                        onClick={() => {
                            toast.push(
                                <Notification type="success" duration={2500} title="Success">
                                    Overview section updated successfully
                                </Notification>,
                                { placement: 'top-end' }
                            )
                        }}
                        loading={isOverviewSaving}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isOverviewSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>


            {/* Why Choose RMH Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Why Choose RMH</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={whyChooseUsSection.headerText}
                        onChange={(e) => setWhyChooseUsSection({ ...whyChooseUsSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">Why Choose Items</label>
                    </div>
                    <div className="">
                        {whyChooseUsSection.items.map((item, idx) => (
                            <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Upload Image</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={item.imageFileName}
                                            readOnly
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={(e) => handleWhyChooseImageUpload(e, idx)}
                                            className="hidden"
                                            id={`why-choose-image-${item.id}`}
                                            disabled={isWhyChooseUploadingIndex === idx}
                                        />
                                        <label
                                            htmlFor={`why-choose-image-${item.id}`}
                                            className={`px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors cursor-pointer ${isWhyChooseUploadingIndex === idx ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isWhyChooseUploadingIndex === idx ? 'Uploading...' : 'Upload File'}
                                        </label>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => {
                                            const updatedItems = whyChooseUsSection.items.map((i, iIdx) =>
                                                iIdx === idx ? { ...i, title: e.target.value } : i
                                            )
                                            setWhyChooseUsSection({ ...whyChooseUsSection, items: updatedItems })
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                        placeholder="Enter title..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={() => {
                            toast.push(
                                <Notification type="success" duration={2500} title="Success">
                                    Why Choose RMH section updated successfully
                                </Notification>,
                                { placement: 'top-end' }
                            )
                        }}
                        loading={isUpdating}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Exclusive Services Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Exclusive Services</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={exclusiveServicesSection.headerText}
                        onChange={(e) => setExclusiveServicesSection({ ...exclusiveServicesSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                <div className="">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Exclusive Services For Our International Patients </label>
                        <div className="space-y-3">
                            {exclusiveServicesSection.leftColumn.map((service, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={service.title}
                                        onChange={(e) => {
                                            const updatedLeftColumn = [...exclusiveServicesSection.leftColumn]
                                            updatedLeftColumn[index] = e.target.value
                                            setExclusiveServicesSection({ ...exclusiveServicesSection, leftColumn: updatedLeftColumn })
                                        }}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                        placeholder="Enter service..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* <div>
                        <div className="space-y-3 mt-3">
                            {exclusiveServicesSection.rightColumn.map((service, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={service}
                                        onChange={(e) => {
                                            const updatedRightColumn = [...exclusiveServicesSection.rightColumn]
                                            updatedRightColumn[index] = e.target.value
                                            setExclusiveServicesSection({ ...exclusiveServicesSection, rightColumn: updatedRightColumn })
                                        }}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                        placeholder="Enter service..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div> */}
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={() => {
                            toast.push(
                                <Notification type="success" duration={2500} title="Success">
                                    Exclusive Services section updated successfully
                                </Notification>,
                                { placement: 'top-end' }
                            )
                        }}
                        loading={isUpdating}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Pre-Departure Services Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Pre-Departure Services</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={preDepartureSection.headerText}
                        onChange={(e) => setPreDepartureSection({ ...preDepartureSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                <div className="">
                    {preDepartureSection.services.map((service, idx) => (
                        <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Upload Image</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={service.imageFileName}
                                        readOnly
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handlePreDepartureImageUpload(e, idx)}
                                        className="hidden"
                                        id={`pre-dep-image-${service.id}`}
                                        disabled={isPreDepartureUploadingIndex === idx}
                                    />
                                    <label
                                        htmlFor={`pre-dep-image-${service.id}`}
                                        className={`px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors cursor-pointer ${isPreDepartureUploadingIndex === idx ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isPreDepartureUploadingIndex === idx ? 'Uploading...' : 'Upload File'}
                                    </label>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={service.title}
                                    onChange={(e) => {
                                        const updated = preDepartureSection.services.map((s, sIdx) =>
                                            sIdx === idx ? { ...s, title: e.target.value } : s
                                        )
                                        setPreDepartureSection({ ...preDepartureSection, services: updated })
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                    placeholder="Enter title..."
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={() => {
                            toast.push(
                                <Notification type="success" duration={2500} title="Success">
                                    Pre-Departure Services section updated successfully
                                </Notification>,
                                { placement: 'top-end' }
                            )
                        }}
                        loading={isUpdating}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Travel & Accommodation Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Travel & Accommodation</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={travelAccommodationSection.headerText}
                        onChange={(e) => setTravelAccommodationSection({ ...travelAccommodationSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                <div className="">
                    {travelAccommodationSection.services.map((service, idx) => (
                        <div key={service.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Upload Image</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={service.imageFileName}
                                        readOnly
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleTravelAccommodationImageUpload(e, idx)}
                                        className="hidden"
                                        id={`travel-acc-image-${service.id}`}
                                        disabled={isTravelAccUploadingIndex === idx}
                                    />
                                    <label
                                        htmlFor={`travel-acc-image-${service.id}`}
                                        className={`px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors cursor-pointer ${isTravelAccUploadingIndex === idx ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isTravelAccUploadingIndex === idx ? 'Uploading...' : 'Upload File'}
                                    </label>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={service.title}
                                    onChange={(e) => {
                                        const updated = travelAccommodationSection.services.map((s, sIdx) =>
                                            sIdx === idx ? { ...s, title: e.target.value } : s
                                        )
                                        setTravelAccommodationSection({ ...travelAccommodationSection, services: updated })
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                    placeholder="Enter title..."
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={() => {
                            toast.push(
                                <Notification type="success" duration={2500} title="Success">
                                    Travel & Accommodation section updated successfully
                                </Notification>,
                                { placement: 'top-end' }
                            )
                        }}
                        loading={isUpdating}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Contact Details Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Contact Details</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={contactDetailsSection.headerText}
                        onChange={(e) => setContactDetailsSection({ ...contactDetailsSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                <div className="">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">Contact Persons</label>
                        <div className="space-y-4">
                            {contactDetailsSection.contactPersons.map((person, idx) => (
                                <div key={person.id} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Profile Image</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={person.imageFileName || ''}
                                                readOnly
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                                            />
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                onChange={(e) => handleContactPersonImageUpload(e, idx)}
                                                className="hidden"
                                                id={`contact-person-image-${person.id}`}
                                                disabled={isContactUploadingIndex === idx}
                                            />
                                            <label
                                                htmlFor={`contact-person-image-${person.id}`}
                                                className={`px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors cursor-pointer ${isContactUploadingIndex === idx ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isContactUploadingIndex === idx ? 'Uploading...' : 'Upload File'}
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={person.name}
                                            onChange={(e) => {
                                                const updatedPersons = contactDetailsSection.contactPersons.map((p, pIdx) =>
                                                    pIdx === idx ? { ...p, name: e.target.value } : p
                                                )
                                                setContactDetailsSection({ ...contactDetailsSection, contactPersons: updatedPersons })
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                            placeholder="Enter name..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={person.title}
                                            onChange={(e) => {
                                                const updatedPersons = contactDetailsSection.contactPersons.map((p, pIdx) =>
                                                    pIdx === idx ? { ...p, title: e.target.value } : p
                                                )
                                                setContactDetailsSection({ ...contactDetailsSection, contactPersons: updatedPersons })
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                            placeholder="Enter title..."
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
                                        <input
                                            type="text"
                                            value={person.phone}
                                            onChange={(e) => {
                                                const updatedPersons = contactDetailsSection.contactPersons.map((p, pIdx) =>
                                                    pIdx === idx ? { ...p, phone: e.target.value } : p
                                                )
                                                setContactDetailsSection({ ...contactDetailsSection, contactPersons: updatedPersons })
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                            placeholder="Enter phone..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={person.email}
                                            onChange={(e) => {
                                                const updatedPersons = contactDetailsSection.contactPersons.map((p, pIdx) =>
                                                    pIdx === idx ? { ...p, email: e.target.value } : p
                                                )
                                                setContactDetailsSection({ ...contactDetailsSection, contactPersons: updatedPersons })
                                            }}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                            placeholder="Enter email..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={() => {
                            toast.push(
                                <Notification type="success" duration={2500} title="Success">
                                    Contact Details section updated successfully
                                </Notification>,
                                { placement: 'top-end' }
                            )
                        }}
                        loading={isUpdating}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Statistics Section */}
            <div className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-[#495057] font-inter text-[16px] font-semibold leading-normal mb-6">Hospital Statistics</h3>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
                    <input
                        type="text"
                        value={statisticsSection.headerText}
                        onChange={(e) => setStatisticsSection({ ...statisticsSection, headerText: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter header text..."
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sub Header Text</label>
                    <input
                        type="text"
                        value={statisticsSection.subHeader}
                        onChange={(e) => setStatisticsSection({ ...statisticsSection, subHeader: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                        placeholder="Enter sub header text..."
                    />
                </div>

                <div className="">
                    {statisticsSection.boxes.map((box, idx) => (
                        <div key={box.id} className="p-4 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Header of Box</label>
                                    <input
                                        type="text"
                                        value={box.header}
                                        onChange={(e) => {
                                            const updated = statisticsSection.boxes.map((b, bIdx) => bIdx === idx ? { ...b, header: e.target.value } : b)
                                            setStatisticsSection({ ...statisticsSection, boxes: updated })
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                        placeholder="Enter header..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Sub Header of Box</label>
                                    <input
                                        type="text"
                                        value={box.subHeader}
                                        onChange={(e) => {
                                            const updated = statisticsSection.boxes.map((b, bIdx) => bIdx === idx ? { ...b, subHeader: e.target.value } : b)
                                            setStatisticsSection({ ...statisticsSection, boxes: updated })
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-[24px] bg-white"
                                        placeholder="Enter sub header..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-2">Box Icon</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={box.iconFileName}
                                            readOnly
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-[24px] bg-white text-gray-700"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={(e) => handleStatsIconUpload(e, idx)}
                                            className="hidden"
                                            id={`stats-icon-${box.id}`}
                                            disabled={isStatsUploadingIndex === idx}
                                        />
                                        <label
                                            htmlFor={`stats-icon-${box.id}`}
                                            className={`px-4 py-3 hover:bg-gray-100 text-gray-700 rounded-[24px] bg-gray-200 transition-colors cursor-pointer ${isStatsUploadingIndex === idx ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isStatsUploadingIndex === idx ? 'Uploading...' : 'Upload File'}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={() => {
                            toast.push(
                                <Notification type="success" duration={2500} title="Success">
                                    Statistics section updated successfully
                                </Notification>,
                                { placement: 'top-end' }
                            )
                        }}
                        loading={isUpdating}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                        {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default InternationalPatient
