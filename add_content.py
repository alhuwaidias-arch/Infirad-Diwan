#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
أداة سطر الأوامر لإضافة محتوى جديد لمنصة ديوان الانفراد
CLI Tool for Adding New Content to Diwan Al-Infirad Platform
"""

from content_manager import ContentManager, CATEGORIES
import sys

def print_categories():
    """عرض المجالات العلمية المتاحة"""
    print("\n📚 المجالات العلمية المتاحة:")
    print("="*50)
    for key, value in CATEGORIES.items():
        print(f"  {key:15} -> {value['ar']}")
    print("="*50)

def add_term_interactive():
    """إضافة مصطلح بشكل تفاعلي"""
    print("\n✨ إضافة مصطلح جديد")
    print("="*50)
    
    print_categories()
    
    term_data = {}
    
    # جمع البيانات
    term_data['title_ar'] = input("\n📝 العنوان بالعربية: ").strip()
    term_data['title_en'] = input("📝 English Title: ").strip()
    
    while True:
        category = input("📂 المجال (مثال: physics): ").strip().lower()
        if category in CATEGORIES:
            term_data['category'] = category
            break
        print("❌ المجال غير صحيح. حاول مرة أخرى.")
    
    term_data['definition'] = input("\n📖 التعريف العلمي:\n").strip()
    term_data['explanation'] = input("\n💡 شرح مبسط:\n").strip()
    
    # الأمثلة
    examples = []
    print("\n📌 الأمثلة (اضغط Enter بدون كتابة للإنهاء):")
    while True:
        example_title = input(f"  مثال {len(examples)+1} - العنوان: ").strip()
        if not example_title:
            break
        example_content = input(f"  مثال {len(examples)+1} - المحتوى: ").strip()
        examples.append({'title': example_title, 'content': example_content})
    
    if examples:
        term_data['examples'] = examples
    
    # الصورة (اختياري)
    image = input("\n🖼️  اسم ملف الصورة (اختياري، اضغط Enter للتخطي): ").strip()
    if image:
        term_data['image'] = image
    
    # تأكيد
    print("\n" + "="*50)
    print("📋 ملخص المصطلح:")
    print(f"  العنوان: {term_data['title_ar']}")
    print(f"  المجال: {CATEGORIES[term_data['category']]['ar']}")
    print(f"  عدد الأمثلة: {len(examples)}")
    print("="*50)
    
    confirm = input("\n✅ هل تريد حفظ المصطلح؟ (y/n): ").strip().lower()
    
    if confirm == 'y':
        manager = ContentManager()
        filename = manager.add_term(term_data)
        print(f"\n🎉 تم إنشاء المصطلح بنجاح!")
        print(f"📄 الملف: {filename}")
        return True
    else:
        print("\n❌ تم الإلغاء")
        return False

def add_article_interactive():
    """إضافة مقال بشكل تفاعلي"""
    print("\n✨ إضافة مقال جديد")
    print("="*50)
    
    print_categories()
    
    article_data = {}
    
    # جمع البيانات
    article_data['title'] = input("\n📝 عنوان المقال: ").strip()
    
    while True:
        category = input("📂 المجال (مثال: physics): ").strip().lower()
        if category in CATEGORIES:
            article_data['category'] = category
            break
        print("❌ المجال غير صحيح. حاول مرة أخرى.")
    
    article_data['intro'] = input("\n📖 مقدمة المقال:\n").strip()
    
    # الأقسام
    sections = []
    print("\n📌 أقسام المقال (اضغط Enter بدون كتابة للإنهاء):")
    while True:
        section_title = input(f"  قسم {len(sections)+1} - العنوان: ").strip()
        if not section_title:
            break
        section_content = input(f"  قسم {len(sections)+1} - المحتوى:\n").strip()
        sections.append({'title': section_title, 'content': section_content})
    
    if sections:
        article_data['sections'] = sections
    
    # وقت القراءة
    reading_time = input("\n⏱️  وقت القراءة المتوقع (بالدقائق): ").strip()
    article_data['reading_time'] = int(reading_time) if reading_time else 10
    
    # الصورة (اختياري)
    image = input("\n🖼️  اسم ملف الصورة (اختياري، اضغط Enter للتخطي): ").strip()
    if image:
        article_data['image'] = image
    
    # تأكيد
    print("\n" + "="*50)
    print("📋 ملخص المقال:")
    print(f"  العنوان: {article_data['title']}")
    print(f"  المجال: {CATEGORIES[article_data['category']]['ar']}")
    print(f"  عدد الأقسام: {len(sections)}")
    print(f"  وقت القراءة: {article_data['reading_time']} دقيقة")
    print("="*50)
    
    confirm = input("\n✅ هل تريد حفظ المقال؟ (y/n): ").strip().lower()
    
    if confirm == 'y':
        manager = ContentManager()
        filename = manager.add_article(article_data)
        print(f"\n🎉 تم إنشاء المقال بنجاح!")
        print(f"📄 الملف: {filename}")
        return True
    else:
        print("\n❌ تم الإلغاء")
        return False

def show_stats():
    """عرض إحصائيات المنصة"""
    manager = ContentManager()
    stats = manager.get_stats()
    
    print("\n📊 إحصائيات منصة ديوان الانفراد")
    print("="*50)
    print(f"  المجالات العلمية: {stats['categories_count']}")
    print(f"  المصطلحات: {stats['terms_count']}")
    print(f"  المقالات: {stats['articles_count']}")
    print("="*50)

def main():
    """القائمة الرئيسية"""
    print("\n" + "="*50)
    print("  🌟 نظام إدارة محتوى ديوان الانفراد 🌟")
    print("="*50)
    
    while True:
        print("\n📋 القائمة الرئيسية:")
        print("  1. إضافة مصطلح جديد")
        print("  2. إضافة مقال جديد")
        print("  3. عرض الإحصائيات")
        print("  4. عرض المجالات المتاحة")
        print("  5. خروج")
        
        choice = input("\n👉 اختر رقم الخيار: ").strip()
        
        if choice == '1':
            add_term_interactive()
        elif choice == '2':
            add_article_interactive()
        elif choice == '3':
            show_stats()
        elif choice == '4':
            print_categories()
        elif choice == '5':
            print("\n👋 شكراً لاستخدامك نظام إدارة المحتوى!")
            break
        else:
            print("\n❌ خيار غير صحيح. حاول مرة أخرى.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 تم إيقاف البرنامج")
        sys.exit(0)

