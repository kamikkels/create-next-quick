import { writeFile, createFolder, fileExists, readFile } from './utils.js';
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

export const createLayout = (projectPath, projectName, useTypeScript, useAppDir) => {
  const extension = useTypeScript ? ".tsx" : ".js";

  if (!useAppDir) {
    // layout files are mainly used in appDir structure
    return;
  }

  const layoutPath = path.join(projectPath, "app", `layout${extension}`);

  if (fileExists(layoutPath)) {
    let layoutContent = readFile(layoutPath);
    layoutContent = layoutContent.replace(
      /title:\s*".*?"/,
      `title: "${projectName}"`
    );
    layoutContent = layoutContent.replace(
      /description:\s*".*?"/,
      `description: ""`
    );
    writeFile(layoutPath, layoutContent);
  } else {
    // Create minimal new layout
    const layoutContent = useTypeScript
      ? `export const metadata = {
  title: "${projectName}",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`
      : `export const metadata = {
  title: "${projectName}",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

    createFolder(path.join(projectPath, "app"));
    writeFile(layoutPath, layoutContent);
  }
};
