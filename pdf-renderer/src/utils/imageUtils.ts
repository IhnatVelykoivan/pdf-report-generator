import fs from 'fs';
import { promisify } from 'util';
import axios from 'axios';

const readFileAsync = promisify(fs.readFile);

/**
 * Fetches image data from various sources
 */
export const fetchImage = async (source: string | Buffer): Promise<Buffer> => {
    // If source is already a Buffer, return it
    if (Buffer.isBuffer(source)) {
        return source;
    }

    // If source is a base64 data URL
    if (typeof source === 'string' && source.startsWith('data:')) {
        const base64Data = source.split(',')[1];
        return Buffer.from(base64Data, 'base64');
    }

    // If source is a file path
    if (typeof source === 'string' && (source.startsWith('./') || source.startsWith('/') || source.includes(':\\') || source.includes(':/'))) {
        try {
            return await readFileAsync(source);
        } catch (error) {
            throw new Error(`Failed to read image file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // If source is a URL
    if (typeof source === 'string' && (source.startsWith('http://') || source.startsWith('https://'))) {
        try {
            const response = await axios.get(source, {
                responseType: 'arraybuffer'
            });

            return Buffer.from(response.data);
        } catch (error) {
            throw new Error(`Failed to fetch image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    throw new Error('Invalid image source format');
};