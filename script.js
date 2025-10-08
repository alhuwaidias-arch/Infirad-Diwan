document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Search functionality
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('active');
        });

        searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('active');
        });

        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            if (query.length > 2) {
                showSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
        });
    }

    // Mock function to show search suggestions
    function showSearchSuggestions(query) {
        // Check if suggestions container already exists
        let suggestionsContainer = document.querySelector('.search-suggestions');
        
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            document.querySelector('.search-container').appendChild(suggestionsContainer);
        }

        // Clear previous suggestions
        suggestionsContainer.innerHTML = '';

        // Mock data - in a real app, this would come from an API
        const mockSuggestions = [
            { term: 'الطاقة الشمسية', field: 'الطاقة المتجددة' },
            { term: 'الطاقة الحرارية', field: 'الفيزياء' },
            { term: 'الطاقة الحركية', field: 'الفيزياء' },
            { term: 'الطاقة المتجددة', field: 'الطاقة' },
            { term: 'الطاقة النووية', field: 'الفيزياء' }
        ];

        // Filter suggestions based on query
        const filteredSuggestions = mockSuggestions.filter(item => 
            item.term.toLowerCase().includes(query) || 
            item.field.toLowerCase().includes(query)
        );

        // Add suggestions to container
        if (filteredSuggestions.length > 0) {
            filteredSuggestions.forEach(item => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'suggestion-item';
                suggestionItem.innerHTML = `<strong>${item.term}</strong> <span class="text-muted">(${item.field})</span>`;
                
                suggestionItem.addEventListener('click', function() {
                    window.location.href = 'term.html'; // In a real app, this would go to the term page
                });
                
                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            const noResults = document.createElement('div');
            noResults.className = 'suggestion-item';
            noResults.textContent = 'لا توجد نتائج مطابقة';
            suggestionsContainer.appendChild(noResults);
        }
    }

    // Hide search suggestions
    function hideSearchSuggestions() {
        const suggestionsContainer = document.querySelector('.search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.remove();
        }
    }

    // Close suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-container')) {
            hideSearchSuggestions();
        }
    });

    // Category tags click handler
    const categoryTags = document.querySelectorAll('.category-tags .badge');
    categoryTags.forEach(tag => {
        tag.addEventListener('click', function() {
            const category = this.textContent;
            searchInput.value = category;
            // In a real app, this would trigger a search or redirect to category page
            showToast(`تم اختيار فئة: ${category}`);
        });
    });

    // Term card hover animation
    const termCards = document.querySelectorAll('.term-card');
    termCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('animate-fadeIn');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('animate-fadeIn');
        });
    });

    // Bookmark functionality
    const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
    bookmarkButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const isBookmarked = this.classList.toggle('active');
            const termTitle = this.closest('.term-card').querySelector('.term-title').textContent;
            
            if (isBookmarked) {
                showToast(`تم حفظ "${termTitle}" في المفضلة`);
                this.innerHTML = '<i class="fas fa-bookmark"></i>';
            } else {
                showToast(`تم إزالة "${termTitle}" من المفضلة`);
                this.innerHTML = '<i class="far fa-bookmark"></i>';
            }
        });
    });

    // Share functionality
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const termTitle = this.closest('.term-card').querySelector('.term-title').textContent;
            
            // In a real app, this would open a share dialog
            showToast(`جاري مشاركة "${termTitle}"`);
        });
    });

    // Toast notification system
    function showToast(message, type = 'info') {
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
        toast.className = `toast show ${type}`;
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
        
        // Auto-remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
        
        // Add close button functionality
        toast.querySelector('.btn-close').addEventListener('click', function() {
            toast.classList.remove('show');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        });
    }

    // Remove dark mode toggle button
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.remove();
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to clicked link if it's a nav-link
                if (this.classList.contains('nav-link')) {
                    this.classList.add('active');
                }
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        const sections = ['home', 'categories', 'about', 'terms'];
        const navbarHeight = document.querySelector('header').offsetHeight;
        
        let current = '';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop - navbarHeight - 100;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
                    current = sectionId;
                }
            }
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Animation on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 50) {
                element.classList.add('animate-fadeIn');
            }
        });
    };
    
    // Add animation class to elements
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('animate-on-scroll');
    });
    
    // Initial check and add scroll event listener
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
});
