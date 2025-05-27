import { useUserContext } from '../customHooks/UserContext'
import T_Section from '../components/TeacherDashboard/T_Sections';

const TeacherDashboard = () => {
  const user = useUserContext();
  return (
    <div>
      <T_Section/>
    </div>
  )
}

export default TeacherDashboard