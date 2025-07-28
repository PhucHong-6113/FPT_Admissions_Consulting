# FPT University Ticket Management System

## Overview
This ticket management system allows students to create support tickets and consultants to respond to them. The system is built with Next.js and integrates with the Request Ticket Service API.

## Features

### For Students:
- **Create Tickets**: Submit support requests with title, description, priority, and category
- **View My Tickets**: See all submitted tickets with their status and responses
- **Ticket Details**: View detailed information about specific tickets including consultant responses
- **Real-time Status**: Track ticket progress from pending to responded/closed

### For Consultants:
- **Dashboard**: Overview of all tickets with statistics
- **Pending Tickets**: View and respond to tickets awaiting consultation
- **All Tickets**: Access complete ticket history
- **Respond to Tickets**: Add responses that automatically mark tickets as resolved

## Pages Structure

```
/request-tickets          - Create new support tickets (Students)
/my-tickets              - View all user's tickets (Students)  
/ticket-detail/[ticketId] - View specific ticket details (Students & Consultants)
/consultant-dashboard    - Manage and respond to tickets (Consultants only)
```

## User Flows

### Student Flow:
1. Click "Gửi ticket" on homepage or "Ticket của tôi" if logged in
2. Fill out ticket form with details (title, description, priority, category)
3. Submit ticket and optionally view in "My Tickets"
4. Check ticket status and consultant responses in ticket details

### Consultant Flow:
1. Access consultant dashboard
2. View pending tickets requiring responses
3. Click "Phản hồi" to respond to specific tickets
4. Track all tickets and their resolution status

## API Integration

The system integrates with the Request Ticket Service API endpoints:

- `POST /api/request-tickets` - Create ticket
- `GET /api/request-tickets/my-tickets` - Get user's tickets
- `GET /api/request-tickets/pending` - Get pending tickets (consultants)
- `GET /api/request-tickets` - Get all tickets (consultants)
- `GET /api/request-tickets/{ticketId}` - Get ticket details
- `POST /api/request-tickets/{ticketId}/respond` - Respond to ticket

## Authentication & Authorization

- **Students**: Can create and view their own tickets
- **Consultants**: Can view all tickets and respond to pending ones
- **JWT Bearer Token**: Required for all API calls
- **Role-based Access**: Different UI and permissions based on user role

## Status & Priority System

### Ticket Status:
- **Pending**: Awaiting consultant response
- **Responded**: Consultant has provided response
- **Closed**: Ticket is completed and closed

### Priority Levels:
- **Low**: Non-urgent requests
- **Medium**: Standard priority (default)
- **High**: Important issues
- **Urgent**: Critical problems requiring immediate attention

## UI/UX Features

- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Automatic refresh after actions
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Statistics Dashboard**: Visual overview of ticket metrics
- **Color-coded Status**: Easy identification of ticket states
- **Formatted Timestamps**: Local timezone display

## Navigation

The system provides seamless navigation between:
- Homepage with ticket creation access
- Student ticket management pages
- Consultant dashboard and tools
- Detailed ticket viewing for both roles

## Security Features

- JWT token validation for all requests
- Role-based page access control
- User can only view their own tickets (students)
- Consultant access to all tickets with response capabilities
- Secure API communication with authorization headers

## Technical Implementation

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: JWT Bearer token system
- **State Management**: React hooks with local state
- **API Calls**: Fetch API with error handling
- **Routing**: Next.js App Router with dynamic routes

This comprehensive ticket management system provides a complete solution for student support requests and consultant responses within the FPT University ecosystem.
