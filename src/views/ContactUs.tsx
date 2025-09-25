import { Card } from '@/components/ui'

const ContactUs = () => {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3>Contact Us</h3>
            </div>
            <Card>
                <div className="p-6">
                    <h4 className="mb-4">Contact Information</h4>
                    <p>Manage contact information and inquiries here.</p>
                </div>
            </Card>
        </div>
    )
}

export default ContactUs
