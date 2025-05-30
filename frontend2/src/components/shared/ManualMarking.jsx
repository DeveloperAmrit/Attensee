import { useEffect, useState } from "react";
import { APIBase } from "../../data/data";

const ManualMarking = ({ uploadId, subsectionId, onClose }) => {
  const [students, setStudents] = useState([]);
  const [presentStudents, setPresentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  // Local state for editing
  const [localPresent, setLocalPresent] = useState([]);
  const [localAlert, setLocalAlert] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all students (rollNumbers)
        const studentsRes = await fetch(`${APIBase}/subsection/getAllRollNumbers`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ subsectionId: subsectionId })
        });
        const studentsData = await studentsRes.json();
        setStudents(studentsData.rolls || []);

        // Fetch present students by uploadId
        const presentRes = await fetch(`${APIBase}/subsection/getPresentStudentsByUploadId`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ uploadId: uploadId })
        });
        const presentData = await presentRes.json();
        setPresentStudents(presentData.presentStudents || []);

        // Set local state for editing
        setLocalPresent((presentData.presentStudents || []).map(s => s.rollNumber));
        const alertObj = {};
        (presentData.presentStudents || []).forEach(s => {
          alertObj[s.rollNumber] = s.alertState || "active";
        });
        setLocalAlert(alertObj);

      } catch (err) {
        setStudents([]);
        setPresentStudents([]);
        setLocalPresent([]);
        setLocalAlert({});
      }
      setLoading(false);
    }

    if (uploadId) fetchData();
  }, [uploadId, subsectionId]);

  // Toggle present/absent
  const togglePresent = (roll) => {
    if (localPresent.includes(roll)) {
      setLocalPresent(localPresent.filter(r => r !== roll));
      // Remove alert state for absent students
      const newAlert = { ...localAlert };
      delete newAlert[roll];
      setLocalAlert(newAlert);
    } else {
      setLocalPresent([...localPresent, roll]);
      setLocalAlert({ ...localAlert, [roll]: localAlert[roll] || "active" });
    }
  };

  // Set alert state
  const setAlertState = (roll, state) => {
    if (localPresent.includes(roll)) {
      setLocalAlert({ ...localAlert, [roll]: state });
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitMsg(null);
    const token = localStorage.getItem("token");
    // Prepare presentStudents array for backend
    const presentArr = localPresent.map(roll => ({
      rollNumber: roll,
      alertState: localAlert[roll] || "active"
    }));
    try {
      const res = await fetch(`${APIBase}/subsection/updateAttendence`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          uploadId,
          presentStudents: presentArr
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMsg({ type: "success", text: data.message || "Attendance updated!" });
      } else {
        setSubmitMsg({ type: "error", text: data.message || "Failed to update attendance" });
      }
    } catch (err) {
      setSubmitMsg({ type: "error", text: err.message });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <span className="text-blue-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-blue-700 mb-4">Manual Marking</h2>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-3 py-2 border">Roll Number</th>
                <th className="px-3 py-2 border">Present</th>
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
                  const isPresent = localPresent.includes(roll);
                  const alertState = localAlert[roll] || "active";
                  return (
                    <tr key={roll}>
                      <td className="px-3 py-2 border">{roll}</td>
                      <td className="px-3 py-2 border text-center">
                        <button
                          className={`rounded-full w-8 h-8 flex items-center justify-center border-2 transition ${
                            isPresent
                              ? "bg-green-100 border-green-500 text-green-700"
                              : "bg-gray-100 border-gray-300 text-gray-400"
                          }`}
                          onClick={() => togglePresent(roll)}
                          title={isPresent ? "Mark Absent" : "Mark Present"}
                        >
                          {isPresent ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="8" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2 border text-center">
                        {isPresent ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              className={`px-2 py-1 rounded ${
                                alertState === "active"
                                  ? "bg-blue-600 text-white font-bold"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                              onClick={() => setAlertState(roll, "active")}
                            >
                              Active
                            </button>
                            <button
                              className={`px-2 py-1 rounded ${
                                alertState === "passive"
                                  ? "bg-blue-600 text-white font-bold"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                              onClick={() => setAlertState(roll, "passive")}
                            >
                              Passive
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {submitMsg && (
          <div className={`mb-2 text-center ${submitMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {submitMsg.text}
          </div>
        )}
        <button
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Attendance"}
        </button>
      </div>
    </div>
  );
};

export default ManualMarking;