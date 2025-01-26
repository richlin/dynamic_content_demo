'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface Variant {
    id: string;
    subjectLine: string;
    callToAction: string;
    emailBody: string;
    imageUrl: string;
}

interface Segment {
    id: string;
    name: string;
    variants: Variant[];
}

const createVariant = (id: string, content: Partial<Variant> = {}): Variant => ({
    id,
    subjectLine: '',
    callToAction: '',
    emailBody: '',
    imageUrl: '',
    ...content
});

const INITIAL_SEGMENTS: Segment[] = [
    { 
        id: 'high-spender', 
        name: 'High Spender', 
        variants: [
            createVariant('high-spender-a', {
                subjectLine: 'Exclusive Business Platinum Rewards Await You',
                callToAction: 'Upgrade Now',
                emailBody: `Dear Business Owner,

As one of our most distinguished Business Cardmembers, you've earned access to our exclusive Business Platinum rewards program.

Enjoy premium benefits including:
• 5x points on travel bookings
• Priority airport lounge access worldwide
• Dedicated business concierge service
• Premium car rental privileges
• Global dining collection access

Start maximizing your rewards today.

Terms and conditions apply.`,
                imageUrl: 'https://card.americanexpress.com/imgs/opt/cards/pentagon/amx/cns/right/amx-cns-platinum-right@480w.webp'
            }),
            createVariant('high-spender-b', {
                subjectLine: 'Double Points on Business Purchases',
                callToAction: 'Start Earning',
                emailBody: `Dear Business Owner,

Your premium status has unlocked an exclusive offer: earn double points on all business purchases.

Benefits include:
• 2x points at business retailers
• Enhanced purchase protection
• Exclusive business events access
• Extended warranty coverage
• Premium shipping services

Don't miss out on these rewards.

Terms and conditions apply.`,
                imageUrl: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/business-rewards.png'
            })
        ] 
    },
    { 
        id: 'business-traveler', 
        name: 'Business Traveler', 
        variants: [
            createVariant('business-traveler-a', {
                subjectLine: 'Maximize Your Business Travel Benefits',
                callToAction: 'Book Now',
                emailBody: `Dear Business Traveler,

Make every business trip count with our enhanced travel program.

Exclusive benefits include:
• 3x points on flights and hotels
• Complimentary airport lounge access
• Travel insurance coverage
• Global assistance hotline
• Car rental elite status

Book your next business trip today.

Terms and conditions apply.`,
                imageUrl: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/business-travel.png'
            }),
            createVariant('business-traveler-b', {
                subjectLine: 'New Business Expense Management Tools',
                callToAction: 'Get Started',
                emailBody: `Dear Business Traveler,

Take control of your business expenses with our new management tools.

Key features include:
• Automated expense tracking
• Digital receipt storage
• Real-time spending alerts
• Employee card management
• Custom spending reports

Streamline your business expenses today.

Terms and conditions apply.`,
                imageUrl: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/expense-management.png'
            })
        ] 
    },
    { 
        id: 'budget-conscious', 
        name: 'Budget Conscious', 
        variants: [
            createVariant('budget-conscious-a', {
                subjectLine: 'Business Cash Back Rewards Program',
                callToAction: 'Start Saving',
                emailBody: `Dear Business Owner,

Make your business spending work harder with our enhanced cash back program.

Great benefits include:
• 5% cash back on office supplies
• 3% cash back on shipping
• 2% cash back on utilities
• No category limits
• Automatic cash deposits

Start earning cash back today.

Terms and conditions apply.`,
                imageUrl: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/business-cashback.png'
            }),
            createVariant('budget-conscious-b', {
                subjectLine: 'Special Business Financing Offer',
                callToAction: 'Apply Now',
                emailBody: `Dear Business Owner,

Take advantage of our special business financing offer.

Limited time offer includes:
• 0% APR for 12 months
• No balance transfer fee
• Free employee cards
• Detailed spending reports
• Flexible payment options

Grow your business today.

Terms and conditions apply.`,
                imageUrl: 'https://image.member.americanexpress.com/lib/fe2b11717d640479721c73/m/1/business-financing.png'
            })
        ] 
    },
];

