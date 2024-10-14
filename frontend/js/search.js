// Global variables
let debounceTimeout;
let selectedIds = new Set();
let previousFilters = {};
let allSelected = false;
let totalResultsCount = 0;
let currentPage = 1;
let totalPages = 1;
let countryNames = {};

// Utility functions
const debounce = (func, delay) => {
    return (...args) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func(...args), delay);
    };
};

const getElement = id => document.getElementById(id);

// Filter related functions
const toggleFilters = () => {
    getElement('filtersSection').classList.toggle('show');
};

const getSearchFilters = () => {
    const filters = {
        query: getElement('searchQuery').value,
        timeRangeStart: getElement('timeRangeStart').value,
        timeRangeEnd: getElement('timeRangeEnd').value,
        selectedTopics: Array.from(getElement('topic').selectedOptions).map(option => option.value),
        selectedSentiments: Array.from(getElement('sentiment').selectedOptions).map(option => option.value),
        selectedLocations: Array.from(getElement('location').selectedOptions).map(option => option.value),
        verifiedAccount: getElement('verifiedAccount').value,
        nodeType: getElement('nodeType').value,
        authorKeynode: getElement('authorKeynode').value,
        hashtagKeynode: getElement('hashtagKeynode').value
    };

    const rangeFilters = ['retweetCount', 'replyCount', 'quoteCount', 'favouriteCount', 'influenceTweetFactor', 'influenceUser', 'extendedEntities'];
    
    rangeFilters.forEach(filter => {
        const value = parseInt(getElement(filter).value);
        if (value > 0) {  
            filters[filter] = { min: value };
        }
    });

    Object.keys(filters).forEach(key => {
        if (filters[key] === '' || filters[key] === null || filters[key] === undefined || 
            (Array.isArray(filters[key]) && filters[key].length === 0)) {
            delete filters[key];
        }
    });

    return filters;
};

const saveCurrentFilters = () => {
    previousFilters = getSearchFilters();
};

// Search related functions
const performSearchWithFilters = (page = 1) => { 
    saveCurrentFilters();
    const filters = getSearchFilters();
    const resultsDiv = getElement('results');
    const loadingSpinner = getElement('loadingSpinner');
    const downloadSection = getElement('downloadSection');

    filters.sort_field = currentSortField;
    filters.sort_order = currentSortOrder;

    console.log('Sending filters to backend:', filters);

    loadingSpinner.style.display = 'inline-block';
    resultsDiv.innerHTML = '';
    downloadSection.style.display = 'none';

    fetch(`http://localhost:5001/api/search?page=${page}&page_size=50`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(filters),
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log('Search results:', data);
        loadingSpinner.style.display = 'none';
        totalResultsCount = data.total;
        currentPage = data.page;
        totalPages = Math.ceil(data.total / data.page_size);
        updateResultsCount();
        displayResults(data.results);
        displayPagination();
        if (data.total > 0) downloadSection.style.display = 'flex';
    })
    .catch(error => {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        resultsDiv.innerHTML = `<p>Error: ${error.message}. Please try again later.</p>`;
        alert('An error occurred during the search. Please try again later.');
    });
};

const displayPagination = () => {
    const paginationDiv = getElement('pagination');
    paginationDiv.innerHTML = '';

    if (totalPages > 1) {
        const nav = document.createElement('nav');
        nav.className = 'pagination is-rounded';
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'pagination');

        const prevLink = document.createElement('a');
        prevLink.className = `pagination-previous ${currentPage === 1 ? 'is-disabled' : ''}`;
        prevLink.innerHTML = 'Previous';
        prevLink.onclick = () => currentPage > 1 && performSearchWithFilters(currentPage - 1);

        const nextLink = document.createElement('a');
        nextLink.className = `pagination-next ${currentPage === totalPages ? 'is-disabled' : ''}`;
        nextLink.innerHTML = 'Next page';
        nextLink.onclick = () => currentPage < totalPages && performSearchWithFilters(currentPage + 1);

        const pageList = document.createElement('ul');
        pageList.className = 'pagination-list';

        // Add first page
        pageList.appendChild(createPageItem(1));

        // Add ellipsis if needed
        if (currentPage > 3) {
            pageList.appendChild(createEllipsis());
        }

        // Add pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pageList.appendChild(createPageItem(i));
        }

        // Add ellipsis if needed
        if (currentPage < totalPages - 2) {
            pageList.appendChild(createEllipsis());
        }

        // Add last page
        if (totalPages > 1) {
            pageList.appendChild(createPageItem(totalPages));
        }

        nav.appendChild(prevLink);
        nav.appendChild(nextLink);
        nav.appendChild(pageList);
        paginationDiv.appendChild(nav);
    }
};

const createPageItem = (pageNum) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = `pagination-link ${pageNum === currentPage ? 'is-current' : ''}`;
    a.setAttribute('aria-label', `Goto page ${pageNum}`);
    a.innerHTML = pageNum;
    a.onclick = () => performSearchWithFilters(pageNum);
    li.appendChild(a);
    return li;
};

const createEllipsis = () => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'pagination-ellipsis';
    span.innerHTML = '&hellip;';
    li.appendChild(span);
    return li;
};


const debouncedSearch = debounce(performSearchWithFilters, 300);


const updateResultsCount = () => {
    const countDisplay = getElement('resultsCountDisplay');
    countDisplay.textContent = `${selectedIds.size} out of ${totalResultsCount} items selected (Page ${currentPage} of ${totalPages})`;
};



// Result display related functions
    const displayResults = results => {
        const resultsDiv = getElement('results');
        const downloadSection = getElement('downloadSection');
        resultsDiv.innerHTML = '';

        if (results.length === 0) {
            resultsDiv.innerHTML = '<p>No results found.</p>';
            downloadSection.style.display = 'none';
            return;
        }

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            if (selectedIds.has(result._id)) {
                resultItem.classList.add('selected');
            }

            const createdAt = new Date(result.created_at_dt).toLocaleString();

            const contentWithSpans = result.text.replace(/(@\w+)/g, '<span class="mention">$1</span>')
                                                .replace(/(https?:\/\/\S+)/g, '<span class="link">$1</span>')
                                                .replace(/(#\w+)/g, '<span class="hashtag">$1</span>');

            resultItem.innerHTML = `
            <input type="checkbox" class="select-checkbox" id="select-${result._id}" ${selectedIds.has(result._id) ? 'checked' : ''} onchange="toggleSelection('${result._id}')">
            <div class="tweet-card">
                <h3>${result.deidentname}</h3>
                <div class="content">${contentWithSpans}</div> <!-- 使用 contentWithSpans -->
                <div class="meta">
                    <p>Created at: ${createdAt}</p>
                    <p>Location: ${result.location}</p>
                </div>
                <div class="actions">
                    <span><i class="fas fa-heart icon"></i>${result.favourite_count}</span>
                    <span><i class="fas fa-retweet icon"></i>${result.retweet_count}</span>
                    <span><i class="fas fa-reply icon"></i>${result.reply_count}</span>
                    <span><i class="fas fa-quote-right icon"></i>${result.quote_count}</span>
                </div>
            </div>
            <div class="stats">
                <div class="stat-item">Influence User: ${result.influence_user}</div>
                <div class="stat-item">Extended Entities: ${result.extended_entities_count}</div>
                <div class="stat-item">Dominant Topic: ${result.dominant_topic}</div>
                <div class="stat-item">Sentiment: ${result.sentiment}</div>
                <div class="stat-item">Verified: ${result.verified}</div>
                <div class="stat-item">Node Type: ${result.node_type}</div>
                <div class="stat-item">Author Keynode: ${result.author_keynode}</div>
                <div class="stat-item">Hashtag Keynode: ${result.hashtag_keynode}</div>
                <div class="stat-item">Influence Tweet Factor: ${result.influence_tweet_factor}</div>
            </div>
        `;

        resultItem.addEventListener('click', (event) => {
            if (event.target.tagName !== 'INPUT') {
                const checkbox = resultItem.querySelector('.select-checkbox');
                checkbox.checked = !checkbox.checked;
                toggleSelection(result._id);
            }
        });

        resultsDiv.appendChild(resultItem);
    });

    
    totalResultsCount = results.length;
    selectedIds.clear();
    updateResultsCount();
    updateSelectAllButtonText();
    updateDownloadButtonState();
};

const toggleSelection = id => {
    const checkbox = document.getElementById(`select-${id}`);
    const resultItem = checkbox.closest('.result-item');

    if (selectedIds.has(id)) {
        selectedIds.delete(id);
        resultItem.classList.remove('selected');
    } else {
        selectedIds.add(id);
        resultItem.classList.add('selected');
    }

    updateSelectAllButtonText();
    updateDownloadButtonState();
    updateResultsCount();
};

const toggleSelectAll = () => {
    const checkboxes = document.querySelectorAll('.result-item input[type="checkbox"]');
    allSelected = !allSelected;
    checkboxes.forEach(checkbox => {
        checkbox.checked = allSelected;
        const id = checkbox.id.replace('select-', '');
        if (allSelected) {
            selectedIds.add(id);
        } else {
            selectedIds.delete(id);
        }
    });
    updateSelectAllButtonText();
    updateDownloadButtonState();
    updateResultsCount(); 
};


const updateSelectAllButtonText = () => {
    const selectAllButton = getElement('selectAllButton');
    selectAllButton.innerHTML = allSelected ? 
        '<i class="fas fa-check-square"></i> Select All' : 
        '<i class="fas fa-square"></i> Select All';
};

