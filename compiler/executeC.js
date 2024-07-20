const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const executeC = (filepath, inputFilePath) => {
    const jobId = path.basename(filepath, '.c');
    const outDir = path.join(path.dirname(filepath), '../../outputs/c');
    const outPath = path.join(outDir, `${jobId}.exe`);

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        exec(
            `gcc "${filepath}" -o "${outPath}"`,
            (compileError, compileStdout, compileStderr) => {
                if (compileError) {
                    reject({ error: compileError, stderr: compileStderr });
                    return;
                }

                exec(
                    `"${outPath}" < "${inputFilePath}"`,
                    (runError, runStdout, runStderr) => {
                        if (runError) {
                            reject({ error: runError, stderr: runStderr });
                            return;
                        }
                        const normalizedOutput = runStdout.replace(/\r\n/g, '\n').trim();
                        resolve({ output: normalizedOutput });
                    }
                );
            }
        );
    });
};

module.exports = {
    executeC,
};
