import React, { useState } from 'react';
import axios from 'axios';
import resultContext from '../context/resultContext';

export const ResultTable = () => {
  const { results } = React.useContext(resultContext);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchDetailedResult = async (rollNo) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://result-zq31.onrender.com/student/${rollNo}`);
      setHtmlContent(response.data.htmlContent);
      setSelectedStudent(rollNo);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching detailed result:', error);
      alert('Failed to fetch detailed result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setHtmlContent(null);
    setSelectedStudent(null);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Render the table only if there are results */}
      {(Array.isArray(results) && results.length > 0) ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full table-auto text-sm text-left text-gray-500">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Roll Number</th>
                <th className="px-4 py-2">SGPA</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {results.map((student, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.rollNo}</td>
                  <td className="px-4 py-2">{student.sgpa}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => fetchDetailedResult(student.rollNo)}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors duration-200 disabled:bg-gray-400"
                    >
                      {loading && selectedStudent === student.rollNo ? 'Loading...' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Optionally display a message if no results
        <div className="text-center text-gray-500">
          {results}
        </div>
      )}

      {/* Modal for HTML content */}
      {showModal && htmlContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg w-[95vw] h-[95vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Student Result Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden p-2">
              <iframe
                srcDoc={htmlContent}
                className="w-full h-full border-0 rounded"
                title="Student Result"
                sandbox="allow-same-origin"
              />
            </div>
            
            <div className="p-4 border-t text-center bg-gray-50">
              <button
                onClick={closeModal}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
