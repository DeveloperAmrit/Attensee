import { useState, useMemo, useEffect } from "react";
import { APIBase } from "../../data/data";

const ViewTeachers = ({
  onClose,
  isForAdd = false,
  onSubmit = () => {}
}) => {
  const [search, setSearch] = useState("");
  const [allTeachers, setAllTeachers] = useState([]);
  const [localSelected, setLocalSelected] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch teachers when modal opens
  useEffect(() => {
    const token = localStorage.getItem('token');
    async function fetchTeachers() {
      try {
        const response = await fetch(`${APIBase}/teacher/getAllTeachers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (response.ok) {
          setAllTeachers(result.teachers);
        } else {
          setErrorMessage({ title: `Failed to fetch teachers`, message: result.message });
        }
      } catch (err) {
        setErrorMessage({ title: `Failed to fetch teachers`, message: err.message });
      }
    }
    fetchTeachers();
  }, []);

  // Filter teachers by name or teacherId
  const filteredTeachers = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return allTeachers;
    return allTeachers.filter(
      t =>
        t.name.toLowerCase().includes(s) ||
        t.teacherId.toLowerCase().includes(s)
    );
  }, [search, allTeachers]);

  const isTeacherSelected = (teacher) =>
    localSelected.some((t) => t.teacherId === teacher.teacherId);

  const handleAddRemove = (teacher) => {
    if (isTeacherSelected(teacher)) {
      setLocalSelected(localSelected.filter((t) => t.teacherId !== teacher.teacherId));
    } else {
      setLocalSelected([...localSelected, teacher]);
    }
  };

  const handleSubmit = () => {
    onSubmit(localSelected);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">All Teachers</h2>
        {errorMessage && (
          <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            <strong>{errorMessage.title}:</strong> {errorMessage.message}
          </div>
        )}
        <input
          type="text"
          placeholder="Search by name or teacher ID..."
          className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-3 py-2 border">Teacher ID</th>
                <th className="px-3 py-2 border">Name</th>
                <th className="px-3 py-2 border">Email</th>
                {isForAdd && <th className="px-3 py-2 border">Add</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={isForAdd ? 6 : 5} className="text-center py-4 text-gray-400">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t, idx) => (
                  <tr key={t.teacherId || idx} className="hover:bg-blue-50">
                    <td className="px-3 py-2 border">{t.teacherId}</td>
                    <td className="px-3 py-2 border">{t.name}</td>
                    <td className="px-3 py-2 border">{t.email}</td>
                    {isForAdd && (
                      <td className="px-3 py-2 border text-center">
                        <button
                          className={`px-3 py-1 rounded ${
                            isTeacherSelected(t)
                              ? "bg-green-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                          onClick={() => handleAddRemove(t)}
                        >
                          {isTeacherSelected(t) ? "Added" : "Add"}
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
            Submit Selected Teachers
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewTeachers;