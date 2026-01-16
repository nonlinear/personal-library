import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PreviewProvider } from '../types';

const execAsync = promisify(exec);

export class StorybookProvider implements PreviewProvider {
    name = 'Storybook';
    private starting = false;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    shouldPreview(filePath: string): boolean {
        // Check if file matches .stories pattern
        return filePath.includes('.stories.') &&
               (filePath.endsWith('.js') ||
                filePath.endsWith('.jsx') ||
                filePath.endsWith('.ts') ||
                filePath.endsWith('.tsx'));
    }

    async isServerRunning(): Promise<boolean> {
        try {
            // Check for common Storybook port
            const { stdout } = await execAsync('lsof -i :6006 -t');
            if (stdout.trim()) {
                this.outputChannel.appendLine('[Storybook] Server is already running');
                return true;
            }
        } catch (error) {
            // lsof returns error if port not in use
        }
        return false;
    }

    async startServer(): Promise<boolean> {
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
            exec(`cd "${cwd}" && npm run storybook`, (error) => {
                if (error) {
                    this.outputChannel.appendLine('[Storybook] Error: ' + error.message);
                }
                this.starting = false;
            });

            // Wait for Storybook to start (longer than Hugo)
            await new Promise(resolve => setTimeout(resolve, 10000));
            this.outputChannel.appendLine('[Storybook] Server should be running');
            return true;
        } catch (error) {
            this.outputChannel.appendLine('[Storybook] Failed to start: ' + error);
            this.starting = false;
            return false;
        }
    }

    buildUrl(filePath: string): string {
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

    getBaseUrl(): string {
        const config = vscode.workspace.getConfiguration('previewInBrowser');
        return config.get<string>('storybook.baseUrl') || 'http://localhost:6006';
    }
}
