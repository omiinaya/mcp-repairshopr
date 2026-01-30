# RepairShopr API Documentation

**Version:** v1  
**OpenAPI Version:** 3.0.0

## Table of Contents

- [Introduction](#introduction)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Appointment Types](#appointment-types)
  - [Appointments](#appointments)
  - [Assets](#assets)
  - [Calls](#calls)
  - [Canned Responses](#canned-responses)
  - [Contacts](#contacts)
  - [Contracts](#contracts)
  - [Customers](#customers)
  - [Estimates](#estimates)
  - [Invoices](#invoices)
  - [Items](#items)
  - [Leads](#leads)
  - [Line Items](#line-items)
  - [New Ticket Forms](#new-ticket-forms)
  - [Payment Methods](#payment-methods)
  - [Payment Profiles](#payment-profiles)
  - [Payments](#payments)
  - [Phones](#phones)
  - [Portal Users](#portal-users)
  - [Products](#products)
  - [Product Serials](#product-serials)
  - [Purchase Orders](#purchase-orders)
  - [RMM Alerts](#rmm-alerts)
  - [Schedules](#schedules)
  - [Search](#search)
  - [Settings](#settings)
  - [Ticket Timers](#ticket-timers)
  - [Tickets](#tickets)
  - [Timelogs](#timelogs)
  - [User Devices](#user-devices)
  - [Users](#users)
  - [Vendors](#vendors)
  - [Wiki Pages](#wiki-pages)
  - [Worksheet Results](#worksheet-results)

---

## Introduction

Welcome to the official RepairShopr API Docs.

To use these docs, you will need an active RepairShopr account. You can sign up for one here: [RepairShopr](https://repairshopr.com)

If you already have an active account, fill in your subdomain below and then click "Authorize" and fill in your api-key. The key is specific to your user account so it is found on the your user profile page.

Please review the Terms of Service before using these docs and feel free to reach out with questions via the links below.

**Rate Limit:** 180 requests per minute per IP address on API Usage.

### Contact Information

- **Email:** help@repairshopr.com
- **Support URL:** https://feedback.repairshopr.com/
- **Terms of Service:** https://www.repairshopr.com/repairshopr-site-terms

### Additional Documentation

[Additional API Docs](https://feedback.repairshopr.com/knowledgebase/articles/376312-repairshopr-rest-api-build-custom-extensions-app)

---

## Authentication

The RepairShopr API uses Bearer Token authentication. Include your API key in the Authorization header:

```http
Authorization: Bearer YOUR_API_KEY
```

**Security Scheme:** `bearerAuth`  
**Type:** API Key  
**In:** Header  
**Name:** Authorization  
**Scheme:** Bearer

---

> **Note:** This file was split from the original docs/repairshoprapi.md file for better organization and maintainability.
