const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const axios = require('axios');
const cors = require('cors');
const Buffer = require('buffer').Buffer;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const { Pool } = require('pg');
const connectionString = process.env.CONNECTION_STRING;

// Create a new Pool instance with PostgreSQL connection details
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Connect to PostgreSQL database
pool.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err);
    } else {
        console.log('Connected to PostgreSQL database');
    }
});


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const redis = require('ioredis');

const client = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});


app.post('/submit', async (req, res) => {
    const { username, code_language, stdin, source_code } = req.body;
    let code = 71;
    if (code_language === 'Python') {
        code = 71;
    } else if (code_language === 'C++') {
        code = 54;
    } else if (code_language === 'Java') {
        code = 91;
    } else if (code_language === 'JavaScript') {
        code = 93;
    }
    try {
        const output = await executeCode(source_code, code, stdin);
        const insertQuery = 'INSERT INTO user_details (username, code_language, stdin, source_code, stdout, timestamp) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)';
        const values = [username, code_language, stdin, source_code, output];
        await pool.query(insertQuery, values);
        res.status(200).send('Code snippet submitted successfully');
        // Update Redis cache after inserting new data
        const snippets = await fetchDataFromDatabase();
        await client.set('snippets', JSON.stringify(snippets));
    } catch (error) {
        console.error('Error executing code:', error);
        res.status(500).send('Error submitting code snippet');
    }
});


const executeCode = async (sourceCode, languageCode, stdin) => {
    try {
        const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions',
            params: {
                base64_encoded: 'true',
                fields: '*'
            },
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': process.env.RapidAPIKey,
                'X-RapidAPI-Host': process.env.RapidAPIHost
            },
            data: {
                language_id: languageCode,
                source_code: Buffer.from(sourceCode).toString('base64'),
                stdin: Buffer.from(stdin).toString('base64')
            }
        };

        const response = await axios.request(options);
        const submissionId = response.data.token;
        let output = '';

        // Poll Judge0 API until the submission is completed or a maximum number of attempts is reached
        const maxAttempts = 10;
        let attempts = 0;
        const pollInterval = 2000; // 2 seconds (adjust as needed)
        while (attempts < maxAttempts) {
            const submissionDetails = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${submissionId}`, {
                headers: {
                    'X-RapidAPI-Key': process.env.RapidAPIKey,
                    'X-RapidAPI-Host': process.env.RapidAPIHost
                }
            });
            if (submissionDetails.data.status.description === "Accepted") {
                output = submissionDetails.data.stdout;
                break;
            } else {
                output=submissionDetails.data.compile_output ||"Error while compiling";
                attempts++;
                await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
        }

        return output;
    } catch (error) {
        console.error('Error executing code:', error);
    }
};

const fetchDataFromDatabase = async () => {
    try {
        const selectQuery = 'SELECT username, code_language, stdin, LEFT(source_code, 100) AS source_code, stdout, timestamp FROM user_details';
        const { rows } = await pool.query(selectQuery);
        return rows;
    } catch (error) {
        console.error('Error retrieving code snippets from the database:', error);
        throw error;
    }
};

const fetchSnippetsFromRedisOrDatabase = async () => {
    try {
        const cachedSnippets = await client.get('snippets');
        if (cachedSnippets) {
            return JSON.parse(cachedSnippets);
        } else {
            const snippets = await fetchDataFromDatabase();
            await client.set('snippets', JSON.stringify(snippets));
            return snippets;
        }
    } catch (error) {
        console.error('Error retrieving code snippets:', error);
        throw error;
    }
};

app.get('/snippets', async (req, res) => {
    try {
        const snippets = await fetchSnippetsFromRedisOrDatabase();
        res.status(200).json(snippets);
    } catch (error) {
        console.error('Error retrieving code snippets:', error);
        res.status(500).send('Error retrieving code snippets');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
