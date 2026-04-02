const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            filelist = fs.statSync(dirFile).isDirectory()
                ? walkSync(dirFile, filelist)
                : filelist.concat(dirFile);
        } catch (err) {
            if (err.code === 'ENOENT' || err.code === 'EACCES' || err.code === 'EPERM') return;
            throw err;
        }
    });
    return filelist;
};

const replaceInFile = (filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.html') && !filePath.endsWith('.json')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ordered to prevent partial replacements causing issues
    const replacements = [
        { from: /TechniquesContext/g, to: 'ExercisesContext' },
        { from: /TechniqueContext/g, to: 'ExerciseContext' },
        { from: /Techniques/g, to: 'Exercises' },
        { from: /techniques/g, to: 'exercises' },
        { from: /Technique/g, to: 'Exercise' },
        { from: /technique/g, to: 'exercise' },
        { from: /JournalEntry/g, to: 'ActivityLog' },
        { from: /journalEntry/g, to: 'activityLog' },
        { from: /Journal/g, to: 'Activities' },
        { from: /journal/g, to: 'activities' },
        { from: /isGi/g, to: 'isPrimarySport' },
        { from: /belt/g, to: 'primarySport' },
        { from: /BeltColor/g, to: 'string' },
        { from: /bjjExperience/g, to: 'experience' },
        { from: /bjj-amigo/g, to: 'sport-amigo' },
        { from: /BJJ Amigo/g, to: 'Sport Amigo' },
        { from: /BJJ/g, to: 'Sport' },
        { from: /giTraining/g, to: 'gymTraining' },
        { from: /noGiTraining/g, to: 'homeWorkout' },
        { from: /stripes/g, to: 'completedGoals' }
    ];

    let oldContent = content;
    for (const r of replacements) {
        content = content.replace(r.from, r.to);
    }
    
    if (oldContent !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
};

const srcFiles = walkSync(path.join(__dirname, 'src'));
srcFiles.forEach(replaceInFile);
console.log('Done!');
