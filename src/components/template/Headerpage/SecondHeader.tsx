import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { FormItem, FormContainer } from '@/components/ui/Form'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import Modal from 'react-modal'
import { SIDE_NAV_WIDTH } from '@/constants/theme.constant'
import { apiGetHeaderSettings, type HeaderSettings, type SettingItem } from '@/services/HeaderService'
import { useUploadFileMutation } from '@/store/slices/fileUpload/fileUploadApiSlice'
import { useUpdateHeaderSettingsMutation } from '@/store/slices/header'
import { toast, Notification } from '@/components/ui'

interface AccreditationLogo {
  id: string
  name: string
  file?: File
  visible: boolean
}

type SecondHeaderFormSchema = {
  companyLogo: string
  pageLink: string
  accreditationLogos: AccreditationLogo[]
  lifeGetsBetter: string
}

type LogoModalFormSchema = {
  logoName: string
  imageFile: string
}

const validationSchema = Yup.object().shape({
  companyLogo: Yup.string().required('Company logo is required'),
  pageLink: Yup.string().url('Please enter a valid URL'), // Made optional since no data
  accreditationLogos: Yup.array().min(1, 'At least one accreditation logo is required'),
  lifeGetsBetter: Yup.string().required('#LifeGetsBetter text is required'),
})

const logoModalValidationSchema = Yup.object().shape({
  logoName: Yup.string().required('Logo name is required'),
  imageFile: Yup.string().required('Image file is required'),
})

