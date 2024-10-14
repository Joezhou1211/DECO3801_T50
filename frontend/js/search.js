// Global variables
let debounceTimeout;
let selectedIds = new Set();
let previousFilters = {};
let allSelected = false;
let totalResultsCount = 0;
let currentPage = 1;
let totalPages = 1;
let locations = [];
let totalTweetsCount = 0; 
const MIN_DATE = '2019-11-01';
const MAX_DATE = '2020-01-31';
const countryList = [
    'Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 
    'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'New South Wales, Australia', 'Victoria, Australia', 'Queensland, Australia', 
    'South Australia, Australia', 'Western Australia, Australia', 'Tasmania, Australia', 
    'Northern Territory, Australia', 'Australian Capital Territory, Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 
    'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 
    'Botswana', 'Brazil', 'British Indian Ocean Territory', 'Brunei Darussalam', 'Bulgaria', 
    'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands', 
    'Central African Republic', 'Chad', 'Chile', 'China', 'Christmas Island', 
    'Cocos (Keeling) Islands', 'Colombia', 'Comoros', 'Congo', 'Congo, Democratic Republic', 
    'Cook Islands', 'Costa Rica', "Côte d'Ivoire", 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Islands', 'Faroe Islands', 
    'Fiji', 'Finland', 'France', 'French Guiana', 'French Polynesia', 'Gabon', 'Gambia', 'Georgia', 
    'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guadeloupe', 'Guam', 
    'Guatemala', 'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Holy See (Vatican City State)', 
    'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 
    'Isle of Man', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 
    'Kiribati', 'South Korea', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 
    'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macao', 'North Macedonia', 'Madagascar', 
    'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Martinique', 'Mauritania', 
    'Mauritius', 'Mayotte', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 
    'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 
    'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'Norfolk Island', 
    'Northern Mariana Islands', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 
    'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 
    'Réunion', 'Romania', 'Russia', 'Rwanda', 'Samoa', 'San Marino', 'Sao Tome and Principe', 
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 
    'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 
    'Togo', 'Tokelau', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 
    'Turks and Caicos Islands', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 
    'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Wallis and Futuna', 
    'Western Sahara', 'Yemen', 'Zambia', 'Zimbabwe', 'Unknown'
];
    

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

const setDateRanges = () => {
    flatpickr("#timeRangeStart", {
        dateFormat: "Y-m-d",
        minDate: MIN_DATE,
        maxDate: MAX_DATE,
        onChange: function(selectedDates, dateStr, instance) {
            endDatePicker.set('minDate', dateStr);
            debouncedSearch();
        }
    });

    const endDatePicker = flatpickr("#timeRangeEnd", {
        dateFormat: "Y-m-d",
        minDate: MIN_DATE,
        maxDate: MAX_DATE,
        onChange: function(selectedDates, dateStr, instance) {
            debouncedSearch();
        }
    });
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
        totalTweetsCount = data.total;
        currentPage = data.page;
        totalPages = Math.ceil(data.total / data.page_size);
        displayResults(data.results);
        updateResultsCount();  
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
        nav.className = 'pagination is-centered is-rounded';
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

        if (currentPage > 2) {
            pageList.appendChild(createPageItem(1));
            if (currentPage > 3) {
                pageList.appendChild(createEllipsis());
            }
        }

        for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
            pageList.appendChild(createPageItem(i));
        }

        if (currentPage < totalPages - 1) {
            if (currentPage < totalPages - 2) {
                pageList.appendChild(createEllipsis());
            }
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
    countDisplay.textContent = `${selectedIds.size} out of ${totalResultsCount} items selected (Page ${currentPage} of ${totalPages}, Total Tweets: ${totalTweetsCount})`;
    
    const filterTotalCount = getElement('filterTotalCount');
    filterTotalCount.textContent = `Total Tweets: ${totalTweetsCount}`;
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
    const resultItems = document.querySelectorAll('.result-item');
    allSelected = !allSelected;
    
    checkboxes.forEach((checkbox, index) => {
        checkbox.checked = allSelected;
        const id = checkbox.id.replace('select-', '');
        if (allSelected) {
            selectedIds.add(id);
            resultItems[index].classList.add('selected');
        } else {
            selectedIds.delete(id);
            resultItems[index].classList.remove('selected');
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
    populateLocationFilter(); 
    setDateRanges(); 
};


const populateLocationFilter = () => {
    const locationSelect = getElement('location');
    locationSelect.innerHTML = '';
    countryList.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
    console.log("Location filter populated, options count:", locationSelect.options.length);
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
    selectedLocationsDiv.innerHTML = selectedLocations.map(location => `<span class="chip">${location}</span>`).join('');
    
    debouncedSearch();
};



const updateAllDisplays = () => {
    ['retweetCount', 'replyCount', 'quoteCount', 'favouriteCount', 'influenceTweetFactor', 'influenceUser', 'extendedEntities'].forEach(updateDisplay);
};

const updateDisplay = (id) => {
    getElement(`${id}Display`).innerText = getElement(id).value;
    debouncedSearch();
};

const resetFilters = () => {
    ['searchQuery', 'timeRangeStart', 'timeRangeEnd', 'location', 'topic', 'sentiment', 'influenceTweetFactor', 'influenceUser', 'verifiedAccount', 'retweetCount', 'replyCount', 'quoteCount', 'favouriteCount', 'extendedEntities', 'authorKeynode', 'hashtagKeynode'].forEach(id => {
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
window.updateLocationFilter = updateLocationFilter;

