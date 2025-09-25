import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '@/utils/hooks/useAuth'

const Logout = () => {
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const handleLogout = () => {
        signOut()
    }

    return (
        <div className="min-h-screen w-full">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-[6px_6px_54px_0_rgba(0,0,0,0.05)] p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Logout</h1>
                    <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleLogout}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                        >
                            Yes, Logout
                        </button>
                        <button 
                            onClick={() => navigate('/home')}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Logout 