const express = require('express');
const app = express();
const { generateFile } = require('./generateFile');
const { executeCpp } = require('./executeCPP');
const { executeJava } = require('./executeJava');
const { executePython } = require('./executePython');
const { executeC } = require('./executeC');
const cors = require('cors');

// middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ online: 'compiler' });
});

app.post("/run", async (req, res) => {
    const { language = 'cpp', code, input } = req.body;
    if (code === undefined) {
        return res.status(400).json({ success: false, error: "Empty code!" });
    }
    try {
        const { filePath, inputFilePath } = await generateFile(language, code, input);
        console.log(`Generated files: ${filePath}, ${inputFilePath}`);
        let result;
        switch (language) {
            case 'cpp':
                result = await executeCpp(filePath, inputFilePath);
                break;
            case 'java':
                result = await executeJava(filePath, inputFilePath);
                break;
            case 'py':
                result = await executePython(filePath, inputFilePath);
                break;
            case 'c':
                result = await executeC(filePath, inputFilePath);
                break;
            default:
                return res.status(400).json({ success: false, error: "Unsupported language!" });
        }
        res.json({ output: result.output });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "An error occurred during execution" });
    }
});

app.post("/submit", async (req, res) => {
    const { language = 'cpp', code, testCases } = req.body;
    if (code === undefined) {
        return res.status(400).json({ success: false, error: "Empty code!" });
    }
    try {
        const results = [];
        for (const testCase of testCases) {
            const { filePath, inputFilePath } = await generateFile(language, code, testCase.input);
            let result;
            switch (language) {
                case 'cpp':
                    result = await executeCpp(filePath, inputFilePath);
                    break;
                case 'java':
                    result = await executeJava(filePath, inputFilePath);
                    break;
                case 'py':
                    result = await executePython(filePath, inputFilePath);
                    break;
                case 'c':
                    result = await executeC(filePath, inputFilePath);
                    break;
                default:
                    return res.status(400).json({ success: false, error: "Unsupported language!" });
            }
            results.push({
                input: testCase.input,
                expectedOutput: testCase.expectedOutput,
                actualOutput: result.output.trim(),
                passed: result.output.trim().replace(/\s+/g, '') === testCase.expectedOutput.trim().replace(/\s+/g, '')
            });
            console.log(`Input: "${testCase.input}"`);
            console.log('Expected:', testCase.expectedOutput);
            console.log('Actual:', result.output.trim());
        }
        const allPassed = results.every(result => result.passed);
        res.json({ 
            success: true, 
            results,
            status: allPassed ? 'Success' : 'Failed',
            message: allPassed ? 'All test cases passed!' : 'Some test cases failed.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            error: error.message || "An error occurred during execution",
            status: 'Error',
            message: 'An error occurred during code execution.'
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
});