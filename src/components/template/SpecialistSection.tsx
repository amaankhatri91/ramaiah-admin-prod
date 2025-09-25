import { Card, Input, Button } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { useGetHomeDataQuery, useUpdateHomeDataMutation } from '@/store/slices/home'
import { toast, Notification } from '@/components/ui'

interface Speciality {
    id: string
    name: string
}

type SpecialistFormSchema = {
    specialityHeaderText: string
    specialistHeaderText: string
    specialities: Speciality[]
    specialists: Speciality[]
    specialityButtonText: string
    specialistButtonText: string
    specialityButtonLink: string
    specialistButtonLink: string
}

const validationSchema = Yup.object().shape({
    specialityHeaderText: Yup.string().required('Speciality header text is required'),
    specialistHeaderText: Yup.string().required('Specialist header text is required'),
    specialities: Yup.array().min(1, 'At least one speciality is required'),
    specialists: Yup.array().min(1, 'At least one specialist is required'),
    specialityButtonText: Yup.string().required('Speciality button text is required'),
    specialistButtonText: Yup.string().required('Specialist button text is required'),
    specialityButtonLink: Yup.string().url('Please enter a valid URL').required('Speciality button link is required'),
    specialistButtonLink: Yup.string().url('Please enter a valid URL').required('Specialist button link is required'),
})

