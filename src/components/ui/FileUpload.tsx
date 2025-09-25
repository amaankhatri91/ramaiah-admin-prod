import React, { useState, useRef } from 'react'
import { HiCloudArrowUp, HiXMark } from 'react-icons/hi2'

interface FileUploadProps {
    accept?: string
    onFileSelect?: (file: File | null) => void
    currentFileName?: string
    placeholder?: string
    className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
    accept = "*/*",
    onFileSelect,
    currentFileName,
    placeholder = "no-file",
    className = ""
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (file: File) => {
        setSelectedFile(file)
        onFileSelect?.(file)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
        }
    }

    const handleRemoveFile = () => {
        setSelectedFile(null)
        onFileSelect?.(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase()
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
                return '🖼️'
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
                return '🎥'
            case 'mp3':
            case 'wav':
            case 'ogg':
                return '🎵'
            default:
                return '📄'
        }
    }

    const displayFileName = selectedFile?.name || currentFileName || placeholder

    return (
        <div className={`relative ${className}`}>
            <div
                className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
                    dragActive 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                />
                
                <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                        {selectedFile || currentFileName ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{getFileIcon(displayFileName)}</span>
                                <span className="text-sm text-gray-700 truncate max-w-32">
                                    {displayFileName}
                                </span>
                                <button
                                    onClick={handleRemoveFile}
                                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <HiXMark className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        ) : (
                            <HiCloudArrowUp className="w-8 h-8 text-gray-400 mx-auto" />
                        )}
                    </div>
                    
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        {selectedFile || currentFileName ? 'Change File' : 'Upload File'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FileUpload


