const fs = require('fs');
const data = fs.readFileSync('results.csv', 'utf8');

const lines = data.trim().split('\n');
const headers = lines[0];
const students = lines.slice(1).map(line => {
    const [name, rollNo, sgpa] = line.split(',');
    return { name, rollNo, sgpa: parseFloat(sgpa) };
});

students.sort((a, b) => b.sgpa - a.sgpa);


let i=1;
console.log(headers);
students.forEach(student => {
    console.log(`${i},${student.name},${student.rollNo},${student.sgpa}`);
    i=i+1;
});
