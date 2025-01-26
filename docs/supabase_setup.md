# Supabase Setup Instructions

This document outlines the steps to connect the application to Supabase.

## Prerequisites

1. Node.js and npm installed
2. Access to the Supabase project

## Installation

1. Install the Supabase client library:
```bash
npm install @supabase/supabase-js
```

## Environment Setup

Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema

The application uses the following tables:

### Recipients Table
- `id` (uuid, primary key)
- `first_name` (text)
- `email` (text, unique)
- `segment` (text)

### Email Templates Table
- `id` (text, primary key)
- `subject` (text)
- `content` (text)

### Segment Variant Rules Table
- `id` (uuid, primary key)
- `segment` (text)
- `variation_key` (text)
- `headline` (text)
- `image_url` (text)
- `call_to_action` (text)

### Email Sends Table
- `id` (uuid, primary key)
- `recipient_id` (uuid, foreign key to recipients.id)
- `template_id` (text, foreign key to email_templates.id)
- `variation_used` (text)
- `sent_at` (timestamp)

## Testing the Connection

1. Run the test script to verify the connection and table operations:
```bash
npm run test:supabase
```

The test script will:
- Test the basic connection
- Insert test data into each table
- Update test records
- Clean up test data

## Troubleshooting

If you encounter errors:

1. Check that your environment variables are correctly set
2. Verify that your Supabase project is running
3. Ensure your database schema matches the expected structure
4. Check the Supabase dashboard for any policy restrictions

## Security Notes

1. Never commit `.env` or `.env.local` files to version control
2. Use Row Level Security (RLS) policies in Supabase for data protection
3. The anon key should only have the minimum required permissions 