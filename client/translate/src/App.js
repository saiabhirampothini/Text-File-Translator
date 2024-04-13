import React, { useState } from "react";
import axios from "axios";
import "../src/App.css";
function App() {
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleLanguageChange = (event) => {
    setTargetLanguage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetLanguage", targetLanguage);
    try {
      const response = await axios.post(
        "http://localhost:5050/api/translate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "text/plain", // Set response type to text
        }
      );
      window.alert("Download the file");
      const url = window.URL.createObjectURL(new Blob([response.data]), {
        type: "text/plain", // Set content type to text
      });

      // Create a link element
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "translated_file.txt"); // Set the file name with .txt extension

      // Append the link to the body and click it
      document.body.appendChild(link);
      link.click();

      // Remove the link from the body
      document.body.removeChild(link);
      window.location.reload();
    } catch (error) {
      setMessage("An error occurred while uploading and translating the file.");
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="header">Text file translator</h1>
      <p className="heading-text">
        Translate your text files from one language to any other language in
        just 5 seconds
      </p>
      <div className="body">
        <h2>File Upload</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="file">Choose .txt file:</label>
            <input type="file" id="file" onChange={handleFileChange} />
          </div>
          <div>
            <label htmlFor="targetLanguage">Select Target Language:</label>
            <select
              id="targetLanguage"
              value={targetLanguage}
              onChange={handleLanguageChange}
            >
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="te">Telugu</option>
              <option value="hi">Hindi</option>
              <option value="bn">Bengali</option>
              <option value="gu">Gujarati</option>
              <option value="kn">Kannada</option>
              <option value="ml">Malayalam</option>
              <option value="mr">Marathi</option>
              <option value="pa">Punjabi</option>
              <option value="ta">Tamil</option>
              <option value="ar">Arabic</option>
              <option value="zh">Chinese (Simplified)</option>
              <option value="zh-TW">Chinese (Traditional)</option>
              <option value="cs">Czech</option>
              <option value="da">Danish</option>
              <option value="nl">Dutch</option>

              <option value="fi">Finnish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="el">Greek</option>
              <option value="he">Hebrew</option>
              <option value="hu">Hungarian</option>
              <option value="id">Indonesian</option>
              <option value="it">Italian</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="ms">Malay</option>
              <option value="no">Norwegian</option>
              <option value="pl">Polish</option>
              <option value="pt">Portuguese</option>
              <option value="ro">Romanian</option>
              <option value="ru">Russian</option>
              <option value="sk">Slovak</option>
              <option value="sl">Slovenian</option>
              <option value="es">Spanish</option>
              <option value="sv">Swedish</option>
              <option value="tr">Turkish</option>
              <option value="uk">Ukrainian</option>
              <option value="vi">Vietnamese</option>

              {/* Add more options for other languages */}
            </select>
          </div>
          <p>Please wait for 5 seconds after uploading the file..</p>
          <button type="submit">Upload and Translate</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default App;
