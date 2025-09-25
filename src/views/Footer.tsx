import { Card } from '@/components/ui'

const Footer = () => {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3>Footer Management</h3>
            </div>
            <Card>
                <div className="p-6">
                    <h4 className="mb-4">Footer Configuration</h4>
                    <p>Manage footer content and settings here.</p>
                </div>
            </Card>
        </div>
    )
}

export default Footer
