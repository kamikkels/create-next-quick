import { writeFile, createFolder } from './utils.js';
import path from 'path';

export const createPages = (pagesPath, pages, useTypeScript, useAppDir) => {
    const extension = useTypeScript ? '.tsx' : '.js';

    if (pages.length === 0) {
        pages.push('index');
    }

    pages.forEach((page) => {
        const pageName = page.charAt(0).toUpperCase() + page.slice(1);
        const pageContent = 
        `export default function ${pageName}() {
    return (
        <div>
            <h1>${pageName}</h1>
        </div>
    );
}`;

        let pagePath;
        if (useAppDir) {
            if (page.toLowerCase() === 'index' || page.toLowerCase() === 'home') {
                pagePath = path.join(pagesPath, `page${extension}`);
            } else {
                const pageDir = path.join(pagesPath, page.toLowerCase());
                createFolder(pageDir);
                pagePath = path.join(pageDir, `page${extension}`);
            }
        } else {
            if (page.toLowerCase() === 'index' || page.toLowerCase() === 'home') {
                pagePath = path.join(pagesPath, `index${extension}`);
            } else {
                pagePath = path.join(pagesPath, `${page.toLowerCase()}${extension}`);
            }
        }
        writeFile(pagePath, pageContent);
    });
};