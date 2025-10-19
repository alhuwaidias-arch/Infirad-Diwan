// Forms Handler for Infirad Diwan Platform
// Handles newsletter subscription and knowledge sharing forms
// With Google Drive file upload support

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzNYIrwQ7f_eI14HlYfOZ-xmVNRmc1i5gO-oVkKYftwelT8pNZl7FmaUpQaTaBR7TrqhQ/exec';

// Newsletter Form Handler
document.getElementById('newsletterForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('newsletterSubmitBtn');
    const messageDiv = document.getElementById('newsletterMessage');
    const name = document.getElementById('newsletterName').value.trim();
    const email = document.getElementById('newsletterEmail').value.trim();
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>جاري الإرسال...';
    messageDiv.classList.add('d-none');
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'newsletter',
                name: name,
                email: email
            })
        });
        
        // Since we're using no-cors, we can't read the response
        // We'll assume success if no error was thrown
        showMessage(messageDiv, 'success', 'تم الاشتراك بنجاح! شكراً لانضمامك إلى قائمتنا البريدية.');
        document.getElementById('newsletterForm').reset();
        
        // Close modal after 2 seconds
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('newsletterModal'));
            modal.hide();
            messageDiv.classList.add('d-none');
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(messageDiv, 'danger', 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>اشترك الآن';
    }
});

// Knowledge Sharing Form Handler with File Upload
document.getElementById('knowledgeForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('knowledgeSubmitBtn');
    const messageDiv = document.getElementById('knowledgeMessage');
    const name = document.getElementById('knowledgeName').value.trim();
    const email = document.getElementById('knowledgeEmail').value.trim();
    const field = document.getElementById('knowledgeField').value;
    const contributionType = document.getElementById('knowledgeType').value;
    const notes = document.getElementById('knowledgeNotes').value.trim();
    const fileInput = document.getElementById('knowledgeFile');
    
    // Validate file size
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (file.size > maxSize) {
            showMessage(messageDiv, 'danger', 'حجم الملف كبير جداً. الحد الأقصى المسموح به هو 10MB.');
            return;
        }
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>جاري الإرسال...';
    messageDiv.classList.add('d-none');
    
    try {
        let fileData = null;
        
        // If file is selected, convert to base64
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            showMessage(messageDiv, 'info', 'جاري رفع الملف...');
            
            // Convert file to base64
            fileData = await fileToBase64(file);
        }
        
        const requestData = {
            type: 'knowledge',
            name: name,
            email: email,
            field: field,
            contributionType: contributionType,
            notes: notes
        };
        
        // Add file data if exists
        if (fileData) {
            requestData.file = fileData;
        }
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        // Since we're using no-cors, we can't read the response
        // We'll assume success if no error was thrown
        showMessage(messageDiv, 'success', 'تم إرسال مشاركتك بنجاح! سنقوم بمراجعتها قريباً.');
        document.getElementById('knowledgeForm').reset();
        
        // Close modal after 2 seconds
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('knowledgeModal'));
            modal.hide();
            messageDiv.classList.add('d-none');
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage(messageDiv, 'danger', 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>إرسال المشاركة';
    }
});

/**
 * Convert file to base64 for upload to Google Drive
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const base64String = e.target.result.split(',')[1]; // Remove data:*/*;base64, prefix
            resolve({
                name: file.name,
                mimeType: file.type,
                data: base64String,
                size: file.size
            });
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

// Helper function to show messages
function showMessage(element, type, message) {
    element.className = `alert alert-${type}`;
    element.textContent = message;
    element.classList.remove('d-none');
}

// Reset message when modals are closed
document.getElementById('newsletterModal')?.addEventListener('hidden.bs.modal', function() {
    document.getElementById('newsletterMessage').classList.add('d-none');
    document.getElementById('newsletterForm').reset();
});

document.getElementById('knowledgeModal')?.addEventListener('hidden.bs.modal', function() {
    document.getElementById('knowledgeMessage').classList.add('d-none');
    document.getElementById('knowledgeForm').reset();
});

