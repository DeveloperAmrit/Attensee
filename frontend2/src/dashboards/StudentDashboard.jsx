import S_Section from '../components/StudentDashboard/S_Sections';
import StudentSubsection from '../components/StudentDashboard/StudentSubsection';
import { useUserContext } from '../customHooks/UserContext'

const StudentDashboard = () => {
  const user = useUserContext();

  return (
    <div>
       <S_Section/>
    </div>
  )
}

export default StudentDashboard