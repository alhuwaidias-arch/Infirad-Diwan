#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
نظام إدارة المحتوى لمنصة ديوان الانفراد
Content Management System for Diwan Al-Infirad Platform

هذا السكريبت يقوم بإنشاء صفحات المصطلحات والمقالات تلقائياً
ويحدث الإحصائيات والروابط في جميع الصفحات ذات الصلة
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path

# المجالات العلمية المتاحة
CATEGORIES = {
    'physics': {'ar': 'الفيزياء', 'en': 'Physics', 'color': 'primary'},
    'chemistry': {'ar': 'الكيمياء', 'en': 'Chemistry', 'color': 'success'},
    'biology': {'ar': 'الأحياء', 'en': 'Biology', 'color': 'info'},
    'energy': {'ar': 'الطاقة', 'en': 'Energy', 'color': 'warning'},
    'engineering': {'ar': 'الهندسة', 'en': 'Engineering', 'color': 'danger'},
    'nature': {'ar': 'الطبيعة', 'en': 'Nature', 'color': 'secondary'}
}

class ContentManager:
    def __init__(self, base_dir='.'):
        self.base_dir = Path(base_dir)
        self.terms_file = self.base_dir / 'data' / 'terms.json'
        self.articles_file = self.base_dir / 'data' / 'articles.json'
        self._ensure_data_dir()
        
    def _ensure_data_dir(self):
        """إنشاء مجلد البيانات إذا لم يكن موجوداً"""
        data_dir = self.base_dir / 'data'
        data_dir.mkdir(exist_ok=True)
        
        if not self.terms_file.exists():
            self._save_json(self.terms_file, [])
        if not self.articles_file.exists():
            self._save_json(self.articles_file, [])
    
    def _load_json(self, filepath):
        """تحميل ملف JSON"""
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _save_json(self, filepath, data):
        """حفظ ملف JSON"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def _slugify(self, text):
        """تحويل النص العربي إلى slug مناسب لاسم الملف"""
        # إزالة التشكيل والرموز الخاصة
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[\s_]+', '-', text)
        return text.strip('-').lower()
    
    def _get_current_date(self):
        """الحصول على التاريخ الحالي بالتنسيق العربي"""
        now = datetime.now()
        return f"٢٠٢٥/{now.month}/{now.day}"
    
    def add_term(self, term_data):
        """
        إضافة مصطلح جديد
        
        term_data = {
            'title_ar': 'العنوان بالعربية',
            'title_en': 'English Title',
            'category': 'physics',  # أحد المجالات المتاحة
            'definition': 'التعريف العلمي',
            'explanation': 'شرح مبسط',
            'examples': [
                {'title': 'عنوان المثال', 'content': 'محتوى المثال'},
                ...
            ],
            'image': 'term-example.jpg'  # اختياري
        }
        """
        # التحقق من صحة البيانات
        if term_data['category'] not in CATEGORIES:
            raise ValueError(f"المجال غير صحيح. المجالات المتاحة: {list(CATEGORIES.keys())}")
        
        # إنشاء slug لاسم الملف
        slug = self._slugify(term_data['title_ar'])
        filename = f"term-{slug}.html"
        
        # إضافة معلومات إضافية
        term_data['slug'] = slug
        term_data['filename'] = filename
        term_data['date'] = self._get_current_date()
        
        # حفظ البيانات
        terms = self._load_json(self.terms_file)
        terms.append(term_data)
        self._save_json(self.terms_file, terms)
        
        # إنشاء صفحة HTML
        self._create_term_page(term_data)
        
        # تحديث الصفحات ذات الصلة
        self._update_category_page(term_data['category'])
        self._update_terms_list_page()
        self._update_homepage_stats()
        
        print(f"✅ تم إضافة المصطلح: {term_data['title_ar']}")
        print(f"📄 الملف: {filename}")
        return filename
    
    def add_article(self, article_data):
        """
        إضافة مقال جديد
        
        article_data = {
            'title': 'عنوان المقال',
            'category': 'physics',
            'intro': 'مقدمة المقال',
            'sections': [
                {'title': 'عنوان القسم', 'content': 'محتوى القسم'},
                ...
            ],
            'reading_time': 15,  # بالدقائق
            'image': 'article-example.jpg'  # اختياري
        }
        """
        # التحقق من صحة البيانات
        if article_data['category'] not in CATEGORIES:
            raise ValueError(f"المجال غير صحيح. المجالات المتاحة: {list(CATEGORIES.keys())}")
        
        # إنشاء slug لاسم الملف
        slug = self._slugify(article_data['title'])
        filename = f"article-{slug}.html"
        
        # إضافة معلومات إضافية
        article_data['slug'] = slug
        article_data['filename'] = filename
        article_data['date'] = self._get_current_date()
        
        # حفظ البيانات
        articles = self._load_json(self.articles_file)
        articles.append(article_data)
        self._save_json(self.articles_file, articles)
        
        # إنشاء صفحة HTML
        self._create_article_page(article_data)
        
        # تحديث الصفحات ذات الصلة
        self._update_articles_list_page()
        self._update_homepage_stats()
        
        print(f"✅ تم إضافة المقال: {article_data['title']}")
        print(f"📄 الملف: {filename}")
        return filename
    
    def _create_term_page(self, term_data):
        """إنشاء صفحة HTML للمصطلح"""
        category = CATEGORIES[term_data['category']]
        
        # بناء أمثلة التوضيح
        examples_html = ""
        for example in term_data.get('examples', []):
            examples_html += f"""
                        <h3 class="mt-4 mb-3">{example['title']}</h3>
                        <p>{example['content']}</p>
