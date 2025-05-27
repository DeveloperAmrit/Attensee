import React from 'react'
import { useUserContext } from '../customHooks/UserContext'
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../dashboards/AdminDashboard';
import StudentDashboard from '../dashboards/StudentDashboard';
import TeacherDashboard from '../dashboards/TeacherDashboard';


const Dashboard = () => {
  const user = useUserContext();
  console.log(user);

  const navigate = useNavigate();

  if(!user.userId){
    navigate('/login');
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard/>
    case 'teacher':
      return <TeacherDashboard/>
    case 'student':
      return <StudentDashboard/>
    default:
      navigate('/login');
  }

  return (
    <div>You are not logged in. Please login</div>
  )
}

export default Dashboard