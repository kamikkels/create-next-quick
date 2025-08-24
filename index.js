import inquirer from "inquirer";
import path from "path";
import { run, deleteFolder, createFolder, deleteFile, fileExists, writeFile } from './lib/utils.js';
import { createPages } from './lib/templates.js';

(async () => {
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "projectName",
            message: "Enter project name:"
        },
        {
            type: "confirm",
            name: "useTypeScript",
            message: "Do you want to use TypeScript?",
            default: true
        },
        {
            type: "confirm",
            name: "useTailwind",
            message: "Do you want to use Tailwind CSS?",
            default: true
        },
        {
            type: "confirm",
            name: "useAppDir",
            message: "Do you want to use the app directory?",
            default: true
        },
        {
            type: "input",
            name: "pages",
            message: "Enter the names of the pages you want to create (comma-separated):",
            filter: (input) => input.split(',').map((page) => page.trim())
        },
        {
            type: "list",
            name: "linter",
            message: "Choose a linter:",
            choices: ["eslint", "biome", "other"],
            default: "eslint"
        },
        {
            type: "confirm",
            name: "useShadcn",
            message: "Do you want to use Shadcn UI?",
            default: true
        }
    ]);

    const { projectName, useTypeScript, useTailwind, useAppDir, pages, linter, useShadcn } = answers;
    const projectPath = path.join(process.cwd(), projectName);

    console.log(`
        Creating ${projectName}...`);

    let command = `npx create-next-app@latest ${projectName} --use-npm --yes`;
    if (useTypeScript) {
        command += " --ts";
    } else {
        command += " --js";
    }
    if (useTailwind) {
        command += " --tailwind";
    }
    if (useAppDir) {
        command += " --app";
    } else {
        command += " --no-app --src-dir";
    }

    run(command);

    const publicPath = path.join(projectPath, "public");
    deleteFolder(publicPath);
    createFolder(publicPath);

    

    const pagesPath = useAppDir ? path.join(projectPath, "app") : path.join(projectPath, "src", "pages");
    createPages(pagesPath, pages, useTypeScript, useAppDir);

    const readmePath = path.join(projectPath, "README.md");
    writeFile(readmePath, "");

    if (linter === "biome") {
        run(`npm install --save-dev @biomejs/biome`, projectPath);
        run(`npx @biomejs/biome init`, projectPath);
    }

    if (useShadcn) {
        run(`npm install --save-dev tailwindcss-animate class-variance-authority`, projectPath);
        run(`npx shadcn-ui@latest init`, projectPath);
        const componentsJsonPath = path.join(projectPath, "components.json");
        const componentsJsonContent = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": "default",
            "rsc": useAppDir,
            "tsx": useTypeScript,
            "tailwind": {
                "config": useTypeScript ? "tailwind.config.ts" : "tailwind.config.js",
                "css": "src/app/globals.css",
                "baseColor": "slate",
                "cssVariables": true
            },
            "aliases": {
                "components": "@/components",
                "utils": "@/lib/utils"
            }
        };
        writeFile(componentsJsonPath, JSON.stringify(componentsJsonContent, null, 2));
    }

    console.log("Setup complete!");
    console.log(`
        Next steps:
        cd ${projectName}
        npm run dev`);
})();
