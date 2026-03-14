import { useEffect, useState } from "react";
import { myResults, downloadResults, downloadResultsPdf } from "../api/results";

const StudentResultsPage = () => {
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    myResults()
      .then((data) => setResults(data.results || data))
      .catch(() => setMessage("Failed to load results"));
  }, []);

  const handleDownload = async () => {
    setMessage("");
    try {
      const blob = await downloadResults();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "results.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage("Failed to download results");
    }
  };

  const handleDownloadPdf = async () => {
    setMessage("");
    try {
      const blob = await downloadResultsPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "results.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage("Failed to download results PDF");
    }
  };

  return (
    <section className="card">
      <h3>Published Results</h3>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={handleDownload} style={{ marginRight: '0.5rem' }}>Download Results CSV</button>
        <button onClick={handleDownloadPdf}>Download Results PDF</button>
      </div>
      {message && <p className="info">{message}</p>}
      <table>
        <thead>
          <tr>
            <th>Course</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Grade Point</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>{result.course_code}</td>
              <td>{result.score}</td>
              <td>{result.grade}</td>
              <td>{result.grade_point}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default StudentResultsPage;
