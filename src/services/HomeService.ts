import ApiService from './ApiService'

export interface MediaFile {
    id: number
    media_file: {
        id: number
        filename: string
        original_filename: string
        file_path: string
        file_url: string
        file_type: string
        mime_type: string
        file_size: string
        width: number | null
        height: number | null
        duration: number | null
        alt_text: string
        caption: string | null
        uploaded_by: number | null
        created_at: string
        updated_at: string
    }
}

export interface Statistic {
    id: number
    content_block_id: number
    statistic_text: string | null
    number: string
    label: string
    suffix: string
    icon_class: string
    color: string
    animation_delay: number
    created_at: string
    updated_at: string
}

export interface Accreditation {
    id: number
    content_block_id: number
    name: string
    description: string
    year_achieved: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface ContentBlock {
    id: number
    section_id: number
    block_type: string
    title: string
    subtitle: string | null
    description: string | null
    content: string | null
    alignment: string
    width_percentage: number
    custom_css: string | null
    display_order: number
    media_files: MediaFile[]
    statistics: Statistic[]
    testimonials: any[]
    accreditations: Accreditation[]
    buttons: any[]
    faqs: any[]
}

export interface HomeData {
    data: ContentBlock[]
}

export interface HomeResponse {
    status: number
    message: string
    data: ContentBlock[]
}

export interface UpdateHomeRequest {
    [key: string]: any
}

export interface UpdateHomeResponse {
    success: boolean
    message: string
    data?: any
}

export async function apiGetHomeData() {
    console.log('Making API call to /admin/home')
    try {
        const response = await ApiService.fetchData<HomeResponse>({
            url: '/admin/home',
            method: 'get',
        })
        console.log('Home API Response received:', response)
        return response
    } catch (error) {
        console.error('Home API Error:', error)
        throw error
    }
}

// Helper functions to parse data by section
export const parseHeroSection = (blocks: ContentBlock[]) => {
    const heroBlocks = blocks.filter(block => block.section_id === 1)
    
    const headlineBlock = heroBlocks.find(block => block.title === 'Hero Headline')
    const subtitleBlock = heroBlocks.find(block => block.title === 'Hero Subtitle')
    // Find banner block - title can be "banner image" (lowercase) or "Banner Images" or by block_type
    const bannerBlock = heroBlocks.find(block => 
        block.media_files &&
        block.media_files.length > 0 &&
        (block.title?.toLowerCase() === 'banner image' || 
         block.title?.toLowerCase() === 'banner images' ||
         block.title === 'joint commission international' ||
         (block.block_type === 'image' && block.section_id === 1))
    )
    const smallBannerBlock = heroBlocks.find(block => block.title === 'Small Banner')
    
    return {
        headerText: headlineBlock?.content || '',
        subHeaderText: subtitleBlock?.content || '',
        bannerImages: bannerBlock?.media_files?.map(file => ({
            id: file.id.toString(),
            name: file.media_file.original_filename,
            url: file.media_file.file_url,
            media_file_id: file.media_file.id
        })) || [],
        smallBannerFile: smallBannerBlock?.media_files?.[0]?.media_file?.original_filename || '',
        smallBannerMediaFileId: smallBannerBlock?.media_files?.[0]?.media_file?.id
    }
}

export const parseQuickLinksSection = (blocks: ContentBlock[]) => {
    const quickLinkBlocks = blocks.filter(block => block.section_id === 2)
    
    return quickLinkBlocks.map(block => ({
        id: block.id.toString(),
        name: block.title,
        link: block.statistics?.[0]?.statistic_text || '',
        icon: block.media_files?.[0]?.media_file?.original_filename || 'icon_01.svg'
    }))
}

export const parseDoctorSpeakSection = (blocks: ContentBlock[]) => {
    const doctorBlock = blocks.find(block => block.section_id === 3 && block.title === 'Doctor Speak')
    
    return {
        doctorSpeakVideo: doctorBlock?.media_files?.[0]?.media_file?.original_filename || ''
    }
}

export const parsePatientSpeakSection = (blocks: ContentBlock[]) => {
    const patientBlock = blocks.find(block => block.section_id === 3 && block.title === 'Patient Speak')
    
    return {
        patientSpeakVideo: patientBlock?.media_files?.[0]?.media_file?.original_filename || ''
    }
}

export const parseOurStorySection = (blocks: ContentBlock[]) => {
    const storyBlocks = blocks.filter(block => block.section_id === 4)
    
    return {
        headerText: 'Our Story',
        subHeaderText: '',
        storyBoxes: storyBlocks.map(block => ({
            id: block.id.toString(),
            header: block.content || '',
            subHeader: block.statistics?.[0]?.statistic_text || '',
            icon: block.media_files?.[0]?.media_file?.original_filename || 'icon_01.svg'
        }))
    }
}

export const parseAccreditationsSection = (blocks: ContentBlock[]) => {
    const accreditationBlocks = blocks.filter(block => block.section_id === 5)
    
    return {
        certificates: accreditationBlocks.map(block => ({
            id: block.id.toString(),
            name: block.title,
            image: block.media_files?.[0]?.media_file?.original_filename || 'certificate.png'
        }))
    }
}

export const parseMiddleSection = (blocks: ContentBlock[]) => {
    const middleBlocks = blocks.filter(block => block.section_id === 6)
    
    const descriptionBlock = middleBlocks.find(block => block.title === 'Legacy Description')
    const imageBlock = middleBlocks.find(block => block.title === 'Modern Medical Facility')
    
    return {
        headerText: 'Our 20+ Years of Legacy & Clinical Excellence',
        subHeaderText: descriptionBlock?.content || '',
        buttonText: '',
        buttonLink: '',
        doctorSpeakVideo: imageBlock?.media_files?.[0]?.media_file?.original_filename || ''
    }
}

export const parseOurJourneySection = (blocks: ContentBlock[]) => {
    // Get all blocks from section 7 (Our Journey Content Section)
    const section7Blocks = blocks.filter(block => block.section_id === 7)
    
    // Sort by display_order to ensure correct order
    const sortedBlocks = section7Blocks.sort((a, b) => a.display_order - b.display_order)
    
    // First object (display_order: 1) - Title block
    const titleBlock = sortedBlocks.find(block => block.display_order === 1 && block.block_type === 'text')
    
    // Second object (display_order: 2) - Content with journey description
    const contentBlock = sortedBlocks.find(block => block.display_order === 2 && block.content)
    
    // Third object (display_order: 3) - Image with media file
    const imageBlock = sortedBlocks.find(block => block.display_order === 3 && block.block_type === 'image')

    const formatContentForDisplay = (content: string) => {
        if (!content) return ''
        // Keep HTML formatting but convert paragraph breaks to single paragraph
        return content
            .replace(/<p[^>]*>/gi, '') // Remove opening <p> tags
            .replace(/<\/p>/gi, ' ') // Replace closing </p> tags with space
            .replace(/<br\s*\/?>/gi, ' ') // Replace <br> tags with space
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim()
    }
    
    return {
        headerText: titleBlock?.title || 'Our Journey',
        subHeaderText: '',
        content: formatContentForDisplay(contentBlock?.content || ''),
        uploadFile: imageBlock?.media_files?.[0]?.media_file?.original_filename || '',
        uploadFileMediaId: imageBlock?.media_files?.[0]?.media_file?.id
    }
}

export async function apiUpdateHomeData(data: UpdateHomeRequest) {
    console.log('Making API call to /admin/home with PUT method')
    try {
        const response = await ApiService.fetchData<UpdateHomeResponse>({
            url: '/admin/home',
            method: 'put',
            data: data,
        })
        console.log('Home Update API Response received:', response)
        return response
    } catch (error) {
        console.error('Home Update API Error:', error)
        throw error
    }
}

// Interface for page sections API response
export interface PageSectionsResponse {
    status: number
    message: string
    data: {
        heroSection?: any
        sections?: any[]
        [key: string]: any
    }
}

// Interface for the data part of the response
export interface PageSectionsData {
    heroSection?: any
    sections?: any[]
    [key: string]: any
}

// API function to get page sections data
export async function apiGetPageSections(pageId: string) {
    console.log(`Making API call to /home/sections/${pageId}`)
    try {
        const response = await ApiService.fetchData<PageSectionsResponse>({
            url: `/home/sections/${pageId}`,
            method: 'get',
        })
        console.log('Page Sections API Response received:', response)
        return response
    } catch (error) {
        console.error('Page Sections API Error:', error)
        throw error
    }
}

// API function to update page section data
export async function apiUpdatePageSection(pageId: string, sectionId: number, updateData: any) {
    console.log(`Making API call to /home/sections/${pageId}/section/${sectionId}`)
    try {
        const response = await ApiService.fetchData<UpdateHomeResponse>({
            url: `/home/sections/${pageId}/section/${sectionId}`,
            method: 'put',
            data: { updateData },
        })
        console.log('Page Section Update API Response received:', response)
        return response
    } catch (error) {
        console.error('Page Section Update API Error:', error)
        throw error
    }
}

// API function to create a new section
export async function apiCreateSection(sectionData: any) {
    console.log('Making API call to /home/section with POST method')
    try {
        const response = await ApiService.fetchData<UpdateHomeResponse>({
            url: '/home/section',
            method: 'post',
            data: sectionData,
        })
        console.log('Create Section API Response received:', response)
        return response
    } catch (error) {
        console.error('Create Section API Error:', error)
        throw error
    }
}