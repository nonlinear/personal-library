"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorybookProvider = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class StorybookProvider {
    constructor(outputChannel) {
        this.name = 'Storybook';
        this.starting = false;
        this.outputChannel = outputChannel;
    }
    shouldPreview(filePath) {
        // Check if file matches .stories pattern
        return filePath.includes('.stories.') &&
            (filePath.endsWith('.js') ||
                filePath.endsWith('.jsx') ||
                filePath.endsWith('.ts') ||
                filePath.endsWith('.tsx'));
    }
    async isServerRunning() {
        try {
            // Check for common Storybook port
            const { stdout } = await execAsync('lsof -i :6006 -t');
            if (stdout.trim()) {
                this.outputChannel.appendLine('[Storybook] Server is already running');
                return true;
            }
        }
        catch (error) {
            // lsof returns error if port not in use
        }
        return false;
    }
    async startServer() {
        if (this.starting) {
            this.outputChannel.appendLine('[Storybook] Server already starting...');
            return false;
        }
        this.outputChannel.appendLine('[Storybook] Starting server...');
        this.starting = true;
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                this.outputChannel.appendLine('[Storybook] No workspace folder found');
                this.starting = false;
                return false;
            }
            const cwd = workspaceFolder.uri.fsPath;
            (0, child_process_1.exec)(`cd "${cwd}" && npm run storybook`, (error) => {
                if (error) {
                    this.outputChannel.appendLine('[Storybook] Error: ' + error.message);
                }
                this.starting = false;
            });
            // Wait for Storybook to start (longer than Hugo)
            await new Promise(resolve => setTimeout(resolve, 10000));
            this.outputChannel.appendLine('[Storybook] Server should be running');
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine('[Storybook] Failed to start: ' + error);
            this.starting = false;
            return false;
        }
    }
    buildUrl(filePath) {
        // Extract component name from file path
        // e.g., Button.stories.tsx -> button
        const fileName = filePath.split('/').pop() || '';
        const componentName = fileName
            .replace('.stories.', '.')
            .split('.')[0]
            .toLowerCase();
        // Storybook URL pattern: /?path=/story/component-name
        return `${this.getBaseUrl()}/?path=/story/${componentName}`;
    }
    getBaseUrl() {
        const config = vscode.workspace.getConfiguration('previewInBrowser');
        return config.get('storybook.baseUrl') || 'http://localhost:6006';
    }
}
exports.StorybookProvider = StorybookProvider;
//# sourceMappingURL=storybook.js.map