document.addEventListener('DOMContentLoaded', () => {
    const shortenBtn = document.getElementById('shortenBtn');
    const urlInput = document.getElementById('longUrlInput');
    const resultBox = document.getElementById('resultBox');
    const shortLinkOutput = document.getElementById('shortLinkOutput');
    const copyText = document.getElementById('copyText');
    
    // Custom Alert Elements
    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlertBtn = document.getElementById('closeAlert');
    let alertTimeout;

    // Toast Notification Function
    const showToast = (msg) => {
        alertMessage.textContent = msg;
        customAlert.classList.add('show');
        
        clearTimeout(alertTimeout);
        alertTimeout = setTimeout(() => {
            customAlert.classList.remove('show');
        }, 3500);
    };

    closeAlertBtn.addEventListener('click', () => {
        customAlert.classList.remove('show');
    });

    const isValidUrl = (url) => {
        const pattern = new RegExp(
            '^(https?:\\/\\/)?' + 
            '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + 
            '((\\d{1,3}\\.){3}\\d{1,3}))' + 
            '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + 
            '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + 
            '(\\#[-a-zA-Z\\d_]*)?$','i' 
        );
        return pattern.test(url);
    };

    const processUrl = async () => {
        const originalUrl = urlInput.value.trim();
        
        if (!originalUrl) {
            showToast('Please enter a valid URL first.');
            return;
        }

        if (!isValidUrl(originalUrl)) {
            showToast('Invalid format! Please enter a real URL (e.g., google.com).');
            return;
        }

        shortenBtn.textContent = '⏳ Shortening...';
        shortenBtn.disabled = true;
        resultBox.style.display = 'none';

        try {
            // Note: Remember to update this URL to your Render URL after deployment!
            const response = await fetch('https://nexuslink-backend-1wu6.onrender.com/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ originalUrl: originalUrl })
            });

            if (response.ok) {
                const data = await response.json();
                shortLinkOutput.textContent = data.shortUrl;
                resultBox.style.display = 'block';
                copyText.textContent = 'Click to copy ✂️';
                urlInput.value = '';
            } else {
                showToast('Failed to shorten URL. Please try again.');
            }
        } catch (error) {
            console.error('API Connection Error:', error);
            showToast('Cannot connect to server. Is the backend running?');
        } finally {
            shortenBtn.textContent = '✂️ Shorten';
            shortenBtn.disabled = false;
        }
    };

    shortenBtn.addEventListener('click', processUrl);

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            processUrl();
        }
    });

    resultBox.addEventListener('click', async () => {
        const urlToCopy = shortLinkOutput.textContent;
        if (urlToCopy) {
            try {
                await navigator.clipboard.writeText(urlToCopy);
                copyText.textContent = 'Copied! ✅';
                setTimeout(() => {
                    copyText.textContent = 'Click to copy ✂️';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
                showToast('Failed to copy to clipboard.');
            }
        }
    });
});