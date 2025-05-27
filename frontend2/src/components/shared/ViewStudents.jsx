import { useState, useMemo, useEffect } from "react";
import { APIBase } from "../../data/data";

const ViewStudents = ({
  onClose,
  isForAdd = false,
  onSubmit = () => {}
}) => {
  const [search, setSearch] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [localSelected, setLocalSelected] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch students when modal opens
  useEffect(() => {
    const token = localStorage.getItem('token');
    async function fetchStudents() {
      try {
        const response = await fetch(`${APIBase}/student/getAllStudents`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (response.ok) {
          setAllStudents(result.students);
        } else {
          setErrorMessage({ title: `Failed to fetch students`, message: result.message });
        }
      } catch (err) {
        setErrorMessage({ title: `Failed to fetch students`, message: err.message });
      }
    }
    fetchStudents();
  }, []);

  // Filter students by name or rollNumber
  const filteredStudents = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return allStudents;
    return allStudents.filter(
      st =>
        (st.name && st.name.toLowerCase().includes(s)) ||
        (st.rollNumber && st.rollNumber.toLowerCase().includes(s))
    );
  }, [search, allStudents]);

  const isStudentSelected = (student) =>
    localSelected.some((s) => s.rollNumber === student.rollNumber);

  const handleAddRemove = (student) => {
    if (isStudentSelected(student)) {
      setLocalSelected(localSelected.filter((s) => s.rollNumber !== student.rollNumber));
    } else {
      setLocalSelected([...localSelected, student]);
    }
  };

  const handleSubmit = () => {
    onSubmit(localSelected);
    onClose && onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">All Students</h2>
        {errorMessage && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            <strong>{errorMessage.title}:</strong> {errorMessage.message}
          </div>
        )}
        <input
          type="text"
          placeholder="Search by name or roll number..."
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-3 py-2 border">Roll Number</th>
                <th className="px-3 py-2 border">Name</th>
                <th className="px-3 py-2 border">Email</th>
                <th className="px-3 py-2 border">Department</th>
                <th className="px-3 py-2 border">Year</th>
                <th className="px-3 py-2 border">Admission Year</th>
                {isForAdd && <th className="px-3 py-2 border">Add</th>}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={isForAdd ? 8 : 7} className="text-center py-4 text-gray-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st, idx) => (
                  <tr key={st.rollNumber || idx} className="hover:bg-blue-50">
                    <td className="px-3 py-2 border">{st.rollNumber}</td>
                    <td className="px-3 py-2 border">{st.name}</td>
                    <td className="px-3 py-2 border">{st.email || <span className="text-gray-400">N/A</span>}</td>
                    <td className="px-3 py-2 border">{st.department}</td>
                    <td className="px-3 py-2 border">{st.year}</td>
                    <td className="px-3 py-2 border">{st.admissionYear}</td>
                    {isForAdd && (
                      <td className="px-3 py-2 border text-center">
                        <button
                          className={`px-3 py-1 rounded ${
                            isStudentSelected(st)
                              ? "bg-green-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                          onClick={() => handleAddRemove(st)}
                        >
                          {isStudentSelected(st) ? "Added" : "Add"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {isForAdd && (
          <button
            className="mt-6 w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            onClick={handleSubmit}
            disabled={localSelected.length === 0}
          >
            Submit Selected Students
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewStudents;