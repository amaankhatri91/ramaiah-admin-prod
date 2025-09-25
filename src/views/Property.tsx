import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { 
    HiPlus,
    HiFilter
} from 'react-icons/hi'
import SearchIcon from '@/components/ui/SearchIcon'
import { EditPencilSvg, EyeActionSvg, DeleteActionSvg } from '@/assets/svg'

interface PropertyData {
    id: string
    propertyName: string
    propertyType: string
    location: string
    propertyStatus: 'Active' | 'Inactive' | 'Sold' | 'Pending'
    propertyPrice: number
    beds: number
    baths: number
    sqft: number
}

const Property = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [showFilterModal, setShowFilterModal] = useState(false)
    const [filters, setFilters] = useState({
        propertyType: '',
        location: '',
        propertyStatus: '',
        minPrice: '',
        maxPrice: '',
        beds: '',
        baths: '',
        sqft: ''
    })

    // Mock data for properties
    const propertyData: PropertyData[] = [
        {
            id: 'PROP001',
            propertyName: 'Sunset Villa',
            propertyType: 'Single Family',
            location: 'Los Angeles, CA',
            propertyStatus: 'Active',
            propertyPrice: 450000,
            beds: 3,
            baths: 2,
            sqft: 1800
        },
        {
            id: 'PROP002',
            propertyName: 'Ocean View Condo',
            propertyType: 'Condo',
            location: 'Miami, FL',
            propertyStatus: 'Active',
            propertyPrice: 320000,
            beds: 2,
            baths: 2,
            sqft: 1200
        },
        {
            id: 'PROP003',
            propertyName: 'Downtown Loft',
            propertyType: 'Apartment',
            location: 'New York, NY',
            propertyStatus: 'Sold',
            propertyPrice: 280000,
            beds: 1,
            baths: 1,
            sqft: 900
        },
        {
            id: 'PROP004',
            propertyName: 'Family Home',
            propertyType: 'Single Family',
            location: 'Chicago, IL',
            propertyStatus: 'Pending',
            propertyPrice: 580000,
            beds: 4,
            baths: 3,
            sqft: 2200
        },
        {
            id: 'PROP005',
            propertyName: 'Garden Apartment',
            propertyType: 'Apartment',
            location: 'Seattle, WA',
            propertyStatus: 'Inactive',
            propertyPrice: 295000,
            beds: 2,
            baths: 1,
            sqft: 1100
        }
    ]

    const filteredProperties = propertyData.filter(property =>
        property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'rounded-[13.5px] bg-[#00C417] text-white text-[14px] font-bold leading-none font-nunito'
            case 'Inactive':
                return 'rounded-[13.5px] bg-[#E8E8E8] text-gray-800 text-[14px] font-bold leading-none font-nunito'
            case 'Sold':
                return 'rounded-[13.5px] bg-[#FF7308] text-white text-[14px] font-bold leading-none font-nunito'
            case 'Pending':
                return 'rounded-[13.5px] bg-[#FF7308] text-white text-[14px] font-bold leading-none font-nunito'
            default:
                return 'rounded-[13.5px] bg-[#E8E8E8] text-gray-800 text-[14px] font-bold leading-none font-nunito'
        }
    }

    return (
        <div className="min-h-screen w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Property</h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search properties..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-[253px]"
                        />
                    </div>
                    <Button 
                        variant="plain" 
                        size="sm" 
                        icon={<HiFilter />}
                        onClick={() => setShowFilterModal(true)}
                    >
                        Filter Property
                    </Button>
                    <Button variant="solid" size="sm" icon={<HiPlus />}>
                        Add Property
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <Card className="mb-6">
                <div className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <Select 
                            placeholder="Property Type"
                            value={filters.propertyType}
                            onChange={(value) => setFilters({...filters, propertyType: value || ''})}
                        >
                            <option value="">All Types</option>
                            <option value="Single Family">Single Family</option>
                            <option value="Condo">Condo</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Townhouse">Townhouse</option>
                        </Select>

                        <Select 
                            placeholder="Location"
                            value={filters.location}
                            onChange={(value) => setFilters({...filters, location: value || ''})}
                        >
                            <option value="">All Locations</option>
                            <option value="Los Angeles">Los Angeles</option>
                            <option value="Miami">Miami</option>
                            <option value="New York">New York</option>
                            <option value="Chicago">Chicago</option>
                            <option value="Seattle">Seattle</option>
                        </Select>

                        <Select 
                            placeholder="Property Status"
                            value={filters.propertyStatus}
                            onChange={(value) => setFilters({...filters, propertyStatus: value || ''})}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Sold">Sold</option>
                            <option value="Pending">Pending</option>
                        </Select>

                        <Input
                            type="number"
                            placeholder="Min Price"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                        />

                        <Input
                            type="number"
                            placeholder="Max Price"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                        />

                        <Input
                            type="number"
                            placeholder="Beds"
                            value={filters.beds}
                            onChange={(e) => setFilters({...filters, beds: e.target.value})}
                        />

                        <Input
                            type="number"
                            placeholder="Sqft"
                            value={filters.sqft}
                            onChange={(e) => setFilters({...filters, sqft: e.target.value})}
                        />
                    </div>
                </div>
            </Card>

            {/* Property Table */}
            <Card>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Property ID</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Name</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Type</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Property Price</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Beds</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Baths</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sqft</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProperties.map((property) => (
                                    <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{property.id}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{property.propertyName}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{property.propertyType}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{property.location}</td>
                                        <td className="py-3 px-4">
                                            <Badge className={getStatusColor(property.propertyStatus)}>
                                                {property.propertyStatus}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{formatCurrency(property.propertyPrice)}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{property.beds}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{property.baths}</td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{property.sqft.toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center">
                                                <div className="flex bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                                                    <button className="p-[9px_8px_9px_12px] hover:bg-white border-r border-gray-200 transition-colors duration-200">
                                                        <EyeActionSvg />
                                                    </button>
                                                    <button className="p-[9px_8px_9px_12px] hover:bg-white border-r border-gray-200 transition-colors duration-200">
                                                        <EditPencilSvg />
                                                    </button>
                                                    <button className="p-[9px_8px_9px_12px] hover:bg-white transition-colors duration-200">
                                                        <DeleteActionSvg />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-600">
                            Showing 1 to 5 of 5 results
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button size="sm" variant="plain" disabled>
                                Previous
                            </Button>
                            <Button size="sm" variant="solid" className="bg-blue-600 text-white">
                                1
                            </Button>
                            <Button size="sm" variant="plain" disabled>
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Property</h3>
                            <div className="space-y-4">
                                                                 <Select 
                                     placeholder="Property Type"
                                     value={filters.propertyType}
                                     onChange={(value) => setFilters({...filters, propertyType: value || ''})}
                                 >
                                    <option value="">All Types</option>
                                    <option value="Single Family">Single Family</option>
                                    <option value="Condo">Condo</option>
                                    <option value="Apartment">Apartment</option>
                                    <option value="Townhouse">Townhouse</option>
                                </Select>

                                                                 <Select 
                                     placeholder="Location"
                                     value={filters.location}
                                     onChange={(value) => setFilters({...filters, location: value || ''})}
                                 >
                                    <option value="">All Locations</option>
                                    <option value="Los Angeles">Los Angeles</option>
                                    <option value="Miami">Miami</option>
                                    <option value="New York">New York</option>
                                    <option value="Chicago">Chicago</option>
                                    <option value="Seattle">Seattle</option>
                                </Select>

                                                                 <Select 
                                     placeholder="Property Status"
                                     value={filters.propertyStatus}
                                     onChange={(value) => setFilters({...filters, propertyStatus: value || ''})}
                                 >
                                    <option value="">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Sold">Sold</option>
                                    <option value="Pending">Pending</option>
                                </Select>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        placeholder="Min Price"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Max Price"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <Input
                                        type="number"
                                        placeholder="Beds"
                                        value={filters.beds}
                                        onChange={(e) => setFilters({...filters, beds: e.target.value})}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Baths"
                                        value={filters.baths}
                                        onChange={(e) => setFilters({...filters, baths: e.target.value})}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Sqft"
                                        value={filters.sqft}
                                        onChange={(e) => setFilters({...filters, sqft: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <Button 
                                    variant="plain" 
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="solid"
                                    onClick={() => setShowFilterModal(false)}
                                >
                                    Apply Filter
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}

export default Property 