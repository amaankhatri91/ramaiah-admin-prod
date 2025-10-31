import RtkQueryService from '@/services/RtkQueryService'
import { UpdateHomeRequest, UpdateHomeResponse, HomeResponse } from '@/services/HomeService'

export const homeApiSlice = RtkQueryService.injectEndpoints({
    endpoints: (builder) => ({
        getHomeData: builder.query<HomeResponse, void>({
            query: () => ({
                url: '/admin/home',
                method: 'GET',
            }),
            transformResponse: (response: any) => {
                // Extract content_blocks from nested data structure
                // Support both old format (response.data is array) and new format (response.data.content_blocks)
                const contentBlocks = response.data?.content_blocks || (Array.isArray(response.data) ? response.data : [])
                
                return {
                    status: response.status || 1,
                    message: response.message || 'Home data fetched successfully',
                    data: contentBlocks,
                }
            },
            transformErrorResponse: (response: any) => {
                return {
                    status: 0,
                    message: response.data?.message || 'Failed to fetch home data',
                    data: [],
                }
            },
        }),
        updateHomeData: builder.mutation<UpdateHomeResponse, UpdateHomeRequest>({
            query: (data) => ({
                url: '/home',
                method: 'PUT',
                data: data,
            }),
            transformResponse: (response: any) => {
                return {
                    success: response.success || true,
                    message: response.message || 'Home data updated successfully',
                    data: response.data,
                }
            },
            transformErrorResponse: (response: any) => {
                return {
                    success: false,
                    message: response.data?.message || 'Failed to update home data',
                    data: null,
                }
            },
        }),
        updateHomeSection: builder.mutation<UpdateHomeResponse, { sectionId: number; updateData: any }>({
            query: ({ sectionId, updateData }) => ({
                url: `/home/section/${sectionId}`,
                method: 'PUT',
                data: { updateData },
            }),
            transformResponse: (response: any) => {
                return {
                    success: response.success || true,
                    message: response.message || 'Section updated successfully',
                    data: response.data,
                }
            },
            transformErrorResponse: (response: any) => {
                return {
                    success: false,
                    message: response.data?.message || 'Failed to update section',
                    data: null,
                }
            },
        }),
        getPageSettings: builder.query<any, void>({
            query: () => ({
                url: '/admin/home',
                method: 'GET',
            }),
            transformResponse: (response: any) => {
                // Return the full page metadata from the response
                return {
                    status: response.status || 1,
                    message: response.message || 'Page settings fetched successfully',
                    data: {
                        id: response.data?.id,
                        slug: response.data?.slug,
                        title: response.data?.title,
                        page_type: response.data?.page_type,
                        meta_title: response.data?.meta_title,
                        meta_description: response.data?.meta_description,
                        meta_keywords: response.data?.meta_keywords,
                    },
                }
            },
            transformErrorResponse: (response: any) => {
                return {
                    status: 0,
                    message: response.data?.message || 'Failed to fetch page settings',
                    data: null,
                }
            },
        }),
    }),
    overrideExisting: false,
})

export const { 
    useGetHomeDataQuery, 
    useUpdateHomeDataMutation,
    useUpdateHomeSectionMutation,
    useGetPageSettingsQuery 
} = homeApiSlice
