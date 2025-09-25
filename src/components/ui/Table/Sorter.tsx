import { useConfig } from '../ConfigProvider'
import caretDownImage from '/img/images/caret-downsvg.svg'

export type SorterProps = { sort?: boolean | 'asc' | 'desc' }

const Sorter = ({ sort }: SorterProps) => {
    const { themeColor, primaryColorLevel } = useConfig()

    const color = `text-${themeColor}-${primaryColorLevel}`

    const renderSort = () => {
        if (typeof sort === 'boolean') {
            return (
                <img
                    src={caretDownImage}
                    alt="sort"
                    className="w-4 h-4 ml-1 shrink-0"
                />
            )
        }

        if (sort === 'asc') {
            return (
                <img
                    src={caretDownImage}
                    alt="sort ascending"
                    className={`w-4 h-4 ml-1 shrink-0 transform rotate-180 ${color}`}
                />
            )
        }

        if (sort === 'desc') {
            return (
                <img
                    src={caretDownImage}
                    alt="sort descending"
                    className={`w-4 h-4 ml-1 shrink-0 ${color}`}
                />
            )
        }

        return null
    }

    return <div className="inline-flex items-center shrink-0">{renderSort()}</div>
}

export default Sorter
