import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectType } from '../types';

export class ProjectDetector {
    /**
     * Detect project type based on workspace files
     */
    static async detectProjectType(): Promise<ProjectType> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return ProjectType.None;
        }

        const rootPath = workspaceFolder.uri.fsPath;

        // Check for Hugo
        if (this.isHugoProject(rootPath)) {
            return ProjectType.Hugo;
        }

        // Check for Storybook
        if (await this.isStorybookProject(rootPath)) {
            return ProjectType.Storybook;
        }

        return ProjectType.None;
    }

    private static isHugoProject(rootPath: string): boolean {
        // Check for Hugo config files
        const hugoConfigs = [
            'config.toml',
            'config.yaml',
            'config.yml',
            'hugo.toml',
            'hugo.yaml'
        ];

        return hugoConfigs.some(config =>
            fs.existsSync(path.join(rootPath, config))
        );
    }

    private static async isStorybookProject(rootPath: string): Promise<boolean> {
        // Check for .storybook folder
        const storybookDir = path.join(rootPath, '.storybook');
        if (fs.existsSync(storybookDir)) {
            return true;
        }

        // Check package.json for @storybook/* dependencies
        const packageJsonPath = path.join(rootPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                const allDeps = {
                    ...packageJson.dependencies,
                    ...packageJson.devDependencies
                };

                return Object.keys(allDeps).some(dep => dep.startsWith('@storybook/'));
            } catch (error) {
                // Ignore parse errors
            }
        }

        return false;
    }
}
