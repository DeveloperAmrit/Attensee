import { AccountCircle, Logout } from '@mui/icons-material'
import { useUserContext, useUserDispatchContext } from '../../customHooks/UserContext'
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
    const user = useUserContext();
    const dispatch = useUserDispatchContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch({ type: 'logout' });
        localStorage.removeItem('token');
        navigate('/login');
    }

    return (
        <div className='w-full bg-blue-500 py-2 px-6 flex justify-between items-center'>
            <h1
            onClick={() =>navigate('/')} 
            className="text-2xl font-bold text-white capitalize cursor-pointer">{user.role} Dashboard</h1>
            <div className='flex space-x-4'>
                <div
                    onClick={() => navigate('/profile')}
                    className='flex items-center space-x-2 cursor-pointer hover:bg-blue-600 px-4 py-2 rounded'>
                    <AccountCircle className='text-white' fontSize='large' />
                    <span className='text-white text-lg'>{user.username}</span>
                </div>
                <div
                    onClick={handleLogout}
                    className='text-white flex items-center space-x-2 cursor-pointer hover:bg-blue-600 px-4 py-2 rounded'>
                    <h1 className='text-lg'>Logout</h1>
                    <Logout />
                </div>
            </div>
        </div>

    )
}

export default Navbar