const SpecialistSection = () => {
    const [updateHomeData, { isLoading: isUpdating }] = useUpdateHomeDataMutation()
    const { data: homeData, isLoading: isLoadingData, error } = useGetHomeDataQuery()

    const getInitialValues = (): SpecialistFormSchema => {
        const specialistData = homeData?.data?.specialistSection
        return {
            specialityHeaderText: specialistData?.specialityHeaderText || "Choose Speciality",
            specialistHeaderText: specialistData?.specialistHeaderText || "Choose Specialist",
            specialities: specialistData?.specialities || [
                { id: '1', name: 'Anastasiya' },
                { id: '2', name: 'Anastasiya' }
            ],
            specialists: specialistData?.specialists || [
                { id: '1', name: 'Choose Speciality' },
                { id: '2', name: 'Dr. Smith' }
            ],
            specialityButtonText: specialistData?.specialityButtonText || "Book Appointment",
            specialistButtonText: specialistData?.specialistButtonText || "Book Appointment",
            specialityButtonLink: specialistData?.specialityButtonLink || "https://www.somepagelink.com",
            specialistButtonLink: specialistData?.specialistButtonLink || "https://www.somepagelink.com"
        }
    }

    const handleSpecialityChange = (setFieldValue: any, specialities: Speciality[], id: string, value: string) => {
        const updatedSpecialities = specialities.map(speciality => 
            speciality.id === id ? { ...speciality, name: value } : speciality
        )
        setFieldValue('specialities', updatedSpecialities)
    }

    const handleDeleteSpeciality = (setFieldValue: any, specialities: Speciality[], id: string) => {
        setFieldValue('specialities', specialities.filter(speciality => speciality.id !== id))
    }

    const handleAddSpeciality = (setFieldValue: any, specialities: Speciality[]) => {
        const newSpeciality: Speciality = {
            id: Date.now().toString(),
            name: 'New Speciality'
        }
        setFieldValue('specialities', [...specialities, newSpeciality])
    }

    const handleSpecialistChange = (setFieldValue: any, specialists: Speciality[], id: string, value: string) => {
        const updatedSpecialists = specialists.map(specialist => 
            specialist.id === id ? { ...specialist, name: value } : specialist
        )
        setFieldValue('specialists', updatedSpecialists)
    }

    const handleDeleteSpecialist = (setFieldValue: any, specialists: Speciality[], id: string) => {
        setFieldValue('specialists', specialists.filter(specialist => specialist.id !== id))
    }

    const handleAddSpecialist = (setFieldValue: any, specialists: Speciality[]) => {
        const newSpecialist: Speciality = {
            id: Date.now().toString(),
            name: 'New Specialist'
        }
        setFieldValue('specialists', [...specialists, newSpecialist])
    }

    const onSubmit = async (values: SpecialistFormSchema) => {
        try {
            const result = await updateHomeData({
                specialistSection: values
            }).unwrap()
            
            if (result.success) {
                toast.push(
                    <Notification type="success" duration={2500} title="Success">
                        {result.message}
                    </Notification>,
                    { placement: 'top-end' }
                )
            } else {
                throw new Error(result.message)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to update specialist section'
            toast.push(
                <Notification type="danger" duration={3000} title="Error">
                    {errorMessage}
                </Notification>,
                { placement: 'top-end' }
            )
        }
    }

    return (
        <Card className="bg-gray-50 rounded-xl">
            <div className="px-2">
                <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Specialist Section</p>
                
                {isLoadingData ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading specialist section data...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-red-500">Error loading specialist section data</div>
                    </div>
                ) : (
                    <Formik
                        initialValues={getInitialValues()}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                        enableReinitialize={true}
                    >
                    {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                        <Form>
                            <FormContainer>
                                {/* First Section */}
                                <div className="">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Column - Speciality Header */}
                                        <div>
                                            <FormItem
                                                label="Header Text"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.specialityHeaderText && touched.specialityHeaderText) as boolean}
                                                errorMessage={errors.specialityHeaderText}
                                            >
                                                <Field
                                                    name="specialityHeaderText"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter header text"
                                                />
                                            </FormItem>
                                        </div>

                                        {/* Right Column - Specialist Header */}
                                        <div>
                                            <FormItem
                                                label="Header Text"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.specialistHeaderText && touched.specialistHeaderText) as boolean}
                                                errorMessage={errors.specialistHeaderText}
                                            >
                                                <Field
                                                    name="specialistHeaderText"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter header text"
                                                />
                                            </FormItem>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Column - Select Specialities */}
                                        <div>
                                            <label className="block text-[#495057] font-inter text-[14px] font-medium leading-normal mb-2">
                                                Select Specialities
                                            </label>
                                            <div className={`space-y-3 ${values.specialities.length > 3 ? 'max-h-[180px] overflow-y-auto pr-2' : ''}`}>
                                                {values.specialities.map((speciality, index) => (
                                                    <div key={speciality.id} className="flex items-center gap-3">
                                                        <Input
                                                            value={speciality.name}
                                                            onChange={(e) => handleSpecialityChange(setFieldValue, values.specialities, speciality.id, e.target.value)}
                                                            className="flex-1 !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                            placeholder="Enter speciality name"
                                                        />
                                                        {index === 0 ? (
                                                            // First field - only show plus icon, no delete
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddSpeciality(setFieldValue, values.specialities)}
                                                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                            >
                                                                <FaPlus className="w-5 h-5" />
                                                            </button>
                                                        ) : (
                                                            // Additional fields - only show delete icon
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSpeciality(setFieldValue, values.specialities, speciality.id)}
                                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                            >
                                                                <img src="/img/images/deatetable.svg" alt="delete" className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Column - Select Specialist */}
                                        <div>
                                            <label className="block text-[#495057] font-inter text-[14px] font-medium leading-normal mb-2">
                                                Select Specialist
                                            </label>
                                            <div className={`space-y-3 ${values.specialists.length > 3 ? 'max-h-[180px] overflow-y-auto pr-2' : ''}`}>
                                                {values.specialists.map((specialist, index) => (
                                                    <div key={specialist.id} className="flex items-center gap-3">
                                                        <Input
                                                            value={specialist.name}
                                                            onChange={(e) => handleSpecialistChange(setFieldValue, values.specialists, specialist.id, e.target.value)}
                                                            className="flex-1 !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                            placeholder="Enter specialist name"
                                                        />
                                                        {index === 0 ? (
                                                            // First field - only show plus icon, no delete
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddSpecialist(setFieldValue, values.specialists)}
                                                                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                            >
                                                                <FaPlus className="w-5 h-5" />
                                                            </button>
                                                        ) : (
                                                            // Additional fields - only show delete icon
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSpecialist(setFieldValue, values.specialists, specialist.id)}
                                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                            >
                                                                <img src="/img/images/deatetable.svg" alt="delete" className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Border Separator */}
                                <div className="border-t border-gray-300 my-8"></div>

                                {/* Second Section */}
                                <div className="">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Column - Button Text */}
                                        <div>
                                            <FormItem
                                                label="Button Text"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.specialityButtonText && touched.specialityButtonText) as boolean}
                                                errorMessage={errors.specialityButtonText}
                                            >
                                                <Field
                                                    name="specialityButtonText"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter button text"
                                                />
                                            </FormItem>
                                        </div>

                                        {/* Right Column - Button Link */}
                                        <div>
                                            <FormItem
                                                label="Button Link"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.specialityButtonLink && touched.specialityButtonLink) as boolean}
                                                errorMessage={errors.specialityButtonLink}
                                            >
                                                <Field
                                                    name="specialityButtonLink"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter button link"
                                                />
                                            </FormItem>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Left Column - Button Text (Second) */}
                                        <div>
                                            <FormItem
                                                label="Button Text"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.specialistButtonText && touched.specialistButtonText) as boolean}
                                                errorMessage={errors.specialistButtonText}
                                            >
                                                <Field
                                                    name="specialistButtonText"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter button text"
                                                />
                                            </FormItem>
                                        </div>

                                        {/* Right Column - Button Link (Second) */}
                                        <div>
                                            <FormItem
                                                label="Button Link"
                                                labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                                invalid={(errors.specialistButtonLink && touched.specialistButtonLink) as boolean}
                                                errorMessage={errors.specialistButtonLink}
                                            >
                                                <Field
                                                    name="specialistButtonLink"
                                                    component={Input}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Enter button link"
                                                />
                                            </FormItem>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <Button 
                                        type="submit"
                                        loading={isSubmitting || isUpdating}
                                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                                    >
                                        {isSubmitting || isUpdating ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                    </Formik>
                )}
            </div>
        </Card>
    )
}

export default SpecialistSection
