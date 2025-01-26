import 'dotenv/config';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

async function cleanupExistingData() {
    console.log('Cleaning up existing data...');

    // Delete in reverse order of dependencies
    const { error: sendsError } = await supabase
        .from('email_sends')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');
    if (sendsError) throw sendsError;

    const { error: rulesError } = await supabase
        .from('segment_variant_rules')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');
    if (rulesError) throw rulesError;

    const { error: recipientsError } = await supabase
        .from('recipients')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');
    if (recipientsError) throw recipientsError;

    console.log('✅ Existing data cleaned up');
}

async function populateInitialData() {
    try {
        console.log('Starting to populate initial data...');

        // Clean up existing data first
        await cleanupExistingData();

        // Add recipients
        console.log('\nAdding recipients...');
        const { data: recipients, error: recipientsError } = await supabase
            .from('recipients')
            .insert([
                {
                    id: uuidv4(),
                    first_name: 'John',
                    email: 'john.doe@example.com',
                    segment: 'HighSpender'
                },
                {
                    id: uuidv4(),
                    first_name: 'Jane',
                    email: 'jane.smith@example.com',
                    segment: 'BusinessTraveler'
                },
                {
                    id: uuidv4(),
                    first_name: 'Mike',
                    email: 'mike.wilson@example.com',
                    segment: 'BudgetConscious'
                }
            ])
            .select();

        if (recipientsError) throw recipientsError;
        console.log('✅ Recipients added:', recipients);

        // Add segment variant rules
        console.log('\nAdding segment variant rules...');
        const { data: rules, error: rulesError } = await supabase
            .from('segment_variant_rules')
            .insert([
                {
                    id: uuidv4(),
                    segment: 'HighSpender',
                    variation_key: 'A',
                    subject_line: 'Exclusive Business Platinum Rewards Await You',
                    html_body: `Dear {{firstName}},

As one of our most distinguished Business Cardmembers, you've earned access to our exclusive Business Platinum rewards program.

{{headline}}

Enjoy premium benefits including:
• 5x points on travel bookings
• Priority airport lounge access worldwide
• Dedicated business concierge service
• Premium car rental privileges
• Global dining collection access

Start maximizing your rewards today.

Terms and conditions apply.`,
                    headline: 'Exclusive Business Platinum Rewards',
                    image_url: 'https://card.americanexpress.com/imgs/opt/cards/pentagon/amx/cns/right/amx-cns-platinum-right@480w.webp',
                    call_to_action: 'Upgrade Now'
                },
                {
                    id: uuidv4(),
                    segment: 'HighSpender',
                    variation_key: 'B',
                    subject_line: 'Double Your Business Rewards Today',
                    html_body: `Dear {{firstName}},

Your business deserves more rewards. We're excited to offer you an enhanced rewards program tailored for high-value cardmembers.

{{headline}}

Unlock these premium benefits:
• Double points on all business purchases
• Complimentary airport lounge access
• Premium travel insurance
• 24/7 concierge service
• Exclusive event access

Start earning more today.

Terms and conditions apply.`,
                    headline: 'Double Points on Business Purchases',
                    image_url: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/business-rewards.png',
                    call_to_action: 'Start Earning'
                },
                {
                    id: uuidv4(),
                    segment: 'BusinessTraveler',
                    variation_key: 'A',
                    subject_line: 'Maximize Your Business Travel Benefits',
                    html_body: `Dear {{firstName}},

Make every business trip count with our enhanced travel program.

{{headline}}

Exclusive benefits include:
• 3x points on flights and hotels
• Complimentary airport lounge access
• Travel insurance coverage
• Global assistance hotline
• Car rental elite status

Book your next business trip today.

Terms and conditions apply.`,
                    headline: 'Enhanced Travel Benefits',
                    image_url: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/business-travel.png',
                    call_to_action: 'Book Now'
                },
                {
                    id: uuidv4(),
                    segment: 'BusinessTraveler',
                    variation_key: 'B',
                    subject_line: 'New Travel Management Tools for Your Business',
                    html_body: `Dear {{firstName}},

Streamline your business travel with our new suite of management tools.

{{headline}}

Discover these powerful features:
• Centralized travel booking
• Expense tracking automation
• Team travel coordination
• Real-time reporting
• Policy compliance tools

Optimize your business travel today.

Terms and conditions apply.`,
                    headline: 'New Business Expense Management Tools',
                    image_url: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/expense-management.png',
                    call_to_action: 'Get Started'
                },
                {
                    id: uuidv4(),
                    segment: 'BudgetConscious',
                    variation_key: 'A',
                    subject_line: 'Smart Savings with Business Cash Back',
                    html_body: `Dear {{firstName}},

Make your business spending work harder with our enhanced cash back program.

{{headline}}

Great benefits include:
• 5% cash back on office supplies
• 3% cash back on shipping
• 2% cash back on utilities
• No category limits
• Automatic cash deposits

Start earning cash back today.

Terms and conditions apply.`,
                    headline: 'Business Cash Back Program',
                    image_url: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/business-cashback.png',
                    call_to_action: 'Start Saving'
                },
                {
                    id: uuidv4(),
                    segment: 'BudgetConscious',
                    variation_key: 'B',
                    subject_line: 'Special Financing Offer for Your Business',
                    html_body: `Dear {{firstName}},

Take advantage of our special business financing options designed for smart growth.

{{headline}}

Exclusive offer includes:
• 0% APR for 12 months
• No annual fee
• Free employee cards
• Extended payment terms
• Flexible payment options

Grow your business today.

Terms and conditions apply.`,
                    headline: 'Special Business Financing Offer',
                    image_url: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/business-financing.png',
                    call_to_action: 'Apply Now'
                }
            ])
            .select();

        if (rulesError) throw rulesError;
        console.log('✅ Segment variant rules added:', rules);

        // Add a sample email send
        console.log('\nAdding sample email send...');
        if (recipients && recipients.length > 0 && rules && rules.length > 0) {
            const { data: emailSend, error: sendError } = await supabase
                .from('email_sends')
                .insert([
                    {
                        id: uuidv4(),
                        recipient_id: recipients[0].id,
                        variant_rule_id: rules[0].id,
                        variation_used: 'A',
                        timestamp_sent: new Date().toISOString()
                    }
                ])
                .select();

            if (sendError) throw sendError;
            console.log('✅ Sample email send added:', emailSend);
        }

        console.log('\n✅ Initial data population completed successfully!');

    } catch (error) {
        console.error('❌ Error populating data:', error);
    }
}

// Run the population script
populateInitialData(); 