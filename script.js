// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    // In a real application, this would redirect to search results
                    showSearchResults(searchTerm);
                }
            }
        });

        // Add search suggestions
        const searchSuggestions = [
            'الطاقة الشمسية',
            'الحمض النووي',
            'طاقة الرياح',
            'الفيزياء الكمية',
            'النظرية النسبية',
            'الخلايا الجذعية'
        ];

        // Create suggestions container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        suggestionsContainer.style.display = 'none';
        searchInput.parentNode.appendChild(suggestionsContainer);

        // Show suggestions on focus
        searchInput.addEventListener('focus', function() {
            if (this.value.trim() === '') {
                showSuggestions(searchSuggestions);
            }
        });

        // Filter suggestions on input
        searchInput.addEventListener('input', function() {
            const value = this.value.trim().toLowerCase();
            if (value === '') {
                showSuggestions(searchSuggestions);
            } else {
                const filteredSuggestions = searchSuggestions.filter(suggestion => 
                    suggestion.toLowerCase().includes(value)
                );
                showSuggestions(filteredSuggestions);
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });

        function showSuggestions(suggestions) {
            suggestionsContainer.innerHTML = '';
            
            if (suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item';
                    item.textContent = suggestion;
                    item.addEventListener('click', function() {
                        searchInput.value = suggestion;
                        suggestionsContainer.style.display = 'none';
                        showSearchResults(suggestion);
                    });
                    suggestionsContainer.appendChild(item);
                });
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        }
    }

    // Function to show search results
    function showSearchResults(searchTerm) {
        // Create modal for search results
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'searchResultsModal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('aria-labelledby', 'searchResultsModalLabel');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="searchResultsModalLabel">نتائج البحث: ${searchTerm}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="search-results">
                            ${getSearchResultsHTML(searchTerm)}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const searchResultsModal = new bootstrap.Modal(document.getElementById('searchResultsModal'));
        searchResultsModal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('searchResultsModal').addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    }

    // Function to generate search results HTML
    function getSearchResultsHTML(searchTerm) {
        // Mock search results based on the search term
        const results = [];
        
        if (searchTerm.includes('طاقة') || searchTerm.includes('شمس')) {
            results.push({
                title: 'الطاقة الشمسية',
                category: 'الطاقة المتجددة',
                description: 'الطاقة الشمسية هي طاقة مستمدة من أشعة الشمس، ويمكن تحويلها إلى حرارة أو كهرباء.',
                url: 'term.html'
            });
        }
        
        if (searchTerm.includes('طاقة') || searchTerm.includes('ريح')) {
            results.push({
                title: 'طاقة الرياح',
                category: 'الطاقة المتجددة',
                description: 'طاقة الرياح هي عملية تحويل حركة الرياح إلى شكل مفيد من أشكال الطاقة، مثل الكهرباء.',
                url: '#'
            });
        }
        
        if (searchTerm.includes('حمض') || searchTerm.includes('نووي') || searchTerm.includes('dna')) {
            results.push({
                title: 'الحمض النووي',
                category: 'الأحياء',
                description: 'الحمض النووي هو جزيء يحمل المعلومات الوراثية المستخدمة في نمو وتطور وأداء وظائف جميع الكائنات الحية.',
                url: '#'
            });
        }
        
        // Add generic results if no specific matches or search term is short
        if (results.length === 0 || searchTerm.length < 3) {
            results.push(
                {
                    title: 'الطاقة الشمسية',
                    category: 'الطاقة المتجددة',
                    description: 'الطاقة الشمسية هي طاقة مستمدة من أشعة الشمس، ويمكن تحويلها إلى حرارة أو كهرباء.',
                    url: 'term.html'
                },
                {
                    title: 'الحمض النووي',
                    category: 'الأحياء',
                    description: 'الحمض النووي هو جزيء يحمل المعلومات الوراثية المستخدمة في نمو وتطور وأداء وظائف جميع الكائنات الحية.',
                    url: '#'
                },
                {
                    title: 'طاقة الرياح',
                    category: 'الطاقة المتجددة',
                    description: 'طاقة الرياح هي عملية تحويل حركة الرياح إلى شكل مفيد من أشكال الطاقة، مثل الكهرباء.',
                    url: '#'
                }
            );
        }
        
        if (results.length === 0) {
            return `<p class="text-center">لا توجد نتائج مطابقة لـ "${searchTerm}"</p>`;
        }
        
        return results.map(result => `
            <div class="search-result-item">
                <span class="badge bg-primary mb-2">${result.category}</span>
                <h4><a href="${result.url}">${result.title}</a></h4>
                <p>${result.description}</p>
            </div>
        `).join('<hr>');
    }

    // Add animation to stats when they come into view
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => {
            observer.observe(stat);
        });
    }

    // Function to animate stats with counting effect
    function animateStats() {
        stats.forEach(stat => {
            const targetValue = parseInt(stat.textContent.replace(/\D/g, ''));
            const duration = 2000; // 2 seconds
            const startTime = Date.now();
            const endValue = targetValue;
            
            const updateCounter = () => {
                const currentTime = Date.now();
                const elapsedTime = currentTime - startTime;
                const progress = Math.min(elapsedTime / duration, 1);
                
                const currentValue = Math.floor(progress * endValue);
                stat.textContent = currentValue + (stat.textContent.includes('+') ? '+' : '');
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = targetValue + (stat.textContent.includes('+') ? '+' : '');
                }
            };
            
            updateCounter();
        });
    }

    // Add animation to elements when they come into view
    const animatedElements = document.querySelectorAll('.category-card, .term-card, .about-feature');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Add CSS for animations and search suggestions
    const style = document.createElement('style');
    style.textContent = `
        .category-card, .term-card, .about-feature {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .category-card.animated, .term-card.animated, .about-feature.animated {
            opacity: 1;
            transform: translateY(0);
        }
        .search-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 0 0 5px 5px;
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
        }
        .suggestion-item {
            padding: 10px 15px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .suggestion-item:hover {
            background-color: #f8f9fa;
        }
        .search-result-item {
            margin-bottom: 15px;
        }
        .search-result-item h4 {
            margin-bottom: 5px;
        }
        .search-result-item p {
            color: #666;
        }
    `;
    document.head.appendChild(style);

    // Add bookmark functionality
    const bookmarkButtons = document.querySelectorAll('button:has(.fa-bookmark)');
    bookmarkButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('.fa-bookmark');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                showToast('تم حفظ المصطلح في المفضلة');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                showToast('تم إزالة المصطلح من المفضلة');
            }
        });
    });

    // Add share functionality
    const shareButtons = document.querySelectorAll('button:has(.fa-share-alt)');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Create share modal
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'shareModal';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-labelledby', 'shareModalLabel');
            modal.setAttribute('aria-hidden', 'true');
            
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="shareModalLabel">مشاركة المصطلح</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="shareLink" class="form-label">رابط المشاركة</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="shareLink" value="${window.location.href}" readonly>
                                    <button class="btn btn-outline-secondary" type="button" id="copyLinkBtn">نسخ</button>
                                </div>
                            </div>
                            <div class="share-buttons d-flex justify-content-center gap-3 mt-4">
                                <a href="#" class="btn btn-primary"><i class="fab fa-facebook-f"></i></a>
                                <a href="#" class="btn btn-info text-white"><i class="fab fa-twitter"></i></a>
                                <a href="#" class="btn btn-success"><i class="fab fa-whatsapp"></i></a>
                                <a href="#" class="btn btn-secondary"><i class="fas fa-envelope"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
            shareModal.show();
            
            // Copy link functionality
            document.getElementById('copyLinkBtn').addEventListener('click', function() {
                const shareLink = document.getElementById('shareLink');
                shareLink.select();
                document.execCommand('copy');
                showToast('تم نسخ الرابط');
            });
            
            // Remove modal from DOM when hidden
            document.getElementById('shareModal').addEventListener('hidden.bs.modal', function () {
                document.body.removeChild(modal);
            });
        });
    });

    // Function to show toast notifications
    function showToast(message) {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="toast-header">
                <strong class="me-auto">ديوان الانفراد</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Remove toast from DOM when hidden
        toast.addEventListener('hidden.bs.toast', function () {
            toastContainer.removeChild(toast);
        });
    }

    // Add dark mode toggle
    const navbar = document.querySelector('.navbar .container');
    if (navbar) {
        const darkModeToggle = document.createElement('div');
        darkModeToggle.className = 'dark-mode-toggle ms-3';
        darkModeToggle.innerHTML = `
            <button class="btn btn-sm btn-outline-secondary" id="darkModeToggle">
                <i class="fas fa-moon"></i>
            </button>
        `;
        navbar.appendChild(darkModeToggle);
        
        const darkModeToggleBtn = document.getElementById('darkModeToggle');
        const htmlElement = document.documentElement;
        
        // Check for saved theme preference or prefer-color-scheme
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            htmlElement.classList.add('dark-theme');
            darkModeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // Toggle dark mode
        darkModeToggleBtn.addEventListener('click', function() {
            if (htmlElement.classList.contains('dark-theme')) {
                htmlElement.classList.remove('dark-theme');
                localStorage.setItem('theme', 'light');
                this.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                htmlElement.classList.add('dark-theme');
                localStorage.setItem('theme', 'dark');
                this.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
        
        // Add dark mode styles
        const darkModeStyle = document.createElement('style');
        darkModeStyle.textContent = `
            .dark-theme {
                --background: #121212;
                --foreground: #e0e0e0;
                --card: #1e1e1e;
                --card-foreground: #e0e0e0;
                --border-color: #333;
                --primary-color: #90caf9;
                --secondary-color: #64b5f6;
                --accent-color: #42a5f5;
                --light-color: #0d47a1;
                --light-text-color: #aaa;
            }
            
            .dark-theme body {
                background-color: var(--background);
                color: var(--foreground);
            }
            
            .dark-theme .bg-white,
            .dark-theme .term-card,
            .dark-theme .category-card,
            .dark-theme .term-section,
            .dark-theme .stat-card {
                background-color: var(--card) !important;
                color: var(--card-foreground);
            }
            
            .dark-theme .bg-light {
                background-color: var(--light-color) !important;
            }
            
            .dark-theme .text-dark {
                color: var(--card-foreground) !important;
            }
            
            .dark-theme .navbar {
                background-color: var(--card) !important;
            }
            
            .dark-theme .footer-divider {
                border-color: var(--border-color);
            }
            
            .dark-theme .term-header,
            .dark-theme .term-footer {
                border-color: var(--border-color);
            }
        `;
        document.head.appendChild(darkModeStyle);
    }
});
