import { useState } from 'react';
import AttendanceTable from '../components/AdminDashboard/AttendenceTable';
import Parameters from '../components/AdminDashboard/Parameters';
import Sections from '../components/AdminDashboard/Sections';
import SuccessMessage from '../components/shared/success';
import ErrorMessage from '../components/shared/error';
import DynamicForm from '../components/shared/DynamicForm';
import ViewTeachers from '../components/shared/ViewTeachers';
import ViewStudents from '../components/shared/ViewStudents';
import { useNavigate } from 'react-router-dom';
import { APIBase } from '../data/data';
import {validateImageUrl} from '../utils/validateURL'


const addTeacherFormFields = [
  {label: "Teacher Id", name: "teacherId", type: "text", required: true},
  {label: "Name", name: "name", type: "text", required: true},
  {label: "Email", name: "email", type: "text", required: true},
  {label: "Face Image URL", name: "faceimageurl", type: "text", required: true},
  {label: "username", name: "username", type: "text", disabled: true, generate: true},
  {label: "Password", name: "password", type: "text", required: true,}
]

const addStudentFormFields =[
  {label: "Name", name: "name", type: "text", required: true},
  {label: "Roll Number", name: "rollNumber", type: "text", required: true},
  {label: "Email", name: "email", type: "text", required: true},
  {label: "Department", name: "department", type: "text", required: true},
  {label: "Year", name: "year", type: "number", required: true},
  {label: "Face Image URL", name: "faceimageurl", type: "text", required: true},
  {label: "Admission Year", name: "admissionYear", type: "number", required: true},
  {label: "username", name: "username", type: "text", disabled: true, generate: true},
  {label: "Password", name: "password", type: "text", required: true},
]

const deleteTeacherFormFields = [
  {label: "Teacher Id", name: "teacherId", type: "text", required: true},
]

const deleteStudentFormFields = [
  {label: "Roll Number", name: "rollNumber", type: "text", required: true},
]

const AdminDashboard = () => {
  const [showForm1, setShowForm1] = useState(false);
  const [showForm2, setShowForm2] = useState(false);
  const [showForm3, setShowForm3] = useState(false);
  const [showForm4, setShowForm4] = useState(false);
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleAdd = (data, name, api) => {
    const token = localStorage.getItem('token');
    async function addTeacher(data){
      const isValidURL = validateImageUrl(data.faceimageurl)
      if(!isValidURL){
        setErrorMessage({title: `${name} creation failed`, message: "Invalid face image url" })
        return;
      }
      const userId = crypto.randomUUID();
      const response = await fetch(api,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({userId,...data})
      }) 
      const result = await response.json()
      if (response.ok) {
        setSuccessMessage({title: `${name} added successfully`, message: result.message});
      } else {
        setErrorMessage({title: `Failed to add ${name}`, message: result.message});
      }
    }
    try{
      addTeacher(data)
    }
    catch(err){
      console.log(err)
      setErrorMessage({title: `Failed to add ${name}`, message: err.message});
    }
  }


  const handleDelete = (data, name, api) => {
    const token = localStorage.getItem('token');
    async function deleteTeacher(data){
      const response = await fetch(api,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }) 
      const result = await response.json()
      if (response.ok) {
        setSuccessMessage({title: `${name} deleted successfully`, message: result.message});
      } else {
        setErrorMessage({title: `Failed to delete ${name}`, message: result.message});
      }
    }
    try{
      deleteTeacher(data)
    }
    catch(err){
      console.log(err)
      setErrorMessage({title: `Failed to delete ${name}`, message: err.message});
    }
  }

 

  return (
    <div>
      {successMessage && <SuccessMessage title={successMessage.title} message={successMessage.message} onClose={() => setSuccessMessage(null)} />}
      {errorMessage && <ErrorMessage title={errorMessage.title} message={errorMessage.message} onClose={() => setErrorMessage(null)} />}
      <div className='w-full min-h-screen bg-gray-100 px-6 divide-y-2 divide-gray-200'>
        <div className='py-4'>
          <h1 className='text-2xl font-semibold'>Manage Sections</h1>
          <Sections />
        </div>
        <div className='py-4'>
          <h1 className='text-2xl font-semibold '>Manage Teachers</h1>
          <div className='w-fit mx-auto flex justify-between gap-x-4 items-center py-4'>
            <Button text="Add Teacher" onClick={()=>setShowForm1(true)} color="blue" />
            {showForm1 && 
            <DynamicForm
              fields={addTeacherFormFields}
              onSubmit={(data) => handleAdd(data, "Teacher", `${APIBase}/teacher/createTeacher`)}
              onClose={() => setShowForm1(false)}
            />
            }
            <Button text="Add Teachers by sheet" onClick={()=>navigate('/addTeachersBySheet')} color="blue" />
            <Button text="View Teachers" onClick={()=>setShowAllTeachers(true)} color="blue" />
            {showAllTeachers && 
              <ViewTeachers open={showAllTeachers} onClose={()=>setShowAllTeachers(false)}/>
            }
            <Button text="Delete Teacher" onClick={() => setShowForm3(true)} color="blue" />
            {showForm3 &&
            <DynamicForm 
            fields={deleteTeacherFormFields}
            onSubmit={(data) => handleDelete(data, "Teacher", `${APIBase}/teacher/deleteTeacher`)}
            onClose={() => setShowForm3(false)}
            />
            }
          </div>
        </div>
        <div className='py-4'>
          <h1 className='text-2xl font-semibold'>Manage Students</h1>
          <div className='w-fit mx-auto flex justify-between gap-x-4 items-center py-4'>
            <Button text="Add Student" onClick={() => setShowForm2(true)} color="pink" />
            {showForm2 && 
            <DynamicForm
              fields={addStudentFormFields}
              onSubmit={(data) => handleAdd(data, "Student", `${APIBase}/student/createStudent`)}
              onClose={() => setShowForm2(false)}
            />
            }
            <Button text="Add Students by sheet" onClick={()=>navigate('/addStudentsBySheet')} color="pink" />
            <Button text="View Students" onClick={()=>setShowAllStudents(true)} color="pink" />
            {showAllStudents &&
              <ViewStudents open={showAllStudents} onClose={() => setShowAllStudents(false)} />
            }
            <Button text="Delete Student" onClick={() => setShowForm4(true)} color="pink" />
            {showForm4 &&
            <DynamicForm 
            fields={deleteStudentFormFields}
            onSubmit={(data) => handleDelete(data, "Student", `${APIBase}/student/deleteStudent`)}
            onClose={() => setShowForm4(false)}
            />
            }
          </div>
        </div>
      </div>
      {/* For tailwind */}
      <span className='hidden bg-blue-500 hover:bg-blue-600'>
        <span className='bg-pink-500 hover:bg-pink-600'></span>
        <span className='bg-green-500 hover:bg-green-600'></span>
      </span>
    </div>
  )
}

export default AdminDashboard


const Button = ({ text, onClick, color }) => {
  return (
    <button
      className={`bg-${color}-500 text-white px-4 py-2 rounded hover:bg-${color}-600 cursor-pointer transition duration-300`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}


