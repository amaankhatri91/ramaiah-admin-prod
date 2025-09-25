import { Card } from '@/components/ui'

const InternationalPatient = () => {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3>International Patient</h3>
            </div>
            <Card>
                <div className="p-6">
                    <h4 className="mb-4">International Patient Services</h4>
                    <p>Manage international patient services content here.</p>
                </div>
            </Card>
        </div>
    )
}

export default InternationalPatient
