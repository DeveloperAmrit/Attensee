import {useState,useEffect} from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Error from './pages/Error';
import Loading from './components/shared/Loading';
import { useUserContext } from './customHooks/UserContext';
import Profile from './pages/Profile';
import Navbar from './components/shared/Navbar';
import { useSectionsContext } from './customHooks/SectionsContext';
import AddBySheet from './pages/AddBySheet';
import { teacherHeaders, teacherSheetApi, studentHeaders, studentSheetApi } from './data/data';
import Subsection from './pages/Subsection';
import StudentSubsection from './components/StudentDashboard/StudentSubsection'


const App = () => {
  const user = useUserContext();
  const sections = useSectionsContext();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && sections) {
      setLoading(false); // Assuming user data is loaded once the context is available
    }
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Router>
          {(user.role) && <Navbar />}
          <Routes>

            {/* Pages */}
            <Route path="/" element={(user.role) ? <Dashboard /> : <Login />} />
            <Route path="/dashbaord" element={<Dashboard />} />
            <Route path='/login' element={<Login />} />
            <Route path='/error' element={<Error />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/subsection/:subsectionId' element={<Subsection />} />
            <Route path='/studentsubsection/:subsectionId' element={<StudentSubsection />} />

            {/* addBySheet */}
            <Route path='/addTeachersBySheet' element={<AddBySheet headers={teacherHeaders} api={teacherSheetApi} name="Teacher" />} />
            <Route path='/addStudentsBySheet' element={<AddBySheet headers={studentHeaders} api={studentSheetApi} name="Student" />} />

          </Routes>
    </Router>
  );
};

export default App;
