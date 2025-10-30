// Real Search Functionality for Infirad Diwan Platform
let searchData = null;

// Load search data on page load
async function loadSearchData() {
    try {
        const response = await fetch('search-data.json');
        searchData = await response.json();
        console.log('Search data loaded successfully');
    } catch (error) {
        console.error('Error loading search data:', error);
        searchData = { terms: [], articles: [] };
    }
}

// Normalize Arabic text for better search
function normalizeArabic(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/[أإآ]/g, 'ا')
        .replace(/[ىئ]/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
        .trim();
}

// Search function
function performSearch(query) {
    if (!searchData || !query || query.length < 2) {
        return { terms: [], articles: [] };
    }

    const normalizedQuery = normalizeArabic(query);
    const results = { terms: [], articles: [] };

    // Search in terms
    searchData.terms.forEach(term => {
        const normalizedTitle = normalizeArabic(term.title);
        const normalizedEnglish = normalizeArabic(term.englishTitle);
        const normalizedDefinition = normalizeArabic(term.definition);
        const normalizedCategory = normalizeArabic(term.category);
        
        // Check if query matches title, english title, definition, category, or keywords
        const matchScore = 
            (normalizedTitle.includes(normalizedQuery) ? 10 : 0) +
            (normalizedEnglish.includes(normalizedQuery) ? 8 : 0) +
            (normalizedDefinition.includes(normalizedQuery) ? 5 : 0) +
            (normalizedCategory.includes(normalizedQuery) ? 3 : 0) +
            (term.keywords.some(kw => normalizeArabic(kw).includes(normalizedQuery)) ? 7 : 0);

        if (matchScore > 0) {
            results.terms.push({ ...term, matchScore });
        }
    });

    // Search in articles
    searchData.articles.forEach(article => {
        const normalizedTitle = normalizeArabic(article.title);
        const normalizedSummary = normalizeArabic(article.summary);
        const normalizedCategory = normalizeArabic(article.category);
        
        const matchScore = 
            (normalizedTitle.includes(normalizedQuery) ? 10 : 0) +
            (normalizedSummary.includes(normalizedQuery) ? 5 : 0) +
            (normalizedCategory.includes(normalizedQuery) ? 3 : 0) +
            (article.keywords.some(kw => normalizeArabic(kw).includes(normalizedQuery)) ? 7 : 0);

        if (matchScore > 0) {
            results.articles.push({ ...article, matchScore });
        }
    });

    // Sort by match score
    results.terms.sort((a, b) => b.matchScore - a.matchScore);
    results.articles.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    results.terms = results.terms.slice(0, 5);
    results.articles = results.articles.slice(0, 3);

    return results;
}

// Show search suggestions
function showSearchSuggestions(query, inputElement) {
    const results = performSearch(query);
    
    // Remove existing suggestions
    hideSearchSuggestions();
    
    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    suggestionsContainer.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e0e0e0;
        border-top: none;
        border-radius: 0 0 10px 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-height: 400px;
        overflow-y: auto;
        z-index: 1000;
        margin-top: -1px;
    `;

    const totalResults = results.terms.length + results.articles.length;

    if (totalResults === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'suggestion-item';
        noResults.style.cssText = `
            padding: 15px;
            text-align: center;
            color: #999;
        `;
        noResults.textContent = 'لا توجد نتائج مطابقة';
        suggestionsContainer.appendChild(noResults);
    } else {
        // Add terms section
        if (results.terms.length > 0) {
            const termsHeader = document.createElement('div');
            termsHeader.style.cssText = `
                padding: 10px 15px;
                background: #f8f9fa;
                font-weight: bold;
                color: #0a2351;
                border-bottom: 1px solid #e0e0e0;
            `;
            termsHeader.innerHTML = '<i class="fas fa-book"></i> المصطلحات';
            suggestionsContainer.appendChild(termsHeader);

            results.terms.forEach(term => {
                const item = createSuggestionItem(
                    term.title,
                    term.category,
                    term.url,
                    'term'
                );
                suggestionsContainer.appendChild(item);
            });
        }

        // Add articles section
        if (results.articles.length > 0) {
            const articlesHeader = document.createElement('div');
            articlesHeader.style.cssText = `
                padding: 10px 15px;
                background: #f8f9fa;
                font-weight: bold;
                color: #0a2351;
                border-bottom: 1px solid #e0e0e0;
                ${results.terms.length > 0 ? 'border-top: 2px solid #e0e0e0; margin-top: 5px;' : ''}
            `;
            articlesHeader.innerHTML = '<i class="fas fa-newspaper"></i> المقالات';
            suggestionsContainer.appendChild(articlesHeader);

            results.articles.forEach(article => {
                const item = createSuggestionItem(
                    article.title,
                    article.category + ' • ' + article.readingTime,
                    article.url,
                    'article'
                );
                suggestionsContainer.appendChild(item);
            });
        }
    }

    // Add to DOM
    const searchContainer = inputElement.closest('.search-container') || inputElement.parentElement;
    searchContainer.style.position = 'relative';
    searchContainer.appendChild(suggestionsContainer);
}

// Create suggestion item
function createSuggestionItem(title, subtitle, url, type) {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.style.cssText = `
        padding: 12px 15px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        transition: background-color 0.2s;
    `;
    
    const icon = type === 'term' ? 'fa-book' : 'fa-newspaper';
    const color = type === 'term' ? '#2196F3' : '#4CAF50';
    
    item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${icon}" style="color: ${color}; font-size: 18px;"></i>
            <div style="flex: 1;">
                <div style="font-weight: 500; color: #333; margin-bottom: 3px;">${title}</div>
                <div style="font-size: 12px; color: #999;">${subtitle}</div>
            </div>
            <i class="fas fa-arrow-left" style="color: #ccc; font-size: 14px;"></i>
        </div>
    `;

    item.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#f8f9fa';
    });

    item.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'white';
    });

    item.addEventListener('click', function() {
        window.location.href = url;
    });

    return item;
}

// Hide search suggestions
function hideSearchSuggestions() {
    const existingSuggestions = document.querySelector('.search-suggestions');
    if (existingSuggestions) {
        existingSuggestions.remove();
    }
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', async function() {
    // Load search data
    await loadSearchData();

    // Get search input and button
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    if (!searchInput) return;

    // Input event - show suggestions as user types
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length >= 2) {
            showSearchSuggestions(query, this);
        } else {
            hideSearchSuggestions();
        }
    });

    // Search button click
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (query.length >= 2) {
                showSearchSuggestions(query, searchInput);
            }
        });
    }

    // Enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query.length >= 2) {
                showSearchSuggestions(query, this);
            }
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-container')) {
            hideSearchSuggestions();
        }
    });

    // Focus and blur effects
    searchInput.addEventListener('focus', function() {
        this.parentElement.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.2)';
    });

    searchInput.addEventListener('blur', function() {
        setTimeout(() => {
            this.parentElement.style.boxShadow = '';
        }, 200);
    });
});

