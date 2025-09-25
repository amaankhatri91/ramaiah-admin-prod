import React from 'react'

interface SearchIconProps {
    className?: string
    size?: number
}

const SearchIcon: React.FC<SearchIconProps> = ({ className = '', size = 17 }) => {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 17 17" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g opacity="0.5">
                <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M9.69353 12.535C12.4234 11.3748 13.6959 8.22136 12.5357 5.49152C11.3755 2.76168 8.22208 1.4892 5.49225 2.64936C2.76241 3.80951 1.48993 6.96297 2.65008 9.69281C3.81024 12.4226 6.9637 13.6951 9.69353 12.535Z" 
                    stroke="currentColor" 
                    strokeWidth="1.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
                <path 
                    d="M11.3902 11.3896L15.5555 15.5556" 
                    stroke="currentColor" 
                    strokeWidth="1.2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    )
}

export default SearchIcon 