const updateDownloadButtonState = () => {
    const downloadButton = getElement('downloadButton');
    downloadButton.disabled = selectedIds.size === 0;
};

const downloadSelected = () => {
    if (selectedIds.size === 0) {
        alert('Please select at least one item to download.');
        return;
    }
    const loadingSpinner = getElement('loadingSpinner');
    loadingSpinner.style.display = 'inline-block';

    fetch('http://localhost:5001/api/download', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({selected_ids: Array.from(selectedIds)}),
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
};

// Initialize and update filter functions
const initializeFilters = () => {
    updateAllDisplays();
    updateSentimentFilter();
};



const updateTopicFilter = () => {
    const topicSelect = getElement('topic');
    const selectedTopicsDiv = getElement('selected-topics');
    selectedTopicsDiv.innerHTML = ''; 

    Array.from(topicSelect.selectedOptions).forEach(option => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = option.text;
        selectedTopicsDiv.appendChild(chip);
    });

    debouncedSearch();  
};

const updateSentimentFilter = () => {
    const sentimentSelect = getElement('sentiment');
    const selectedSentimentsDiv = getElement('selected-sentiments');
    selectedSentimentsDiv.innerHTML = '';  

    Array.from(sentimentSelect.selectedOptions).forEach(option => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = option.text;
        selectedSentimentsDiv.appendChild(chip);
    });

    debouncedSearch();  
};

const updateLocationFilter = () => {
    const locationSelect = getElement('location');
    const selectedLocations = Array.from(locationSelect.selectedOptions).map(option => option.value);
    
    const selectedLocationsDiv = getElement('selected-locations');
    selectedLocationsDiv.innerHTML = selectedLocations.map(name => `<span class="chip">${name}</span>`).join('');
    
    debouncedSearch();
};


const updateAllDisplays = () => {
    ['retweetCount', 'replyCount', 'quoteCount', 'favouriteCount', 'influenceTweetFactor', 'influenceUser', 'extendedEntities'].forEach(updateDisplay);
};

const updateDisplay = (id) => {
    const value = getElement(id).value;
    getElement(`${id}Display`).innerText = value;
    debouncedSearch();
};

const resetFilters = () => {
    ['searchQuery', 'timeRangeStart', 'timeRangeEnd', 'location', 'topic', 'sentiment', 'influenceTweetFactor', 'influenceUser', 'verifiedAccount', 'retweetCount', 'replyCount', 'quoteCount', 'favouriteCount', 'extendedEntities', 'nodeType', 'authorKeynode', 'hashtagKeynode'].forEach(id => {
        const element = getElement(id);
        if (element.type === 'select-multiple') {
            element.selectedIndex = -1;
        } else if (element.type === 'range') {
            element.value = 0;
        } else {
            element.value = '';
        }
    });


    selectedIds.clear();
    updateResultsCount();

    updateTopicFilter();
    updateAllDisplays();
    updateSentimentFilter();

    getElement('results').innerHTML = '';
    getElement('downloadSection').style.display = 'none';
};

const downloadAllData = () => {
    const loadingSpinner = getElement('loadingSpinner');
    loadingSpinner.style.display = 'inline-block';

    fetch('http://localhost:5001/api/download-all', {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.blob();
    })
    .then(blob => {
        loadingSpinner.style.display = 'none';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'all_data.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error:', error);
        loadingSpinner.style.display = 'none';
        alert(`Error downloading all data: ${error.message}`);
    });
};

let currentSortField = '';
let currentSortOrder = 'desc';

const toggleSort = () => {
    const modal = document.getElementById('sortModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
};

const updateSort = () => {
    const sortField = getElement('sortField').value;
    const sortOrder = getElement('sortOrder').value;
    
    if (sortField !== currentSortField || sortOrder !== currentSortOrder) {
        currentSortField = sortField;
        currentSortOrder = sortOrder;
        performSearchWithFilters();
    }
};

window.onclick = function(event) {
    const modal = document.getElementById('sortModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


document.addEventListener('DOMContentLoaded', initializeFilters);

window.toggleFilters = toggleFilters;
window.performSearchWithFilters = performSearchWithFilters;
window.debouncedSearch = debouncedSearch;
window.toggleSelection = toggleSelection;
window.toggleSelectAll = toggleSelectAll;
window.downloadSelected = downloadSelected;
window.updateTopicFilter = updateTopicFilter;
window.updateDisplay = updateDisplay;
window.resetFilters = resetFilters;
window.updateSentimentFilter = updateSentimentFilter;
window.downloadAllData = downloadAllData;
window.toggleSort = toggleSort;
window.updateSort = updateSort;