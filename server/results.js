import axios from 'axios';
import cheerio from 'cheerio';
import { createObjectCsvWriter as createCsvWriter } from 'csv-writer';

const baseUrl = 'http://results.ietdavv.edu.in/DisplayStudentResult?rollno=';
const typeOfStudent = '&typeOfStudent=Regular';

// Generate roll numbers dynamically
const generateRollNumbers = (prefix, start, end) => {
    const rollNumbers = [];
    for (let i = start; i <= end; i++) {
        rollNumbers.push(`${prefix}${i.toString().padStart(2, '0')}`);
    }
    return rollNumbers;
};



const csvWriter = createCsvWriter({
    path: 'results.csv',
    header: [
        { id: 'name', title: 'Name' },
        { id: 'rollNo', title: 'Roll No' },
        { id: 'sgpa', title: 'SGPA' }
    ]
});

const fetchResult = async (rollNo) => {
    try {
        const response = await axios.get(`${baseUrl}${rollNo}${typeOfStudent}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data for roll no ${rollNo}:`, error.message);
        return null;
    }
};

export const extractData = (html) => {
    const $ = cheerio.load(html);
    const name = $('td:contains("Student Name")').next().text().trim();
    const rollNo = $('td:contains("Roll Number")').next().text().trim();
    const sgpa = $('td:contains("SGPA")').next().text().trim();

    // If any of the required data is missing, return null
    if (!name || !rollNo || !sgpa) return null;

    return { name, rollNo, sgpa };
};

export const results = async (formData) => {
    const results = [];
    let d = '';
    let year = formData.year;
    const semester = formData.semester;
    let branch ;
    const section = formData.section==='A'?'0':'1';

    if(formData.branch === 'IT') branch = 'I';
    else if(formData.branch === 'CS') branch = 'C';
    else if(formData.branch === 'ETC') branch = 'T';
    else if(formData.branch === 'EI') branch = 'E';
    else if(formData.branch === 'Civil') branch = 'V';
    else if(formData.branch === 'Mechanical') branch = 'M';

    const base=year.slice(2,4)+branch+semester+section;

    const rollNumbers = generateRollNumbers(base, 1, 100);

    
    // year = parseInt(year, 10); // Convert to a number
    // year++; // Decrement
    // year = year.toString(); // Convert back to a string (optional)
    // const lateralRollNumbers = generateRollNumbers(year.slice(2,4)+branch+semester+section, 1, 100);

    // rollNumbers.push(...lateralRollNumbers);
 
    for (const rollNo of rollNumbers) {
        const html = await fetchResult(rollNo);
        if (html) {
            const data = extractData(html);
            if (data) {
                results.push(data);
            } else {
                console.log(`No valid data found for roll no ${rollNo}`);
            }
        }
    
}
    try {
        d=JSON.stringify(results);
        await csvWriter.writeRecords(results);
        console.log('CSV file has been written successfully');
        return results.length>0?d:'No valid data found';
    } catch (error) {
        console.error('Error writing CSV file:', error.message);
    }
    
};


