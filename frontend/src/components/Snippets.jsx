import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Snippets.css';
import Pagination from './Pagination';

const CodeSnippetList = () => {
    const [snippets, setSnippets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [snippetsPerPage] = useState(5);

    useEffect(() => {
        fetchSnippets();
    }, []);

    const fetchSnippets = async () => {
        try {
            const response = await axios.get('http://localhost:5000/snippets');
            // Extract date and time from timestamp
            const formattedSnippets = response.data.map(snippet => {
                const timestamp = new Date(snippet.timestamp);
                const timezoneOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
                const localTime = new Date(timestamp.getTime() + timezoneOffset);
                return {
                    ...snippet,
                    date: timestamp.toLocaleDateString(),
                    time: localTime.toLocaleTimeString(),
                };
            });
            setSnippets(formattedSnippets);
        } catch (error) {
            console.error('Error fetching snippets:', error);
        }
    };

    // Get current snippets
    const indexOfLastSnippet = currentPage * snippetsPerPage;
    const indexOfFirstSnippet = indexOfLastSnippet - snippetsPerPage;
    const currentSnippets = snippets.slice(indexOfFirstSnippet, indexOfLastSnippet);

    // Change page
    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <div>
            <h2>Submitted Snippets</h2>
            <table className="table-container">
                <thead className="table-header">
                    <tr>
                        <th>Username</th>
                        <th>Code Language</th>
                        <th>Standard Input</th>
                        <th>Source Code (First 100 chars)</th>
                        <th>Standard Output</th>
                        <th>Date</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody className="table-body">
                    {currentSnippets.map((snippet, index) => (
                        <tr key={index}>
                            <td>{snippet.username}</td>
                            <td>{snippet.code_language}</td>
                            <td>{snippet.stdin}</td>
                            <td>{snippet.source_code}</td>
                            <td>{snippet.stdout}</td>
                            <td>{snippet.date}</td>
                            <td>{snippet.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                snippetsPerPage={snippetsPerPage}
                totalSnippets={snippets.length}
                paginate={paginate}
            />
        </div>
    );
};

export default CodeSnippetList;