import { DefaultFileScanner } from './dist/index.js';

const scanner = new DefaultFileScanner();

// Test sync version
const files = scanner.scan('.');
console.log('Sync scan found', files.length, 'files');

// Test async version
const asyncFiles = await scanner.scanAsync('.');
console.log('Async scan found', asyncFiles.length, 'files');

console.log('Async scanner works:', files.length === asyncFiles.length);
