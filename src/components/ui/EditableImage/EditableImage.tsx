import React from 'react'

interface EditableImageProps {
    className?: string
    onClick?: (e: React.MouseEvent) => void
    color?: 'white' | 'default'
    // size?: 'sm' | 'md' | 'lg'
}

const EditableImage: React.FC<EditableImageProps> = ({ 
    className = '', 
    onClick,
    color = 'default'
    // size = 'md' 
}) => {
    // const sizeClasses = {
    //     sm: 'w-3 h-3',
    //     md: 'w-4 h-4',
    //     lg: 'w-5 h-5'
    // }

    const colorFilter = color === 'white' ? 'brightness(0) invert(1)' : 'none'

    return (
        <img
            src="/img/images/Edittable.svg"
            alt="Edit"
            // className={`${sizeClasses[size]} ${className}`}
            className={className}
            onClick={onClick}
            style={{ 
                cursor: onClick ? 'pointer' : 'default',
                filter: colorFilter
            }}
        />
    )
}

export default EditableImage
