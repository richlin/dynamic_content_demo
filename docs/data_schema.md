Table Structure
1. recipients
id (UUID, Primary Key) - Unique identifier for each recipient.
first_name (VARCHAR) - First name of the recipient.
email (VARCHAR, Unique) - Email address of the recipient.
segment (VARCHAR) - Segment to which the recipient belongs (e.g., "HighSpender").

2. segment_variant_rules
id (UUID, Primary Key) - Unique identifier for each rule.
segment (VARCHAR) - Segment name (links to "HighSpender", etc.).
variation_key (VARCHAR) - Variation key (e.g., "A" or "B").
headline (VARCHAR) - Headline for the email variant.
image_url (VARCHAR) - URL of the image for the email variant.
call_to_action (VARCHAR) - Call to action text for the email variant.
email_body (TEXT) - Email content of the email with placeholders (e.g., {{firstName}}, {{headline}}).

3. email_sends
id (UUID, Primary Key) - Unique identifier for each email send record.
recipient_id (UUID, Foreign Key) - Links to the recipients table.
template_id (UUID, Foreign Key) - Links to the email_templates table.
variation_used (VARCHAR) - Variation used for the email (e.g., "A" or "B").
timestamp_sent (TIMESTAMP) - Timestamp when the email was sent.
