import HeroSection from '@/components/template/HeroSection'
import QuickLinksSection from '@/components/template/QuickLinksSection'
import MiddleSection from '@/components/template/MiddleSection'
import DoctorSpeakSection from '@/components/template/DoctorSpeakSection'
import PatientSpeakSection from '@/components/template/PatientSpeakSection'
import OurStorySection from '@/components/template/OurStorySection'
import OurJourneySection from '@/components/template/OurJourneySection'
import AccreditationsSection from '@/components/template/AccreditationsSection'
import SpecialistSection from '@/components/template/SpecialistSection'

const Home = () => {

    return (
        <div className="flex flex-col gap-4">
            <HeroSection />
            <QuickLinksSection />
            {/* <SpecialistSection /> */}
            <DoctorSpeakSection />
            <PatientSpeakSection />
            <OurStorySection />
            <AccreditationsSection />
            <MiddleSection sectionId={6} />
            <OurJourneySection />
        </div>
    )
}

export default Home
