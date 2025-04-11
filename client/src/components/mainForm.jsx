import React, { useState } from "react";
import axios from "axios";
import resultContext from "../context/resultContext";

export const MainForm = () => {
  const [formData, setFormData] = useState({
    year: "",
    semester: "",
    branch: "",
    section: "",
  });
  const [loading, setLoading] = useState(false); // Loader state

  const { setResults } = React.useContext(resultContext);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Start loader
    try {
      console.log("Form Data:", formData);
      const response = await axios.post("https://result-zq31.onrender.com/results", formData);
      setResults(response.data);
      console.log("Response:", response);
    } catch (error) {
      console.error("Error submitting the form:", error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-4">
        Academic Details Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Year Field */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select Year
            </option>
            {["2021", "2022", "2023", "2024"].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Field */}
        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
            Semester
          </label>
          <select
            id="semester"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select Semester
            </option>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Field */}
        <div>
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
            Branch
          </label>
          <select
            id="branch"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select Branch
            </option>
            {["IT", "CS", "ETC", "EI", "Civil", "Mechanical"].map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        {/* Section Field */}
        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700">
            Section
          </label>
          <select
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Select Section
            </option>
            {["A", "B"].map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading} // Disable button while loading
          >
            {loading ? "Submitting..." : "Submit"} {/* Button text */}
          </button>
        </div>
      </form>

      {/* Loader */}
      {loading && (
        <div className="flex justify-center mt-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};


