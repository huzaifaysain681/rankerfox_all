const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    let browser;
    try {
        // Launch the browser in headless mode
        browser = await puppeteer.launch({
            headless: true, // Headless mode
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        const page = await browser.newPage();

        // Open the login page
        await page.goto('https://rankerfox.com/login', { waitUntil: 'networkidle2' });

        // Locate the username and password fields and input the provided credentials
        await page.type('#iump_login_username', username);
        await page.type('#iump_login_password', password);

        // Submit the form
        await page.keyboard.press('Enter');

        // Wait for navigation after login
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        // Get the current URL to check if login was successful
        const currentUrl = page.url();
        if (currentUrl.includes('premium-plan')) {
            // Login successful, send redirect to the success page
            res.json({ success: true, redirectUrl: '/success' });
        } else {
            // If login fails (URL didn't change), return an error
            res.json({ success: false, message: 'Invalid credentials. Please try again.' });
        }

    } catch (error) {
        console.error("An error occurred:", error);
        res.json({ success: false, message: error.message });
    } finally {
        // Close the browser after the process is complete
        if (browser) await browser.close();
    }
});

// Serve the success page
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));  // Serve the 'success.html' file
});

// Serve the login page
app.use(express.static('public'));

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
