import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { 
    HiCog,
    HiUser,
    HiBell,
    HiShieldCheck,
    HiCreditCard,
    HiGlobe,
    HiSave
} from 'react-icons/hi'

const Settings = () => {
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            push: false,
            sms: true
        },
        privacy: {
            profileVisibility: 'public',
            dataSharing: false
        },
        billing: {
            autoRenew: true,
            currency: 'USD'
        }
    })

    const handleSettingChange = (category: string, setting: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [setting]: value
            }
        }))
    }

    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <Button variant="solid" size="sm" icon={<HiSave />}>
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <HiUser className="text-blue-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-700">Profile Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Name
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Enter your display name"
                                    defaultValue="John Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    defaultValue="john.smith@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <Input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    defaultValue="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Notification Settings */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <HiBell className="text-green-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-700">Notification Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                                    <p className="text-xs text-gray-500">Receive updates via email</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.email}
                                    onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Push Notifications</p>
                                    <p className="text-xs text-gray-500">Receive push notifications</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.push}
                                    onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">SMS Notifications</p>
                                    <p className="text-xs text-gray-500">Receive SMS alerts</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.sms}
                                    onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Privacy Settings */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <HiShieldCheck className="text-purple-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-700">Privacy Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Visibility
                                </label>
                                <Select 
                                    value={settings.privacy.profileVisibility}
                                    onChange={(value) => handleSettingChange('privacy', 'profileVisibility', value || 'public')}
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                    <option value="friends">Friends Only</option>
                                </Select>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Data Sharing</p>
                                    <p className="text-xs text-gray-500">Allow data sharing with partners</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.dataSharing}
                                    onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Billing Settings */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <HiCreditCard className="text-orange-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-700">Billing Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Auto Renewal</p>
                                    <p className="text-xs text-gray-500">Automatically renew subscription</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.billing.autoRenew}
                                    onChange={(e) => handleSettingChange('billing', 'autoRenew', e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                </label>
                                <Select 
                                    value={settings.billing.currency}
                                    onChange={(value) => handleSettingChange('billing', 'currency', value || 'USD')}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD (C$)</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* System Settings */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <HiCog className="text-gray-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-700">System Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language
                                </label>
                                <Select defaultValue="en">
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time Zone
                                </label>
                                <Select defaultValue="UTC-5">
                                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                                    <option value="UTC-6">Central Time (UTC-6)</option>
                                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                                    <option value="UTC+0">UTC</option>
                                    <option value="UTC+1">Central European Time (UTC+1)</option>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Account Status */}
                <Card>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <HiGlobe className="text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-700">Account Status</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Account Status</p>
                                    <p className="text-xs text-gray-500">Your account is active</p>
                                </div>
                                <Badge className="rounded-[13.5px] bg-[#00C417] text-white text-[14px] font-bold leading-none font-nunito">
                                    Active
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Subscription Plan</p>
                                    <p className="text-xs text-gray-500">Pro Plan</p>
                                </div>
                                <Badge className="rounded-[13.5px] bg-[#FF7308] text-white text-[14px] font-bold leading-none font-nunito">
                                    Pro
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Member Since</p>
                                    <p className="text-xs text-gray-500">January 2023</p>
                                </div>
                                <span className="text-sm text-gray-600">1 year</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Settings 