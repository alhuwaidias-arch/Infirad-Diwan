// Email Service
const nodemailer = require('nodemailer');

// Create email transporter
let transporter = null;

/**
 * Initialize email transporter
 */
function initializeTransporter() {
  if (transporter) {
    return transporter;
  }
  
  // Check if email configuration is provided
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('Email configuration not provided. Email notifications will be disabled.');
    return null;
  }
  
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
  
  // Verify connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email transporter verification failed:', error);
      transporter = null;
    } else {
      console.log('✓ Email service ready');
    }
  });
  
  return transporter;
}

/**
 * Send email
 */
async function sendEmail(to, subject, html, text = null) {
  try {
    const emailTransporter = initializeTransporter();
    
    if (!emailTransporter) {
      console.log(`[Email Disabled] Would send to ${to}: ${subject}`);
      return { success: false, message: 'Email service not configured' };
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@diwan-maarifa.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };
    
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Send email error:', error);
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
        <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a>
      </p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
}

/**
 * Send content submission notification
 */
async function sendSubmissionNotification(submission, author) {
  const subject = 'تم استلام مساهمتك - ديوان المعرفة';
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>عزيزي ${author.full_name}،</h2>
      <p>تم استلام مساهمتك بنجاح:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>العنوان:</strong> ${submission.title}<br>
        <strong>النوع:</strong> ${submission.content_type === 'term' ? 'مصطلح' : 'مقال'}<br>
        <strong>الحالة:</strong> قيد المراجعة
      </div>
      <p>سيتم مراجعة مساهمتك من قبل فريق التدقيق وسنبلغك بالنتيجة قريباً.</p>
      <p>شكراً لمساهمتك في إثراء المحتوى العربي!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية<br>
        <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a>
      </p>
    </div>
  `;
  
  return await sendEmail(author.email, subject, html);
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
        <strong>العنوان:</strong> ${submission.title}<br>
        <strong>النوع:</strong> ${submission.content_type === 'term' ? 'مصطلح' : 'مقال'}<br>
        <strong>المؤلف:</strong> ${submission.author_name}
      </div>
      <p>يرجى مراجعة المساهمة في أقرب وقت ممكن.</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/admin/reviews/${submission.id}" 
           style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          مراجعة الآن
        </a>
      </p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية<br>
        <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a>
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
    message = 'تهانينا! تمت الموافقة على مساهمتك وهي الآن في المرحلة التالية من المراجعة.';
  } else if (decision === 'rejected') {
    statusText = 'مرفوضة';
    statusColor = '#dc3545';
    message = 'نأسف لإبلاغك بأن مساهمتك لم تستوفِ معايير النشر.';
  } else if (decision === 'needs_revision') {
    statusText = 'تحتاج إلى تعديل';
    statusColor = '#ffc107';
    message = 'مساهمتك تحتاج إلى بعض التعديلات قبل الموافقة عليها.';
  }
  
  const subject = `نتيجة مراجعة مساهمتك: ${submission.title}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>عزيزي ${author.full_name}،</h2>
      <p>${message}</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <strong>العنوان:</strong> ${submission.title}<br>
        <strong>الحالة:</strong> <span style="color: ${statusColor};">${statusText}</span>
      </div>
      ${comments ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #ffc107;">
          <strong>ملاحظات المراجع:</strong><br>
          ${comments}
        </div>
      ` : ''}
      <p>
        <a href="${process.env.FRONTEND_URL}/submissions/${submission.id}" 
           style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          عرض التفاصيل
        </a>
      </p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية<br>
        <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a>
      </p>
    </div>
  `;
  
  return await sendEmail(author.email, subject, html);
}

/**
 * Send publication notification to author
 */
async function sendPublicationNotification(content, author) {
  const subject = `تم نشر مساهمتك: ${content.title}`;
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>مبروك ${author.full_name}!</h2>
      <p>تم نشر مساهمتك على منصة ديوان المعرفة:</p>
      <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #28a745;">
        <strong>العنوان:</strong> ${content.title}<br>
        <strong>النوع:</strong> ${content.content_type === 'term' ? 'مصطلح' : 'مقال'}
      </div>
      <p>يمكنك الآن مشاركة مساهمتك مع الآخرين:</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/${content.content_type}s/${content.slug}" 
           style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          عرض المساهمة المنشورة
        </a>
      </p>
      <p>شكراً لإثراء المحتوى العربي!</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        ديوان المعرفة - منصة المعرفة العلمية العربية<br>
        <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a>
      </p>
    </div>
  `;
  
  return await sendEmail(author.email, subject, html);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(user, resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
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
        ديوان المعرفة - منصة المعرفة العلمية العربية<br>
        <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a>
      </p>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
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
