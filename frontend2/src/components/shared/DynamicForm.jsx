import { useState, useEffect } from "react";

const DynamicForm = ({ fields, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({});

  const generateUniqueUsername = (fullName) => {
    const firstWord = fullName.split(" ")[0].toLowerCase();
    const timestamp = Date.now().toString(36); // base36 makes it shorter
    return `${firstWord}_${timestamp}`;
  };

  useEffect(() => {
    if (formData.name) {
      const uniqueUsername = generateUniqueUsername(formData.name);
      setFormData((prev) => ({
        ...prev,
        username: uniqueUsername,
      }));
    }
  }, [formData.name]);

  const handleChange = (e, name) => {
    setFormData({ ...formData, [name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block mb-1 text-sm font-medium">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder || ""}
                onChange={(e) => handleChange(e, field.name)}
                value={formData[field.name] || ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-200"
                required={field.required}
                disabled={field.disabled}
              />
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;
