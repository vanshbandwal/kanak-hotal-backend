const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find . -name "*.controller.js"').toString().split('\n').filter(Boolean);

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // First, let's remove any existing success: true or success: false
    // so we don't end up with duplicates
    content = content.replace(/['"]?success['"]?\s*:\s*(true|false)\s*,?\s*/g, '');
    
    // Replace .json({ with .json({ success: true,
    content = content.replace(/\.json\(\s*\{/g, '.json({ success: true, ');

    // Handle .json(variable) or .json([ ... ]) 
    // We look for .json( ... ) where it does NOT start with {
    // We will parse character by character to handle nested parenthesis
    let newContent = '';
    let i = 0;
    while (i < content.length) {
        let match = content.indexOf('.json(', i);
        if (match === -1) {
            newContent += content.slice(i);
            break;
        }
        
        newContent += content.slice(i, match + 6);
        i = match + 6;
        
        // Skip whitespace
        while (i < content.length && /\s/.test(content[i])) {
            newContent += content[i];
            i++;
        }
        
        // If it starts with { it's already handled by the regex above!
        // wait, our regex above replaced .json({ with .json({ success: true, 
        // so it already starts with { success: true. 
        if (content[i] === '{') {
            continue; // let the loop continue normally
        }
        
        // Now it's something like .json(taxes)
        // Find the matching closing parenthesis
        let parenCount = 1;
        let startArg = i;
        while (i < content.length && parenCount > 0) {
            if (content[i] === '(') parenCount++;
            if (content[i] === ')') parenCount--;
            i++;
        }
        
        let arg = content.slice(startArg, i - 1);
        
        // We wrap it in { success: true, data: arg }
        newContent += `{ success: true, data: ${arg.trim()} })`;
    }
    
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
}
