import { useUserContext } from "../customHooks/UserContext"
import { useState } from "react"
import SuccessMessage from "../components/shared/success";
import ErrorMessage from "../components/shared/error";
import { APIBase } from "../data/data";

const Profile = () => {
    const user = useUserContext();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    const handleChangePassword = () => {


        if (!oldPassword || !newPassword) {
            setError({ title: "Incomplete input", message: "Please fill in both fields." });
            return;
        }
        const changePassword = async () => {
            setError(null);
            setSuccess(null);
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${APIBase}/user/change-password`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword })
                });


                const data = await response.json();
                console.log(data)
                if (!response.ok) {
                    setError({ title: "Error", message: data.message });
                    return;
                }
                setOldPassword("");
                setNewPassword("");
                setSuccess({ title: "Success", message: "Password changed successfully!" });
            } catch (error) {
                setError({ title: "Error", message: "Failed to change password." });
            }
        }
        changePassword();
    };

    return (
        <div className='w-full min-h-screen bg-gray-100 px-6 divide-y-2 divide-gray-200'>
            <div className='py-4'>
                <h1 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                    <span>
                        <svg className="inline-block w-8 h-8 text-blue-500 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="4" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-2.5 3.5-4.5 8-4.5s8 2 8 4.5" />
                        </svg>
                    </span>
                    Profile
                </h1>
                <div className="py-4">
                    <div className="bg-white rounded-lg shadow p-6 flex items-center gap-6 max-w-md">
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-3xl font-bold">
                                {user.username?.[0]?.toUpperCase() || "U"}
                            </div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                Username: <span className="text-blue-600">{user.username}</span>
                            </div>
                            <div className="text-md text-gray-600 mt-1 flex items-center gap-2">
                                Role: <span className="text-pink-600 font-medium">{user.role}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-4">
                <h2 className="text-xl font-semibold mb-2">Change Password</h2>
                <div className="flex flex-col max-w-sm gap-2">
                    <div className="relative">
                        <input
                            type={showOldPassword ? "text" : "password"}
                            placeholder="Old Password"
                            className="border px-3 py-2 rounded w-full pr-10"
                            value={oldPassword}
                            onChange={e => setOldPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                            onClick={() => setShowOldPassword(v => !v)}
                            tabIndex={-1}
                        >
                            {showOldPassword ? (
                                // Eye open icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            ) : (
                                // Eye closed icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m1.414-1.414A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.364 6.364L19.07 4.93" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            className="border px-3 py-2 rounded w-full pr-10"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                            onClick={() => setShowNewPassword(v => !v)}
                            tabIndex={-1}
                        >
                            {showNewPassword ? (
                                // Eye open icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            ) : (
                                // Eye closed icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m1.414-1.414A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.364 6.364L19.07 4.93" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        onClick={handleChangePassword}
                    >
                        Change
                    </button>
                    {success && <SuccessMessage title={success.title} message={success.message} />}
                    {error && <ErrorMessage title={error.title} message={error.message} />}
                </div>
            </div>
        </div>
    )
}

export default Profile