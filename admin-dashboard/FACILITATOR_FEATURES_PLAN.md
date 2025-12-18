# Facilitator Features Implementation Plan

## 🎯 Goal
Enhance the facilitator experience with task management, calendar view, and communication tools.

---

## 📋 Phase 3: Facilitator Features

### 1. Task Management System
**Priority: HIGH**

#### Features:
- **Task Dashboard**
  - Today's tasks overview
  - Upcoming tasks
  - Overdue tasks
  - Completed tasks

- **Task Types**
  - Maintenance requests (auto-created)
  - Property inspections
  - Tenant follow-ups
  - Custom tasks

- **Task Actions**
  - Mark as complete
  - Add notes/comments
  - Upload photos
  - Set priority
  - Set due date
  - Assign to self

- **Task Filters**
  - By property
  - By priority
  - By status
  - By date range

#### UI Components:
```
┌─────────────────────────────────────┐
│  Tasks Dashboard                     │
├─────────────────────────────────────┤
│  📊 Overview                         │
│  • 5 tasks today                     │
│  • 3 overdue                         │
│  • 12 this week                      │
├─────────────────────────────────────┤
│  📝 Today's Tasks                    │
│  ☐ Fix leaking pipe - Unit 101      │
│  ☐ Inspect property - Building A    │
│  ☑ Follow up with tenant            │
├─────────────────────────────────────┤
│  ⚠️  Overdue (3)                     │
│  ☐ Urgent repair - Unit 205         │
└─────────────────────────────────────┘
```

---

### 2. Calendar View
**Priority: HIGH**

#### Features:
- **Calendar Types**
  - Month view
  - Week view
  - Day view
  - Agenda view

- **Calendar Events**
  - Maintenance appointments
  - Property inspections
  - Tenant meetings
  - Task deadlines

- **Event Actions**
  - Create new event
  - Edit event
  - Delete event
  - Mark as complete
  - Add notes

- **Calendar Filters**
  - By property
  - By event type
  - By status

#### UI Components:
```
┌─────────────────────────────────────┐
│  December 2024          < Today >   │
├─────────────────────────────────────┤
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun │
│   1    2    3    4    5    6    7  │
│   8    9   10   11   12   13   14  │
│  15   16  [17]  18   19   20   21  │
│  22   23   24   25   26   27   28  │
│  29   30   31                       │
├─────────────────────────────────────┤
│  Today's Schedule                   │
│  9:00 AM - Fix pipe (Unit 101)     │
│  2:00 PM - Property inspection      │
│  4:00 PM - Tenant meeting           │
└─────────────────────────────────────┘
```

---

### 3. Communication Tools
**Priority: MEDIUM**

#### Features:
- **Messaging System**
  - Send messages to landlords
  - Send messages to tenants
  - Send messages to admin
  - Group messages

- **Notification Center**
  - Unread messages count
  - New task notifications
  - Maintenance updates
  - System announcements

- **Quick Actions**
  - Quick reply templates
  - Send update to landlord
  - Request help from admin
  - Notify tenant

#### UI Components:
```
┌─────────────────────────────────────┐
│  Messages                    🔔 (3) │
├─────────────────────────────────────┤
│  📬 Inbox (5)                        │
│  • John Doe (Landlord)              │
│    "When will the repair..."        │
│  • Admin                             │
│    "New property assigned"          │
├─────────────────────────────────────┤
│  📤 Sent                             │
│  📝 Drafts                           │
│  ⭐ Important                        │
└─────────────────────────────────────┘
```

---

### 4. Enhanced Property View
**Priority: MEDIUM**

#### Features:
- **Property Details**
  - Property information
  - Unit list with status
  - Tenant list
  - Maintenance history
  - Documents/files

- **Quick Actions**
  - Report maintenance
  - Schedule inspection
  - Contact landlord
  - View documents

- **Property Stats**
  - Occupancy rate
  - Maintenance requests
  - Response time
  - Tenant satisfaction

---

### 5. Performance Metrics
**Priority: LOW**

#### Features:
- **Personal Dashboard**
  - Tasks completed
  - Average response time
  - Properties managed
  - Maintenance handled

- **Performance Charts**
  - Tasks over time
  - Response time trends
  - Completion rate

- **Achievements**
  - Fast responder badge
  - 100% completion badge
  - Top performer badge

---

## 🚀 Implementation Plan

### Week 1: Task Management

**Day 1-2: Task Data Model & API**
- [ ] Create task schema (if not exists)
- [ ] Create task API endpoints
- [ ] Implement task CRUD operations
- [ ] Add task status updates
- [ ] Test API

**Day 3-4: Task Dashboard UI**
- [ ] Create Tasks page
- [ ] Create TaskCard component
- [ ] Create TaskList component
- [ ] Add task filters
- [ ] Add task creation modal
- [ ] Test UI

**Day 5: Task Actions**
- [ ] Implement mark as complete
- [ ] Add notes/comments
- [ ] Upload photos
- [ ] Set priority/due date
- [ ] Test all actions

---

### Week 2: Calendar View

**Day 1-2: Calendar Component**
- [ ] Install calendar library (react-big-calendar or fullcalendar)
- [ ] Create Calendar page
- [ ] Implement month view
- [ ] Implement week view
- [ ] Implement day view

**Day 3: Calendar Events**
- [ ] Fetch maintenance appointments
- [ ] Fetch tasks with due dates
- [ ] Display events on calendar
- [ ] Color code by type
- [ ] Test calendar

**Day 4-5: Event Management**
- [ ] Create event modal
- [ ] Edit event modal
- [ ] Delete event
- [ ] Mark event as complete
- [ ] Add event notes
- [ ] Test event management

---

### Week 3: Communication Tools

**Day 1-2: Messaging Backend**
- [ ] Check existing message API
- [ ] Add facilitator-specific endpoints
- [ ] Implement unread count
- [ ] Add message filters
- [ ] Test API

**Day 3-4: Messaging UI**
- [ ] Create Messages page
- [ ] Create conversation list
- [ ] Create message thread view
- [ ] Add compose message
- [ ] Add quick replies
- [ ] Test messaging

**Day 5: Notification Center**
- [ ] Create notification dropdown
- [ ] Fetch unread notifications
- [ ] Mark as read
- [ ] Navigate to related item
- [ ] Test notifications

---

### Week 4: Enhanced Views & Polish

**Day 1-2: Enhanced Property View**
- [ ] Update property details page
- [ ] Add unit status overview
- [ ] Add tenant list
- [ ] Add maintenance history
- [ ] Add quick actions
- [ ] Test property view

**Day 3: Performance Metrics**
- [ ] Create performance dashboard
- [ ] Add completion charts
- [ ] Add response time metrics
- [ ] Add achievements
- [ ] Test metrics

**Day 4-5: Testing & Polish**
- [ ] Test all features
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Update documentation
- [ ] User testing

---

## 📦 Dependencies Needed

```json
{
  "react-big-calendar": "^1.8.5",     // Calendar component
  "date-fns": "^3.0.6",               // Already installed
  "react-quill": "^2.0.0",            // Rich text editor for messages
  "react-dropzone": "^14.2.3"         // File uploads
}
```

Or alternative:

```json
{
  "@fullcalendar/react": "^6.1.10",   // Alternative calendar
  "@fullcalendar/daygrid": "^6.1.10",
  "@fullcalendar/timegrid": "^6.1.10",
  "@fullcalendar/interaction": "^6.1.10"
}
```

---

## 🗄️ Database Schema

### Tasks Table (if not exists)

```sql
CREATE TABLE facilitator_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id UUID REFERENCES users(id) NOT NULL,
  property_id UUID REFERENCES properties(id),
  maintenance_request_id UUID REFERENCES maintenance_requests(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  
  notes TEXT,
  attachments TEXT[], -- Array of file URLs
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_facilitator ON facilitator_tasks(facilitator_id);
CREATE INDEX idx_tasks_status ON facilitator_tasks(status);
CREATE INDEX idx_tasks_due_date ON facilitator_tasks(due_date);
```

### Calendar Events Table

```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facilitator_id UUID REFERENCES users(id) NOT NULL,
  property_id UUID REFERENCES properties(id),
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50), -- maintenance, inspection, meeting, task
  
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  all_day BOOLEAN DEFAULT false,
  
  location VARCHAR(255),
  attendees TEXT[], -- Array of user IDs
  
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_facilitator ON calendar_events(facilitator_id);
CREATE INDEX idx_events_date ON calendar_events(start_time);
```

