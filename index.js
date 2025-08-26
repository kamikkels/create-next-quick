#!/usr/bin/env node
import inquirer from "inquirer";
import path from "path";
import { run, deleteFolder, createFolder, deleteFile, fileExists, writeFile } from './lib/utils.js';
import { createPages, createLayout } from './lib/templates.js';

(async () => {
    const answers = await inquirer.prompt([
        {
            type: "input",
            name: "projectName",
            message: "Enter project name:",
            filter: (input) => input.trim() === '' ? '.' : input.trim()
        },
        {
            type: "confirm",
            name: "useTypeScript",
            message: "Do you want to use TypeScript? (default: Yes)",
            default: true
        },
        {
            type: "confirm",
            name: "useTailwind",
            message: "Do you want to use Tailwind CSS? (default: Yes)",
            default: true
        },
        {
            type: "confirm",
            name: "useSrcDir",
            message: "Do you want to use src directory? (default: Yes)",
            default: true
        },
        {
            type: "confirm",
            name: "useAppDir",
            message: "Do you want to use the app directory? (default: Yes)",
            default: true
        },
        {
            type: "input",
            name: "pages",
            message: "Enter the names of the pages you want to create (comma-separated, default: none):",
            default: "",
            filter: (input) => input.split(',').map((page) => page.trim()).filter(page => page !== '')
        },
        {
            type: "list",
            name: "linter",
            message: "Choose a linter (default: none):",
            choices: ["none", "eslint", "biome"],
            default: "none"
        },
        {
            type: "confirm",
            name: "useShadcn",
            message: "Do you want to use Shadcn UI? (default: No)",
            default: false
        }
    ]);

    const { projectName, useTypeScript, useTailwind, useAppDir, useSrcDir, pages, linter, useShadcn } = answers;
    const projectPath = path.join(process.cwd(), projectName);

    console.log(`Creating ${projectName}...`);

    let command = `npx create-next-app@latest ${projectName} --use-npm --yes`;
    if (useTypeScript) {
        command += " --ts";
    } else {
        command += " --js";
    }
    if (useTailwind) {
        command += " --tailwind";
    }
    if (useSrcDir) {
        command += " --src-dir";
    }
    if (useAppDir) {
        command += " --app";
    } else {
        command += " --no-app";
    }

    if (linter === "none") {
        command += " --no-eslint";
    }

    run(command);

    if (!useAppDir) {
        const apiHelloPath = useSrcDir
            ? path.join(projectPath, "src", "pages", "api", "hello.js")
            : path.join(projectPath, "pages", "api", "hello.js");
        if (fileExists(apiHelloPath)) {
            deleteFile(apiHelloPath);
        }
    }

    const publicPath = path.join(projectPath, "public");
    deleteFolder(publicPath);
    createFolder(publicPath);

    createLayout(projectPath, projectName, useTypeScript, useAppDir, useSrcDir);

    const pagesPath = useAppDir ? (useSrcDir ? path.join(projectPath, "src", "app") : path.join(projectPath, "app")) : (useSrcDir ? path.join(projectPath, "src", "pages") : path.join(projectPath, "pages"));
    createPages(pagesPath, pages, useTypeScript, useAppDir, useSrcDir);

    const faviconPathInAppOrSrc = useAppDir ? (useSrcDir ? path.join(projectPath, "src", "app", "favicon.ico") : path.join(projectPath, "app", "favicon.ico")) : (useSrcDir ? path.join(projectPath, "src", "favicon.ico") : path.join(projectPath, "favicon.ico"));
    if (fileExists(faviconPathInAppOrSrc)) {
        deleteFile(faviconPathInAppOrSrc);
    }

    let defaultPagePath;
    if (useAppDir) {
        defaultPagePath = useSrcDir ? path.join(projectPath, "src", "app", useTypeScript ? "page.tsx" : "page.js") : path.join(projectPath, "app", useTypeScript ? "page.tsx" : "page.js");
    } else {
        defaultPagePath = useSrcDir ? path.join(projectPath, "src", "pages", useTypeScript ? "index.tsx" : "index.js") : path.join(projectPath, "pages", useTypeScript ? "index.tsx" : "index.js");
    }
    const emptyPageContent =
        `export default function Page() {\n  return (\n    <></>\n  );\n}\n`;
    writeFile(defaultPagePath, emptyPageContent);

    const readmePath = path.join(projectPath, "README.md");
    writeFile(readmePath, `# ${projectName}`);

    if (linter === "biome") {
        run(`npm install --save-dev @biomejs/biome`, projectPath);
        run(`npx @biomejs/biome init`, projectPath);
    }

    if (useShadcn) {
        run(`npm install --save-dev tailwindcss-animate class-variance-authority`, projectPath);
        run(`npx shadcn@latest init`, projectPath);
        const componentsJsonPath = path.join(projectPath, "components.json");
        const componentsJsonContent = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": "default",
            "rsc": useAppDir,
            "tsx": useTypeScript,
            "tailwind": {
                "config": useTypeScript ? "tailwind.config.ts" : "tailwind.config.js",
                "css": useAppDir ? (useSrcDir ? "src/app/globals.css" : "app/globals.css") : (useSrcDir ? "src/styles/globals.css" : "styles/globals.css"),
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
Thankyou for using create-next-quick!
Next steps:
cd ${projectName}
npm run dev`);
})();
