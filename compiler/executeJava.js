const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const executeJava = (filepath, inputFilePath) => {
    const jobId = path.basename(filepath, '.java');
    const dirName = path.dirname(filepath);
    return new Promise((resolve, reject) => {
        exec(
            `javac "${filepath}"`,
            (compileError, compileStdout, compileStderr) => {
                if (compileError) {
                    reject({ error: compileError, stderr: compileStderr });
                    return;
                }
               
                exec(
                    `java -cp "${dirName}" ${jobId}`,
                    { input: fs.readFileSync(inputFilePath, 'utf8') },
                    (runError, runStdout, runStderr) => {
                        if (runError) {
                            reject({ error: runError, stderr: runStderr });
                            return;
                        }
                        const normalizedOutput = runStdout.replace(/\r\n/g, '\n');
                        resolve(normalizedOutput);
                    }
                );
            }
        );
    });
};

module.exports = {
    executeJava,
};