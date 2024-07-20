const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

const executePython = (filepath, inputFilePath) => {
    const jobId = path.basename(filepath, '.py');
    const outDir = path.join(path.dirname(filepath), '../../outputs/python');
    const outPath = path.join(outDir, `${jobId}.txt`);

    return new Promise(async (resolve, reject) => {
        try {
            await fs.mkdir(outDir, { recursive: true });

            exec(
                `python "${filepath}" < "${inputFilePath}"`,
                async (error, stdout, stderr) => {
                    if (error) {
                        reject({ error, stderr });
                        return;
                    }
                    if (stderr) {
                        reject(stderr);
                        return;
                    }
                    const normalizedOutput = stdout.replace(/\r\n/g, '\n');
                    
                    try {
                        await fs.writeFile(outPath, normalizedOutput);
                        resolve({ output: normalizedOutput, outputPath: outPath });
                    } catch (writeError) {
                        reject({ error: writeError, message: "Failed to write output to file" });
                    }
                }
            );
        } catch (mkdirError) {
            reject({ error: mkdirError, message: "Failed to create output directory" });
        }
    });
};

module.exports = {
    executePython,
};