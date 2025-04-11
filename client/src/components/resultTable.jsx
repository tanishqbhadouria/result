import React from 'react';
import resultContext from '../context/resultContext';

export const ResultTable = () => {
  const { results } = React.useContext(resultContext);

  return (
    <div className="container mx-auto p-4">
      {/* Render the table only if there are results */}
      {(Array.isArray(results) && results.length>0 ) ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full table-auto text-sm text-left text-gray-500">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Roll Number</th>
                <th className="px-4 py-2">CGPA</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {results.map((student, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.rollNo}</td>
                  <td className="px-4 py-2">{student.sgpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) :(
        // Optionally display a message if no results
        <div className="text-center text-gray-500">
         {results}
        </div>
      )}
    </div>
  );
};
