import RtkQueryService from '@/services/RtkQueryService'

export interface FileUploadResponse {
    status: number
    message: string
    data?: {
        message: string
        filePath: string
        savedMedia?: {
            id: number
            filename: string
            original_filename: string
            alt_text: string
            file_type: string
            mime_type: string
            file_url: string
            file_size: number
            created_at: string
            updated_at: string
            uploaded_by: number
            caption?: string
            duration?: number
            height?: number
            width?: number
        }
    }
    filePath?: string
    savedMedia?: {
        id: number
        filename: string
        original_filename: string
        alt_text: string
        file_type: string
        mime_type: string
        file_url: string
        file_size: number
        created_at: string
        updated_at: string
        uploaded_by: number
        caption?: string
        duration?: number
        height?: number
        width?: number
    }
}

export interface FileUploadRequest {
    file: File
}

export const fileUploadApiSlice = RtkQueryService.injectEndpoints({
    endpoints: (builder) => ({
        uploadFile: builder.mutation<FileUploadResponse, FileUploadRequest>({
            query: ({ file }) => {
                const formData = new FormData()
                formData.append('file', file)
                
                return {
                    url: '/site/settings/upload',
                    method: 'POST',
                    data: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            },
            transformResponse: (response: any) => {
                return {
                    status: response.status || 1,
                    message: response.message || 'File uploaded successfully',
                    data: response.data || {
                        message: response.data?.message || 'File uploaded successfully',
                        filePath: response.data?.filePath || response.filePath,
                        savedMedia: response.data?.savedMedia || response.savedMedia,
                    },
                    filePath: response.filePath,
                    savedMedia: response.savedMedia,
                }
            },
            transformErrorResponse: (response: any) => {
                return {
                    status: 0,
                    message: response.data?.message || response.message || 'File upload failed',
                }
            },
        }),
    }),
    overrideExisting: false,
})

// Export the mutation hook
export const { useUploadFileMutation } = fileUploadApiSlice
