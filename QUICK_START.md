# 🚀 البدء السريع - نظام إدارة محتوى ديوان الانفراد

## إضافة مصطلح جديد

```bash
cd /home/ubuntu/Infirad-Diwan
python3 add_content.py
# اختر: 1
```

**البيانات المطلوبة:**
- العنوان بالعربية
- English Title  
- المجال (physics, chemistry, biology, energy, engineering, nature)
- التعريف العلمي
- شرح مبسط
- أمثلة (اختياري)
- صورة (اختياري)

---

## إضافة مقال جديد

```bash
cd /home/ubuntu/Infirad-Diwan
python3 add_content.py
# اختر: 2
```

**البيانات المطلوبة:**
- عنوان المقال
- المجال
- مقدمة المقال
- أقسام المقال
- وقت القراءة (بالدقائق)
- صورة (اختياري)

---

## نشر التحديثات

```bash
cd /home/ubuntu/Infirad-Diwan
git add .
git commit -m "إضافة محتوى جديد: [الوصف]"
git push origin main
```

---

## عرض الإحصائيات

```bash
python3 add_content.py
# اختر: 3
```

---

## المجالات المتاحة

| الرمز | الاسم |
|-------|-------|
| `physics` | الفيزياء |
| `chemistry` | الكيمياء |
| `biology` | الأحياء |
| `energy` | الطاقة |
| `engineering` | الهندسة |
| `nature` | الطبيعة |

---

## مثال سريع (Python)

```python
from content_manager import ContentManager

manager = ContentManager()

# إضافة مصطلح
term = {
    'title_ar': 'الجاذبية',
    'title_en': 'Gravity',
    'category': 'physics',
    'definition': 'قوة طبيعية تجذب الأجسام نحو بعضها',
    'explanation': 'القوة التي تجعل التفاحة تسقط من الشجرة',
    'examples': [
        {'title': 'سقوط الأجسام', 'content': 'الأجسام تسقط نحو الأرض بسبب الجاذبية'}
    ]
}

manager.add_term(term)
```

---

## الملفات المهمة

- `content_manager.py` - المحرك الأساسي
- `add_content.py` - الواجهة التفاعلية
- `data/terms.json` - قاعدة بيانات المصطلحات
- `data/articles.json` - قاعدة بيانات المقالات
- `USER_GUIDE.md` - الدليل الكامل

---

**للمزيد من التفاصيل، راجع `USER_GUIDE.md`**

