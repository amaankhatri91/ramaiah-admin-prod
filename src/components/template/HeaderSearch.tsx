import { useState } from 'react'
import classNames from 'classnames'
import SearchIcon from '@/components/ui/SearchIcon'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import type { CommonProps } from '@/@types/common'

const _HeaderSearch = ({ className }: CommonProps) => {
    const [searchValue, setSearchValue] = useState('')

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    return (
        <div className={classNames(className, 'flex items-center')}>
            <div className="relative w-64 ml-[12px] md:ml-[15px]">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <SearchIcon className="text-lg" size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchValue}
                    onChange={handleSearchChange}
                    style={{
                        borderRadius: '19px',
                        border: '0.6px solid #D5D5D5',
                        background: '#F5F6FA',
                        height: '40px',
                        paddingLeft: '40px',
                        paddingRight: '16px',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                    className="w-[220px] md:w-[388px] placeholder:text-gray-400 focus:bg-white"
                />
            </div>
        </div>
    )
}

const HeaderSearch = withHeaderItem(_HeaderSearch)

// Override the default hoverable behavior
const HeaderSearchWithNoHover = (props: any) => <HeaderSearch {...props} hoverable={false} />

export default HeaderSearchWithNoHover 