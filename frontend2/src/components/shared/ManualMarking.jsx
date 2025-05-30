import { useEffect, useState } from "react";
import { APIBase } from "../../data/data";

const ManualMarking = ({ uploadId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [presentStudents, setPresentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all students (rollNumbers)
        const studentsRes = await fetch(`${APIBase}/student/getAllRollNumbers`, {
            method: 'POST',
          headers: { "Authorization": `Bearer ${token}` }
        });
        const studentsData = await studentsRes.json();
        setStudents(studentsData.rollNumbers || []);

        // Fetch present students by uploadId
        const presentRes = await fetch(`${APIBase}/attendance/getPresentStudentsByUploadId`, {
            method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({uploadId: uploadId})
          
        });
        const presentData = await presentRes.json();
        setPresentStudents(presentData.presentStudents || []);
      } catch (err) {
        setStudents([]);
        setPresentStudents([]);
      }
      setLoading(false);
    }

    if (uploadId) fetchData();
  }, [uploadId]);

  // Helper to get present/absent and alertState
  const getPresentInfo = (roll) => {
    const found = presentStudents.find((p) => p.rollNumber === roll);
    if (found) return { status: "Present", alertState: found.alertState };
    return { status: "Absent", alertState: "-" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <span className="text-blue-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-700">Manual Marking</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">&times;</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-3 py-2 border">Roll Number</th>
              <th className="px-3 py-2 border">Status</th>
              <th className="px-3 py-2 border">Alert State</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-400">No students found.</td>
              </tr>
            ) : (
              students.map((roll) => {
                const info = getPresentInfo(roll);
                return (
                  <tr key={roll}>
                    <td className="px-3 py-2 border">{roll}</td>
                    <td className={`px-3 py-2 border ${info.status === "Present" ? "text-green-600" : "text-red-600"}`}>{info.status}</td>
                    <td className="px-3 py-2 border">{info.alertState}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManualMarking;