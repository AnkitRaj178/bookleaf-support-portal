# Backend REST API Specification

This document details the enterprise-grade secured REST API endpoints for the BookLeaf Publishing support platform.

## Authentication
All endpoints under `/api/books` and `/api/tickets` require a valid JWT token passed in the `Authorization` header as a Bearer token.
- `role: 'admin'` grants global access and mutation rights.
- `role: 'author'` enforces strict ownership checks (HTTP 403) on any specific resource ID.

---

## Auth Endpoints

### 1. User Login
**Method:** `POST`  
**Path:** `/api/auth/login`  
**Auth Required:** None (Public)  
**Description:** Authenticates user and returns a JWT payload.
**Request Body:**
```json
{
  "email": "user@bookleaf.com",
  "password": "securepassword123"
}
```
**Responses:**
- `200 OK`: Returns `{ token, role, authorId, name, email }`
- `400 Bad Request`: "Invalid email or password"
- `500 Internal Server Error`: "Server error"

---

## Book Endpoints

### 1. Get Books
**Method:** `GET`  
**Path:** `/api/books`  
**Auth Required:** Valid JWT  
**Role Restrictions:**
- Admin: Retrieves all books in the database.
- Author: Retrieves only books where `authorId` matches the authenticated user ID.
**Responses:**
- `200 OK`: Returns an array of Book objects.
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Access denied.

### 2. Get Book by ID
**Method:** `GET`  
**Path:** `/api/books/:id`  
**Auth Required:** Valid JWT  
**Role Restrictions:** 
- Admin: Access any book.
- Author: Access only if `authorId` matches the user.
**Responses:**
- `200 OK`: Returns the Book object.
- `403 Forbidden`: "Forbidden: You do not have access to this book."
- `404 Not Found`: "Book not found"

---

## Ticket Endpoints

### 1. Get Tickets
**Method:** `GET`  
**Path:** `/api/tickets`  
**Auth Required:** Valid JWT  
**Role Restrictions:**
- Admin: Retrieves all support tickets.
- Author: Retrieves only tickets matching the authenticated user ID.
**Responses:**
- `200 OK`: Returns an array of Ticket objects.
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Access denied.

### 2. Get Ticket by ID
**Method:** `GET`  
**Path:** `/api/tickets/:id`  
**Auth Required:** Valid JWT  
**Role Restrictions:**
- Admin: Access any ticket.
- Author: Access only if `authorId` matches the user.
**Responses:**
- `200 OK`: Returns the Ticket object.
- `403 Forbidden`: "Forbidden: You do not have access to this ticket."
- `404 Not Found`: "Ticket not found"

### 3. Create Ticket
**Method:** `POST`  
**Path:** `/api/tickets`  
**Auth Required:** Valid JWT (Author only)  
**Role Restrictions:**
- Admin: Explicitly Forbidden (403). Admins cannot create support tickets.
**Request Body:**
```json
{
  "bookId": "60d5ec49f1b2c8a1b4e8e1a2", // Optional
  "subject": "Missing Royalty Payout", // Required
  "description": "I did not receive my payout for last month." // Required
}
```
**Responses:**
- `201 Created`: Returns the saved Ticket object.
- `400 Bad Request`: "Subject and description are required."
- `403 Forbidden`: "Admins cannot create tickets via this route."

### 4. Respond to Ticket (Sub-resource)
**Method:** `POST`  
**Path:** `/api/tickets/:id/responses`  
**Auth Required:** Valid JWT  
**Role Restrictions:**
- Admin: Can reply to any ticket. Automatically clears AI Drafts.
- Author: Can only reply if `authorId` matches.
**Request Body:**
```json
{
  "message": "Thank you for the update. Can you confirm the timeline?" // Required
}
```
**Responses:**
- `200 OK`: Returns the updated Ticket object.
- `400 Bad Request`: "Message content is required." OR "Cannot reply to a closed ticket."
- `403 Forbidden`: "Forbidden: You do not have access to this ticket."
- `404 Not Found`: "Ticket not found"

### 5. Update Ticket (Core fields)
**Method:** `PUT`  
**Path:** `/api/tickets/:id`  
**Auth Required:** Valid JWT (Admin only)  
**Role Restrictions:** Admin only.  
**Request Body:**
```json
{
  "status": "In Progress", // Optional
  "priority": "High", // Optional
  "category": "Financial", // Optional
  "internalNotes": "Finance team alerted." // Optional
}
```
**Responses:**
- `200 OK`: Returns the updated Ticket object.
- `400 Bad Request`: "No valid fields provided for update."
- `403 Forbidden`: "Only admins can update ticket fields."
- `404 Not Found`: "Ticket not found"

### 6. Assign Ticket
**Method:** `PATCH`  
**Path:** `/api/tickets/:id/assignee`  
**Auth Required:** Valid JWT (Admin only)  
**Role Restrictions:** Admin only.  
**Request Body:**
```json
{
  "assignedTo": "AdminName" // Required
}
```
**Responses:**
- `200 OK`: Returns the updated Ticket object.
- `400 Bad Request`: "assignedTo is required."
- `403 Forbidden`: "Only admins can assign tickets."
- `404 Not Found`: "Ticket not found"
