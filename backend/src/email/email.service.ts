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
        from: this.configService.get('RESEND_FROM_EMAIL', 'HIW Maintenance <noreply@howitworks.com.ng>'),
        to: [email],
        subject: 'Verify Your Email Address - HIW Maintenance',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - HIW Maintenance</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Navy Blue Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1A2A52 0%, #2d4575 100%); padding: 40px 30px; text-align: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="60" height="60" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd; margin-bottom: 16px;" viewBox="0 0 230.92 231.07">
                          <path fill="#ffffff" d="M-0 105.78l0 73.91c0,16.55 6.15,30.55 16.65,39.71 1.62,-0.14 3.29,-0.26 4.65,-0.88 4.84,-0.85 9.64,-4.42 12.07,-6.9 7.09,-7.22 10.19,-17.26 7.05,-27.17 -1.05,-3.3 -4.36,-10.17 -6.93,-11.49 -0.06,-0.56 0.32,-0.44 -0.36,-0.96 -0.5,-3.11 0.1,-3.98 1.68,-5.71l7.4 -7.51c2.94,-2.91 5.7,-6.46 8.85,-5.36 2.55,0.9 11.85,11.87 28.49,6.83 3.98,-1.21 6.93,-3.2 9.46,-5.45 4.67,-4.16 9.04,-10.87 9.61,-20.16 0.4,-6.49 3.79,-5.71 9.61,-5.7 2.94,0 12.46,-0.44 14.47,0.48 3.31,1.52 2.59,6.58 4.02,10.9 2.24,6.74 7.46,12.65 14.02,15.82 3.59,1.73 7.74,2.81 12.25,2.71 12.93,-0.27 18.01,-7.88 20.68,-9.21 2.23,-1.11 4.04,-0.27 5.44,1.12l7.72 7.2c1.23,1.33 2.42,2.08 3.87,3.59 2.63,2.75 6.98,4.97 6.11,8.62 -0.74,3.09 -14.4,14.08 -4.86,33.46 2.86,5.82 9,11.13 16.44,13.39 2.34,0.71 5.04,0.72 7.29,1.12 9.64,-9.16 15.25,-22.64 15.25,-38.45l0 -73.91c0,-14.8 -3.56,-25.44 -12.24,-35.78 -3.79,-4.51 -5.62,-5.73 -10.73,-9.77l-53.18 -43.94c-2.57,-2.09 -4.79,-4.1 -7.48,-6.01 -8.51,-6.03 -21.31,-10.29 -31.83,-10.29l-11.99 1.53c-3.92,0.9 -7.16,1.98 -10.49,3.53 -7.36,3.43 -10.74,6.11 -16.53,10.99 -8.76,7.38 -22.51,18.05 -30.45,25.12l-15.08 12.44c-2.67,2.15 -4.74,3.94 -7.35,6.14 -2.65,2.23 -4.96,4.22 -7.7,6.33 -4.19,3.22 -9.09,11.23 -11.38,16.14 -3.04,6.52 -4.49,14.23 -4.49,23.56zm152.12 -20.44l-16.85 0c-2.71,0 -4.92,2.21 -4.92,4.92l0 17.86c0,2.7 2.21,4.92 4.92,4.92l16.85 0c2.71,0 4.92,-2.21 4.92,-4.92l0 -17.86c0,-2.7 -2.21,-4.92 -4.92,-4.92zm-64.32 -0.71l-15.52 0c-2.71,0 -4.92,2.21 -4.92,4.92l0 17.86c0,2.71 2.21,4.92 4.92,4.92l16.85 0c2.71,0 4.92,-2.21 4.92,-4.92l0 -16.98c1.05,-4.22 3.72,-9.28 8.51,-11.36 0.31,0.06 0.63,0.09 0.96,0.09l16.85 0c2.71,0 4.92,-2.21 4.92,-4.92l0 -17.86c0,-2.71 -2.21,-4.92 -4.92,-4.92l-16.85 0c-2.71,0 -4.92,2.21 -4.92,4.92l0 17.27c-1.07,4.46 -5.87,9.3 -10.79,10.98l0 0zm-27.27 146.41l0.03 0c-0.02,-0.28 -0.02,-0.2 -0.03,0zm0.12 0c36.93,0.18 72.28,-0.46 109.68,-0.19 -1.19,-15.6 -9.04,-30.47 -22.03,-40.09 -35.62,-26.38 -84.89,-2.31 -87.65,40.28z"/>
                        </svg>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          HIW Maintenance
                        </h1>
                        <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">
                          Smart Property Care
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
                          Thank you for joining HIW Maintenance! We're excited to have you on board.
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
                            If you didn't create an account with HIW Maintenance, you can safely ignore this email.
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
                          Smart Property Care
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

  async sendVerificationCodeEmail(email: string, firstName: string, code: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email send.');
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get('RESEND_FROM_EMAIL', 'HIW Maintenance <noreply@howitworks.com.ng>'),
        to: [email],
        subject: 'Verify Your Email Address - HIW Maintenance',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - HIW Maintenance</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Navy Blue Background -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1A2A52 0%, #2d4575 100%); padding: 40px 30px; text-align: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="60" height="60" version="1.1" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd; margin-bottom: 16px;" viewBox="0 0 230.92 231.07">
                          <path fill="#ffffff" d="M-0 105.78l0 73.91c0,16.55 6.15,30.55 16.65,39.71 1.62,-0.14 3.29,-0.26 4.65,-0.88 4.84,-0.85 9.64,-4.42 12.07,-6.9 7.09,-7.22 10.19,-17.26 7.05,-27.17 -1.05,-3.3 -4.36,-10.17 -6.93,-11.49 -0.06,-0.56 0.32,-0.44 -0.36,-0.96 -0.5,-3.11 0.1,-3.98 1.68,-5.71l7.4 -7.51c2.94,-2.91 5.7,-6.46 8.85,-5.36 2.55,0.9 11.85,11.87 28.49,6.83 3.98,-1.21 6.93,-3.2 9.46,-5.45 4.67,-4.16 9.04,-10.87 9.61,-20.16 0.4,-6.49 3.79,-5.71 9.61,-5.7 2.94,0 12.46,-0.44 14.47,0.48 3.31,1.52 2.59,6.58 4.02,10.9 2.24,6.74 7.46,12.65 14.02,15.82 3.59,1.73 7.74,2.81 12.25,2.71 12.93,-0.27 18.01,-7.88 20.68,-9.21 2.23,-1.11 4.04,-0.27 5.44,1.12l7.72 7.2c1.23,1.33 2.42,2.08 3.87,3.59 2.63,2.75 6.98,4.97 6.11,8.62 -0.74,3.09 -14.4,14.08 -4.86,33.46 2.86,5.82 9,11.13 16.44,13.39 2.34,0.71 5.04,0.72 7.29,1.12 9.64,-9.16 15.25,-22.64 15.25,-38.45l0 -73.91c0,-14.8 -3.56,-25.44 -12.24,-35.78 -3.79,-4.51 -5.62,-5.73 -10.73,-9.77l-53.18 -43.94c-2.57,-2.09 -4.79,-4.1 -7.48,-6.01 -8.51,-6.03 -21.31,-10.29 -31.83,-10.29l-11.99 1.53c-3.92,0.9 -7.16,1.98 -10.49,3.53 -7.36,3.43 -10.74,6.11 -16.53,10.99 -8.76,7.38 -22.51,18.05 -30.45,25.12l-15.08 12.44c-2.67,2.15 -4.74,3.94 -7.35,6.14 -2.65,2.23 -4.96,4.22 -7.7,6.33 -4.19,3.22 -9.09,11.23 -11.38,16.14 -3.04,6.52 -4.49,14.23 -4.49,23.56zm152.12 -20.44l-16.85 0c-2.71,0 -4.92,2.21 -4.92,4.92l0 17.86c0,2.7 2.21,4.92 4.92,4.92l16.85 0c2.71,0 4.92,-2.21 4.92,-4.92l0 -17.86c0,-2.7 -2.21,-4.92 -4.92,-4.92zm-64.32 -0.71l-15.52 0c-2.71,0 -4.92,2.21 -4.92,4.92l0 17.86c0,2.71 2.21,4.92 4.92,4.92l16.85 0c2.71,0 4.92,-2.21 4.92,-4.92l0 -16.98c1.05,-4.22 3.72,-9.28 8.51,-11.36 0.31,0.06 0.63,0.09 0.96,0.09l16.85 0c2.71,0 4.92,-2.21 4.92,-4.92l0 -17.86c0,-2.71 -2.21,-4.92 -4.92,-4.92l-16.85 0c-2.71,0 -4.92,2.21 -4.92,4.92l0 17.27c-1.07,4.46 -5.87,9.3 -10.79,10.98l0 0zm-27.27 146.41l0.03 0c-0.02,-0.28 -0.02,-0.2 -0.03,0zm0.12 0c36.93,0.18 72.28,-0.46 109.68,-0.19 -1.19,-15.6 -9.04,-30.47 -22.03,-40.09 -35.62,-26.38 -84.89,-2.31 -87.65,40.28z"/>
                        </svg>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                          HIW Maintenance
                        </h1>
                        <p style="color: #e0e7ff; margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">
                          Smart Property Care
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
                          Thank you for joining HIW Maintenance! We're excited to have you on board.
                        </p>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                          To complete your registration and secure your account, please enter the verification code below in the app:
                        </p>
                        
                        <!-- Verification Code -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <div style="background-color: #f9fafb; border: 2px dashed #1A2A52; border-radius: 12px; padding: 24px; display: inline-block;">
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                  Your Verification Code
                                </p>
                                <p style="color: #1A2A52; font-size: 36px; font-weight: 700; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                  ${code}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Instructions -->
                        <div style="background-color: #f9fafb; border-left: 4px solid #1A2A52; padding: 16px; border-radius: 4px; margin: 0 0 30px 0;">
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                            How to verify:
                          </p>
                          <ol style="color: #6b7280; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>Open the HIW Maintenance app</li>
                            <li>Enter the 6-digit code above</li>
                            <li>Click "Verify" to complete your registration</li>
                          </ol>
                        </div>
                        
                        <!-- Security Note -->
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                            <strong>Security Note:</strong> This verification code will expire in 15 minutes. 
                            If you didn't create an account with HIW Maintenance, you can safely ignore this email.
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
                          Smart Property Care
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

      this.logger.log(`Verification code email sent to ${email}. Message ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send verification code email to ${email}:`, error);
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
                          Smart Property Care
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

  async sendPaymentReminderEmail(
    email: string,
    firstName: string,
    title: string,
    message: string,
    amount?: number,
    dueDate?: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email send.');
      return;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get('RESEND_FROM_EMAIL', 'HowitWorks <noreply@howitworks.com.ng>'),
        to: [email],
        subject: title,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
              <tr>
                <td align="center" style="padding: 40px 20px;">
                  <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
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
                          ${title}
                        </h2>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0; font-size: 16px;">
                          Hi ${firstName},
                        </p>
                        
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                          ${message}
                        </p>
                        
                        ${amount ? `
                        <!-- Payment Details -->
                        <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 0 0 30px 0;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount Due:</td>
                              <td style="padding: 8px 0; color: #1A2A52; font-size: 18px; font-weight: 700; text-align: right;">₦${amount.toLocaleString()}</td>
                            </tr>
                            ${dueDate ? `
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Due Date:</td>
                              <td style="padding: 8px 0; color: #1A2A52; font-size: 16px; font-weight: 600; text-align: right;">${new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                            </tr>
                            ` : ''}
                          </table>
                        </div>
                        ` : ''}
                        
                        <!-- CTA Button -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:8081')}" 
                                 style="display: inline-block; background-color: #1A2A52; color: #ffffff; 
                                        padding: 16px 40px; text-decoration: none; border-radius: 8px; 
                                        font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(26, 42, 82, 0.2);">
                                Make Payment
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Support -->
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                          <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0;">
                            If you have any questions or need assistance, please contact our support team.
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
                          Smart Property Care
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
        throw new Error(`Failed to send payment reminder email: ${error.message}`);
      }

      this.logger.log(`Payment reminder email sent to ${email}. Message ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send payment reminder email to ${email}:`, error);
      throw error;
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
                          Smart Property Care
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

  async sendPasswordResetCodeEmail(email: string, firstName: string, code: string): Promise<void> {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email send.');
      return;
    }

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
                          We received a request to reset your password. Enter the verification code below in the app to create a new password:
                        </p>
                        
                        <!-- Verification Code -->
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td align="center" style="padding: 0 0 30px 0;">
                              <div style="background-color: #f9fafb; border: 2px dashed #1A2A52; border-radius: 12px; padding: 24px; display: inline-block;">
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                  Your Reset Code
                                </p>
                                <p style="color: #1A2A52; font-size: 36px; font-weight: 700; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                  ${code}
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Instructions -->
                        <div style="background-color: #f9fafb; border-left: 4px solid #1A2A52; padding: 16px; border-radius: 4px; margin: 0 0 30px 0;">
                          <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">
                            How to reset your password:
                          </p>
                          <ol style="color: #6b7280; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.8;">
                            <li>Open the HowitWorks app</li>
                            <li>Enter the 6-digit code above</li>
                            <li>Create your new password</li>
                          </ol>
                        </div>
                        
                        <!-- Security Warning -->
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 0 0 20px 0;">
                          <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.5;">
                            <strong>⚠️ Security Notice:</strong> This code will expire in 15 minutes. 
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
                          Smart Property Care
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
        throw new Error(`Failed to send password reset code email: ${error.message}`);
      }

      this.logger.log(`Password reset code email sent to ${email}. Message ID: ${data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset code email to ${email}:`, error);
      throw error;
    }
  }
}