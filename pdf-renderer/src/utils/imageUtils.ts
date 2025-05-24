import fs from 'fs';
import { promisify } from 'util';
import axios from 'axios';

const readFileAsync = promisify(fs.readFile);

/*** Fetches image data from various sources*/

export const fetchImage = async (source: string | Buffer): Promise<Buffer> => {
    // If source is already a Buffer, return it
    if (Buffer.isBuffer(source)) {
        return source;
    }

    // Ensure source is a string for the following checks
    if (typeof source !== 'string') {
        throw new Error('Image source must be a string or Buffer');
    }

    // If source is a base64 data URL
    if (source.startsWith('data:')) {
        const base64Data = source.split(',')[1];
        return Buffer.from(base64Data, 'base64');
    }

    // If source is a file path
    if (source.startsWith('./') || source.startsWith('/') || source.includes(':\\') || source.includes(':/')) {
        try {
            return await readFileAsync(source);
        } catch (error) {
            throw new Error(`Failed to read image file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // If source is a URL
    if (source.startsWith('http://') || source.startsWith('https://')) {
        try {
            const response = await axios.get(source, {
                responseType: 'arraybuffer'
            });

            // Explicitly cast response.data to Buffer
            return Buffer.from(response.data as ArrayBuffer);
        } catch (error) {
            throw new Error(`Failed to fetch image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    throw new Error('Invalid image source format');
};