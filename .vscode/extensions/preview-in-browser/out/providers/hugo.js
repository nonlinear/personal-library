"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HugoProvider = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class HugoProvider {
    constructor(outputChannel) {
        this.name = 'Hugo';
        this.starting = false;
        this.outputChannel = outputChannel;
    }
    shouldPreview(filePath) {
        // Check if file is in content/ folder and is .md or .html
        return filePath.includes('/content/') &&
            (filePath.endsWith('.md') || filePath.endsWith('.html'));
    }
    async isServerRunning() {
        try {
            const { stdout } = await execAsync('pgrep -f "hugo serve"');
            if (stdout.trim()) {
                this.outputChannel.appendLine('[Hugo] Server is already running');
                return true;
            }
        }
        catch (error) {
            // pgrep returns error if not found
        }
        return false;
    }
    async startServer() {
        if (this.starting) {
            this.outputChannel.appendLine('[Hugo] Server already starting...');
            return false;
        }
        this.outputChannel.appendLine('[Hugo] Starting server...');
        this.starting = true;
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                this.outputChannel.appendLine('[Hugo] No workspace folder found');
                this.starting = false;
                return false;
            }
            const cwd = workspaceFolder.uri.fsPath;
            (0, child_process_1.exec)(`cd "${cwd}" && hugo serve -D`, (error) => {
                if (error) {
                    this.outputChannel.appendLine('[Hugo] Error: ' + error.message);
                }
                this.starting = false;
            });
            // Wait for Hugo to start
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.outputChannel.appendLine('[Hugo] Server should be running');
            return true;
        }
        catch (error) {
            this.outputChannel.appendLine('[Hugo] Failed to start: ' + error);
            this.starting = false;
            return false;
        }
    }
    buildUrl(filePath) {
        // Extract path after 'content/'
        const contentIndex = filePath.indexOf('/content/');
        const relativePath = filePath.substring(contentIndex + '/content/'.length);
        // Remove file extension
        const pathWithoutExt = relativePath.replace(/\.(md|html)$/, '');
        return `${this.getBaseUrl()}/${pathWithoutExt}/`;
    }
    getBaseUrl() {
        const config = vscode.workspace.getConfiguration('previewInBrowser');
        return config.get('hugo.baseUrl') || 'http://localhost:1313';
    }
}
exports.HugoProvider = HugoProvider;
//# sourceMappingURL=hugo.js.map