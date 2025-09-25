import { Card } from '@/components/ui'

const WhatsNew = () => {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3>What's New</h3>
            </div>
            <Card>
                <div className="p-6">
                    <h4 className="mb-4">Latest News and Updates</h4>
                    <p>Manage news, updates, and announcements here.</p>
                </div>
            </Card>
        </div>
    )
}

export default WhatsNew
