import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { recipient, variant, campaignName } = await request.json();
        
        const { firstName, email } = recipient;
        const { subject, emailBody } = variant;

        const response = await resend.emails.send({
            from: 'Marketing Campaign <onboarding@resend.dev>',
            to: email,
            subject: subject,
            html: `
                <div>
                    <p>Dear ${firstName},</p>
                    ${emailBody}
                </div>
            `
        });

        return NextResponse.json({ success: true, messageId: response.id });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
} 