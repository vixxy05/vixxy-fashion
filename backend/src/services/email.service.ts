import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure nodemailer (for real app, use SMTP server or service like SendGrid, Mailgun)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASSWORD || 'password',
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, fullName: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'no-reply@yourstore.com',
      to,
      subject: 'Đặt lại mật khẩu của bạn',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Xin chào ${fullName},</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
          <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
          <p>
            <a href="${resetUrl}" style="background-color: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </p>
          <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
          <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
          <hr>
          <p>Trân trọng,<br>Đội ngũ ${process.env.APP_NAME || 'Your Store'}</p>
        </div>
      `,
      text: `Xin chào ${fullName},\n\nBạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.\n\nVui lòng truy cập liên kết sau để đặt lại mật khẩu: ${resetUrl}\n\nLiên kết này sẽ hết hạn sau 1 giờ.\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ ${process.env.APP_NAME || 'Your Store'}`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // For development purposes, just log the token
      if (process.env.NODE_ENV === 'development') {
        console.log('Development Mode - Reset Token:', resetToken);
      }
      return false;
    }
  }
}

export const emailService = new EmailService();
