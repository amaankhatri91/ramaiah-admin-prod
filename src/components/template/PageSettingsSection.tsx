import { Card, Input, Button, Select } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { toast, Notification } from '@/components/ui'

type PageSettingsFormSchema = {
    pageType: string
    pageName: string
    seoTitle: string
    seoKeyword: string
    seoDescription: string
}

const validationSchema = Yup.object().shape({
    pageType: Yup.string().required('Page type is required'),
    pageName: Yup.string().required('Page name is required'),
    seoTitle: Yup.string().required('SEO title is required'),
    seoKeyword: Yup.string().required('SEO keyword is required'),
    seoDescription: Yup.string().required('SEO description is required'),
})

const pageTypeOptions = [
    { value: 'home', label: 'Home' },
    { value: 'about', label: 'About' },
    { value: 'services', label: 'Services' },
    { value: 'contact', label: 'Contact' },
    { value: 'blog', label: 'Blog' },
    { value: 'custom', label: 'Custom' },
]

const PageSettingsSection = () => {
    const getInitialValues = (): PageSettingsFormSchema => {
        return {
            pageType: '',
            pageName: '',
            seoTitle: '',
            seoKeyword: '',
            seoDescription: '',
        }
    }

    const onSubmit = async (values: PageSettingsFormSchema) => {
        try {
            // TODO: Implement API call to save page settings
            console.log('Page settings to save:', values)
            
            toast.push(
                <Notification type="success" duration={2500} title="Success">
                    Page settings saved successfully
                </Notification>,
                { placement: 'top-end' }
            )
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || 'Failed to save page settings'
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
                <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">
                    Page Settings
                </p>

                <Formik
                    initialValues={getInitialValues()}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                        <Form>
                            <FormContainer>
                                {/* Page Type Dropdown */}
                                <div className="mb-6">
                                    <FormItem
                                        label="Page Type"
                                        labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                        invalid={(errors.pageType && touched.pageType) as boolean}
                                        errorMessage={errors.pageType}
                                    >
                                        <Field name="pageType">
                                            {({ field, form }: any) => (
                                                <Select
                                                    {...field}
                                                    options={pageTypeOptions}
                                                    className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                    placeholder="Select page type"
                                                    onChange={(option: any) => {
                                                        form.setFieldValue('pageType', option?.value || '')
                                                    }}
                                                    value={pageTypeOptions.find(option => option.value === field.value)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Slug - Page Name */}
                                <div className="mb-6">
                                    <FormItem
                                        label="Slug - Page Name"
                                        labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                        invalid={(errors.pageName && touched.pageName) as boolean}
                                        errorMessage={errors.pageName}
                                    >
                                        <Field
                                            name="pageName"
                                            component={Input}
                                            className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                            placeholder="Enter page name"
                                        />
                                    </FormItem>
                                </div>

                                {/* SEO Section */}
                                <div className="mb-6">
                                    <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-4">
                                        SEO Section
                                    </h3>

                                    <div className="space-y-4">
                                        {/* SEO Title */}
                                        <FormItem
                                            label="SEO Title"
                                            labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                            invalid={(errors.seoTitle && touched.seoTitle) as boolean}
                                            errorMessage={errors.seoTitle}
                                        >
                                            <Field
                                                name="seoTitle"
                                                component={Input}
                                                className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                placeholder="Enter SEO title"
                                            />
                                        </FormItem>

                                        {/* SEO Keyword */}
                                        <FormItem
                                            label="SEO Keyword"
                                            labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                            invalid={(errors.seoKeyword && touched.seoKeyword) as boolean}
                                            errorMessage={errors.seoKeyword}
                                        >
                                            <Field
                                                name="seoKeyword"
                                                component={Input}
                                                className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                placeholder="Enter SEO keyword"
                                            />
                                        </FormItem>

                                        {/* SEO Description */}
                                        <FormItem
                                            label="SEO Description"
                                            labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                                            invalid={(errors.seoDescription && touched.seoDescription) as boolean}
                                            errorMessage={errors.seoDescription}
                                        >
                                            <Field
                                                name="seoDescription"
                                                component={Input}
                                                textArea
                                                className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                                placeholder="Enter SEO description"
                                            />
                                        </FormItem>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </div>
        </Card>
    )
}

export default PageSettingsSection

