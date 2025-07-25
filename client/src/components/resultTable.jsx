import React, { useState } from 'react';
import axios from 'axios';
import resultContext from '../context/resultContext';

export const ResultTable = () => {
  const { results } = React.useContext(resultContext);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlData, setHtmlData] = useState(null);

  const fetchDetailedResult = async (rollNo) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://result-zq31.onrender.com/student/${rollNo}`);
      setDetailedResult(response.data);
      setSelectedStudent(rollNo);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching detailed result:', error);
      alert('Failed to fetch detailed result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHtmlData = async (rollNo) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://result-zq31.onrender.com/student/${rollNo}/html`);
      setHtmlData(response.data);
      setSelectedStudent(rollNo);
      setShowHtmlModal(true);
    } catch (error) {
      console.error('Error fetching HTML data:', error);
      alert('No cached HTML found for this student.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setDetailedResult(null);
    setSelectedStudent(null);
  };

  const closeHtmlModal = () => {
    setShowHtmlModal(false);
    setHtmlData(null);
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchDetailedResult(student.rollNo)}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors duration-200 disabled:bg-gray-400"
                      >
                        {loading && selectedStudent === student.rollNo ? 'Loading...' : 'View Details'}
                      </button>
                      <button
                        onClick={() => fetchHtmlData(student.rollNo)}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors duration-200 disabled:bg-gray-400"
                      >
                        View HTML
                      </button>
                    </div>
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

      {/* Modal for detailed result */}
      {showModal && detailedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Detailed Result</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div><strong>Name:</strong> {detailedResult.basicInfo.name}</div>
                  <div><strong>Roll No:</strong> {detailedResult.basicInfo.rollNo}</div>
                  <div><strong>Father's Name:</strong> {detailedResult.basicInfo.fatherName}</div>
                  <div><strong>Branch:</strong> {detailedResult.basicInfo.branch}</div>
                  <div><strong>Semester:</strong> {detailedResult.basicInfo.semester}</div>
                  <div><strong>SGPA:</strong> {detailedResult.basicInfo.sgpa}</div>
                  <div><strong>CGPA:</strong> {detailedResult.basicInfo.cgpa}</div>
                  <div><strong>Result:</strong> {detailedResult.basicInfo.result}</div>
                </div>
              </div>

              {/* Subject-wise Results */}
              {detailedResult.subjects && detailedResult.subjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-600">Subject-wise Results</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-sm">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Subject Code</th>
                          <th className="px-3 py-2 text-left">Subject Name</th>
                          <th className="px-3 py-2 text-left">Internal</th>
                          <th className="px-3 py-2 text-left">External</th>
                          <th className="px-3 py-2 text-left">Total</th>
                          <th className="px-3 py-2 text-left">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedResult.subjects.map((subject, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-3 py-2">{subject.subjectCode}</td>
                            <td className="px-3 py-2">{subject.subjectName}</td>
                            <td className="px-3 py-2">{subject.internalMarks}</td>
                            <td className="px-3 py-2">{subject.externalMarks}</td>
                            <td className="px-3 py-2">{subject.totalMarks}</td>
                            <td className="px-3 py-2">{subject.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={closeModal}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for HTML content */}
      {showHtmlModal && htmlData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Raw HTML Content</h2>
                  <p className="text-sm text-gray-600">
                    Roll No: {htmlData.rollNo} | 
                    Fetched: {new Date(htmlData.fetchedAt).toLocaleString()} | 
                    Size: {(htmlData.contentSize / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={closeHtmlModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* HTML Content Display */}
              <div className="mb-4">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([htmlData.htmlContent], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `result_${htmlData.rollNo}.html`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Download HTML
                  </button>
                  <button
                    onClick={() => {
                      const newWindow = window.open();
                      newWindow.document.write(htmlData.htmlContent);
                      newWindow.document.close();
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Open in New Tab
                  </button>
                </div>
                
                <div className="bg-gray-100 p-4 rounded max-h-96 overflow-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap break-words">
                    {htmlData.htmlContent}
                  </pre>
                </div>
              </div>

              {/* Close Button */}
              <div className="text-center">
                <button
                  onClick={closeHtmlModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
