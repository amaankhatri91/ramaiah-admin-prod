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
                url: '/admin/home',
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
    }),
    overrideExisting: false,
})

export const { 
    useGetHomeDataQuery, 
    useUpdateHomeDataMutation,
    useUpdateHomeSectionMutation 
} = homeApiSlice
