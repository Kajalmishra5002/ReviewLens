const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'Electronics_Dataset (2).xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Headers:', Object.keys(data[0]));
console.log('First row:', data[0]);