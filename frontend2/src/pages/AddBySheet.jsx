import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useState, useRef, useEffect } from 'react';
import SuccessMessage from '../components/shared/success';
import ErrorMessage from '../components/shared/error';

const AddBySheet = ({ headers = [], api, name }) => {
  const [loading, setLoading] = useState(false);
  const [resultState, setResultState] = useState([]);
  const [failedUploads, setFailedUploads] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(false);

  const generateTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `${name}Template.xlsx`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset error state on new file selection
    setErrorMessage(null);
    setSuccessMessage(null);
    setFailedUploads([]);

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false }).map(row => ({
          ...row,
          username: (row.name || "") + Date.now().toString(36)
        }));

        const actualHeaders = data.length ? Object.keys(data[0]) : [];
        const missingHeaders = headers.filter(header => !actualHeaders.includes(header));

        if (missingHeaders.length > 0) {
          setErrorMessage({
            title: "Missing Headers",
            message: `The following headers are missing: ${missingHeaders.join(", ")}`
          });
          return;  // Removed recursive readAsArrayBuffer call
        }

        if (!api) {
          setErrorMessage({
            title: "API not provided",
            message: "Please provide a valid API endpoint."
          });
          return;  // Removed recursive readAsArrayBuffer call
        }

        setLoading(true);
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ data: data }),
        });

        const result = await response.json();
        const failedUploads_ = result.failedUploads || [];

        setFailedUploads(failedUploads_);
        setResultState(data.map(({ username, password }) => ({ username, password })));

        if (response.ok) {
          if (result.isSuccess) {
            setSuccessMessage({
              title: "Upload successful",
              message: "Data uploaded successfully!"
            });
          } else if (failedUploads_.length !== data.length) {
            setErrorMessage({
              title: "Some uploads failed",
              message: result.message
            });
          } else {
            setErrorMessage({
              title: "All uploads failed",
              message: "Invalid or repetitive data"
            });
          }
        } else {
          setErrorMessage({
            title: "Upload failed",
            message: result.message || "An error occurred during upload."
          });
        }
      } catch (error) {
        console.error("Upload error:", error);
        setErrorMessage({
          title: "Upload failed",
          message: error.message || "An unexpected error occurred"
        });
      } finally {
        setLoading(false);
        // Properly reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    // Start reading the file
    reader.readAsArrayBuffer(file);
  };

  const downloadUsernamesPasswords = () => {
    if (!resultState || resultState.length === 0) {
      setErrorMessage({ title: "No Data", message: "No usernames or passwords to export." });
      return;
    }
    // Prepare data for sheet
    const sheetData = [
      ["username", "password"],
      ...resultState.map(item => [item.username, item.password])
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usernames_Passwords");
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "usernames_passwords.xlsx");
  };

  useEffect(() => {
    if (resultState && resultState.length > 0) {
      downloadUsernamesPasswords();
    }
  }, [resultState])




  return (
    <div className="w-full min-h-screen bg-gray-100 px-6 py-10 divide-y-2 divide-gray-200">
      {successMessage && <SuccessMessage title={successMessage.title} message={successMessage.message} onClose={() => setSuccessMessage(null)} />}
      {errorMessage && <ErrorMessage title={errorMessage.title} message={errorMessage.message} onClose={() => setErrorMessage(null)} />}
      <div className="w-full h-56 flex flex-col justify-center items-center gap-y-5 border-2 border-blue-400 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Upload .xlsx file
        </h1>
        <label className="flex flex-col items-center px-6 py-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 cursor-pointer hover:bg-blue-100 transition">
          <svg className="w-10 h-10 text-blue-400 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3" />
            <rect width="20" height="16" x="2" y="4" rx="2" />
          </svg>
          <span className="text-blue-600 font-medium">Choose .xlsx file</span>
          <input
            type="file"
            accept=".xlsx"
            ref={fileInputRef}
            multiple={false}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <span className="text-gray-400 text-sm">Only .xlsx files are supported</span>
        {loading && <span className="text-blue-500 mt-2">Uploading...</span>}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-700 mt-10">Instructions</h2>
        <p className="text-gray-600 mt-2">1. Download the template file from the link below.</p>
        <p className="text-gray-600 mt-2">2. Fill in the required data in the template.</p>
        <p className="text-gray-600 mt-2">3. Upload the filled template using the button above.</p>
        <p className="text-gray-600 mt-2">4. Required headers are
          <span className="text-red-500 font-semibold"> {headers.join(', ')}</span>.
        </p>
        <p className="text-gray-600 mt-2">5. Usernames will be auto-generated, we will provide you updated sheet</p>
        <button
          onClick={generateTemplate}
          className="text-blue-500 underline mt-4 block cursor-pointer"
        >
          Download Template
        </button>
      </div>
      <FailedUploadsTable failedUploads={failedUploads} />
    </div>
  );
};

export default AddBySheet;



const FailedUploadsTable = ({ failedUploads }) => {
  if (!failedUploads || failedUploads.length === 0) return null;

  // Get all unique keys from failed upload objects for table headers
  const allKeys = Array.from(
    failedUploads.reduce((set, obj) => {
      Object.keys(obj).forEach(key => set.add(key));
      return set;
    }, new Set())
  );

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-red-600 mb-2">Failed Uploads</h2>
      <div className="overflow-x-auto rounded shadow border border-red-200 bg-white">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr>
              {allKeys.map(key => (
                <th key={key} className="px-4 py-2 border-b bg-red-50 text-red-700 font-semibold">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {failedUploads.map((row, idx) => (
              <tr key={idx} className="hover:bg-red-50">
                {allKeys.map(key => (
                  <td key={key} className="px-4 py-2 border-b">{row[key] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};