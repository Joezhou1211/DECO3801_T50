let debounceTimeout;

// Debounced search function to limit the number of search requests
function debouncedSearch() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        const query = document.getElementById('searchQuery').value;
        performSearch(query);
    }, 300);  // 300ms debounce time
}

// Retrieve query parameter from URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Perform search using the query parameter
function performSearch(query) {
    if (!query) {
        document.getElementById('results').innerHTML = '<p>Please enter a search query.</p>';
        return;
    }

    const resultsDiv = document.getElementById('results');
    const loadingSpinner = document.getElementById('loadingSpinner');

    // Display loading spinner
    loadingSpinner.style.display = 'inline-block';
    resultsDiv.innerHTML = '';

    fetch(`http://localhost:5001/search?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            loadingSpinner.style.display = 'none';
            resultsDiv.innerHTML = '';

            if (data.length === 0) {
                resultsDiv.innerHTML = '<p>No results found.</p>';
                return;
            }

            data.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                resultItem.innerHTML = `
                    <p><strong>ID:</strong> ${item.id}</p>
                    <p><strong>Text:</strong> ${item.text}</p>
                `;
                resultsDiv.appendChild(resultItem);
            });
        })
        .catch(error => {
            loadingSpinner.style.display = 'none';
            console.error('Error fetching search results:', error);
            resultsDiv.innerHTML = '<p>An error occurred while searching. Please try again later.</p>';
        });
}

// Perform search if query parameter is present in the URL
document.addEventListener('DOMContentLoaded', function() {
    const query = getQueryParam('query');
    if (query) {
        document.getElementById('searchQuery').value = query;
        performSearch(query);
    }
});

// Function to handle search and redirect
function SearchWithQuery() {
    const query = document.getElementById('searchQuery').value;
    if (query) {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    } else {
        alert('Please enter a search query.');
    }
}