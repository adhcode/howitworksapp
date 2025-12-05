# Expo Push Notifications - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Install Dependencies
```bash
# Mobile
- [ ] cd mobile
- [ ] npx expo install expo-notifications expo-device expo-constants

# Backend
- [ ] cd backend
- [ ] npm install expo-server-sdk
- [ ] npm install --save-dev @types/expo-server-sdk
```

### 2. Database Setup
```bash
- [ ] cd backend
- [ ] Run: psql -U your_user -d your_database -f create_notifications_tables.sql
- [ ] Verify tables created: push_tokens, notifications
- [ ] Check indexes created
```

### 3. Mobile App Configuration
```typescript
- [ ] Open mobile/app/_layout.tsx
- [ ] Import NotificationProvider
- [ ] Wrap app with NotificationProvider
- [ ] Save file
```

### 4. Build and Test
```bash
- [ ] cd mobile
- [ ] Run: npx expo run:android (or npx expo run:ios)
- [ ] Grant notification permissions
- [ ] Check console for: "✅ Got push token"
- [ ] Check console for: "✅ Push token registered with backend"
```

### 5. Test Notification Flow
```
- [ ] Create maintenance request as tenant
- [ ] Verify landlord/facilitator receives notification
- [ ] Tap notification
- [ ] Verify app opens to correct screen
- [ ] Update maintenance status
- [ ] Verify tenant receives notification
- [ ] Add comment
- [ ] Verify other party receives notification
```

### 6. Verify API Endpoints
```bash
- [ ] POST /notifications/register-token works
- [ ] GET /notifications works
- [ ] GET /notifications/unread-count works
- [ ] PATCH /notifications/:id/read works
- [ ] Notifications appear in database
```

### 7. Production Configuration (Optional)
```
iOS:
- [ ] Configure APNs in Apple Developer Console
- [ ] Generate APNs key
- [ ] Upload to Expo

Android:
- [ ] Configure Firebase Cloud Messaging
- [ ] Download google-services.json
- [ ] Place in mobile root
- [ ] Update app.json
```

---

## 🧪 Testing Checklist

### Notification Types
- [ ] New maintenance request notification
- [ ] Urgent maintenance request (with 🚨 emoji)
- [ ] Status update notification
- [ ] Priority update notification
- [ ] Comment notification

### User Roles
- [ ] Tenant receives notifications
- [ ] Landlord receives notifications
- [ ] Facilitator receives notifications

### Scenarios
- [ ] App in foreground - notification shows
- [ ] App in background - notification shows
- [ ] App closed - notification shows
- [ ] Tap notification - navigates correctly
- [ ] Multiple devices - all receive notifications
- [ ] Offline - notifications queued and delivered

### Edge Cases
- [ ] Invalid token handled gracefully
- [ ] No push tokens - doesn't crash
- [ ] Network error - doesn't crash
- [ ] User deleted - tokens cleaned up
- [ ] Old notifications - can be cleaned up

---

## 📊 Verification Checklist

### Database
- [ ] push_tokens table exists
- [ ] notifications table exists
- [ ] Indexes created
- [ ] Triggers working
- [ ] Foreign keys working

### Backend
- [ ] NotificationsModule imported in AppModule
- [ ] NotificationsService available
- [ ] API endpoints responding
- [ ] Logs showing in console
- [ ] Errors handled gracefully

### Mobile
- [ ] NotificationProvider wrapping app
- [ ] Permissions requested on startup
- [ ] Token registered with backend
- [ ] Notifications received
- [ ] Navigation working
- [ ] Badge count updating (iOS)

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Production credentials configured

### Deployment
- [ ] Backend deployed
- [ ] Database migrated on production
- [ ] Mobile app built
- [ ] App submitted to stores (if applicable)
- [ ] Monitoring configured

### Post-Deployment
- [ ] Test on production
- [ ] Monitor error logs
- [ ] Check notification delivery rate
- [ ] Verify database performance
- [ ] Monitor user feedback

---

## 📈 Monitoring Checklist

### Metrics to Track
- [ ] Notification delivery rate
- [ ] Notification open rate
- [ ] Average time to open
- [ ] Failed deliveries
- [ ] Token registration rate
- [ ] Active tokens count
- [ ] Notifications per user
- [ ] Database size

### Alerts to Set Up
- [ ] High error rate
- [ ] Low delivery rate
- [ ] Database size threshold
- [ ] API response time
- [ ] Token registration failures

---

## 🔧 Maintenance Checklist

### Daily
- [ ] Check error logs
- [ ] Monitor delivery rates
- [ ] Check database size

### Weekly
- [ ] Review notification metrics
- [ ] Check for failed tokens
- [ ] Review user feedback

### Monthly
- [ ] Clean up old notifications
- [ ] Review and optimize queries
- [ ] Update documentation
- [ ] Review security

---

## ✅ Sign-Off

### Development Team
- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation complete
- [ ] Ready for deployment

### QA Team
- [ ] Functional testing complete
- [ ] Edge cases tested
- [ ] Performance tested
- [ ] Security tested

### Product Team
- [ ] Features verified
- [ ] User experience approved
- [ ] Ready for production

---

## 📝 Notes

**Installation Date**: _______________

**Deployed By**: _______________

**Production URL**: _______________

**Issues Encountered**: 
_______________________________________________
_______________________________________________
_______________________________________________

**Resolution**: 
_______________________________________________
_______________________________________________
_______________________________________________

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Overall Progress**: _____ / _____ items complete
