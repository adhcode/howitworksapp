# Maintenance Request Images Fix

## Issue
Maintenance requests submitted with images were not displaying the images in the facilitator/maintenance page.

## Root Cause
The backend services were not selecting the `images` field from the database when fetching maintenance requests, even though:
- The database schema has an `images` field (text array)
- The frontend was already built to display images
- The maintenance detail modal had full image viewing functionality

## Changes Made

### Backend Changes

#### 1. Facilitator Service (`backend/src/facilitators/facilitators.service.ts`)
Updated `getFacilitatorMaintenanceRequests()` method to include images:
- Added `images: maintenanceRequests.images` to the select query
- Added `images: request.images || []` to the returned data

#### 2. Admin Service (`backend/src/admin/admin.service.ts`)
Updated `getPropertyMaintenance()` method to include images:
- Added `images: maintenanceRequests.images` to the select query
- Added `images: request.images || []` to the returned data

### Frontend (Already Working)

The frontend was already properly configured:

1. **List View** - Shows image count indicator:
   ```tsx
   {request.images && request.images.length > 0 && (
       <span className="flex items-center gap-1">
           <ImageIcon className="h-3 w-3" />
           {request.images.length}
       </span>
   )}
   ```

2. **Detail Modal** - Full image gallery with lightbox:
   - Grid display of all attached images
   - Click to view full-size in lightbox
   - Smooth animations and transitions

## Result
Facilitators can now:
- See image count indicators in the maintenance request list
- View all attached images in the detail modal
- Click images to view them full-size
- Better assess maintenance issues visually before taking action

## Testing
1. Submit a maintenance request with images attached
2. View the facilitator maintenance page
3. Verify image count shows in the list
4. Click "View" to open the detail modal
5. Verify all images are displayed in the gallery
6. Click an image to view it full-size
