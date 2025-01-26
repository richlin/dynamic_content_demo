import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { recipient, variant } = await request.json();

        // Replace placeholders in the email body
        const personalizedBody = variant.html_body
            .replace(/{{firstName}}/g, recipient.first_name)
            .replace(/{{headline}}/g, variant.headline);

        // Send the email
        const data = await resend.emails.send({
            from: 'AmEx <onboarding@resend.dev>',
            to: recipient.email,
            subject: variant.subject_line,
            html: personalizedBody,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
} 