function openSidebar() {
    document.getElementById("rightSidebar").classList.add("open");
}

function closeSidebar() {
    document.getElementById("rightSidebar").classList.remove("open");
}

function performSearch() {
    const query = document.getElementById('searchQuery').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Searching...';

    fetch(`http://localhost:5001/api/search?query=${query}`)
        .then(response => response.json())
        .then(data => {
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
            console.error('Error fetching search results:', error);
            resultsDiv.innerHTML = '<p>An error occurred while searching.</p>';
        });
}

