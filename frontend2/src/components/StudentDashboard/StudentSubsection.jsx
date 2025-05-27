import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { APIBase } from '../../data/data';
import SuccessMessage from '../shared/success';
import ErrorMessage from '../shared/error';
import { useUserContext } from '../../customHooks/UserContext';

const StudentSubsection = () => {
    const { subsectionId } = useParams();
    const [subsection, setSubsection] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [attendance, setAttendance] = useState({
        "percent": 0,
        "attended": 0,
        "total": 0
    })
    const user = useUserContext();

    useEffect(() => {
        const token = localStorage.getItem('token');
        async function fetchSubsection() {
            try {
                setLoading(true);
                const res = await fetch(`${APIBase}/subsection/getSubsection`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ subsectionId: subsectionId })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to fetch subsection");
                setSubsection(data.subsection);

                let teachersArr = [];
                if (data.subsection.assignedTeachers.length > 0) {
                    const tRes = await fetch(`${APIBase}/teacher/getTeachersByIds`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ teacherIds: data.subsection.assignedTeachers })
                    });
                    const tData = await tRes.json();
                    if (!tRes.ok) throw new Error(tData.message || "Failed to fetch teachers");
                    teachersArr = tData.teachers;
                }
                setTeachers(teachersArr);

                let studentsArr = [];
                if (data.subsection.studentRolls.length > 0) {
                    const sRes = await fetch(`${APIBase}/student/getStudentsByRolls`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ rollNumbers: data.subsection.studentRolls })
                    });
                    const sData = await sRes.json();
                    if (!sRes.ok) throw new Error(sData.message || "Failed to fetch students");
                    studentsArr = sData.students;
                }
                setStudents(studentsArr);

                setLoading(false);
            } catch (error) {
                setErr(error.message);
                setLoading(false);
            }
        }

        async function fetchAttendance() {
            const resposne = await fetch(`${APIBase}/student/getStudentAttendance`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ subsectionId: subsectionId, username: user.username })

            })

            const data = await resposne.json();
            if(!resposne.ok){
                setErrorMessage({title: "Error fetching attendance", message: data.message})
            }
            setAttendance(data.attendance)
        }
        fetchSubsection();
        fetchAttendance();
    }, [subsectionId]);


    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
    );
    if (err) return <div className="p-8 text-red-600">Error: {err}</div>;
    if (!subsection) return <div className="p-8">No subsection found.</div>;



    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {successMessage && (
                <SuccessMessage
                    title={successMessage.title}
                    message={successMessage.message}
                    onClose={() => setSuccessMessage(null)}
                />
            )}
            {errorMessage && (
                <ErrorMessage
                    title={errorMessage.title}
                    message={errorMessage.message}
                    onClose={() => setErrorMessage(null)}
                />
            )}

            {/* Header Section */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{subsection.name}</h1>
                            <div className="text-gray-600 space-y-1 mt-2">
                                <div className='flex gap-x-4'>
                                    <p className="text-sm"><span className="font-medium">Teachers: </span>{subsection.assignedTeachers.length}</p>
                                    <p className="text-sm"><span className="font-medium">Students: </span>{subsection.studentRolls.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Your attendence: {attendance.percent}</h1>
                            <div className="text-gray-600 space-y-1 mt-2">
                                <div className='flex gap-x-4'>
                                    <p className="text-sm"><span className="font-medium">Attended: </span>{attendance.attended}</p>
                                    <p className="text-sm"><span className="font-medium">Total: </span>{attendance.total}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Sections */}
            <div className="space-y-8">
                {/* Teachers Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Assigned Teachers
                        </h2>
                    </div>
                    <div className="p-6">
                        {teachers.length === 0 ? (
                            <div className="text-gray-400 py-4 text-center">No teachers assigned</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Teacher ID</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Face Image</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {teachers.map(t => (
                                            <tr key={t.teacherId}>
                                                <td className="px-4 py-3">{t.teacherId}</td>
                                                <td className="px-4 py-3">{t.name}</td>
                                                <td className="px-4 py-3">{t.email}</td>
                                                <td className="px-4 py-3">
                                                    <img src={t.faceimageurl} alt={t.name} className="w-10 h-10 rounded-full object-cover border" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Students Section */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Students
                        </h2>
                    </div>
                    <div className="p-6">
                        {students.length === 0 ? (
                            <div className="text-gray-400 py-4 text-center">No students in this subsection</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Roll Number</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Department</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Year</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Admission Year</th>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Face Image</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {students.map(st => (
                                            <tr key={st.rollNumber}>
                                                <td className="px-4 py-3">{st.rollNumber}</td>
                                                <td className="px-4 py-3">{st.name}</td>
                                                <td className="px-4 py-3">{st.email || <span className="text-gray-400">N/A</span>}</td>
                                                <td className="px-4 py-3">{st.department}</td>
                                                <td className="px-4 py-3">{st.year}</td>
                                                <td className="px-4 py-3">{st.admissionYear}</td>
                                                <td className="px-4 py-3">
                                                    <img src={st.faceimageurl} alt={st.name} className="w-10 h-10 rounded-full object-cover border" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentSubsection;