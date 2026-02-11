# Notification & Token Fixes Summary

## Issues Fixed

### 1. ✅ Tenant Invitation Branding Updated
- Changed "Homezy" to "Property HomeCare" in invitation messages
- Updated share message text
- Updated instructions text

### 2. 🔧 Notifications Disappearing (Needs Backend Fix)

**Problem**: Notifications disappear when read instead of staying with "read" indicator

**Current Behavior**:
- `markAllAsRead()` is called when opening notifications
- This might be deleting notifications instead of just marking them as read

**Solution Needed**:

#### Backend Fix (notifications.service.ts):
```typescript
// Current (might be deleting):
async markAsRead(userId: string, notificationId: string) {
  // Should UPDATE, not DELETE
  await this.db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notifications.id, notificationId),
      eq(notifications.userId, userId)
    ));
}
```

#### Frontend Fix (notifications.tsx):
- Remove auto-mark-all-as-read on open
- Add visual indicator for read/unread
- Keep notifications in list even after read

### 3. 🔧 View Token After Generation (Needs Implementation)

**Problem**: Landlord can't see invitation token after initial generation

**Solution**: Add token to tenant list with "View Token" button

#### Implementation Needed:

1. **Backend**: Store invitation token in database
   - Add `invitationToken` column to tenants table
   - Return token in tenant list API

2. **Frontend**: Show token in tenant details
   - Add "View Token" button in tenant list
   - Show token in modal/detail view
   - Allow copy/share from there

## Detailed Fixes

### Fix 1: Update Notifications to Show Read Status

**File**: `mobile/app/landlord/notifications.tsx`

```typescript
// Remove this from useEffect:
useEffect(() => {
  // DON'T auto-mark all as read
  // if (notifications.some(n => !n.isRead)) {
  //   markAllAsRead();
  // }
}, [notifications]);

// Update notification item to show read status:
<View key={notification.id} style={[
  styles.notificationItem,
  !notification.isRead && styles.unreadNotification
]}>
  {!notification.isRead && (
    <View style={styles.unreadIndicator} />
  )}
  {/* ... rest of notification ... */}
</View>

// Add styles:
unreadNotification: {
  backgroundColor: '#F0F9FF',
  borderColor: colors.secondary,
},
unreadIndicator: {
  position: 'absolute',
  left: 8,
  top: 8,
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.secondary,
},
```

### Fix 2: Add Token Storage in Backend

**Migration**: `migrations/add_invitation_token_to_tenants.sql`

```sql
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_tenants_invitation_token 
ON tenants(invitation_token);
```

**Update tenants.service.ts**:

```typescript
async createTenantInvitation(landlordId: string, dto: CreateTenantDto) {
  // ... existing code ...
  
  // Store the token
  const [tenant] = await this.db
    .insert(tenants)
    .values({
      ...dto,
      landlordId,
      invitationToken: token, // Store token
      invitationExpires,
      status: 'invited',
    })
    .returning();
    
  return tenant;
}

// Return token in tenant list
async getTenantsByLandlord(landlordId: string) {
  const tenantList = await this.db
    .select({
      id: tenants.id,
      firstName: tenants.firstName,
      lastName: tenants.lastName,
      email: tenants.email,
      phoneNumber: tenants.phoneNumber,
      status: tenants.status,
      invitationToken: tenants.invitationToken, // Include token
      invitationExpires: tenants.invitationExpires,
      // ... other fields
    })
    .from(tenants)
    .where(eq(tenants.landlordId, landlordId));
    
  return tenantList;
}
```

### Fix 3: Add "View Token" in Mobile App

**File**: `mobile/app/landlord/tenant-list.tsx`

```typescript
// Add modal state
const [tokenModalVisible, setTokenModalVisible] = useState(false);
const [selectedTenant, setSelectedTenant] = useState(null);

// Add button in tenant item (for invited tenants)
{tenant.status === 'invited' && tenant.invitationToken && (
  <TouchableOpacity
    style={styles.viewTokenButton}
    onPress={() => {
      setSelectedTenant(tenant);
      setTokenModalVisible(true);
    }}
  >
    <MaterialIcons name="vpn-key" size={16} color={colors.secondary} />
    <Text style={styles.viewTokenText}>View Token</Text>
  </TouchableOpacity>
)}

// Add modal at bottom
<Modal
  visible={tokenModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setTokenModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.tokenModal}>
      <Text style={styles.modalTitle}>Invitation Token</Text>
      <Text style={styles.modalSubtitle}>
        {selectedTenant?.firstName} {selectedTenant?.lastName}
      </Text>
      
      <View style={styles.tokenContainer}>
        <Text style={styles.tokenText}>
          {selectedTenant?.invitationToken}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Clipboard.setString(selectedTenant?.invitationToken);
            Alert.alert('Copied!', 'Token copied to clipboard');
          }}
        >
          <MaterialIcons name="content-copy" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => shareToken(selectedTenant)}
      >
        <MaterialIcons name="share" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>Share Token</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setTokenModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
```

## Implementation Steps

### Step 1: Fix Notifications (Backend)
```bash
# Check notifications service
# Ensure markAsRead updates, not deletes
# Test with: mark notification as read, check it still exists
```

### Step 2: Fix Notifications (Frontend)
```bash
# Remove auto-mark-all-as-read
# Add visual indicators for read/unread
# Test: read notification should stay in list
```

### Step 3: Add Token Storage (Backend)
```bash
cd backend

# Create migration
cat > migrations/add_invitation_token_to_tenants.sql << 'EOF'
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255);
EOF

# Run migration
psql "$DATABASE_URL" -f migrations/add_invitation_token_to_tenants.sql

# Update tenants service to store and return token
```

### Step 4: Add View Token (Frontend)
```bash
# Update tenant-list.tsx
# Add modal for viewing token
# Add share functionality
# Test: landlord can view and share token anytime
```

## Testing Checklist

- [ ] Notifications stay after being read
- [ ] Read notifications show visual indicator
- [ ] Unread notifications are highlighted
- [ ] Tenant invitation shows "Property HomeCare" not "Homezy"
- [ ] Landlord can view token from tenant list
- [ ] Token can be copied from view
- [ ] Token can be shared from view
- [ ] Token expires after 30 days (existing behavior)

## Quick Wins (Do First)

1. ✅ Update branding (DONE)
2. Remove auto-mark-all-as-read from notifications
3. Add visual read/unread indicators
4. Add token to backend response
5. Add "View Token" button in tenant list

## Files to Modify

### Backend
- `backend/src/notifications/notifications.service.ts` - Fix markAsRead
- `backend/src/tenants/tenants.service.ts` - Store and return token
- `backend/migrations/add_invitation_token_to_tenants.sql` - New migration

### Frontend
- ✅ `mobile/app/landlord/tenant-invitation-success.tsx` - Update branding (DONE)
- `mobile/app/landlord/notifications.tsx` - Fix disappearing notifications
- `mobile/app/landlord/tenant-list.tsx` - Add view token feature

## Priority

1. **High**: Fix notifications disappearing
2. **High**: Add view token feature
3. **Medium**: Add better visual indicators

All fixes are straightforward and can be implemented quickly!
