import { useGetHomeDataQuery } from '@/store/slices/home'
import { parseOurJourneySection } from '@/services/HomeService'
const OurJourneyDisplay = () => {
    const { data: homeData, isLoading, error } = useGetHomeDataQuery()
    if (isLoading) {
        return <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading our journey content...</div>
        </div>
    }
    if (error) {
        return <div className="flex justify-center items-center py-8">
            <div className="text-red-500">Error loading our journey content</div>
        </div>
    }
    if (!homeData?.data) {
        return null
    }
    const journeyData = parseOurJourneySection(homeData.data)
    return (
        <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    {journeyData.headerText || 'Our Journey'}
                </h2>
                {/* Content - Render HTML properly */}
                <div
                    className="text-gray-700 leading-relaxed text-lg"
                    dangerouslySetInnerHTML={{ __html: journeyData.content }}
                />
                {/* Image if available */}
                {journeyData.uploadFile && (
                    <div className="mt-8 text-center">
                        <img
                            src={`/uploads/${journeyData.uploadFile}`}
                            alt="Our Journey"
                            className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
export default OurJourneyDisplay