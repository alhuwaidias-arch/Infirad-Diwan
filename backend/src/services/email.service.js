// Email Service - Updated to use SendGrid
const { sgMail, emailConfig } = require('../config/email.config');
const { query } = require('../database/connection');

/**
 * Send email using SendGrid
 */
async function sendEmail(to, subject, html, text = null) {
  if (!emailConfig.enabled) {
    console.log(`[Email Disabled] Would send to ${to}: ${subject}`);
    return { success: false, message: 'Email notifications disabled' };
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.warn(`[Email Not Configured] Would send to ${to}: ${subject}`);
    return { success: false, message: 'SendGrid not configured' };
  }

  try {
    const msg = {
      to: to,
      from: {
        email: emailConfig.from.email,
        name: emailConfig.from.name
      },
      subject: subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html: html
    };

    await sgMail.send(msg);
    
    // Log to database
    await logEmail({
      recipientEmail: to,
      subject: subject,
      templateName: 'custom',
      status: 'sent'
    });

    console.log(`Email sent to ${to}: ${subject}`);
    return { success: true, message: 'Email sent successfully' };

  } catch (error) {
    console.error('Email send error:', error);
    
    // Log error to database
    await logEmail({
      recipientEmail: to,
      subject: subject,
      templateName: 'custom',
      status: 'failed',
      errorMessage: error.message
    });

    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(user) {
  const subject = 'مرحباً بك في ديوان المعرفة';
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>مرحباً ${user.full_name}،</h2>
      <p>نرحب بك في <strong>ديوان المعرفة</strong> - منصة المعرفة العلمية العربية.</p>
      <p>تم إنشاء حسابك بنجاح ويمكنك الآن:</p>
      <ul>
        <li>تقديم المصطلحات والمقالات العلمية</li>
        <li>متابعة حالة مساهماتك</li>
        <li>التفاعل مع المحتوى المنشور</li>
      </ul>
      <p>نتطلع إلى مساهماتك القيمة!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية<br>
        <a href="${process.env.FRONTEND_URL || 'https://alhuwaidias-arch.github.io/Diwan-Al-Maarifa'}">${process.env.FRONTEND_URL || 'https://alhuwaidias-arch.github.io/Diwan-Al-Maarifa'}</a>
      </p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
}

/**
 * Send content submission notification to admin
 */
async function sendSubmissionNotification(submission, author) {
  // Send to admin
  const adminSubject = `مشاركة جديدة: ${submission.title_ar}`;
  const adminHtml = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>مشاركة جديدة من ${author.full_name}</h2>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>العنوان:</strong> ${submission.title_ar}<br>
        <strong>النوع:</strong> ${submission.type === 'term' ? 'مصطلح' : 'مقال'}<br>
        <strong>المؤلف:</strong> ${author.full_name} (${author.email})<br>
        <strong>تاريخ الإرسال:</strong> ${new Date(submission.submitted_at).toLocaleDateString('ar-EG')}
      </div>
      <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
        <strong>معاينة المحتوى:</strong><br>
        ${submission.content_ar.substring(0, 300)}...
      </div>
      ${submission.notes ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>ملاحظات المؤلف:</strong><br>
          ${submission.notes}
        </div>
      ` : ''}
      <p>يرجى مراجعة المشاركة في أقرب وقت ممكن.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية
      </p>
    </div>
  `;
  
  await sendEmail(emailConfig.adminEmail, adminSubject, adminHtml);
  
  // Send confirmation to author
  const authorSubject = 'تم استلام مساهمتك - ديوان المعرفة';
  const authorHtml = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>عزيزي ${author.full_name}،</h2>
      <p>تم استلام مساهمتك بنجاح:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>العنوان:</strong> ${submission.title_ar}<br>
        <strong>النوع:</strong> ${submission.type === 'term' ? 'مصطلح' : 'مقال'}<br>
        <strong>الحالة:</strong> قيد المراجعة
      </div>
      <p>سيتم مراجعة مساهمتك من قبل فريق التدقيق وسنبلغك بالنتيجة قريباً.</p>
      <p>شكراً لمساهمتك في إثراء المحتوى العربي!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية
      </p>
    </div>
  `;
  
  return await sendEmail(author.email, authorSubject, authorHtml);
}

/**
 * Send review notification to auditors
 */
async function sendReviewRequestNotification(submission, auditor) {
  const subject = 'مساهمة جديدة تحتاج للمراجعة - ديوان المعرفة';
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>عزيزي ${auditor.full_name}،</h2>
      <p>هناك مساهمة جديدة تحتاج إلى مراجعتك:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>العنوان:</strong> ${submission.title_ar}<br>
        <strong>النوع:</strong> ${submission.type === 'term' ? 'مصطلح' : 'مقال'}<br>
        <strong>المؤلف:</strong> ${submission.author_name}
      </div>
      <p>يرجى مراجعة المساهمة في أقرب وقت ممكن.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية
      </p>
    </div>
  `;
  
  return await sendEmail(auditor.email, subject, html);
}

/**
 * Send review decision notification to author
 */
async function sendReviewDecisionNotification(submission, author, decision, comments) {
  let statusText, statusColor, message;
  
  if (decision === 'approved') {
    statusText = 'تمت الموافقة';
    statusColor = '#28a745';
    message = 'تهانينا! تمت الموافقة على مساهمتك وسيتم نشرها قريباً.';
  } else if (decision === 'rejected') {
    statusText = 'مرفوضة';
    statusColor = '#dc3545';
    message = 'نأسف لإبلاغك بأن مساهمتك لم تستوفِ معايير النشر.';
  } else if (decision === 'needs_revision') {
    statusText = 'تحتاج إلى تعديل';
    statusColor = '#ffc107';
    message = 'مساهمتك تحتاج إلى بعض التعديلات قبل الموافقة عليها.';
  }
  
  const subject = `نتيجة مراجعة مساهمتك: ${submission.title_ar}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>عزيزي ${author.full_name}،</h2>
      <p>${message}</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>العنوان:</strong> ${submission.title_ar}<br>
        <strong>الحالة:</strong> <span style="color: ${statusColor};">${statusText}</span>
      </div>
      ${comments ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #ffc107;">
          <strong>ملاحظات المراجع:</strong><br>
          ${comments}
        </div>
      ` : ''}
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية
      </p>
    </div>
  `;
  
  return await sendEmail(author.email, subject, html);
}

/**
 * Send publication notification to author
 */
async function sendPublicationNotification(content, author) {
  const subject = `تم نشر مساهمتك: ${content.title_ar}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>مبروك ${author.full_name}!</h2>
      <p>تم نشر مساهمتك على منصة ديوان المعرفة:</p>
      <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #28a745;">
        <strong>العنوان:</strong> ${content.title_ar}<br>
        <strong>النوع:</strong> ${content.type === 'term' ? 'مصطلح' : 'مقال'}
      </div>
      <p>شكراً لإثراء المحتوى العربي!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية
      </p>
    </div>
  `;
  
  return await sendEmail(author.email, subject, html);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(user, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL || 'https://alhuwaidias-arch.github.io/Diwan-Al-Maarifa'}/reset-password.html?token=${resetToken}`;
  const subject = 'إعادة تعيين كلمة المرور - ديوان المعرفة';
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>عزيزي ${user.full_name}،</h2>
      <p>تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك.</p>
      <p>إذا كنت قد طلبت ذلك، يرجى النقر على الرابط أدناه:</p>
      <p>
        <a href="${resetLink}" 
           style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          إعادة تعيين كلمة المرور
        </a>
      </p>
      <p style="color: #dc3545; font-size: 14px;">
        <strong>ملاحظة:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط.
      </p>
      <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية
      </p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
}

/**
 * Log email to database
 */
async function logEmail(emailData) {
  try {
    await query(
      `INSERT INTO email_notifications 
       (recipient_email, subject, template_name, content_id, status, error_message, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        emailData.recipientEmail,
        emailData.subject,
        emailData.templateName,
        emailData.contentId || null,
        emailData.status,
        emailData.errorMessage || null,
        emailData.status === 'sent' ? new Date() : null
      ]
    );
  } catch (error) {
    console.error('Email log error:', error);
  }
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendSubmissionNotification,
  sendReviewRequestNotification,
  sendReviewDecisionNotification,
  sendPublicationNotification,
  sendPasswordResetEmail
};
