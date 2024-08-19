// Retrieve query parameter from URL
function SearchWithQuery(query) {
    if (query) {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
    else {
        alert('Please enter a search query.');
    }
}
