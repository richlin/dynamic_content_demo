## Tech Stack:
Backend: 
- Python (Django/Flask) 
- or another quick-to-build framework 

Frontend: Simple UI for uploading/entering test recipient data and selecting which A/B test variation to run.
- ReactJS 
- NextJS
- TailwindCSS
- ShadcnUI

Database: A lightweight in-memory structure for demonstration to keep track of segments, variations, and recipients 
Email Service: Use Resend for sending emails. 


## Data Model:

Recipient:
- id (unique)
- firstName
- email
- segment (e.g., “HighSpender”)

EmailTemplate:
- templateId
- subjectLine
- htmlBody (with placeholders, e.g., {{firstName}}, {{headline}}, etc.)

SegmentVariantRules:
- segment (links to “HighSpender,” etc.)
- variationKey (e.g., “A” or “B”)
- headline
- imageUrl
- callToAction
- etc.


## Dynamic Content Logic:

A rules-based or conditional logic engine that, at send time, merges:
- Global content (used by all segments).
- Segment-level overrides (different headlines or images).
- A/B variation (the system either randomizes or follows a preset distribution).

Example:
- Load the base template.
- Determine the segment: “Business Traveler.”
- Check if there is an A/B override for headline or hero image for that segment.
- If so, inject that version’s content in place of the default or Variation A content.


## Mock Tracking / Reporting:

For demonstration, you can store a local record (in DB or memory) of:
- Email ID sent
- Variation used
- Timestamp sent
Optionally display a basic summary (e.g., “10 emails sent to Segment A with Variation B”).

## Technical Considerations:
    
- For real-world use, store user assignment to Variation A/B so that the same user sees consistent content if re-sent the email.
- If scaling beyond a demo, consider using a message queue (RabbitMQ, AWS SQS) to handle large email sends.
- For data privacy, abide by relevant laws (e.g., GDPR/CCPA) if using real user data—though for the demo, synthetic data is enough.