---

## 🎨 UI Components to Create

### 1. Task Components

```typescript
// TaskCard.tsx
<TaskCard
  task={task}
  onComplete={handleComplete}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>

// TaskList.tsx
<TaskList
  tasks={tasks}
  filter={filter}
  onFilterChange={setFilter}
/>

// CreateTaskModal.tsx
<CreateTaskModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleCreate}
/>
```

### 2. Calendar Components

```typescript
// Calendar.tsx
<Calendar
  events={events}
  view={view}
  onViewChange={setView}
  onEventClick={handleEventClick}
  onDateClick={handleDateClick}
/>

// EventModal.tsx
<EventModal
  event={event}
  isOpen={isOpen}
  onClose={onClose}
  onSave={handleSave}
/>
```

### 3. Message Components

```typescript
// MessageList.tsx
<MessageList
  conversations={conversations}
  onSelect={handleSelect}
/>

// MessageThread.tsx
<MessageThread
  conversation={conversation}
  messages={messages}
  onSend={handleSend}
/>

// ComposeMessage.tsx
<ComposeMessage
  recipients={recipients}
  onSend={handleSend}
/>
```

---

## 🔧 Backend API Endpoints

### Task Endpoints

```typescript
// Get facilitator tasks
GET /facilitators/:id/tasks?status=pending&priority=high

// Create task
POST /facilitators/:id/tasks
Body: { title, description, priority, dueDate, propertyId }

// Update task
PATCH /facilitators/tasks/:taskId
Body: { status, notes, completedAt }

// Delete task
DELETE /facilitators/tasks/:taskId

// Upload task attachment
POST /facilitators/tasks/:taskId/attachments
Body: FormData with file
```

### Calendar Endpoints

```typescript
// Get calendar events
GET /facilitators/:id/calendar?start=2024-01-01&end=2024-01-31

// Create event
POST /facilitators/:id/calendar
Body: { title, startTime, endTime, eventType, propertyId }

// Update event
PATCH /facilitators/calendar/:eventId
Body: { title, startTime, endTime, status }

// Delete event
DELETE /facilitators/calendar/:eventId
```

### Message Endpoints

```typescript
// Get conversations
GET /facilitators/:id/messages/conversations

// Get conversation messages
GET /facilitators/:id/messages/conversation/:userId

// Send message
POST /facilitators/:id/messages
Body: { receiverId, subject, content }

// Mark as read
PATCH /facilitators/:id/messages/:messageId/read

// Get unread count
GET /facilitators/:id/messages/unread-count
```

---

## ✅ Success Criteria

### Task Management
- [ ] Can view all tasks
- [ ] Can create new tasks
- [ ] Can mark tasks as complete
- [ ] Can filter tasks
- [ ] Can add notes to tasks
- [ ] Can upload photos

### Calendar View
- [ ] Calendar displays correctly
- [ ] Can switch between views
- [ ] Events show on correct dates
- [ ] Can create new events
- [ ] Can edit/delete events
- [ ] Color coding works

### Communication
- [ ] Can view messages
- [ ] Can send messages
- [ ] Unread count is accurate
- [ ] Notifications work
- [ ] Quick replies work

---

## 🎯 Quick Start Implementation

Let's start with the most impactful feature:

### Option A: Task Management (Recommended)
- **Why**: Most requested feature
- **Impact**: Helps facilitators organize work
- **Effort**: Medium (3-4 days)

### Option B: Calendar View
- **Why**: Visual way to see schedule
- **Impact**: Better time management
- **Effort**: Medium (3-4 days)

### Option C: Communication Tools
- **Why**: Better collaboration
- **Impact**: Faster response times
- **Effort**: Medium (3-4 days)

---

## 📝 Next Steps

1. **Review this plan**
2. **Choose starting feature** (I recommend Task Management)
3. **Check if backend endpoints exist**
4. **Start implementation**

**Ready to start with Task Management?** 🚀

It's the most practical feature and will immediately improve the facilitator experience!
