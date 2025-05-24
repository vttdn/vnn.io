document.addEventListener('DOMContentLoaded', function() {
    const schemaFiles = [
        'vnn.json'
    ];

    schemaFiles.forEach((url) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.status}`);
                }
                return response.json(); // Parse as JSON
            })
            .then(jsonData => {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.textContent = JSON.stringify(jsonData); // Convert back to string
                document.head.appendChild(script);
                console.log(`Successfully injected JSON-LD from ${url}`);
            })
            .catch(error => {
                console.error('Error injecting JSON-LD:', error);
            });
    });
});