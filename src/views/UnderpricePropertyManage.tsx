import React, { useState, useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import SearchIcon from '@/components/ui/SearchIcon'
import DownloadIcon from '@/components/ui/DownloadIcon'
import { exportAllPagesToCSV } from '@/utils/exportExcel'
import { AngleSmallLeftSvg, AngleSmallRightSvg } from '@/assets/svg'
import ApiService from '@/services/ApiService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

interface PropertyItem {
    id: string | number
    name: string
    selected: boolean
}

// CSV-only row shape for export; does not affect UI panels
type UnderpriceCsvRow = {
    id: string
    address: string
    street: string
    city: string
    state: string
    zip: string
    county: string
    latitude: string
    longitude: string
    bed: string
    bath: string
    bedrooms: string
    bathrooms: string
    squareFeet: string
    lotSize: string
    propertyType: string
    yearBuilt: string
    price: string
    currency: string
    estimatedValue: string
    undervaluedAmount: string
    undervaluedPercent: string
    daysOnMarket: string
    mlsNumber: string
    chatgptPriceAnalysis: string
    isDisplayed: string
    sourceProvider: string
    source: string
    createdAt: string
    updatedAt: string
}

const UnderpricePropertyManage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [leftPanelItems, setLeftPanelItems] = useState<PropertyItem[]>([])
    const [rightPanelItems, setRightPanelItems] = useState<PropertyItem[]>([
        { id: '8', name: 'NPL Building 2311 King Streeet, MalibuJL, Jersey city 145738 App 75 Ring Road', selected: false },
        { id: '9', name: 'NPL Building 2311 King Streeet, MalibuJL, Jersey city 145738 App 75 Ring Road', selected: true },
    ])
    const [leftSelectAllClicked, setLeftSelectAllClicked] = useState(false)
    const [rightSelectAllClicked, setRightSelectAllClicked] = useState(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        const fetchLeftPanel = async () => {
            try {
                const payload = {
                    is_displayed: false,
                    limit: 10,
                    offset: 0,
                    page: 1,
                    search: '',
                }

                const res = await ApiService.fetchData<any, typeof payload>({
                    url: '/admin/properties/under-priced/list',
                    method: 'post',
                    data: payload,
                })

                const body = res.data as any
                let rows: any[] = []

                if (Array.isArray(body)) {
                    rows = body
                } else if (body?.data) {
                    const dataBlock = body.data as any
                    rows = dataBlock.rows || dataBlock.list || dataBlock.items || dataBlock.data || []
                } else {
                    rows = body?.rows || body?.list || body?.items || []
                }

                const toAddress = (item: any) => {
                    return (
                        item?.address ||
                        item?.full_address ||
                        [item?.street, item?.city, item?.state].filter(Boolean).join(', ') ||
                        '-'
                    )
                }

                const normalized: PropertyItem[] = rows.map((r: any, idx: number) => {
                    const rawId = r?.id ?? r?._id ?? idx
                    const num = Number(rawId)
                    const finalId = Number.isFinite(num) ? num : (rawId?.toString?.() ?? `${idx}`)
                    return {
                        id: finalId,
                        name: toAddress(r),
                        selected: false,
                    }
                })

                setLeftPanelItems(normalized)
            } catch (e) {
                setLeftPanelItems([])
            }
        }

        fetchLeftPanel()
    }, [])

    useEffect(() => {
        const fetchRightPanel = async () => {
            try {
                const payload = {
                    is_displayed: true,
                    limit: 10,
                    offset: 0,
                    page: 1,
                    search: '',
                }

                const res = await ApiService.fetchData<any, typeof payload>({
                    url: '/admin/properties/under-priced/list',
                    method: 'post',
                    data: payload,
                })

                const body = res.data as any
                let rows: any[] = []

                if (Array.isArray(body)) {
                    rows = body
                } else if (body?.data) {
                    const dataBlock = body.data as any
                    rows = dataBlock.rows || dataBlock.list || dataBlock.items || dataBlock.data || []
                } else {
                    rows = body?.rows || body?.list || body?.items || []
                }

                const toAddress = (item: any) => {
                    return (
                        item?.address ||
                        item?.full_address ||
                        [item?.street, item?.city, item?.state].filter(Boolean).join(', ') ||
                        '-'
                    )
                }

                const normalized: PropertyItem[] = rows.map((r: any, idx: number) => {
                    const rawId = r?.id ?? r?._id ?? idx
                    const num = Number(rawId)
                    const finalId = Number.isFinite(num) ? num : (rawId?.toString?.() ?? `${idx}`)
                    return {
                        id: finalId,
                        name: toAddress(r),
                        selected: false,
                    }
                })

                setRightPanelItems(normalized)
            } catch (e) {
                setRightPanelItems([])
            }
        }

        fetchRightPanel()
    }, [])

    const handleSelectAll = (panel: 'left' | 'right') => {
        if (panel === 'left') {
            const allSelected = leftPanelItems.every(item => item.selected)
            setLeftPanelItems(items => items.map(item => ({ ...item, selected: !allSelected })))
        } else {
            const allSelected = rightPanelItems.every(item => item.selected)
            setRightPanelItems(items => items.map(item => ({ ...item, selected: !allSelected })))
        }
    }

    const handleClearAll = (panel: 'left' | 'right') => {
        if (panel === 'left') {
            setLeftPanelItems(items => items.map(item => ({ ...item, selected: false })))
            setLeftSelectAllClicked(false)
        } else {
            setRightPanelItems(items => items.map(item => ({ ...item, selected: false })))
            setRightSelectAllClicked(false)
        }
    }

    const handleSelectAllText = (panel: 'left' | 'right') => {
        if (panel === 'left') {
            setLeftPanelItems(items => items.map(item => ({ ...item, selected: true })))
            setLeftSelectAllClicked(true)
        } else {
            setRightPanelItems(items => items.map(item => ({ ...item, selected: true })))
            setRightSelectAllClicked(true)
        }
    }

    const handleItemSelect = (panel: 'left' | 'right', itemId: string | number) => {
        if (panel === 'left') {
            setLeftPanelItems(items => 
                items.map(item => 
                    item.id === itemId ? { ...item, selected: !item.selected } : item
                )
            )
        } else {
            setRightPanelItems(items => 
                items.map(item => 
                    item.id === itemId ? { ...item, selected: !item.selected } : item
                )
            )
        }
    }

    const handleAdd = () => {
        const selectedItems = leftPanelItems.filter(item => item.selected)
        const unselectedItems = leftPanelItems.filter(item => !item.selected)
        
        setLeftPanelItems(unselectedItems)
        setRightPanelItems(prev => [...prev, ...selectedItems])
    }

    const handleRemove = () => {
        const selectedItems = rightPanelItems.filter(item => item.selected)
        const unselectedItems = rightPanelItems.filter(item => !item.selected)
        
        setRightPanelItems(unselectedItems)
        setLeftPanelItems(prev => [...prev, ...selectedItems])
    }

    const refreshPanels = async () => {
        try {
            // Left panel refresh (is_displayed: false)
            {
                const payload = { is_displayed: false, limit: 10, offset: 0, page: 1, search: '' }
                const res = await ApiService.fetchData<any, typeof payload>({
                    url: '/admin/properties/under-priced/list',
                    method: 'post',
                    data: payload,
                })
                const body = res.data as any
                let rows: any[] = []
                if (Array.isArray(body)) {
                    rows = body
                } else if (body?.data) {
                    const dataBlock = body.data as any
                    rows = dataBlock.rows || dataBlock.list || dataBlock.items || dataBlock.data || []
                } else {
                    rows = body?.rows || body?.list || body?.items || []
                }
                const toAddress = (item: any) => (
                    item?.address || item?.full_address || [item?.street, item?.city, item?.state].filter(Boolean).join(', ') || '-'
                )
                const normalized: PropertyItem[] = rows.map((r: any, idx: number) => {
                    const rawId = r?.id ?? r?._id ?? idx
                    const num = Number(rawId)
                    const finalId = Number.isFinite(num) ? num : (rawId?.toString?.() ?? `${idx}`)
                    return { id: finalId, name: toAddress(r), selected: false }
                })
                setLeftPanelItems(normalized)
            }

            // Right panel refresh (is_displayed: true)
            {
                const payload = { is_displayed: true, limit: 10, offset: 0, page: 1, search: '' }
                const res = await ApiService.fetchData<any, typeof payload>({
                    url: '/admin/properties/under-priced/list',
                    method: 'post',
                    data: payload,
                })
                const body = res.data as any
                let rows: any[] = []
                if (Array.isArray(body)) {
                    rows = body
                } else if (body?.data) {
                    const dataBlock = body.data as any
                    rows = dataBlock.rows || dataBlock.list || dataBlock.items || dataBlock.data || []
                } else {
                    rows = body?.rows || body?.list || body?.items || []
                }
                const toAddress = (item: any) => (
                    item?.address || item?.full_address || [item?.street, item?.city, item?.state].filter(Boolean).join(', ') || '-'
                )
                const normalized: PropertyItem[] = rows.map((r: any, idx: number) => {
                    const rawId = r?.id ?? r?._id ?? idx
                    const num = Number(rawId)
                    const finalId = Number.isFinite(num) ? num : (rawId?.toString?.() ?? `${idx}`)
                    return { id: finalId, name: toAddress(r), selected: false }
                })
                setRightPanelItems(normalized)
            }
        } catch (e) {
            // ignore refresh errors
        }
    }

    const handleSave = async () => {
        const selectedFromRight = rightPanelItems.filter(item => item.selected)
        const ids = selectedFromRight
            .map(item => (typeof item.id === 'number' ? item.id : Number(item.id)))
            .filter(n => Number.isFinite(n)) as number[]
        try {
            if (ids.length > 0) {
                const res = await ApiService.fetchData<any, { ids: number[] }>({
                    url: '/admin/properties/under-priced/manage',
                    method: 'post',
                    data: { ids },
                })

                const message = (res.data?.message || res.data?.msg || 'Saved successfully') as string
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        {message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                await refreshPanels()
            }
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.message || 'Failed to save'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errMsg}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleDelete = async (panel: 'left' | 'right') => {
        const sourceItems = panel === 'left' ? leftPanelItems : rightPanelItems
        const selected = sourceItems.filter(item => item.selected)
        const ids = selected
            .map(item => (typeof item.id === 'number' ? item.id : Number(item.id)))
            .filter(n => Number.isFinite(n)) as number[]

        try {
            if (ids.length > 0) {
                const res = await ApiService.fetchData<any, { ids: number[]}>({
                    url: '/admin/properties/under-priced/delete',
                    method: 'post',
                    data: { ids },
                })
                const message = (res.data?.message || res.data?.msg || 'Deleted successfully') as string
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        {message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                if (panel === 'left') {
                    setLeftPanelItems(prev => prev.filter(item => !item.selected))
                } else {
                    setRightPanelItems(prev => prev.filter(item => !item.selected))
                }
            }
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.message || 'Failed to delete'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errMsg}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleBulkDelete = async () => {
        const selectedLeft = leftPanelItems.filter(item => item.selected)
        const selectedRight = rightPanelItems.filter(item => item.selected)
        const ids = [...selectedLeft, ...selectedRight]
            .map(item => (typeof item.id === 'number' ? item.id : Number(item.id)))
            .filter(n => Number.isFinite(n)) as number[]

        try {
            if (ids.length > 0) {
                const res = await ApiService.fetchData<any, { ids: number[]}>({
                    url: '/admin/properties/under-priced/delete',
                    method: 'post',
                    data: { ids },
                })
                const message = (res.data?.message || res.data?.msg || 'Deleted successfully') as string
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        {message}
                    </Notification>,
                    { placement: 'top-end' }
                )
                setLeftPanelItems(prev => prev.filter(item => !item.selected))
                setRightPanelItems(prev => prev.filter(item => !item.selected))
            }
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.message || 'Failed to delete'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errMsg}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0]
        if (!file) return

        const isCsv = file.type === 'text/csv' || /\.csv$/i.test(file.name)
        if (!isCsv) {
            toast.push(
                <Notification type="danger" duration={3000} title="Invalid file">
                    Please upload a CSV file with columns: no,address
                </Notification>,
                { placement: 'top-end' }
            )
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }
        // Log CSV file details and contents to the console
        try {
            const textContent = await file.text()
            console.log('[UnderpricePropertyManage] CSV file selected:', {
                name: file.name,
                size: file.size,
                type: file.type,
            })
            console.log('[UnderpricePropertyManage] CSV file content:\n', textContent)
        } catch (readErr) {
            console.log('[UnderpricePropertyManage] Failed to read CSV content:', readErr)
        }
        const formData = new FormData()
        formData.append('file', file)
        try {
            setUploading(true)
            const res = await ApiService.fetchData<any, FormData>({
                url: '/admin/properties/under-priced/upload',
                method: 'post',
                data: formData,
            })
            const message = (res.data?.message || res.data?.msg || 'File uploaded successfully') as string
            toast.push(
                <Notification type="success" duration={2500} title="Upload">
                    {message}
                </Notification>,
                { placement: 'top-end' }
            )
            await refreshPanels()
        } catch (e: any) {
            const errMsg = e?.response?.data?.message || e?.message || 'Failed to upload file'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errMsg}
                </Notification>,
                { placement: 'top-end' }
            )
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const normalizeUnderpriceForCsv = (item: any, index: number): UnderpriceCsvRow => {
        const id = item?.id?.toString?.() || item?._id?.toString?.() || `${index}`
        const street = item?.street || item?.address_line1 || item?.address || ''
        const city = item?.city || item?.location?.city || ''
        const state = item?.state || item?.location?.state || ''
        const zip = item?.zip || item?.zipcode || item?.postal_code || ''
        const county = item?.county || ''
        const address = item?.full_address || [street, city, state, zip].filter(Boolean).join(', ') || '-'
        const latitude = (item?.lat ?? item?.latitude ?? '').toString() || '-'
        const longitude = (item?.lng ?? item?.longitude ?? '').toString() || '-'
        const bedrooms = (item?.bedrooms ?? item?.beds ?? item?.bed ?? '-') + ''
        const bathrooms = (item?.bathrooms ?? item?.baths ?? item?.bath ?? '-') + ''
        const bed = bedrooms
        const bath = bathrooms
        const squareFeet = item?.square_feet?.toString?.() || item?.sqft?.toString?.() || item?.sqft || '-'
        const lotSize = item?.lot_size?.toString?.() || item?.lot_acres?.toString?.() || item?.acreage?.toString?.() || '-'
        const propertyType = item?.property_type || item?.type || '-'
        const yearBuilt = item?.year_built?.toString?.() || '-'
        const rawPrice = item?.price ?? item?.price_text ?? item?.amount
        const price = rawPrice == null ? '-' : `${rawPrice}`
        const currency = item?.currency || 'USD'
        const estimatedValue = item?.estimated_value?.toString?.() || item?.zestimate?.toString?.() || item?.market_value?.toString?.() || '-'
        const undervaluedAmount = item?.undervalued_amount?.toString?.() || item?.savings_amount?.toString?.() || '-'
        const undervaluedPercent = item?.undervalued_percent?.toString?.() || item?.savings_percent?.toString?.() || '-'
        const daysOnMarket = item?.days_on_market?.toString?.() || item?.dom?.toString?.() || '-'
        const mlsNumber = item?.mls_number || item?.mls || '-'
        const chatgptPriceAnalysis = item?.chatgptPriceAnalysis || item?.analysis || item?.gpt_analysis || '-'
        const isDisplayedBool = item?.is_displayed ?? item?.isDisplayed ?? false
        const isDisplayed = isDisplayedBool ? 'True' : 'False'
        const sourceProvider = item?.source_provider || item?.provider || '-'
        const source = isDisplayedBool ? 'Right Panel / Underprice Property' : 'Left Panel'
        const createdAt = item?.created_at ? new Date(item.created_at).toLocaleString() : '-'
        const updatedAt = item?.updated_at ? new Date(item.updated_at).toLocaleString() : '-'
        return { id, address, street, city, state, zip, county, latitude, longitude, bed, bath, bedrooms, bathrooms, squareFeet, lotSize, propertyType, yearBuilt, price, currency, estimatedValue, undervaluedAmount, undervaluedPercent, daysOnMarket, mlsNumber, chatgptPriceAnalysis, isDisplayed, sourceProvider, source, createdAt, updatedAt }
    }

    const handleDownloadExcel = async () => {
        await exportAllPagesToCSV<any, UnderpriceCsvRow>({
            endpoint: '/admin/properties/under-priced/list',
            filename: 'underpriced-properties-all.csv',
            basePayload: {
                // Export all entries; omit is_displayed to include both panels
                search: '',
            },
            limitPerPage: 200,
            normalize: (r, idx) => normalizeUnderpriceForCsv(r, idx),
            columns: [
                { header: 'ID', key: 'id' },
                { header: 'Address', key: 'address' },
                { header: 'Street', key: 'street' },
                { header: 'Bed', key: 'bed' },
                { header: 'Bath', key: 'bath' },
                { header: 'City', key: 'city' },
                { header: 'State', key: 'state' },
                { header: 'Zip', key: 'zip' },
                { header: 'County', key: 'county' },
                { header: 'Latitude', key: 'latitude' },
                { header: 'Longitude', key: 'longitude' },
                { header: 'Price', key: 'price' },
                { header: 'Currency', key: 'currency' },
                { header: 'Estimated Value', key: 'estimatedValue' },
                { header: 'Undervalued Amount', key: 'undervaluedAmount' },
                { header: 'Undervalued %', key: 'undervaluedPercent' },
                { header: 'Bedrooms', key: 'bedrooms' },
                { header: 'Bathrooms', key: 'bathrooms' },
                { header: 'Square Feet', key: 'squareFeet' },
                { header: 'Lot Size', key: 'lotSize' },
                { header: 'Property Type', key: 'propertyType' },
                { header: 'Year Built', key: 'yearBuilt' },
                { header: 'Days on Market', key: 'daysOnMarket' },
                { header: 'MLS Number', key: 'mlsNumber' },
                { header: 'ChatGPT Price Analysis', key: 'chatgptPriceAnalysis' },
                { header: 'Is Displayed', key: 'isDisplayed' },
                { header: 'Source Provider', key: 'sourceProvider' },
                { header: 'Source', key: 'source' },
                { header: 'Created At', key: 'createdAt' },
                { header: 'Updated At', key: 'updatedAt' },
            ],
        })
    }

    const filteredLeftItems = leftPanelItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredRightItems = rightPanelItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen w-full">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                <h1 className="text-[#202224] font-nunito text-[24px] font-bold leading-none tracking-[-0.114px]">
                    Underprice Property
                </h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
                    <div className="relative bg-white rounded-[35px] w-full sm:w-auto">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search Users"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full sm:w-[253px] text-[#202224] font-normal text-[14px] leading-none font-nunit  rounded-[19px] border border-[#D5D5D5] bg-white"
                        />
                    </div>
                    <div className="flex flex-row gap-2 w-full sm:w-auto justify-end">
                    <Button variant="solid" size="sm" className="flex items-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF]" onClick={handleUploadClick} disabled={uploading}>
                        Upload File
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={handleFileChange} />
                    <Button variant="solid" size="sm" className="flex items-center text-white text-center font-nunito text-[12px] font-bold px-[16px] py-[11px] !rounded-[19px] !bg-[#4880FF]" onClick={handleDownloadExcel}>
                        Download
                        <DownloadIcon className="ml-2" size={16} />
                    </Button>
                    </div>
                </div>
            </div>

            {/* Dual Panel Selection Interface */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Panel */}
                <div className="flex-1">
                    <div className="bg-white rounded-[14px] h-[610px]">
                        <div className="rounded-t-[14px] border border-[#D5D5D5]/60 bg-[#F3F6FE] flex items-center justify-between mb-4 p-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    className="rounded-[4px] border border-[#D9D9D9] bg-white"
                                    style={{ width: '14px', height: '14px' }}
                                    checked={leftPanelItems.length > 0 && leftPanelItems.every(item => item.selected)}
                                    onChange={() => handleSelectAll('left')}
                                />
                                <span
                                    className="text-[#202224] font-nunito text-[14px] not-italic font-extrabold leading-none opacity-90 !ml-[16px] cursor-pointer"
                                    onClick={() => handleSelectAllText('left')}
                                >
                                    Select All
                                </span>
                            </div>
                            <div className="flex items-center space-x-4">
                                {(leftSelectAllClicked || (leftPanelItems.length > 0 && leftPanelItems.every(item => item.selected))) && (
                                    <button 
                                        onClick={() => handleClearAll('left')}
                                        className="text-[#4880FF] font-nunito text-[14px] not-italic font-extrabold leading-none opacity-90 "
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[32rem] overflow-y-auto">
                            {filteredLeftItems.map((item) => (
                                <div key={item.id} className="flex items-start space-x-3 px-[14px] py-[16px] rounded-lg hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        className="rounded-[4px] border border-[#D9D9D9] bg-white"
                                        style={{ width: '14px', height: '14px' }}
                                        checked={item.selected}
                                        onChange={() => handleItemSelect('left', item.id)}
                                    />
                                    <span className="text-[#202224] font-nunito text-[14px] not-italic font-semibold leading-none opacity-90">
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row md:flex-col justify-center space-y-0 md:space-y-4 space-x-4 md:space-x-0">
                <Button
                        variant="solid"
                        size="sm"
                        className="flex items-center justify-center text-white text-center font-nunito !text-[13px] font-bold px-4 py-3 !rounded-[19px] !bg-[#ef4444]"
                        onClick={handleBulkDelete}
                    >
                      Delete
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="flex items-center justify-between text-white text-center font-nunito !text-[13px] font-bold px-4 py-3 !rounded-[19px] !bg-[#4880FF]"
                        onClick={handleAdd}
                    >
                        Add
                        <AngleSmallLeftSvg className="ml-[20px] transform -rotate-90 md:rotate-0" size={16} />
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="flex items-center justify-between text-white text-center font-nunito !text-[13px] font-bold px-4 py-3 !rounded-[19px] !bg-[#4880FF]"
                        onClick={handleRemove}
                    >
                        <AngleSmallRightSvg className="mr-[10px] transform -rotate-90 md:rotate-0" size={16} />
                        Remove
                       
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="flex items-center justify-center text-white text-center font-nunito !text-[13px] font-bold px-4 py-3 !rounded-[19px] !bg-[#16a34a]"
                        onClick={handleSave}
                    >
                      Save
                       
                    </Button>
                </div>

                {/* Right Panel */}
                <div className="flex-1">
                <div className="bg-white rounded-[14px] h-[610px]">
                        <div className="rounded-t-[14px] border border-[#D5D5D5]/60 bg-[#F3F6FE] flex items-center justify-between mb-4 px-[14px] py-[15px]">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    className="rounded-[4px] border border-[#D9D9D9] bg-white"
                                    style={{ width: '14px', height: '14px' }}
                                    checked={rightPanelItems.length > 0 && rightPanelItems.every(item => item.selected)}
                                    onChange={() => handleSelectAll('right')}
                                />
                                <span className="text-[#202224] font-nunito text-[14px] not-italic font-extrabold leading-none opacity-90 !ml-[16px] cursor-pointer" onClick={() => handleSelectAllText('right')}>Select All</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                {(rightSelectAllClicked || (rightPanelItems.length > 0 && rightPanelItems.every(item => item.selected))) && (
                                    <button 
                                        onClick={() => handleClearAll('right')}
                                        className="text-[#4880FF] font-nunito text-[14px] not-italic font-extrabold leading-none opacity-90 "
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2 max-h-[32rem] overflow-y-auto">
                            {filteredRightItems.map((item) => (
                                <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        className="rounded-[4px] border border-[#D9D9D9] bg-white"
                                        style={{ width: '14px', height: '14px' }}
                                        checked={item.selected}
                                        onChange={() => handleItemSelect('right', item.id)}
                                    />
                                    <span className="text-[#202224] font-nunito text-[14px] not-italic font-semibold leading-none opacity-90">
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UnderpricePropertyManage 