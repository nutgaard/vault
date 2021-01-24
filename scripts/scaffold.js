const fs = require('fs');
const path = require('path');
const Utils = require('./utils');

const availableTemplates = fs.readdirSync('templates');
const templateName = process.argv[2];
if (!templateName || templateName.length === 0 || !availableTemplates.includes(templateName)) {
    console.log();
    console.error("Must choose one of: " + availableTemplates);
    console.log();

    process.exit(1);
}
const name = process.argv[3];
if (!name || name.length === 0) {
    console.log();
    console.error("Name must be provided");
    console.log();

    process.exit(1);
}

const srcDir = 'templates'
const destDir = path.join('src/components', name);
if (fs.existsSync(destDir)) {
    console.log();
    console.error("component-folder already exists");
    console.log();

    process.exit(1);
}

const replacements = {
    name,
    snakeCaseName: Utils.snakecase(name),
    camelCaseName: Utils.camelcase(name),
    pascalCaseName: Utils.pascalcase(name)
}

const replacementKeys = Object.keys(replacements);
const replacementRegex = new RegExp(`\\[(${replacementKeys.join('|')})\\]`, 'g');
const replacementCallback = (context) => (_, match) => {
    const replacement = replacements[match];
    if (!replacement) {
        console.log();
        console.error(`Found replacementkeys without value in ${context}; ${match}`);
        console.log();

        process.exit(1);
    }
    return replacement
}

fs.mkdirSync(destDir);
const files = fs.readdirSync(`${srcDir}/${templateName}`);
files.forEach((file) => {
    const rawContent = fs.readFileSync(`${srcDir}/${templateName}/${file}`, 'UTF-8');
    const filename = file.replaceAll(replacementRegex, replacementCallback(file));
    const content = rawContent.replaceAll(replacementRegex, replacementCallback(file));

    const filepath = path.join(destDir, filename);
    console.log('Writing file: ', filepath);
    fs.writeFileSync(filepath, content, 'UTF-8');
});
