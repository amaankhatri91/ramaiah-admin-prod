import RtkQueryService from '@/services/RtkQueryService'
import { UpdateHeaderRequest, UpdateHeaderResponse } from '@/services/HeaderService'

export const headerApiSlice = RtkQueryService.injectEndpoints({
    endpoints: (builder) => ({
        updateHeaderSettings: builder.mutation<UpdateHeaderResponse, UpdateHeaderRequest>({
            query: (data) => ({
                url: '/site/settings',
                method: 'PUT',
                data: data,
            }),
            transformResponse: (response: any) => {
                return {
                    success: response.success || true,
                    message: response.message || 'Header settings updated successfully',
                    data: response.data,
                }
            },
            transformErrorResponse: (response: any) => {
                return {
                    success: false,
                    message: response.data?.message || response.message || 'Failed to update header settings',
                }
            },
        }),
    }),
    overrideExisting: false,
})

export const { useUpdateHeaderSettingsMutation } = headerApiSlice
