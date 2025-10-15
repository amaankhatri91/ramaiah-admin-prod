import RtkQueryService from '@/services/RtkQueryService'
import { UpdateHomeResponse } from '@/services/HomeService'

export const pageSectionsApiSlice = RtkQueryService.injectEndpoints({
    endpoints: (builder) => ({
        updatePageSection: builder.mutation<UpdateHomeResponse, { pageId: string; sectionId: number; updateData: any }>({
            query: ({ pageId, sectionId, updateData }) => ({
                url: `/home/section/${sectionId}`,
                method: 'PUT',
                data: { updateData },
            }),
            transformResponse: (response: any) => {
                return {
                    success: response.success || true,
                    message: response.message || 'Page section updated successfully',
                    data: response.data,
                }
            },
            transformErrorResponse: (response: any) => {
                return {
                    success: false,
                    message: response.data?.message || 'Failed to update page section',
                    data: null,
                }
            },
        }),
    }),
    overrideExisting: false,
})

export const { 
    useUpdatePageSectionMutation 
} = pageSectionsApiSlice
