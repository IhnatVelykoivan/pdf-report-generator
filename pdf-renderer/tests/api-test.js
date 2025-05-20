const fs = require('fs');
const axios = require('axios');
const multilingualTestDSL = require('./multilingual-test-dsl');

// Service configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Function to check health endpoint
async function testHealthEndpoint() {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        console.log('Health check response:', response.data);
        return true;
    } catch (error) {
        console.error('Health check failed:', error.message);
        return false;
    }
}

// Function to get list of templates
async function testTemplatesEndpoint() {
    try {
        const response = await axios.get(`${API_BASE_URL}/templates`);
        console.log('Templates response:', response.data);
        return true;
    } catch (error) {
        console.error('Templates check failed:', error.message);
        return false;
    }
}

// Function to test PDF rendering with multilingual support
async function testRenderPDFEndpoint() {
    try {
        console.log('Sending render request with multilingual DSL...');
        console.log('DSL preview:', JSON.stringify(multilingualTestDSL).substring(0, 200) + '...');

        const response = await axios.post(
            `${API_BASE_URL}/render`,
            { dsl: multilingualTestDSL },
            { responseType: 'arraybuffer' }
        );

        // Save PDF
        fs.writeFileSync('multilingual-output.pdf', Buffer.from(response.data));
        console.log('PDF saved to multilingual-output.pdf');
        return true;
    } catch (error) {
        console.error('PDF rendering failed:', error.message);

        // If there's response data in the error, log it
        if (error.response) {
            console.error('Error details:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data ? error.response.data.toString() : 'No data'
            });
        }
        return false;
    }
}

// Function to test image rendering with multilingual support
async function testRenderImagesEndpoint() {
    try {
        console.log('Sending render-images request with multilingual DSL...');

        const response = await axios.post(
            `${API_BASE_URL}/render-images`,
            {
                dsl: multilingualTestDSL,
                dpi: 300
            }
        );

        console.log('Images response, status:', response.status);
        console.log('Number of images:', response.data.images?.length || 0);

        // Save all generated images
        if (response.data.images && response.data.images.length > 0) {
            response.data.images.forEach((imageData, index) => {
                const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
                fs.writeFileSync(`multilingual-page${index+1}.png`, Buffer.from(base64Data, 'base64'));
                console.log(`Page ${index+1} image saved to multilingual-page${index+1}.png`);
            });
        }

        return true;
    } catch (error) {
        console.error('Image rendering failed:', error.message);

        // If there's response data in the error, log it
        if (error.response) {
            console.error('Error details:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: typeof error.response.data === 'object'
                    ? JSON.stringify(error.response.data)
                    : (error.response.data ? error.response.data.toString() : 'No data')
            });
        }
        return false;
    }
}

// Run tests sequentially
async function runTests() {
    console.log('Starting API tests for multilingual support (English + Arabic)...');

    const healthResult = await testHealthEndpoint();
    const templatesResult = await testTemplatesEndpoint();
    const renderResult = await testRenderPDFEndpoint();
    const imagesResult = await testRenderImagesEndpoint();

    console.log('\nTest results:');
    console.log('Health endpoint:', healthResult ? 'PASS' : 'FAIL');
    console.log('Templates endpoint:', templatesResult ? 'PASS' : 'FAIL');
    console.log('Render PDF endpoint:', renderResult ? 'PASS' : 'FAIL');
    console.log('Render Images endpoint:', imagesResult ? 'PASS' : 'FAIL');
}

// Running tests
runTests();