const VARIANT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function TemplateEditor() {
    const [segments, setSegments] = React.useState<Segment[]>(INITIAL_SEGMENTS);
    const [selectedSegment, setSelectedSegment] = React.useState<string>(INITIAL_SEGMENTS[0].id);
    const [variants, setVariants] = React.useState<Variant[]>(INITIAL_SEGMENTS[0].variants);
    const [selectedVariant, setSelectedVariant] = React.useState<Variant>(INITIAL_SEGMENTS[0].variants[0]);
    const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        // Try to load saved segments from localStorage
        if (typeof window !== 'undefined') {
            try {
                const savedSegments = localStorage.getItem('savedSegments');
                if (savedSegments) {
                    const parsed = JSON.parse(savedSegments);
                    setSegments(parsed);
                    setSelectedSegment(parsed[0].id);
                    setVariants(parsed[0].variants);
                    setSelectedVariant(parsed[0].variants[0]);
                }
            } catch (error) {
                console.error('Error loading segments from localStorage:', error);
            }
        }
    }, []);

    React.useEffect(() => {
        const segment = segments.find(s => s.id === selectedSegment);
        if (segment) {
            setVariants(segment.variants);
            setSelectedVariant(segment.variants[0]);
        }
    }, [selectedSegment, segments]);

    const saveToLocalStorage = (updatedSegments: Segment[]) => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('savedSegments', JSON.stringify(updatedSegments));
            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        }
    };

    const addVariant = () => {
        const nextLetterIndex = variants.length;
        if (nextLetterIndex >= VARIANT_LETTERS.length) {
            alert('Maximum number of variants reached');
            return;
        }
        
        const newVariant = createVariant(`${selectedSegment}-${VARIANT_LETTERS[nextLetterIndex].toLowerCase()}`);
        const newVariants = [...variants, newVariant];
        setVariants(newVariants);
        setSelectedVariant(newVariant);
        
        // Update the segment's variants
        const updatedSegments = segments.map(segment =>
            segment.id === selectedSegment
                ? { ...segment, variants: newVariants }
                : segment
        );
        saveToLocalStorage(updatedSegments);
    };

    const removeVariant = (variantId: string) => {
        if (variants.length <= 1) {
            return; // Prevent removing the last variant
        }
        const newVariants = variants.filter(v => v.id !== variantId);
        setVariants(newVariants);
        if (selectedVariant.id === variantId) {
            setSelectedVariant(newVariants[0]);
        }
        
        // Update the segment's variants
        const updatedSegments = segments.map(segment =>
            segment.id === selectedSegment
                ? { ...segment, variants: newVariants }
                : segment
        );
        saveToLocalStorage(updatedSegments);
    };

    const updateVariant = (variantId: string, field: keyof Variant, value: string) => {
        const newVariants = variants.map(v => 
            v.id === variantId ? { ...v, [field]: value } : v
        );
        setVariants(newVariants);
        if (selectedVariant.id === variantId) {
            setSelectedVariant({ ...selectedVariant, [field]: value });
        }
        
        // Update the segment's variants
        const updatedSegments = segments.map(segment =>
            segment.id === selectedSegment
                ? { ...segment, variants: newVariants }
                : segment
        );
        saveToLocalStorage(updatedSegments);
    };

    const handleSave = async () => {
        try {
            // For each variant in the current segment, save a template
            for (const variant of variants) {
                const templateData = {
                    template_id: variant.id,
                    subject_line: variant.subjectLine,
                    html_body: variant.emailBody,
                    segment: selectedSegment,
                    variation_key: variant.id.split('-').pop() || 'a'  // Extract 'a' or 'b' from the variant ID
                };

                // Check if template exists
                const { data: existingTemplate } = await supabase
                    .from('email_templates')
                    .select()
                    .eq('template_id', variant.id)
                    .single();

                if (existingTemplate) {
                    // Update existing template
                    const { error: updateError } = await supabase
                        .from('email_templates')
                        .update(templateData)
                        .eq('template_id', variant.id);

                    if (updateError) throw updateError;
                } else {
                    // Insert new template
                    const { error: insertError } = await supabase
                        .from('email_templates')
                        .insert([templateData]);

                    if (insertError) throw insertError;
                }

                // Save variant rules
                const variantRuleData = {
                    segment: selectedSegment,
                    variation_key: variant.id.split('-').pop() || 'a',
                    headline: variant.subjectLine,
                    image_url: variant.imageUrl,
                    call_to_action: variant.callToAction
                };

                // Check if variant rule exists
                const { data: existingRule } = await supabase
                    .from('segment_variant_rules')
                    .select()
                    .eq('segment', selectedSegment)
                    .eq('variation_key', variant.id.split('-').pop() || 'a')
                    .single();

                if (existingRule) {
                    // Update existing rule
                    const { error: updateError } = await supabase
                        .from('segment_variant_rules')
                        .update(variantRuleData)
                        .eq('segment', selectedSegment)
                        .eq('variation_key', variant.id.split('-').pop() || 'a');

                    if (updateError) throw updateError;
                } else {
                    // Insert new rule
                    const { error: insertError } = await supabase
                        .from('segment_variant_rules')
                        .insert([variantRuleData]);

                    if (insertError) throw insertError;
                }
            }

            setLastSaved(new Date());
            alert('Templates and variant rules saved successfully!');
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template. Please check the console for details.');
        }
    };

    // Update the useEffect to load data from Supabase instead of localStorage
    React.useEffect(() => {
        async function loadData() {
            try {
                // Load templates
                const { data: templatesData, error: templatesError } = await supabase
                    .from('email_templates')
                    .select('*')
                    .eq('segment', selectedSegment);

                if (templatesError) throw templatesError;

                // Load variant rules
                const { data: rulesData, error: rulesError } = await supabase
                    .from('segment_variant_rules')
                    .select('*')
                    .eq('segment', selectedSegment);

                if (rulesError) throw rulesError;

                if (templatesData && rulesData) {
                    // Combine template and rule data
                    const combinedVariants = templatesData.map(template => {
                        const rule = rulesData.find(r => r.variation_key === template.variation_key);
                        return {
                            id: template.template_id,
                            subjectLine: template.subject_line,
                            emailBody: template.html_body,
                            callToAction: rule?.call_to_action || '',
                            imageUrl: rule?.image_url || ''
                        };
                    });

                    if (combinedVariants.length > 0) {
                        setVariants(combinedVariants);
                        setSelectedVariant(combinedVariants[0]);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        if (selectedSegment) {
            loadData();
        }
    }, [selectedSegment]);

    if (!mounted) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Editor */}
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Segment</Label>
                                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select segment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {segments.map(segment => (
                                            <SelectItem key={segment.id} value={segment.id}>
                                                {segment.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Variant</Label>
                                <Select 
                                    value={selectedVariant.id} 
                                    onValueChange={(value) => {
                                        if (value === 'add-new') {
                                            addVariant();
                                        } else {
                                            const variant = variants.find(v => v.id === value);
                                            if (variant) setSelectedVariant(variant);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select variant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {variants.map(variant => (
                                            <SelectItem key={variant.id} value={variant.id}>
                                                Variant {variant.id.split('-').pop()?.toUpperCase()}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="add-new" className="text-blue-600">
                                            + Add New Variant
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">
                                        Variant {selectedVariant.id.split('-').pop()?.toUpperCase()}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        {lastSaved && (
                                            <span className="text-xs text-gray-500">
                                                Last saved: {lastSaved.toLocaleTimeString()}
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeVariant(selectedVariant.id)}
                                            disabled={variants.length <= 1}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Remove Variant
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Subject Line</Label>
                                    <Input
                                        value={selectedVariant.subjectLine}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            updateVariant(selectedVariant.id, 'subjectLine', e.target.value)
                                        }
                                        placeholder="Enter subject line..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Call to Action</Label>
                                    <Input
                                        value={selectedVariant.callToAction}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            updateVariant(selectedVariant.id, 'callToAction', e.target.value)
                                        }
                                        placeholder="Enter call to action text..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Image URL</Label>
                                    <Input
                                        value={selectedVariant.imageUrl}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            updateVariant(selectedVariant.id, 'imageUrl', e.target.value)
                                        }
                                        placeholder="Enter image URL..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email Body</Label>
                                    <Textarea
                                        value={selectedVariant.emailBody}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                                            updateVariant(selectedVariant.id, 'emailBody', e.target.value)
                                        }
                                        placeholder="Enter email body..."
                                        className="min-h-[200px]"
                                    />
                                </div>
                            </div>

                            <Button onClick={handleSave} className="w-full">
                                Save Template
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Side - Preview */}
            <div className="space-y-4">
                <Card className="bg-white">
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex justify-between items-center border-b pb-4">
                                <img 
                                    src="https://www.aexp-static.com/cdaas/one/statics/axp-static-assets/1.8.0/package/dist/img/logos/dls-logo-bluebox-solid.svg" 
                                    alt="American Express"
                                    className="h-8"
                                />
                                <div className="text-sm text-gray-500">
                                    Business Communications
                                </div>
                            </div>

                            {/* Subject Line */}
                            <h2 className="text-2xl font-semibold text-[#006FCF]">
                                {selectedVariant.subjectLine || 'Subject Line'}
                            </h2>

                            {/* Image */}
                            {selectedVariant.imageUrl && (
                                <div className="flex justify-center">
                                    <img 
                                        src={selectedVariant.imageUrl} 
                                        alt="Email preview" 
                                        className="max-w-full h-auto rounded-lg shadow-md"
                                    />
                                </div>
                            )}

                            {/* Email Body */}
                            <div className="whitespace-pre-line text-gray-700 font-sans">
                                {selectedVariant.emailBody || 'Email body will appear here...'}
                            </div>

                            {/* CTA Button */}
                            {selectedVariant.callToAction && (
                                <div className="flex justify-center pt-4">
                                    <button className="bg-[#006FCF] text-white px-8 py-3 rounded font-semibold hover:bg-blue-700 transition-colors">
                                        {selectedVariant.callToAction}
                                    </button>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="border-t pt-4 mt-8 text-xs text-gray-500 space-y-2">
                                <img 
                                    src="https://image.member.americanexpress.com/lib/fe9013727565037a72/m/25/2022_v4.0_dllwi-footer.jpg"
                                    alt="Don't Live Life Without It"
                                    className="h-6 mb-4"
                                />
                                <p>
                                    Please do not reply to this email. This mailbox is not monitored.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-[#006FCF] hover:underline">Privacy Statement</a>
                                    <a href="#" className="text-[#006FCF] hover:underline">Contact Us</a>
                                    <a href="#" className="text-[#006FCF] hover:underline">Unsubscribe</a>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 