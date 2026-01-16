import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PreviewProvider } from '../types';

const execAsync = promisify(exec);

export class HugoProvider implements PreviewProvider {
    name = 'Hugo';
    private starting = false;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    shouldPreview(filePath: string): boolean {
        // Check if file is in content/ folder and is .md or .html
        return filePath.includes('/content/') &&
               (filePath.endsWith('.md') || filePath.endsWith('.html'));
    }

    async isServerRunning(): Promise<boolean> {
        try {
            const { stdout } = await execAsync('pgrep -f "hugo serve"');
            if (stdout.trim()) {
                this.outputChannel.appendLine('[Hugo] Server is already running');
                return true;
            }
        } catch (error) {
            // pgrep returns error if not found
        }
        return false;
    }

    async startServer(): Promise<boolean> {
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
            exec(`cd "${cwd}" && hugo serve -D`, (error) => {
                if (error) {
                    this.outputChannel.appendLine('[Hugo] Error: ' + error.message);
                }
                this.starting = false;
            });

            // Wait for Hugo to start
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.outputChannel.appendLine('[Hugo] Server should be running');
            return true;
        } catch (error) {
            this.outputChannel.appendLine('[Hugo] Failed to start: ' + error);
            this.starting = false;
            return false;
        }
    }

    buildUrl(filePath: string): string {
        // Extract path after 'content/'
        const contentIndex = filePath.indexOf('/content/');
        const relativePath = filePath.substring(contentIndex + '/content/'.length);

        // Remove file extension
        const pathWithoutExt = relativePath.replace(/\.(md|html)$/, '');

        return `${this.getBaseUrl()}/${pathWithoutExt}/`;
    }

    getBaseUrl(): string {
        const config = vscode.workspace.getConfiguration('previewInBrowser');
        return config.get<string>('hugo.baseUrl') || 'http://localhost:1313';
    }
}
