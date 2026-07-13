const fs = require('fs');

const html = fs.readFileSync('c:\\Users\\ogosh\\Desktop\\AI作業用\\入力アプリ\\NYUURYOKU-APP\\nyuuryoku.html', 'utf-8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
let errors = [];

while ((match = regex.exec(html)) !== null) {
    const scriptContent = match[1];
    if (!scriptContent.trim()) continue;

    count++;
    const tempFile = `temp_script_${count}.js`;
    fs.writeFileSync(tempFile, scriptContent);

    try {
        const { execSync } = require('child_process');
        execSync(`node -c ${tempFile}`, { stdio: 'pipe' });
    } catch (e) {
        errors.push(`Script ${count} failed syntax check:\n${e.stderr.toString()}`);
    } finally {
        fs.unlinkSync(tempFile);
    }
}

if (errors.length > 0) {
    console.error("Syntax errors found:");
    console.error(errors.join("\n\n"));
    process.exit(1);
} else {
    console.log(`Checked ${count} scripts. All passed syntax check.`);
}
