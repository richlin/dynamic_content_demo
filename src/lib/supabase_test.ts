import 'dotenv/config';
import { supabase } from './supabase';

async function cleanupTestData() {
    console.log('Cleaning up any existing test data...');
    
    // Delete test email sends
    await supabase
        .from('email_sends')
        .delete()
        .eq('template_id', 'test-template-1');

    // Delete test template
    await supabase
        .from('email_templates')
        .delete()
        .eq('id', 'test-template-1');

    // Delete test variant rule
    await supabase
        .from('segment_variant_rules')
        .delete()
        .eq('segment', 'high-spender')
        .eq('variation_key', 'a');

    // Delete test recipients
    await supabase
        .from('recipients')
        .delete()
        .in('email', ['john.test@example.com', 'jane.test@example.com']);
}

async function testSupabaseConnection() {
    try {
        // Clean up any existing test data first
        await cleanupTestData();

        // Test basic connection
        const { data: connectionTest, error: connectionError } = await supabase
            .from('recipients')
            .select('count')
            .limit(1);

        if (connectionError) throw connectionError;
        console.log('✅ Connection successful');

        // Test Recipients Table
        console.log('\n--- Testing Recipients Table ---');
        
        // Insert test recipients
        const { data: insertedRecipients, error: insertError } = await supabase
            .from('recipients')
            .insert([
                { 
                    first_name: 'John',
                    email: 'john.test@example.com',
                    segment: 'high-spender'
                },
                {
                    first_name: 'Jane',
                    email: 'jane.test@example.com',
                    segment: 'budget-conscious'
                }
            ])
            .select();

        if (insertError) throw insertError;
        console.log('✅ Recipients inserted:', insertedRecipients);

        // Update a recipient
        const { data: updatedRecipient, error: updateError } = await supabase
            .from('recipients')
            .update({ segment: 'high-spender' })
            .eq('email', 'john.test@example.com')
            .select();

        if (updateError) throw updateError;
        console.log('✅ Recipient updated:', updatedRecipient);

        // Test Email Templates Table
        console.log('\n--- Testing Email Templates Table ---');
        
        // Insert test template
        const { data: insertedTemplate, error: templateInsertError } = await supabase
            .from('email_templates')
            .insert([
                {
                    id: 'test-template-1',
                    subject: 'Test Subject',
                    content: 'Test body content'
                }
            ])
            .select();

        if (templateInsertError) throw templateInsertError;
        console.log('✅ Template inserted:', insertedTemplate);

        // Test Segment Variant Rules Table
        console.log('\n--- Testing Segment Variant Rules Table ---');
        
        // Insert test rule
        const { data: insertedRule, error: ruleInsertError } = await supabase
            .from('segment_variant_rules')
            .insert([
                {
                    segment: 'high-spender',
                    variation_key: 'a',
                    headline: 'Test Headline',
                    image_url: 'https://example.com/image.jpg',
                    call_to_action: 'Click Here'
                }
            ])
            .select();

        if (ruleInsertError) throw ruleInsertError;
        console.log('✅ Variant rule inserted:', insertedRule);

        // Test Email Sends Table
        console.log('\n--- Testing Email Sends Table ---');
        
        // Insert test email send
        const { data: insertedSend, error: sendInsertError } = await supabase
            .from('email_sends')
            .insert([
                {
                    recipient_id: insertedRecipients[0].id,
                    template_id: 'test-template-1',
                    variation_used: 'a',
                    sent_at: new Date().toISOString()
                }
            ])
            .select();

        if (sendInsertError) throw sendInsertError;
        console.log('✅ Email send recorded:', insertedSend);

        // Cleanup - Delete test data
        console.log('\n--- Cleaning up test data ---');

        // Delete test email sends
        await supabase
            .from('email_sends')
            .delete()
            .eq('template_id', 'test-template-1');

        // Delete test template
        await supabase
            .from('email_templates')
            .delete()
            .eq('template_id', 'test-template-1');

        // Delete test variant rule
        await supabase
            .from('segment_variant_rules')
            .delete()
            .eq('segment', 'high-spender')
            .eq('variation_key', 'a');

        // Delete test recipients
        await supabase
            .from('recipients')
            .delete()
            .in('email', ['john.test@example.com', 'jane.test@example.com']);

        console.log('✅ Test data cleaned up successfully');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testSupabaseConnection(); 