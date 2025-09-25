import { Card } from '@/components/ui'

const OurSpecialties = () => {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h3>Our Specialties</h3>
            </div>
            <Card>
                <div className="p-6">
                    <h4 className="mb-4">Our Specialties Content</h4>
                    <p>Manage our specialties content here.</p>
                </div>
            </Card>
        </div>
    )
}

export default OurSpecialties
