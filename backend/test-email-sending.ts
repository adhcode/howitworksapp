import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { EmailService } from './src/email/email.service';

async function testEmailSending() {
  console.log('🧪 Testing Email Sending...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const emailService = app.get(EmailService);

  try {
    // Test verification code email
    console.log('📧 Sending test verification email...');
    await emailService.sendVerificationCodeEmail(
      'test@example.com',  // Replace with your email
      'Test User',
      '123456'
    );
    console.log('✅ Verification email sent successfully!\n');

    // Test welcome email
    console.log('📧 Sending test welcome email...');
    await emailService.sendWelcomeEmail(
      'test@example.com',  // Replace with your email
      'Test User'
    );
    console.log('✅ Welcome email sent successfully!\n');

    console.log('🎉 All email tests passed!');
  } catch (error) {
    console.error('❌ Email test failed:', error);
    console.error('\nError details:', error.message);
    
    if (error.message.includes('API key')) {
      console.error('\n⚠️  Check your RESEND_API_KEY in .env file');
    }
    if (error.message.includes('domain')) {
      console.error('\n⚠️  Check your email domain is verified in Resend dashboard');
    }
  } finally {
    await app.close();
  }
}

testEmailSending();
