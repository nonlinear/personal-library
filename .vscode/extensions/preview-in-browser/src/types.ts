import * as vscode from 'vscode';

/**
 * Interface for preview providers (Hugo, Storybook, etc.)
 */
export interface PreviewProvider {
    /** Name of the framework */
    name: string;

    /** Detect if this file should trigger a preview */
    shouldPreview(filePath: string): boolean;

    /** Check if the dev server is running */
    isServerRunning(): Promise<boolean>;

    /** Start the dev server */
    startServer(): Promise<boolean>;

    /** Build the preview URL from file path */
    buildUrl(filePath: string): string;

    /** Get the base URL from config */
    getBaseUrl(): string;
}

/**
 * Detected project type
 */
export enum ProjectType {
    Hugo = 'hugo',
    Storybook = 'storybook',
    None = 'none'
}
