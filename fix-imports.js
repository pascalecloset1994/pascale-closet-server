import fs from 'fs';
import path from 'path';

const getAllFiles = (dir, ext, fileList = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getAllFiles(filePath, ext, fileList);
        } else if (filePath.endsWith(ext)) {
            fileList.push(filePath);
        }
    }
    return fileList;
};

const moduleFiles = getAllFiles(path.join(process.cwd(), 'src', 'modules'), '.js');

moduleFiles.forEach((file) => {
    let content = fs.readFileSync(file, 'utf8');
    let hasChanges = false;

    // Fix imports for siblings in the same module folder
    const siblingReplacements = [
        { regex: /from\s+["'](\.\.\/controllers\/)([^"']+)["']/g, replace: 'from "./$2"' },
        { regex: /from\s+["'](\.\.\/models\/)([^"']+)["']/g, replace: 'from "./$2"' },
        { regex: /from\s+["'](\.\.\/routes\/)([^"']+)["']/g, replace: 'from "./$2"' },
    ];

    // Fix imports for parent folders (going up 2 levels now instead of 1)
    const parentReplacements = [
        { regex: /from\s+["']\.\.\/config\/([^"']+)["']/g, replace: 'from "../../config/$1"' },
        { regex: /from\s+["']\.\.\/utils\/([^"']+)["']/g, replace: 'from "../../utils/$1"' },
        { regex: /from\s+["']\.\.\/middlewares\/([^"']+)["']/g, replace: 'from "../../middlewares/$1"' },
        { regex: /from\s+["']\.\.\/services\/([^"']+)["']/g, replace: 'from "../../services/$1"' },
        { regex: /from\s+["']\.\.\/templates\/([^"']+)["']/g, replace: 'from "../../templates/$1"' }
    ];

    // Handle the specific renamed models
    const renamedModels = [
        { regex: /from\s+["']\.\/user\.models\.js["']/g, replace: 'from "./user.model.js"' },
        { regex: /from\s+["']\.\/order\.models\.js["']/g, replace: 'from "./order.model.js"' },
    ];

    for (const r of [...siblingReplacements, ...parentReplacements, ...renamedModels]) {
        if (r.regex.test(content)) {
            content = content.replace(r.regex, r.replace);
            hasChanges = true;
        }
    }

    if (hasChanges) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated imports in: ${file}`);
    }
});

console.log('Done module internal imports.');
