import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.initializeResend();
  }

  private initializeResend() {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!resendApiKey) {
      this.logger.warn('RESEND_API_KEY not found. Email functionality will be disabled.');
      return;
    }

    this.resend = new Resend(resendApiKey);
  }

  async sendVerificationEmail(email: string, firstName: string, token: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email send.');
      return;
    }

    const verificationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:8081')}/auth/verify-email?token=${token}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get('RESEND_FROM_EMAIL', 'HowitWorks <noreply@howitworks.com.ng>'),
        to: [email],
        subject: 'Verify Your Email Address - HowitWorks',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - HowitWorks</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Navy Blue Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1A2A52 0%, #2d4575 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          HowitWorks
                        </h1>
                        <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">
                          Property Management Made Simple
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <h2 style="color: #1A2A52; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                          Welcome, ${firstName}! 👋
                        </h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                          Thank you for joining HowitWorks! We're excited to have you on board.
                        </p>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                          To complete your registration and secure your account, please verify your email address by clicking the button below:
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <a href="${verificationUrl}" 
                                 style="display: inline-block; background-color: #1A2A52; color: #ffffff; 
                                        padding: 16px 40px; text-decoration: none; border-radius: 8px; 
                                        font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(26, 42, 82, 0.2);">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Alternative Link -->
                        <div style="background-color: #f9fafb; border-left: 4px solid #1A2A52; padding: 16px; border-radius: 4px; margin: 0 0 30px 0;">
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                            Button not working?
                          </p>
                          <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">
                            Copy and paste this link into your browser:
                          </p>
                          <p style="margin: 8px 0 0 0;">
                            <a href="${verificationUrl}" style="color: #1A2A52; word-break: break-all; font-size: 13px;">
                              ${verificationUrl}
                            </a>
                          </p>
                        </div>
                        
                        <!-- Security Note -->
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                            <strong>Security Note:</strong> This verification link will expire in 24 hours. 
                            If you didn't create an account with HowitWorks, you can safely ignore this email.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                          © 2025 HowitWorks. All rights reserved.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          Property Management Platform
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      if (error) {
        this.logger.error(`Resend API error:`, error);
        throw new Error(`Failed to send verification email: ${error.message}`);
      }

      this.logger.log(`Verification email sent to ${email}. Message ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email send.');
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get('RESEND_FROM_EMAIL', 'HowitWorks <noreply@howitworks.com.ng>'),
        to: [email],
        subject: 'Welcome to HowitWorks! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to HowitWorks</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Navy Blue Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1A2A52 0%, #2d4575 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          HowitWorks
                        </h1>
                        <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">
                          Property Management Made Simple
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <span style="font-size: 48px;">🎉</span>
                        </div>
                        
                        <h2 style="color: #1A2A52; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; text-align: center;">
                          Welcome to HowitWorks, ${firstName}!
                        </h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px; text-align: center;">
                          Your email has been verified successfully! You're all set to start managing your properties.
                        </p>
                        
                        <!-- Features -->
                        <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 0 0 30px 0;">
                          <h3 style="color: #1A2A52; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                            What you can do now:
                          </h3>
                          
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #1A2A52; font-size: 18px; margin-right: 12px;">✓</span>
                                <span style="color: #4b5563; font-size: 15px;">Manage your properties and tenants</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #1A2A52; font-size: 18px; margin-right: 12px;">✓</span>
                                <span style="color: #4b5563; font-size: 15px;">Track maintenance requests</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #1A2A52; font-size: 18px; margin-right: 12px;">✓</span>
                                <span style="color: #4b5563; font-size: 15px;">Handle payments seamlessly</span>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <span style="color: #1A2A52; font-size: 18px; margin-right: 12px;">✓</span>
                                <span style="color: #4b5563; font-size: 15px;">Communicate with ease</span>
                              </td>
                            </tr>
                          </table>
                        </div>
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:8081')}" 
                                 style="display: inline-block; background-color: #1A2A52; color: #ffffff; 
                                        padding: 16px 40px; text-decoration: none; border-radius: 8px; 
                                        font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(26, 42, 82, 0.2);">
                                Get Started Now
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Support -->
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0;">
                            Need help? We're here for you!
                          </p>
                          <p style="color: #9ca3af; font-size: 13px; margin: 8px 0 0 0;">
                            Contact our support team anytime
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                          © 2025 HowitWorks. All rights reserved.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          Property Management Platform
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      if (error) {
        this.logger.error(`Resend API error:`, error);
        throw new Error(`Failed to send welcome email: ${error.message}`);
      }

      this.logger.log(`Welcome email sent to ${email}. Message ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }

  async sendPasswordResetEmail(email: string, firstName: string, token: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email send.');
      return;
    }

    const resetUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:8081')}/auth/reset-password?token=${token}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get('RESEND_FROM_EMAIL', 'HowitWorks <noreply@howitworks.com.ng>'),
        to: [email],
        subject: 'Reset Your Password - HowitWorks',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - HowitWorks</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Navy Blue Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1A2A52 0%, #2d4575 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          HowitWorks
                        </h1>
                        <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">
                          Property Management Made Simple
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <span style="font-size: 48px;">🔐</span>
                        </div>
                        
                        <h2 style="color: #1A2A52; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                          Reset Your Password
                        </h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0; font-size: 16px;">
                          Hi ${firstName},
                        </p>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                          We received a request to reset your password. Click the button below to create a new password:
                        </p>
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <a href="${resetUrl}" 
                                 style="display: inline-block; background-color: #1A2A52; color: #ffffff; 
                                        padding: 16px 40px; text-decoration: none; border-radius: 8px; 
                                        font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(26, 42, 82, 0.2);">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Alternative Link -->
                        <div style="background-color: #f9fafb; border-left: 4px solid #1A2A52; padding: 16px; border-radius: 4px; margin: 0 0 30px 0;">
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                            Button not working?
                          </p>
                          <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">
                            Copy and paste this link into your browser:
                          </p>
                          <p style="margin: 8px 0 0 0;">
                            <a href="${resetUrl}" style="color: #1A2A52; word-break: break-all; font-size: 13px;">
                              ${resetUrl}
                            </a>
                          </p>
                        </div>
                        
                        <!-- Security Warning -->
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 0 0 20px 0;">
                          <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                            <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour. 
                            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                          </p>
                        </div>
                        
                        <!-- Support -->
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                            If you're having trouble or didn't request this reset, please contact our support team immediately.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">
                          © 2025 HowitWorks. All rights reserved.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          Property Management Platform
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });

      if (error) {
        this.logger.error(`Resend API error:`, error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }

      this.logger.log(`Password reset email sent to ${email}. Message ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }
}