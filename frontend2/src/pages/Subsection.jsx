import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { APIBase, flaskAPIBase } from '../data/data';
import SuccessMessage from '../components/shared/success';
import ErrorMessage from '../components/shared/error';
import { useUserContext } from '../customHooks/UserContext';
import ManualMarking from '../components/shared/ManualMarking';

const Subsection = () => {
    const { subsectionId } = useParams();
    const [subsection, setSubsection] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [totalClasses, setTotalClasses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [showManualMarking, setShowManualMarking] = useState(false);
    const [uploadId, setUploadId] = useState(false);
    const fileInputRef = useRef();
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

                const aRes = await fetch(`${APIBase}/subsection/getAttendance`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ subsectionId: subsectionId, rollNumbers: data.subsection.studentRolls })
                })
                const adata = await aRes.json();
                if (!aRes.ok) throw new Error(adata.message || "Failed to fetch attendance");
                setTotalClasses(adata.totalClasses);
                setAttendance(adata.attendence);
                setLoading(false);
            } catch (error) {
                setErr(error.message);
                setLoading(false);
            }
        }
        fetchSubsection();
    }, [subsectionId]);

    // Improved upload handler with correct uploadMsg and loading state
    const handleVideoUpload = (e, subsectionId, username) => {
        const file = e.target.files[0];
        if (!file || !subsectionId) return;
        const uploadId = crypto.randomUUID();
        setUploadId(uploadId);

        setUploading(true);
        setUploadMsg({ type: "info", text: "Uploading started" });
        setSuccessMessage(null);
        setErrorMessage(null);

        // Upload with progress
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('video', file);
        formData.append('uploadId', uploadId);
        formData.append('subsectionId', subsectionId);
        formData.append('username', username);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setUploadMsg({ type: "info", text: `Uploading: ${percent}%` });
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                // Connect to processing updates
                const eventSource = new EventSource(`${flaskAPIBase}/progress/${uploadId}`);

                eventSource.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    setUploadMsg(data);

                    if (data.stage === "completed") {
                        eventSource.close();
                        setUploading(false);
                        setSuccessMessage({
                            title: "Processing Complete",
                            message: data.message
                        });
                        setShowManualMarking(true);
                    }
                };

                eventSource.onerror = () => {
                    setUploadMsg({ type: "error", text: "Done" });
                    eventSource.close();
                    setUploading(false);
                    setShowManualMarking(true);
                };
            }
        };

        xhr.onerror = () => {
            setUploadMsg({ type: "error", text: "Upload failed" });
            setUploading(false);
        };

        xhr.open('POST', `${flaskAPIBase}/upload_video`);
        xhr.send(formData);


        if (fileInputRef.current) fileInputRef.current = ""
    };

    let averageAttendance = 0;

    if (attendance && Object.values(attendance).length > 0) {
        const percentages = Object.values(attendance); 
        const total = percentages.reduce((sum, val) => sum + val, 0);
        averageAttendance = parseFloat((total / percentages.length).toFixed(2));
    }


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
            {showManualMarking && 
                <ManualMarking subsectionId={subsectionId} uploadId={uploadId} onClose={()=>setShowManualMarking(false)} />
            }

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
                                <p className="text-sm"><span className="font-medium">Classes: </span>{totalClasses}</p>
                                <p className="text-sm"><span className="font-medium">Average attendance: </span>{averageAttendance}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M12 18.364a7 7 0 010-12.728M8.464 15.536a5 5 0 010-7.072" />
                        </svg>
                        Video Management
                    </h2>
                    <div className="flex flex-col items-start gap-4">
                        <input
                            type="file"
                            accept="video/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => handleVideoUpload(e, subsection.subsectionId, user?.username)}
                            disabled={uploading}
                        />
                        <button
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            type="button"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {uploading ? "Uploading Video..." : "Upload New Video"}
                        </button>
                        {uploadMsg && (
                            <div className={`text-sm ${uploadMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                                {uploadMsg.text}
                            </div>
                        )}
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
                                            <th className="px-4 py-3 text-left font-medium text-gray-700">Attendance</th>
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
                                                <td className="px-4 py-3">{(attendance)? attendance[st.rollNumber] : 0}</td>
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

export default Subsection;