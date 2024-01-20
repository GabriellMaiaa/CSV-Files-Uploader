import React, { useState, useRef } from 'react';
import axios, { AxiosResponse } from 'axios';
import './App.css'; // Importa o arquivo CSS

interface CsvData {
  message: string;
  data: any[];
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert('Select a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response: AxiosResponse<CsvData> = await axios.post('http://localhost:3000/files', formData);

      console.log('CSV Content:', response.data.data); // Display data in the browser console

      setCsvData(response.data.data);
    } catch (error) {
      console.error('Error uploading the file:', error);
      alert('Error uploading the file. Check the console for more details.');
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredData = csvData.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="app-container">
      <header id='header'>
        <h1>CSV Files Uploader</h1>
      </header>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      <button onClick={openFileInput} id='choose-file-button'>Choose File</button>
      {file && <span>{file.name}</span>}

      <button onClick={handleSubmit} id='submit-button'>Submit</button>

      <input
        type="text"
        id='input-search-field'
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />

      <table className="csv-table">
        <thead>
          <tr>
            {csvData.length > 0 &&
              Object.keys(csvData[0]).map((header, index) => (
                <th key={index}>{header}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((value, columnIndex) => (
                <td key={columnIndex}>{String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;

