"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectDetector = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const types_1 = require("../types");
class ProjectDetector {
    /**
     * Detect project type based on workspace files
     */
    static async detectProjectType() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return types_1.ProjectType.None;
        }
        const rootPath = workspaceFolder.uri.fsPath;
        // Check for Hugo
        if (this.isHugoProject(rootPath)) {
            return types_1.ProjectType.Hugo;
        }
        // Check for Storybook
        if (await this.isStorybookProject(rootPath)) {
            return types_1.ProjectType.Storybook;
        }
        return types_1.ProjectType.None;
    }
    static isHugoProject(rootPath) {
        // Check for Hugo config files
        const hugoConfigs = [
            'config.toml',
            'config.yaml',
            'config.yml',
            'hugo.toml',
            'hugo.yaml'
        ];
        return hugoConfigs.some(config => fs.existsSync(path.join(rootPath, config)));
    }
    static async isStorybookProject(rootPath) {
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
            }
            catch (error) {
                // Ignore parse errors
            }
        }
        return false;
    }
}
exports.ProjectDetector = ProjectDetector;
//# sourceMappingURL=detector.js.map