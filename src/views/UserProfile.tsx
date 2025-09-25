import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import Select from '@/components/ui/Select'
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import ApiService from '@/services/ApiService'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { useAppSelector } from '@/store'

const UserProfile = () => {
    // const [userDetails, setUserDetails] = useState({
    //     firstName: '',
    //     lastName: '',
    //     phone: '',
    //     email: '',
    //     active: true,
    // })

    // const [passwordDetails, setPasswordDetails] = useState({
    //     currentPassword: '',
    //     newPassword: '',
    //     confirmPassword: ''
    // })

    // const [profileImage, setProfileImage] = useState<string | null>(null)
    // const fileInputRef = React.useRef<HTMLInputElement>(null)
    // const token = useAppSelector((state) => state.auth.session.signedIn ? state.auth.session.token : null)
    // const authUser = useAppSelector((state) => state.auth.user)

    // const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    // const [showNewPassword, setShowNewPassword] = useState(false)
    // const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    // const [isSavingPassword, setIsSavingPassword] = useState(false)

    // const activeOptions = [
    //     { value: true, label: 'True' },
    //     { value: false, label: 'False' },
    // ]

    // React.useEffect(() => {
    //     setUserDetails((prev) => ({
    //         ...prev,
    //         email: authUser?.email || prev.email,
    //         firstName: (authUser as any)?.first_name || prev.firstName,
    //         lastName: (authUser as any)?.last_name || prev.lastName,
    //         phone: (authUser as any)?.phone || prev.phone,
    //     }))
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [authUser])

    // const handleUserDetailsChange = (field: string, value: string | boolean) => {
    //     setUserDetails(prev => ({
    //         ...prev,
    //         [field]: value
    //     }))
    // }

    // const handlePasswordChange = (field: string, value: string) => {
    //     setPasswordDetails(prev => ({
    //         ...prev,
    //         [field]: value
    //     }))
    // }

    // const handleSaveUserDetails = async () => {
    //     const userIdRaw = (authUser as any)?.id
    //     const user_id = typeof userIdRaw === 'string' || typeof userIdRaw === 'number' ? userIdRaw : undefined

    //     if (!user_id) {
    //         toast.push(
    //             <Notification type="danger" duration={2500} title="Error">
    //                 Missing user id. Please sign in again.
    //             </Notification>,
    //             { placement: 'top-end' }
    //         )
    //         return
    //     }

    //     try {
    //         const payload = {
    //             email: userDetails.email,
    //             first_name: userDetails.firstName,
    //             last_name: userDetails.lastName,
    //             phone: userDetails.phone,
    //             status: userDetails.active,
    //             user_id,
    //         }

    //         const res = await ApiService.fetchData<any, typeof payload>({
    //             url: '/admin/users/edit',
    //             method: 'post',
    //             data: payload,
    //         })

    //         const message = (res.data?.message || res.data?.msg || 'Profile updated successfully') as string
    //         toast.push(
    //             <Notification type="success" duration={2500} title="Success">
    //                 {message}
    //             </Notification>,
    //             { placement: 'top-end' }
    //         )
    //     } catch (e: any) {
    //         const errMsg = e?.response?.data?.message || e?.message || 'Failed to update profile'
    //         toast.push(
    //             <Notification type="danger" duration={3000} title="Error">
    //                 {errMsg}
    //             </Notification>,
    //             { placement: 'top-end' }
    //         )
    //     }
    // }

    // const handleSavePassword = async () => {
    //     const { newPassword, confirmPassword } = passwordDetails

    //     if (!newPassword || !confirmPassword) {
    //         toast.push(
    //             <Notification type="danger" duration={2500} title="Error">
    //                 Please enter and confirm your new password
    //             </Notification>,
    //             { placement: 'top-end' }
    //         )
    //         return
    //     }

    //     if (newPassword !== confirmPassword) {
    //         toast.push(
    //             <Notification type="danger" duration={2500} title="Error">
    //                 Passwords do not match
    //             </Notification>,
    //             { placement: 'top-end' }
    //         )
    //         return
    //     }

    //     if (!token) {
    //         toast.push(
    //             <Notification type="danger" duration={2500} title="Error">
    //                 Missing auth token. Please sign in again.
    //             </Notification>,
    //             { placement: 'top-end' }
    //         )
    //         return
    //     }

    //     try {
    //         setIsSavingPassword(true)
    //         const res = await ApiService.fetchData<any, { password: string; confirmPassword: string }>({
    //             url: `/v1/auth/reset-password/${token}`,
    //             method: 'post',
    //             data: { password: newPassword, confirmPassword },
    //         })

    //         const body = res.data as any
    //         const message = body?.message || body?.msg || 'Password updated successfully'

    //         toast.push(
    //             <Notification type="success" duration={2500} title="Success">
    //                 {message}
    //             </Notification>,
    //             { placement: 'top-end' }
    //         )

    //         setPasswordDetails({ currentPassword: '', newPassword: '', confirmPassword: '' })
    //     } catch (err: any) {
    //         const msg = err?.response?.data?.message || err?.response?.data?.msg || err?.message || 'Failed to update password'
    //         toast.push(
    //             <Notification type="danger" duration={2500} title="Error">
    //                 {msg}
    //             </Notification>,
    //             { placement: 'top-end' }
    //         )
    //     } finally {
    //         setIsSavingPassword(false)
    //     }
    // }

    // const handleCancel = () => {
    //     // Handle cancel logic
    //     console.log('Canceling changes')
    // }

    // const handleUploadClick = () => {
    //     fileInputRef.current?.click()
    // }

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0]
    //     if (file) {
    //         const reader = new FileReader()
    //         reader.onloadend = () => {
    //             setProfileImage(reader.result as string)
    //         }
    //         reader.readAsDataURL(file)
    //     }
    // }

    return (
        <>
        
        </>
        // <div className="min-h-screen">
        //     <div className="max-w-4xl  space-y-6">
        //         {/* User Details Card */}
        //         <Card className="bg-white rounded-[24px] border-none">
        //             <div className="">
        //                 <h2 className="text-[#4B5674] font-nunito text-[17px] not-italic font-bold leading-none mb-[18px]">
        //                     User Details
        //                 </h2>

        //                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        //                     {/* Left Column - Input Fields */}
        //                     <div className="space-y-4">
        //                         <div>
        //                             <label className="text-[#2E3A59] font-nunito text-base not-italic font-medium leading-none">
        //                             First Name <span className="text-red-500">*</span>
        //                             </label>
        //                             <Input
        //                                 placeholder="Enter your first name"
        //                                 value={userDetails.firstName}
        //                                 onChange={(e) => handleUserDetailsChange('firstName', e.target.value)}
        //                                 className="w-full mt-[4px] rounded-[10px] border border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)] text-[#727272] font-nunito text-[12px] font-medium focus:ring-[#2779FF] focus:border-[#2779FF]"
        //                             />
        //                         </div>
        //                         <div>
        //                             <label className="text-[#2E3A59] font-nunito text-base not-italic font-medium leading-none">
        //                             Last Name <span className="text-red-500">*</span>
        //                             </label>
        //                             <Input
        //                                 placeholder="Enter your last name"
        //                                 value={userDetails.lastName}
        //                                 onChange={(e) => handleUserDetailsChange('lastName', e.target.value)}
        //                                 className="w-full mt-[4px] rounded-[10px] border border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)] text-[#727272] font-nunito text-[12px] font-medium focus:ring-[#2779FF] focus:border-[#2779FF]"
        //                             />
        //                         </div>

        //                         <div>
        //                             <label className="text-[#2E3A59] font-nunito text-base not-italic font-medium leading-none">
        //                             Phone <span className="text-red-500">*</span>
        //                             </label>
        //                             <Input
        //                                 placeholder="Enter your phone number"
        //                                 value={userDetails.phone}
        //                                 onChange={(e) => handleUserDetailsChange('phone', e.target.value)}
        //                                 className="w-full mt-[4px] rounded-[10px] border border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)] text-[#727272] font-nunito text-[12px] font-medium focus:ring-[#2779FF] focus:border-[#2779FF]"
        //                             />
        //                         </div>

        //                         <div>
        //                             <label className="text-[#2E3A59] font-nunito text-base not-italic font-medium leading-none">
        //                                 Email Address <span className="text-red-500">*</span>
        //                             </label>
        //                             <Input
        //                                 placeholder="Enter your email address"
        //                                 value={userDetails.email}
        //                                 onChange={(e) => handleUserDetailsChange('email', e.target.value)}
        //                                 disabled
        //                                 className="w-full mt-[4px] rounded-[10px] border border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)] text-[#727272] font-nunito text-[12px] font-medium focus:ring-[#2779FF] focus:border-[#2779FF]"
        //                             />
        //                         </div>

        //                         <div>
        //                             <label className="text-[#2E3A59] font-nunito text-base not-italic font-medium leading-none">
        //                                 Active
        //                             </label>
        //                             <Select
        //                                 className="w-full mt-[4px]"
        //                                 options={activeOptions}
        //                                 value={activeOptions.find(o => o.value === userDetails.active)}
        //                                 onChange={(opt) => handleUserDetailsChange('active', (opt as { value: boolean } | null)?.value ?? true)}
        //                             />
        //                         </div>
        //                     </div>

        //                     {/* Right Column - Profile Image */}
        //                     <div className="space-y-4">
        //                         <div>
        //                             <label className="text-[#2E3A59] flex justify-center font-inter text-base font-medium">
        //                                 Profile Image <span className="text-red-500">*</span>
        //                             </label>
        //                             <div className="flex justify-center space-y-4 mt-[6px]">
        //                                 <div>
        //                                     <Avatar
        //                                         size={120}
        //                                         shape="circle"
        //                                         src={profileImage || "/img/images/userproifelepageprofile.svg"}
        //                                         className="bg-gray-200"
        //                                     />
        //                                 </div>
        //                                 {/* <div className='ml-[12px]'>
        //                                     <Button
        //                                         variant="solid"
        //                                         size="sm"
        //                                         className="hover:bg-[#ffffff] active:bg-[#ffffff] !text-[#727272] font-inter text-[10px] not-italic font-normal leading-none border border-[#E3E3E3] !rounded-[24px] !bg-white"
        //                                         onClick={handleUploadClick}
        //                                     >
        //                                         Upload New Photo
        //                                     </Button>
        //                                     <input
        //                                         type="file"
        //                                         accept="image/png, image/jpeg"
        //                                         style={{ display: 'none' }}
        //                                         ref={fileInputRef}
        //                                         onChange={handleFileChange}
        //                                     />
        //                                     <p className="text-[#F76161] font-inter text-[12px] not-italic font-semibold leading-[1rem] mt-[6px]">
        //                                         NOTE: <span className='text-[#F76161] font-inter text-[12px] not-italic font-normal leading-none'>At least 800 x 800 px recommended. JPG or PNG is allowed</span>
        //                                     </p>
        //                                 </div> */}
        //                             </div>
        //                         </div>
        //                     </div>
        //                 </div>

        //                 {/* Action Buttons */}
        //                 <div className="flex justify-end space-x-3 mt-7 border-gray-200">
        //                     <Button
        //                         variant="solid"
        //                         size="sm"
        //                         onClick={handleCancel}
        //                         className="hover:bg-[#8080801A] active:bg-[#8080801A] rounded-[4px] !bg-[rgba(128,128,128,0.10)] !text-[#808080] text-center font-poppins text-[14px] not-italic font-medium leading-none px-[14px] py-[5px]"
        //                     >
        //                         Cancel
        //                     </Button>
        //                     <Button
        //                         variant="solid"
        //                         size="sm"
        //                         onClick={handleSaveUserDetails}
        //                         className="hover:bg-[#4880FF] active:bg-[#4880FF] rounded-[4px] !bg-[#4880FF] !text-[#ffffff] text-center font-poppins text-[14px] not-italic font-medium leading-none px-[14px] py-[5px]"
        //                     >
        //                         Save
        //                     </Button>
        //                 </div>
        //             </div>
        //         </Card>

        //         {/* Change Password Card */}
        //         <Card className="bg-white rounded-[24px] border-none">
        //             <div className="">
        //                 <h2 className="text-[#4B5674] font-nunito text-[17px] not-italic font-bold leading-none mb-[18px]">
        //                     Change Password
        //                 </h2>

        //                 <div className="space-y-4 max-w-md">
        //                     <div>
        //                         <label className="text-[#2E3A59] font-nunito text-base not-italic font-medium leading-none">
        //                             Current Password
        //                         </label>
        //                         <Input
        //                             type={showCurrentPassword ? 'text' : 'password'}
        //                             placeholder="Enter your current password"
        //                             value={passwordDetails.currentPassword}
        //                             onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
        //                             className="w-full mt-[4px] rounded-[10px] border border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)] text-[#727272] font-nunito text-[12px] font-medium focus:ring-[#2779FF] focus:border-[#2779FF]"
        //                             suffix={
        //                                 <button
        //                                     type="button"
        //                                     onClick={() => setShowCurrentPassword((v) => !v)}
        //                                     className="text-gray-500 hover:text-gray-700"
        //                                 >
        //                                     {showCurrentPassword ? (
        //                                         <HiOutlineEye />
        //                                     ) : (
        //                                         <HiOutlineEyeOff />
        //                                     )}
        //                                 </button>
        //                             }
        //                         />
        //                     </div>

        //                     <div>
        //                         <label className="text-[#2E3A59] font-nunito text-base not-italic font-medium leading-none">
        //                             New Password
        //                         </label>
        //                         <Input
        //                             type={showNewPassword ? 'text' : 'password'}
        //                             placeholder="Enter new password"
        //                             value={passwordDetails.newPassword}
        //                             onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
        //                             className="w-full mt-[4px] rounded-[10px] border border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)] text-[#727272] font-nunito text-[12px] font-medium focus:ring-[#2779FF] focus:border-[#2779FF]"
        //                             suffix={
        //                                 <button
        //                                     type="button"
        //                                     onClick={() => setShowNewPassword((v) => !v)}
        //                                     className="text-gray-500 hover:text-gray-700"
        //                                 >
        //                                     {showNewPassword ? (
        //                                         <HiOutlineEye />
        //                                     ) : (
        //                                         <HiOutlineEyeOff />
        //                                     )}
        //                                 </button>
        //                             }
        //                         />
        //                     </div>

        //                     <div>
        //                         <label className="text-[#2E3A59] font-nunito text-base not-italic font-medium leading-none">
        //                             Confirm Password
        //                         </label>
        //                         <Input
        //                             type={showConfirmPassword ? 'text' : 'password'}
        //                             placeholder="Confirm new password"
        //                             value={passwordDetails.confirmPassword}
        //                             onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
        //                             className="w-full mt-[4px] rounded-[10px] border border-[#E3E3E3] bg-white shadow-[0_0_1px_1px_rgba(255,255,255,0)] text-[#727272] font-nunito text-[12px] font-medium focus:ring-[#2779FF] focus:border-[#2779FF]"
        //                             suffix={
        //                                 <button
        //                                     type="button"
        //                                     onClick={() => setShowConfirmPassword((v) => !v)}
        //                                     className="text-gray-500 hover:text-gray-700"
        //                                 >
        //                                     {showConfirmPassword ? (
        //                                         <HiOutlineEye />
        //                                     ) : (
        //                                         <HiOutlineEyeOff />
        //                                     )}
        //                                 </button>
        //                             }
        //                         />
        //                     </div>
        //                 </div>

        //                 {/* Action Button */}
        //                 <div className="flex justify-end mt-8 ">
        //                     <Button
        //                         variant="solid"
        //                         size="sm"
        //                         onClick={handleSavePassword}
        //                         loading={isSavingPassword}
        //                         className="hover:bg-[#4880FF] active:bg-[#4880FF] rounded-[4px] !bg-[#4880FF] !text-[#ffffff] text-center font-poppins text-[14px] not-italic font-medium leading-none px-[14px] py-[5px]"
        //                     >
        //                         Save
        //                     </Button>
        //                 </div>
        //             </div>
        //         </Card>
        //     </div>
        // </div>
    )
}

export default UserProfile 