const SecondHeader = () => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [apiData, setApiData] = useState<any>(null)
  const [settingsData, setSettingsData] = useState<SettingItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLogo, setEditingLogo] = useState<AccreditationLogo | null>(null)
  
  // Upload mutation
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation()
  const [updateHeaderSettings, { isLoading: isUpdating }] = useUpdateHeaderSettingsMutation()
  const companyLogoFileRef = useRef<HTMLInputElement>(null)
  const logoFileRef = useRef<HTMLInputElement>(null)

  // Set app element for react-modal accessibility
  Modal.setAppElement('#root')

  // Fetch header settings using useEffect
  useEffect(() => {
    const fetchHeaderSettings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiGetHeaderSettings()
        console.log('SecondHeader API Response:', response)
        
        // Handle array response structure
        if (response.data) {
          const settingsArray = response.data.data || response.data
          
          // Store the raw settings data for update API
          setSettingsData(settingsArray)
          
          // If it's an array, map the settings by key
          if (Array.isArray(settingsArray)) {
            const settingsMap = settingsArray.reduce((acc: any, setting: any) => {
              acc[setting.setting_key] = setting.setting_value
              return acc
            }, {})
            
            console.log('SecondHeader Settings map:', settingsMap)
            setApiData(settingsMap)
          }
        }
      } catch (err) {
        console.error('Error fetching header settings:', err)
        setError('Failed to load header settings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeaderSettings()
  }, [])

  // Generate accreditation logos from API data
  const generateAccreditationLogos = (): AccreditationLogo[] => {
    if (!apiData) {
      return [
        { id: '1', name: 'JCI Accreditation Icon.png', visible: true },
        { id: '2', name: 'JCI Accreditation Icon.png', visible: true },
        { id: '3', name: 'JCI Accreditation Icon.png', visible: true },
        { id: '4', name: 'JCI Accreditation Icon.png', visible: true },
        { id: '5', name: 'JCI Accreditation Icon.png', visible: true },
      ]
    }

    const logos: AccreditationLogo[] = []
    
    // Add certifications
    const certificationKeys = ['certification_one', 'certification_two', 'certification_three', 'certification_four', 'certification_five', 'certification_six']
    
    certificationKeys.forEach(certKey => {
      if (apiData[certKey]) {
        logos.push({
          id: certKey,
          name: apiData[certKey].split('/').pop() || `${certKey}.png`,
          visible: true
        })
      }
    })

    console.log('Generated accreditation logos:', logos)
    return logos.length > 0 ? logos : [
      { id: '1', name: 'JCI Accreditation Icon.png', visible: true },
      { id: '2', name: 'JCI Accreditation Icon.png', visible: true },
      { id: '3', name: 'JCI Accreditation Icon.png', visible: true },
      { id: '4', name: 'JCI Accreditation Icon.png', visible: true },
      { id: '5', name: 'JCI Accreditation Icon.png', visible: true },
    ]
  }

  const initialValues: SecondHeaderFormSchema = {
    companyLogo: apiData?.site_logo ? apiData.site_logo.split('/').pop() || 'Main Logo.png' : 'Main Logo.png',
    pageLink: '', // No data for page link as mentioned
    accreditationLogos: generateAccreditationLogos(),
    lifeGetsBetter: apiData?.site_tagline || '#LifeGetsBetter'
  }

  const handleCompanyLogoUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setFieldValue('companyLogo', file.name)
      
      const result = await uploadFile({ file }).unwrap()
      
      if (result.status === 1) {
        toast.push(
          <Notification type="success" duration={2500} title="Upload Success">
            {result.message}
          </Notification>,
          { placement: 'top-end' }
        )
        
        // Update the company logo with the uploaded file path
        if (result.data?.filePath) {
          setFieldValue('companyLogo', result.data.filePath)
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'File upload failed'
      toast.push(
        <Notification type="danger" duration={3000} title="Upload Error">
          {errorMessage}
        </Notification>,
        { placement: 'top-end' }
      )
      
      // Reset the field value on error
      setFieldValue('companyLogo', '')
    }
  }

  const getLogoModalInitialValues = (): LogoModalFormSchema => {
    if (editingLogo) {
      return {
        logoName: editingLogo.name.split('/').pop() || editingLogo.name, // Extract filename from path
        imageFile: editingLogo.name // Keep the full path for the image file
      }
    }
    return {
      logoName: "New Accreditation Logo",
      imageFile: "New Accreditation Logo.png"
    }
  }

  const handleAddNewLogo = () => {
    setEditingLogo(null)
    setIsModalOpen(true)
  }

  const handleEditLogo = (logo: AccreditationLogo) => {
    setEditingLogo(logo)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingLogo(null)
  }

  const handleLogoModalSubmit = (values: LogoModalFormSchema, mainSetFieldValue: any, mainAccreditationLogos: AccreditationLogo[]) => {
    if (editingLogo) {
      // Update existing logo with new image file path
      const updatedLogos = mainAccreditationLogos.map(logo =>
        logo.id === editingLogo.id
          ? { 
              ...logo, 
              name: values.imageFile // Use the uploaded image file name instead of logo name
            }
          : logo
      )
      mainSetFieldValue('accreditationLogos', updatedLogos)
    } else {
      // Add new logo
      const newLogo: AccreditationLogo = {
        id: Date.now().toString(),
        name: values.imageFile, // Use the uploaded image file name
        visible: true
      }
      mainSetFieldValue('accreditationLogos', [...mainAccreditationLogos, newLogo])
    }
    setIsModalOpen(false)
    setEditingLogo(null)
  }

  const handleLogoFileUpload = async (setFieldValue: any, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setFieldValue('imageFile', file.name)
      
      const result = await uploadFile({ file }).unwrap()
      
      if (result.status === 1) {
        toast.push(
          <Notification type="success" duration={2500} title="Upload Success">
            {result.message}
          </Notification>,
          { placement: 'top-end' }
        )
        
        // Update the logo with the uploaded file path
        if (result.data?.filePath) {
          setFieldValue('imageFile', result.data.filePath)
        }
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'File upload failed'
      toast.push(
        <Notification type="danger" duration={3000} title="Upload Error">
          {errorMessage}
        </Notification>,
        { placement: 'top-end' }
      )
      
      // Reset the field value on error
      setFieldValue('imageFile', '')
    }
  }

  const handleToggleVisibility = (setFieldValue: any, accreditationLogos: AccreditationLogo[], id: string) => {
    const updatedLogos = accreditationLogos.map(logo => 
      logo.id === id ? { ...logo, visible: !logo.visible } : logo
    )
    setFieldValue('accreditationLogos', updatedLogos)
  }

  const handleDeleteLogo = (setFieldValue: any, accreditationLogos: AccreditationLogo[], id: string) => {
    const updatedLogos = accreditationLogos.filter(logo => logo.id !== id)
    setFieldValue('accreditationLogos', updatedLogos)
  }

  const onSubmit = async (values: SecondHeaderFormSchema) => {
    console.log('Second Header Form Values:', values)
    
    try {
      // Create the payload for the update API
      const updatePayload = {
        settings: [
          {
            id: settingsData.find(s => s.setting_key === 'site_logo')?.id || 0,
            setting_value:  `${values.companyLogo}`
          },
          {
            id: settingsData.find(s => s.setting_key === 'site_tagline')?.id || 0,
            setting_value: values.lifeGetsBetter
          }
        ]
      }

      // Add accreditation logos if they exist
      values.accreditationLogos.forEach((logo, index) => {
        const certKey = `certification_${['one', 'two', 'three', 'four', 'five', 'six'][index]}`
        const settingId = settingsData.find(s => s.setting_key === certKey)?.id
        if (settingId) {
          updatePayload.settings.push({
            id: settingId,
            setting_value: `${logo.name}`
          })
        }
      })

      console.log('Second Header Update payload:', updatePayload)
      
      const result = await updateHeaderSettings(updatePayload).unwrap()
      
      if (result.success) {
        toast.push(
          <Notification type="success" duration={2500} title="Update Success">
            {result.message}
          </Notification>,
          { placement: 'top-end' }
        )
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to update header settings'
      toast.push(
        <Notification type="danger" duration={3000} title="Update Error">
          {errorMessage}
        </Notification>,
        { placement: 'top-end' }
      )
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string, setFieldValue: any, accreditationLogos: AccreditationLogo[]) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    const newLogos = [...accreditationLogos]
    const draggedIndex = newLogos.findIndex(logo => logo.id === draggedItem)
    const targetIndex = newLogos.findIndex(logo => logo.id === targetId)

    // Remove dragged item and insert at target position
    const [draggedLogo] = newLogos.splice(draggedIndex, 1)
    newLogos.splice(targetIndex, 0, draggedLogo)

    setFieldValue('accreditationLogos', newLogos)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }


  return (
    <>
      <Card className="bg-gray-50 rounded-xl">
        <div className="px-2">
          <Formik
            key={apiData ? 'loaded' : 'loading'}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
          >
            {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                <Form>
                <FormContainer>
                  <p className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Second Header</p>
                  {/* Company Logo Section */}
                  <div className="mb-6">
                    <h3 className="text-[#495057] font-inter text-[14px] font-medium leading-normal mb-[8px]">Company Logo</h3>
                    <div className="flex w-full">
                      <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between rounded-[24px] border-[0.75px] border-[#CED4DA] mr-[20px]">
                        <div className="flex-1 mb-3 sm:mb-0">
                          <span className="text-gray-700 font-medium pl-4">{values.companyLogo}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <label className="cursor-pointer">
                            <input
                              ref={companyLogoFileRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleCompanyLogoUpload(setFieldValue, e)}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              loading={isUploading}
                              onClick={() => companyLogoFileRef.current?.click()}
                              className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[14px] font-medium leading-normal"
                            >
                              {isUploading ? 'Uploading...' : 'Upload File'}
                            </Button>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page Link Section */}
                  <div className="mb-6">
                    <FormItem
                      label="Page Link"
                      labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                      invalid={(errors.pageLink && touched.pageLink) as boolean}
                      errorMessage={errors.pageLink}
                    >
                      <Field
                        name="pageLink"
                        component={Input}
                        className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="No page link data available"
                      />
                    </FormItem>
                  </div>

                  {/* Accreditations Logos Section */}
                  <div className="mb-6 rounded-[24px] border-[0.75px] border-[#CED4DA] p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between !items-baseline mb-4 border-b border-[#CED4DA]">
                      <h3 className="text-[#495057] font-inter text-[14px] font-semibold leading-normal mb-[20px]">Accreditations Logos</h3>
                      <Button
                        type="button"
                        onClick={handleAddNewLogo}
                        className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white text-center font-inter text-[14px] font-medium leading-normal !px-4 !py-1"
                      >
                        Add New Logo
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {values.accreditationLogos.map((logo) => (
                        <div
                          key={logo.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, logo.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, logo.id, setFieldValue, values.accreditationLogos)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between transition-all duration-200 ${
                            draggedItem === logo.id ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="cursor-move text-gray-400 hover:text-gray-600">
                              <img src="/img/images/grip-dots.svg" alt="grip-dots" className="w-5 h-5" />
                            </div>
                            <span className="text-gray-700 font-medium">{logo.name.split('/').pop() || logo.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditLogo(logo)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <img src="/img/images/Edittable.svg" alt="edit" className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(setFieldValue, values.accreditationLogos, logo.id)}
                              className={`p-1 transition-colors ${
                                logo.visible 
                                  ? 'text-gray-400 hover:text-green-600' 
                                  : 'text-gray-300 hover:text-green-600'
                              }`}
                            >
                              <img src="/img/images/viewtable.svg" alt="view" className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLogo(setFieldValue, values.accreditationLogos, logo.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <img src="/img/images/deatetable.svg" alt="delete" className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* #LifeGetsBetter Section */}
                  <div className="mb-6">
                    <FormItem
                      label="Text Logo"
                      labelClass="text-[#495057] font-inter text-[14px] font-medium leading-normal"
                      invalid={(errors.lifeGetsBetter && touched.lifeGetsBetter) as boolean}
                      errorMessage={errors.lifeGetsBetter}
                    >
                      <Field
                        name="lifeGetsBetter"
                        component={Input}
                        className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Enter #LifeGetsBetter text"
                      />
                    </FormItem>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      loading={isSubmitting || isUpdating}
                      className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white px-4 py-2 font-medium transition-all duration-200"
                    >
                      {(isSubmitting || isUpdating) ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </FormContainer>

                {/* Logo Modal */}
                <Modal
                  isOpen={isModalOpen}
                  onRequestClose={handleModalClose}
                  contentLabel="Accreditation Logo Modal"
                  className="modal-content"
                  overlayClassName="modal-overlay"
                  style={{
                    content: {
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: window.innerWidth >= 1024 ? '60%' : '95%',
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      borderRadius: '32px',
                      border: 'none',
                      padding: 0,
                      backgroundColor: 'white',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      overflow: 'auto',
                      margin: window.innerWidth >= 1024 ? `0 0 0 ${SIDE_NAV_WIDTH / 2}px` : '0'
                    },
                    overlay: {
                      position: 'fixed',
                      top: 0,
                      left: window.innerWidth >= 1024 ? `${SIDE_NAV_WIDTH}px` : '0',
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      zIndex: 50
                    }
                  }}
                >
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-center relative mb-4 sm:mb-6">
                      <h3 className="text-[#495057] font-inter text-[14px] sm:text-[16px] md:text-[18px] font-semibold leading-normal flex-1 pr-8">
                        {editingLogo ? 'Edit Accreditation Logo' : 'Add New Accreditation Logo'}
                      </h3>
                      <button
                        type="button"
                        onClick={handleModalClose}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <Formik
                      key={editingLogo?.id || 'new'}
                      initialValues={getLogoModalInitialValues()}
                      validationSchema={logoModalValidationSchema}
                      onSubmit={(modalValues) => handleLogoModalSubmit(modalValues, setFieldValue, values.accreditationLogos)}
                    >
                      {({ values: modalValues, setFieldValue: modalSetFieldValue, touched, errors, isSubmitting }) => (
                        <Form>
                          <FormContainer>
                            <div className="space-y-4 sm:space-y-6">
                              <FormItem
                                label="Logo Name"
                                labelClass="text-[#495057] font-inter text-[12px] sm:text-[14px] font-medium leading-normal"
                                invalid={(errors.logoName && touched.logoName) as boolean}
                                errorMessage={errors.logoName}
                              >
                                <Field
                                  name="logoName"
                                  component={Input}
                                  className="w-full !rounded-[24px] border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-[12px] sm:text-[14px]"
                                  placeholder="Enter logo name"
                                />
                              </FormItem>

                              <FormItem
                                label="Image File"
                                labelClass="text-[#495057] font-inter text-[12px] sm:text-[14px] font-medium leading-normal"
                                invalid={(errors.imageFile && touched.imageFile) as boolean}
                                errorMessage={errors.imageFile}
                              >
                                <div className="w-full">
                                  <div className="flex flex-col w-full rounded-[24px] border-[0.75px] border-[#CED4DA] p-2 sm:p-3">
                                    <div className="flex-1 mb-2">
                                      <span className="text-gray-700 font-medium text-[12px] sm:text-[14px] break-all">{modalValues.imageFile}</span>
                                    </div>
                                    <div className="flex justify-end">
                                      <label className="cursor-pointer">
                                        <input
                                          ref={logoFileRef}
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleLogoFileUpload(modalSetFieldValue, e)}
                                          className="hidden"
                                        />
                                        <Button
                                          type="button"
                                          loading={isUploading}
                                          onClick={() => logoFileRef.current?.click()}
                                          className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[12px] sm:text-[14px] font-medium leading-normal !px-3 !py-1 sm:!px-4"
                                        >
                                          {isUploading ? 'Uploading...' : 'Upload File'}
                                        </Button>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </FormItem>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
                              <Button
                                type="button"
                                onClick={handleModalClose}
                                className="!bg-[#C5C5C5] !text-[#495057] !rounded-[24px] font-inter text-[12px] sm:text-[14px] font-medium leading-normal !px-3 !py-2 sm:!px-4 w-full sm:w-auto order-2 sm:order-1"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                loading={isSubmitting}
                                className="!rounded-[24px] bg-[linear-gradient(267deg,#00ADEF_-49.54%,#D60F8C_110.23%)] text-white !px-3 !py-2 sm:!px-4 font-medium transition-all duration-200 text-[12px] sm:text-[14px] w-full sm:w-auto order-1 sm:order-2"
                              >
                                {isSubmitting ? (editingLogo ? 'Updating...' : 'Adding...') : (editingLogo ? 'Update' : 'Add')}
                              </Button>
                            </div>
                          </FormContainer>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </Modal>
              </Form>
            )}
          </Formik>
        </div>
      </Card>
    </>
  )
}

export default SecondHeader