"""
        
        # صورة المصطلح
        image_html = ""
        if term_data.get('image'):
            image_html = f"""
                        <div class="term-image-large">
                            <img src="images/{term_data['image']}" alt="{term_data['title_ar']}" class="img-fluid rounded">
                        </div>
"""
        
        html_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{term_data['title_ar']} - ديوان الانفراد</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Header -->
    <header class="bg-white shadow-sm sticky-top">
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center" href="index.html">
                    <img src="images/logos/logo_ar.PNG" alt="ديوان الانفراد" style="height: 50px;">
                    <span class="fw-bold fs-3" style="color: #0a2351; margin-right: 120px;">ديوان الانفراد</span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="index.html">الرئيسية</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="index.html#about">عن المنصة</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="categories.html">المجالات العلمية</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="terms-list.html">المصطلحات</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="articles.html">المقالات</a>
                        </li>
                    </ul>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#newsletterModal">
                            <i class="fas fa-envelope"></i> انضم إلينا
                        </button>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#knowledgeModal">
                            <i class="fas fa-share-alt"></i> شارك معرفتك
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <!-- Term Header -->
    <section class="term-page-header">
        <div class="container">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.html" class="text-white">الرئيسية</a></li>
                    <li class="breadcrumb-item"><a href="category-{term_data['category']}.html" class="text-white">{category['ar']}</a></li>
                    <li class="breadcrumb-item active text-white-50" aria-current="page">{term_data['title_ar']}</li>
                </ol>
            </nav>
            <div class="row align-items-center">
                <div class="col-md-8">
                    <span class="badge bg-light text-primary mb-2">{category['ar']}</span>
                    <h1 class="term-page-title">{term_data['title_ar']}</h1>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                    <button class="btn btn-light" onclick="copyPageLink()"><i class="fas fa-share-alt"></i> نسخ الرابط</button>
                </div>
            </div>
        </div>
    </section>

    <!-- Term Content -->
    <section class="py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-8">
                    <!-- Basic Definition -->
                    <div class="term-section">
                        <h2 class="term-section-title">التعريف العلمي</h2>
                        <p>{term_data['definition']}</p>{image_html}
                    </div>

                    <!-- Detailed Explanation -->
                    <div class="term-section">
                        <h2 class="term-section-title">شرح مبسط</h2>
                        <p>{term_data['explanation']}</p>
                    </div>

                    <!-- Examples and Illustrations -->
                    <div class="term-section">
                        <h2 class="term-section-title">أمثلة للتوضيح</h2>
                        {examples_html}
                    </div>
                </div>

                <div class="col-lg-4">
                    <!-- Term Info Card -->
                    <div class="term-section mb-4">
                        <h3 class="term-section-title">معلومات المصطلح</h3>
                        <table class="table">
                            <tbody>
                                <tr>
                                    <th>المجال</th>
                                    <td>{category['ar']}</td>
                                </tr>
                                <tr>
                                    <th>تاريخ الإضافة</th>
                                    <td>{term_data['date']}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">ديوان الانفراد</h5>
                    <p>منصة علمية متخصصة في توحيد وتوثيق المصطلحات العلمية باللغة العربية</p>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">روابط سريعة</h5>
                    <ul class="list-unstyled">
                        <li><a href="index.html" class="text-white-50 text-decoration-none">الرئيسية</a></li>
                        <li><a href="index.html#about" class="text-white-50 text-decoration-none">عن المنصة</a></li>
                        <li><a href="categories.html" class="text-white-50 text-decoration-none">المجالات العلمية</a></li>
                        <li><a href="terms-list.html" class="text-white-50 text-decoration-none">المصطلحات</a></li>
                    </ul>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">تواصل معنا</h5>
                    <p class="text-white-50">info@infiradeng.com</p>
                </div>
            </div>
            <hr class="my-4 bg-white-50">
            <div class="text-center">
                <p class="mb-0">&copy; ٢٠٢٥ ديوان الانفراد. جميع الحقوق محفوظة.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>

    <script>
    function copyPageLink() {{
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(function() {{
            const btn = event.target.closest('button');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ!';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-light');
            
            setTimeout(function() {{
                btn.innerHTML = originalHTML;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-light');
            }}, 2000);
        }}, function(err) {{
            alert('فشل نسخ الرابط. الرجاء المحاولة مرة أخرى.');
        }});
    }}
    </script>
</body>
</html>
"""
        
        # حفظ الملف
        filepath = self.base_dir / term_data['filename']
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    def _create_article_page(self, article_data):
        """إنشاء صفحة HTML للمقال"""
        category = CATEGORIES[article_data['category']]
        
        # بناء أقسام المقال
        sections_html = ""
        for section in article_data.get('sections', []):
            sections_html += f"""
                        <h2 class="fw-bold mb-4 mt-5">{section['title']}</h2>
                        <p>{section['content']}</p>
"""
        
        html_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{article_data['title']} - ديوان الانفراد</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="sticky-top bg-white shadow-sm">
        <nav class="navbar navbar-expand-lg navbar-light">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center" href="index.html">
                    <img src="images/logos/icon.PNG" alt="ديوان الانفراد" height="50">
                    <span class="fw-bold fs-3 me-3" style="color: #0a2351; margin-right: 120px;">ديوان الانفراد</span>
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="index.html">الرئيسية</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="about.html">عن المنصة</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="categories.html">المجالات العلمية</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="terms-list.html">المصطلحات</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link active" href="articles.html">المقالات</a>
                        </li>
                    </ul>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#newsletterModal">
                            <i class="fas fa-envelope"></i> انضم إلينا
                        </button>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#knowledgeModal">
                            <i class="fas fa-share-alt"></i> شارك معرفتك
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <!-- Article Header -->
    <section class="term-page-header">
        <div class="container">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.html" class="text-white">الرئيسية</a></li>
                    <li class="breadcrumb-item"><a href="articles.html" class="text-white">المقالات</a></li>
                    <li class="breadcrumb-item"><a href="category-{article_data['category']}.html" class="text-white">{category['ar']}</a></li>
                    <li class="breadcrumb-item active text-white-50" aria-current="page">{article_data['title']}</li>
                </ol>
            </nav>
            <div class="row align-items-center">
                <div class="col-md-8">
                    <span class="badge bg-light text-{category['color']} mb-2">{category['ar']}</span>
                    <h1 class="term-page-title">{article_data['title']}</h1>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                    <button class="btn btn-light" onclick="copyPageLink()"><i class="fas fa-share-alt"></i> نسخ الرابط</button>
                </div>
            </div>
        </div>
    </section>

    <!-- Article Content -->
    <section class="py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-8 mx-auto">
                    <article class="article-content">
                        <h2 class="fw-bold mb-4">مقدمة</h2>
                        <p class="lead">{article_data['intro']}</p>
{sections_html}
                    </article>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-dark text-white py-5">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">ديوان الانفراد</h5>
                    <p>منصة علمية متخصصة في توحيد وتوثيق المصطلحات العلمية باللغة العربية</p>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">روابط سريعة</h5>
                    <ul class="list-unstyled">
                        <li><a href="index.html" class="text-white-50 text-decoration-none">الرئيسية</a></li>
                        <li><a href="about.html" class="text-white-50 text-decoration-none">عن المنصة</a></li>
                        <li><a href="categories.html" class="text-white-50 text-decoration-none">المجالات العلمية</a></li>
                        <li><a href="terms-list.html" class="text-white-50 text-decoration-none">المصطلحات</a></li>
                    </ul>
                </div>
                <div class="col-md-4 mb-4">
                    <h5 class="fw-bold mb-3">تواصل معنا</h5>
                    <p class="text-white-50">info@infiradeng.com</p>
                </div>
            </div>
            <hr class="my-4 bg-white-50">
            <div class="text-center">
                <p class="mb-0">&copy; ٢٠٢٥ ديوان الانفراد. جميع الحقوق محفوظة.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>

    <script>
    function copyPageLink() {{
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(function() {{
            const btn = event.target.closest('button');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> تم النسخ!';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-light');
            
            setTimeout(function() {{
                btn.innerHTML = originalHTML;
                btn.classList.remove('btn-success');
                btn.classList.add('btn-light');
            }}, 2000);
        }}, function(err) {{
            alert('فشل نسخ الرابط. الرجاء المحاولة مرة أخرى.');
        }});
    }}
    </script>
