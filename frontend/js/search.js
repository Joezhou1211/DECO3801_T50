let debounceTimeout;
let selectedIds = new Set(); // Track selected item IDs for download

// Function to toggle filters visibility
function toggleFilters() {
    const filtersSection = document.getElementById('filtersSection');
    filtersSection.classList.toggle('show');
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
    const verifiedAccount = document.getElementById('verifiedAccount').value;
    const nodeType = document.getElementById('nodeType').value;
    const authorKeynode = document.getElementById('authorKeynode').value;
    const hashtagKeynode = document.getElementById('hashtagKeynode').value;

    let filters = {
        query,
        timeRangeStart,
        timeRangeEnd,
        selectedLocations,
        selectedTopics,
        verifiedAccount,
        nodeType,
        authorKeynode,
        hashtagKeynode
    };

    // 处理数值型过滤器
    const numericFilters = ['sentiment', 'retweetCount', 'replyCount', 'quoteCount', 'favouriteCount', 'influenceTweetFactor', 'influenceUser', 'extendedEntities'];
    
    numericFilters.forEach(filter => {
        const value = document.getElementById(filter).value;
        if (value !== '') {
            filters[filter] = {min: parseFloat(value)};
        }
    });

    return filters;
}

// Perform search and send filters to backend
function performSearchWithFilters() {
    const filters = getSearchFilters();
    const resultsDiv = document.getElementById('results');
    const loadingSpinner = document.getElementById('loadingSpinner');

    console.log('Sending filters to backend:', filters);

    loadingSpinner.style.display = 'inline-block';
    resultsDiv.innerHTML = '';

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
        console.log('Search results:', data);
        loadingSpinner.style.display = 'none';
        displayResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        resultsDiv.innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
        alert('An error occurred while searching. Please try again.');
    });
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <h3>${result.deidentname}</h3>
            <p>${result.text}</p>
            <p>Created at: ${result.created_at_dt}</p>
            <p>Location: ${result.location}</p>
            <p>Dominant Topic: ${result.dominant_topic}</p>
            <p>Sentiment: ${result.sentiment}</p>
            <p>Retweet Count: ${result.retweet_count}</p>
            <p>Reply Count: ${result.reply_count}</p>
            <p>Quote Count: ${result.quote_count}</p>
            <p>Favourite Count: ${result.favourite_count}</p>
            <p>Node Type: ${result.node_type}</p>
            <p>Author Keynode: ${result.author_keynode ? 'Yes' : 'No'}</p>
            <p>Hashtag Keynode: ${result.hashtag_keynode ? 'Yes' : 'No'}</p>
            <label>
                <input type="checkbox" onchange="toggleSelection('${result._id}')">
                Select for download
            </label>
        `;
        resultsDiv.appendChild(resultItem);
    });
}


function toggleSelection(id) {
    if (selectedIds.has(id)) {
        selectedIds.delete(id);
    } else {
        selectedIds.add(id);
    }
    updateDownloadButtonState();
}

function updateDownloadButtonState() {
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.disabled = selectedIds.size === 0;
}

function downloadSelected() {
    if (selectedIds.size === 0) {
        alert('Please select at least one item to download.');
        return;
    }
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'inline-block';

    fetch('http://localhost:5001/api/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({selected_ids: Array.from(selectedIds)}),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        loadingSpinner.style.display = 'none';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'selected_data.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        alert(`Error downloading data: ${error.message}`);
    });
}


function initializeFilters() {
    initializeLocationFilter();
    
    updateSentimentDisplay();
    updateRetweetCountDisplay();
    updateReplyCountDisplay();
    updateQuoteCountDisplay();
    updateFavouriteCountDisplay();
    updateInfluenceTweetFactorDisplay();
    updateInfluenceUserDisplay();
    updateExtendedEntitiesDisplay();
}

function initializeLocationFilter() {
    const locationSelect = document.getElementById('location');
    locationSelect.innerHTML = ''; 
    
    // 添加 "All" 选项
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All';
    locationSelect.appendChild(allOption);
    
    // 使用 map.js 中定义的 countryNames
    for (const [code, name] of Object.entries(countryNames)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        locationSelect.appendChild(option);
    }
}

function updateSentimentDisplay() {
    const sentiment = document.getElementById('sentiment').value;
    document.getElementById('sentimentDisplay').innerText = `Sentiment Value: ${sentiment}`;
    debouncedSearch();
}

function updateRetweetCountDisplay() {
    const count = document.getElementById('retweetCount').value;
    document.getElementById('retweetCountDisplay').innerText = count;
    debouncedSearch();
}

function updateReplyCountDisplay() {
    const count = document.getElementById('replyCount').value;
    document.getElementById('replyCountDisplay').innerText = count;
    debouncedSearch();
}

function updateQuoteCountDisplay() {
    const count = document.getElementById('quoteCount').value;
    document.getElementById('quoteCountDisplay').innerText = count;
    debouncedSearch();
}

function updateFavouriteCountDisplay() {
    const count = document.getElementById('favouriteCount').value;
    document.getElementById('favouriteCountDisplay').innerText = count;
    debouncedSearch();
}

function updateInfluenceTweetFactorDisplay() {
    const value = document.getElementById('influenceTweetFactor').value;
    document.getElementById('influenceTweetFactorDisplay').innerText = value;
    debouncedSearch();
}

function updateInfluenceUserDisplay() {
    const value = document.getElementById('influenceUser').value;
    document.getElementById('influenceUserDisplay').innerText = value;
    debouncedSearch();
}

function updateExtendedEntitiesDisplay() {
    const count = document.getElementById('extendedEntities').value;
    document.getElementById('extendedEntitiesDisplay').innerText = count;
    debouncedSearch();
}

// Update selected locations and topics
function updateLocationFilter() {
    const locationSelect = document.getElementById('location');
    const selectedLocationsDiv = document.getElementById('selected-locations');
    selectedLocationsDiv.innerHTML = '';  

    Array.from(locationSelect.selectedOptions).forEach(option => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = option.text;
        selectedLocationsDiv.appendChild(chip);
    });

    debouncedSearch();  
}

function updateTopicFilter() {
    const topicSelect = document.getElementById('topic');
    const selectedTopicsDiv = document.getElementById('selected-topics');
    selectedTopicsDiv.innerHTML = ''; 

    Array.from(topicSelect.selectedOptions).forEach(option => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = option.text;
        selectedTopicsDiv.appendChild(chip);
    });

    debouncedSearch();  
}

document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
});