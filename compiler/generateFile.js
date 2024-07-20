const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const generateFile = async (language, code, input) => {
    const jobId = uuidv4();
    const dirCode = path.join(__dirname, 'codes');
    const dirInput = path.join(__dirname, 'inputs');

    if (!fs.existsSync(dirCode)) {
        fs.mkdirSync(dirCode, { recursive: true });
    }

    if (!fs.existsSync(dirInput)) {
        fs.mkdirSync(dirInput, { recursive: true });
    }

    const filePath = path.join(dirCode, `${jobId}.${language}`);
    const inputFilePath = path.join(dirInput, `${jobId}.txt`);

    await fs.promises.writeFile(filePath, code);
    await fs.promises.writeFile(inputFilePath, input);

    return { filePath, inputFilePath };
};

module.exports = { generateFile };