</body>
</html>
"""
        
        # حفظ الملف
        filepath = self.base_dir / article_data['filename']
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    def _update_category_page(self, category):
        """تحديث صفحة الفئة بالمصطلحات الجديدة"""
        print(f"🔄 تحديث صفحة الفئة: {CATEGORIES[category]['ar']}")
        # سيتم تنفيذ هذا لاحقاً
    
    def _update_terms_list_page(self):
        """تحديث صفحة قائمة المصطلحات"""
        print("🔄 تحديث صفحة قائمة المصطلحات")
        # سيتم تنفيذ هذا لاحقاً
    
    def _update_articles_list_page(self):
        """تحديث صفحة قائمة المقالات"""
        print("🔄 تحديث صفحة قائمة المقالات")
        # سيتم تنفيذ هذا لاحقاً
    
    def _update_homepage_stats(self):
        """تحديث الإحصائيات في الصفحة الرئيسية"""
        terms = self._load_json(self.terms_file)
        articles = self._load_json(self.articles_file)
        
        print(f"📊 الإحصائيات الجديدة:")
        print(f"   - المصطلحات: {len(terms)}")
        print(f"   - المقالات: {len(articles)}")
    
    def get_stats(self):
        """الحصول على إحصائيات المحتوى"""
        terms = self._load_json(self.terms_file)
        articles = self._load_json(self.articles_file)
        
        return {
            'terms_count': len(terms),
            'articles_count': len(articles),
            'categories_count': len(CATEGORIES)
        }


# مثال على الاستخدام
if __name__ == "__main__":
    manager = ContentManager()
    
    # عرض الإحصائيات الحالية
    stats = manager.get_stats()
    print("📊 إحصائيات المنصة الحالية:")
    print(f"   المجالات العلمية: {stats['categories_count']}")
    print(f"   المصطلحات: {stats['terms_count']}")
    print(f"   المقالات: {stats['articles_count']}")
    print("\n" + "="*50)
    print("نظام إدارة المحتوى جاهز للاستخدام!")
    print("="*50)

