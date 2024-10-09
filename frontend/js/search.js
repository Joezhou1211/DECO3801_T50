let debounceTimeout;
let selectedIds = new Set(); // Track selected item IDs for download

// Function to toggle filters visibility
function toggleFilters() {
    const filtersSection = document.getElementById('filtersSection');
    filtersSection.style.display = (filtersSection.style.display === 'none' || filtersSection.style.display === '') ? 'block' : 'none';
}

// Debounced search function to limit the number of search requests
function debouncedSearch() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        performSearchWithFilters();
    }, 300);  // 300ms debounce time
}

// Collect the filters and search query into a single object
function getSearchFilters() {
    const query = document.getElementById('searchQuery').value;
    const timeRangeStart = document.getElementById('timeRangeStart').value;
    const timeRangeEnd = document.getElementById('timeRangeEnd').value;
    const locationSelect = document.getElementById('location');
    const selectedLocations = Array.from(locationSelect.selectedOptions).map(option => option.value);
    const topicSelect = document.getElementById('topic');
    const selectedTopics = Array.from(topicSelect.selectedOptions).map(option => option.value);
    const sentiment = document.getElementById('sentiment').value;
    const retweetCount = document.getElementById('retweetCount').value;
    const replyCount = document.getElementById('replyCount').value;
    const quoteCount = document.getElementById('quoteCount').value;
    const favouriteCount = document.getElementById('favouriteCount').value;
    const influenceTweetFactor = document.getElementById('influenceTweetFactor').value;
    const influenceUser = document.getElementById('influenceUser').value;
    const verifiedAccount = document.getElementById('verifiedAccount').value;
    const nodeType = document.getElementById('nodeType').value;
    const authorKeynode = document.getElementById('authorKeynode').value;
    const hashtagKeynode = document.getElementById('hashtagKeynode').value;

    return {
        query,
        timeRangeStart,
        timeRangeEnd,
        selectedLocations,
        selectedTopics,
        sentiment,
        retweetCount,
        replyCount,
        quoteCount,
        favouriteCount,
        influenceTweetFactor,
        influenceUser,
        verifiedAccount,
        nodeType,
        authorKeynode,
        hashtagKeynode
    };
}

// Perform search and send filters to backend
function performSearchWithFilters() {
    const filters = getSearchFilters();
    const resultsDiv = document.getElementById('results');
    const loadingSpinner = document.getElementById('loadingSpinner');

    loadingSpinner.style.display = 'inline-block';
    resultsDiv.innerHTML = '';  // Clear previous results

    fetch('http://localhost:5001/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Search results:', data);  // Log for debugging

        loadingSpinner.style.display = 'none';
        resultsDiv.innerHTML = '';

        let resultsArray = Array.isArray(data) ? data : (data.hits || data.results || []);

        if (resultsArray.length === 0) {
            resultsDiv.innerHTML = '<p>No results found.</p>';
            return;
        }

        resultsArray.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <input type="checkbox" onchange="toggleSelection('${item._id}')" />
                <p><strong>Deidentified Name:</strong> ${item.deidentname}</p>
                <p><strong>Text:</strong> ${item.text}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Topic:</strong> ${item.dominant_topic}</p>
                <p><strong>Sentiment:</strong> ${item.sentiment}</p>
                <p><strong>Retweet Count:</strong> ${item.retweet_count}</p>
                <p><strong>Reply Count:</strong> ${item.reply_count}</p>
            `;
            resultsDiv.appendChild(resultItem);
        });
    })
    .catch(error => {
        loadingSpinner.style.display = 'none';
        console.error('Error fetching search results:', error);
        resultsDiv.innerHTML = `<p>An error occurred while searching: ${error.message}</p>`;
    });
}

// Toggle selection of a result item
function toggleSelection(id) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
}

// Download selected items
function downloadSelected() {
    if (selectedIds.size === 0) {
        alert('Please select at least one item to download.');
        return;
    }

    const selectedArray = Array.from(selectedIds);
    fetch('http://localhost:5001/api/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_ids: selectedArray }),
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'selected_data.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
    })
    .catch(error => {
        console.error('Error downloading data:', error);
        alert('An error occurred while downloading the data.');
    });
}

// Update slider display values
function updateSentimentDisplay() {
    const sentiment = document.getElementById('sentiment').value;
    document.getElementById('sentimentDisplay').innerText = `Sentiment Value: ${sentiment}`;
}

function updateRetweetCountDisplay() {
    const count = document.getElementById('retweetCount').value;
    document.getElementById('retweetCountDisplay').innerText = count;
}

function updateReplyCountDisplay() {
    const count = document.getElementById('replyCount').value;
    document.getElementById('replyCountDisplay').innerText = count;
}

function updateQuoteCountDisplay() {
    const count = document.getElementById('quoteCount').value;
    document.getElementById('quoteCountDisplay').innerText = count;
}

function updateFavouriteCountDisplay() {
    const count = document.getElementById('favouriteCount').value;
    document.getElementById('favouriteCountDisplay').innerText = count;
}

function updateInfluenceTweetFactorDisplay() {
    const value = document.getElementById('influenceTweetFactor').value;
    document.getElementById('influenceTweetFactorDisplay').innerText = value;
}

function updateInfluenceUserDisplay() {
    const value = document.getElementById('influenceUser').value;
    document.getElementById('influenceUserDisplay').innerText = value;
}

// Update selected locations and topics
function updateLocationFilter() {
    const locationSelect = document.getElementById('location');
    const selectedLocationsDiv = document.getElementById('selected-locations');
    selectedLocationsDiv.innerHTML = '';  // Clear previous selections

    Array.from(locationSelect.selectedOptions).forEach(option => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = option.text;
        selectedLocationsDiv.appendChild(chip);
    });

    debouncedSearch();  // Trigger search after updating
}

function updateTopicFilter() {
    const topicSelect = document.getElementById('topic');
    const selectedTopicsDiv = document.getElementById('selected-topics');
    selectedTopicsDiv.innerHTML = '';  // Clear previous selections

    Array.from(topicSelect.selectedOptions).forEach(option => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = option.text;
        selectedTopicsDiv.appendChild(chip);
    });

    debouncedSearch();  // Trigger search after updating
}
