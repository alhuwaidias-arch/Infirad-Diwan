#!/bin/bash

# List of main pages to update (excluding term and article detail pages)
FILES="about.html categories.html terms-list.html articles.html category-physics.html category-chemistry.html category-biology.html category-energy.html category-engineering.html category-nature.html"

for file in $FILES; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Update navigation buttons
        sed -i 's|<a href="#" class="btn btn-outline-primary">تسجيل الدخول</a>|<button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#newsletterModal"><i class="fas fa-envelope"></i> الاشتراك في القائمة البريدية</button>|g' "$file"
        
        sed -i 's|<a href="#" class="btn btn-primary">إنشاء حساب</a>|<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#knowledgeModal"><i class="fas fa-share-alt"></i> شارك معرفتك</button>|g' "$file"
        
        # Add forms.js script before closing body tag if not already there
        if ! grep -q "forms.js" "$file"; then
            sed -i 's|</body>|    <script src="forms.js"></script>\n</body>|g' "$file"
        fi
    fi
done

echo "Done!"
