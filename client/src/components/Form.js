import { useState } from 'react';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import './CodeSnippetForm.css';

const CodeSnippetForm = () => {
    const [username, setUsername] = useState('');
    const [codeLanguage, setCodeLanguage] = useState('');
    const [stdin, setStdin] = useState('');
    const [sourceCode, setSourceCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    axios.defaults.baseURL = 'https://tuf-assignment-aqmr.onrender.com';
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true to display spinner
        try {
            await axios.post('/submit', {
                username,
                code_language: codeLanguage,
                stdin,
                source_code: sourceCode
            });
            setUsername('');
            setCodeLanguage('');
            setStdin('');
            setSourceCode('');
            setMessage('Code snippet submitted successfully');
        } catch (error) {
            console.error('Error submitting snippet:', error);
            setMessage('Error submitting code snippet');
        } finally {
            setLoading(false); // Set loading back to false after submission
        }
    };

    return (
        <div className="form-container">
            <h1 className="form-title">Code Snippet Submission</h1>
            <div className="form">
                <div className="form-group">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="codeLanguage" className="form-label">Code Language</label>
                    <select id="codeLanguage" value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)} className="form-input" required>
                        <option value="">Select a language</option>
                        <option value="C++">C++</option>
                        <option value="Java">Java</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="stdin" className="form-label">Standard Input</label>
                    <input type="text" id="stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="sourceCode" className="form-label">Source Code</label>
                    <textarea id="sourceCode" value={sourceCode} onChange={(e) => setSourceCode(e.target.value)} rows="5" className="form-textarea" required />
                </div>
                {loading ? ( // Display spinner if loading is true
                    <ClipLoader size={14} />
                ) : (
                    <button className="form-button" onClick={handleSubmit}>Submit</button>
                )}
                {message && <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</div>}
            </div>
        </div>
    );
};

export default CodeSnippetForm;
