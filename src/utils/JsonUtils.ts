import { JsonRepresentable } from '../interfaces/JsonRepresentable';

export function safeStringify(obj: any, indent: number = 2): string {
    
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
            if (typeof (value as JsonRepresentable).createJsonRepresentation === 'function') {
                return JSON.parse((value as JsonRepresentable).createJsonRepresentation());
            }
            if (value?.constructor?.name?.includes('Phaser.')) {
                return '[Phaser Object]';
            }
        }
        return value;
    }, indent);
}