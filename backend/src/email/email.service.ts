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
        from: this.configService.get('RESEND_FROM_EMAIL', 'HowitWorks <onboarding@resend.dev>'),
        to: [email],
        subject: 'Verify Your Email Address - HowitWorks',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #2E7D32; margin: 0;">HowitWorks</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Home Maintenance Made Simple</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${firstName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Thank you for signing up with HowitWorks. To complete your registration and secure your account, 
                please verify your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background-color: #2E7D32; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;
                          font-weight: bold;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, you can copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #2E7D32; word-break: break-all;">
                  ${verificationUrl}
                </a>
              </p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This verification link will expire in 24 hours. If you didn't create an account with HowitWorks, 
                you can safely ignore this email.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>© 2025 HowitWorks. All rights reserved.</p>
            </div>
          </div>
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
        from: this.configService.get('RESEND_FROM_EMAIL', 'HowitWorks <onboarding@resend.dev>'),
        to: [email],
        subject: 'Welcome to HowitWorks!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #2E7D32; margin: 0;">HowitWorks</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Home Maintenance Made Simple</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Welcome to HowitWorks, ${firstName}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Your email has been verified successfully! You can now enjoy all the features of HowitWorks:
              </p>
              
              <ul style="color: #666; line-height: 1.8; margin-bottom: 25px;">
                <li>Manage your properties and tenants</li>
                <li>Track maintenance requests</li>
                <li>Handle payments seamlessly</li>
                <li>Communicate with your landlord/tenants</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.configService.get('FRONTEND_URL', 'http://localhost:8081')}" 
                   style="background-color: #2E7D32; color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;
                          font-weight: bold;">
                  Get Started
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>© 2025 HowitWorks. All rights reserved.</p>
            </div>
          </div>
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
}