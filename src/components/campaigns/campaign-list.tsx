'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, Play, Pause, Send, Users, X, Loader2 } from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    segments: Array<{
        id: string;  // Unique ID for this segment-variants pair
        segmentId: string;
        variants: string[];  // Array of variant IDs
    }>;
    startDate: string;
    endDate: string;
    assignmentMethod: 'random' | 'sequential' | 'weighted';
    status: 'active' | 'inactive' | 'draft';
}

const INITIAL_CAMPAIGNS: Campaign[] = [
    {
        id: 'campaign-1',
        name: 'Q1 Business Rewards',
        segments: [
            { 
                id: 'seg1',
                segmentId: 'high-spender',
                variants: ['variant-a', 'variant-b']
            },
            { 
                id: 'seg2',
                segmentId: 'business-traveler',
                variants: ['variant-a', 'variant-b']
            }
        ],
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        assignmentMethod: 'random',
        status: 'active'
    }
];

const ASSIGNMENT_METHODS = [
    { id: 'random', name: 'Random Assignment' },
    { id: 'sequential', name: 'Sequential (A/B)' },
    { id: 'weighted', name: 'Weighted (70/30)' }
];

const INITIAL_SEGMENTS = [
    { id: 'high-spender', name: 'High Spender' },
    { id: 'business-traveler', name: 'Business Traveler' },
    { id: 'budget-conscious', name: 'Budget Conscious' }
];

const INITIAL_VARIANTS = [
    { id: 'variant-a', name: 'Variant A' },
    { id: 'variant-b', name: 'Variant B' }
];

interface SelectedSegment {
    id: string;
    segmentId: string;
    variants: string[];
}

// Add this interface for recipients
interface Recipient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    segments: string[];
}

// Add this interface for variants
interface Variant {
    id: string;
    name: string;
    subject: string;
    emailBody: string;
}

export default function CampaignList() {
    const [campaigns, setCampaigns] = React.useState<Campaign[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('campaigns');
            return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
        }
        return INITIAL_CAMPAIGNS;
    });

    const [segments, setSegments] = React.useState<Array<{ id: string; name: string }>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('segments');
            return saved ? JSON.parse(saved) : INITIAL_SEGMENTS;
        }
        return INITIAL_SEGMENTS;
    });

    const [selectedSegments, setSelectedSegments] = React.useState<SelectedSegment[]>([]);
    const [variants, setVariants] = React.useState<Array<{ id: string; name: string }>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('variants');
            return saved ? JSON.parse(saved) : INITIAL_VARIANTS;
        }
        return INITIAL_VARIANTS;
    });

    const [newCampaign, setNewCampaign] = React.useState<Omit<Campaign, 'id'>>({
        name: '',
        segments: [],
        startDate: '',
        endDate: '',
        assignmentMethod: 'random',
        status: 'draft'
    });

    const [showNewCampaignForm, setShowNewCampaignForm] = React.useState(false);
    const [isTestRunning, setIsTestRunning] = React.useState(false);

    const saveToLocalStorage = (updatedCampaigns: Campaign[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));
        }
    };

    const handleAddCampaign = () => {
        if (!newCampaign.name || !newCampaign.startDate || !newCampaign.endDate || selectedSegments.length === 0) {
            alert('Please fill in all required fields and add at least one segment');
            return;
        }

        // Validate that all segments have both segment and variants selected
        const hasIncompleteSegments = selectedSegments.some(
            seg => !seg.segmentId || seg.variants.length === 0
        );

        if (hasIncompleteSegments) {
            alert('Please select both segment and at least one variant for all entries');
            return;
        }

        const id = `campaign-${Date.now()}`;
        const updatedCampaigns = [...campaigns, { 
            ...newCampaign, 
            id,
            segments: selectedSegments 
        }];
        
        setCampaigns(updatedCampaigns);
        saveToLocalStorage(updatedCampaigns);
        setShowNewCampaignForm(false);
        setNewCampaign({
            name: '',
            segments: [],
            startDate: '',
            endDate: '',
            assignmentMethod: 'random',
            status: 'draft'
        });
    };

    const handleStatusChange = (campaignId: string, newStatus: Campaign['status']) => {
        const updatedCampaigns = campaigns.map(campaign =>
            campaign.id === campaignId ? { ...campaign, status: newStatus } : campaign
        );
        setCampaigns(updatedCampaigns);
        saveToLocalStorage(updatedCampaigns);
    };

    const handleTestRun = async (campaign: Campaign) => {
        try {
            setIsTestRunning(true);

            // Get recipients from localStorage
            const savedRecipients = localStorage.getItem('recipients');
            const recipients: Recipient[] = savedRecipients ? JSON.parse(savedRecipients) : [];

            // Get variants from localStorage with full details
            const savedVariants = localStorage.getItem('variants');
            const variants: Variant[] = savedVariants ? JSON.parse(savedVariants) : [];

            // For each segment in the campaign
            for (const segment of campaign.segments) {
                // Get recipients for this segment
                const segmentRecipients = recipients.filter(r => 
                    r.segments.includes(segment.segmentId)
                );

                // For each recipient in the segment
                for (const recipient of segmentRecipients) {
                    // Randomly select a variant from the segment's variants
                    const randomVariantId = segment.variants[
                        Math.floor(Math.random() * segment.variants.length)
                    ];
                    const selectedVariant = variants.find(v => v.id === randomVariantId);

                    if (!selectedVariant) continue;

                    // Send test email
                    const response = await fetch('/api/send-test-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            recipient,
                            variant: selectedVariant,
                            campaignName: campaign.name
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to send email to ${recipient.email}`);
                    }
                }
            }

            alert('Test run completed successfully! Emails have been sent to all recipients.');
        } catch (error) {
            console.error('Test run failed:', error);
            alert('Failed to complete test run. Please check the console for details.');
        } finally {
            setIsTestRunning(false);
        }
    };

    const handleRemoveCampaign = (campaignId: string) => {
        if (window.confirm('Are you sure you want to remove this campaign?')) {
            const updatedCampaigns = campaigns.filter(campaign => campaign.id !== campaignId);
            setCampaigns(updatedCampaigns);
            saveToLocalStorage(updatedCampaigns);
        }
    };

    // Add useEffect to sync with localStorage
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSegments = localStorage.getItem('segments');
            const savedVariants = localStorage.getItem('variants');
            
            if (!savedSegments) {
                localStorage.setItem('segments', JSON.stringify(INITIAL_SEGMENTS));
                setSegments(INITIAL_SEGMENTS);
            }
            
            if (!savedVariants) {
                localStorage.setItem('variants', JSON.stringify(INITIAL_VARIANTS));
                setVariants(INITIAL_VARIANTS);
            }
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Campaign List */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
                            <Button onClick={() => {
                                setShowNewCampaignForm(true);
                                setSelectedSegments([]);
                            }}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Campaign
                            </Button>
                        </div>
                        <div className="divide-y">
                            {campaigns?.map((campaign) => (
                                <div key={campaign.id} className="py-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-medium">{campaign.name}</h3>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {format(new Date(campaign.startDate), 'MMM d, yyyy')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleTestRun(campaign)}
                                                disabled={isTestRunning}
                                            >
                                                {isTestRunning ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Test Run
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant={campaign.status === 'active' ? 'destructive' : 'default'}
                                                size="sm"
                                                onClick={() => handleStatusChange(campaign.id, campaign.status === 'active' ? 'inactive' : 'active')}
                                            >
                                                {campaign.status === 'active' ? (
                                                    <><Pause className="w-4 h-4 mr-2" /> Deactivate</>
                                                ) : (
                                                    <><Play className="w-4 h-4 mr-2" /> Activate</>
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveCampaign(campaign.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="text-muted-foreground mb-1">Segments and Variants:</div>
                                            <div className="flex flex-col gap-2">
                                                {campaign.segments?.map((segment) => (
                                                    <div key={`${campaign.id}-${segment.id}`} className="flex items-center gap-2">
                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                                            {segments.find(s => s.id === segment.segmentId)?.name || segment.segmentId}
                                                        </span>
                                                        <span className="text-muted-foreground">→</span>
                                                        <div className="flex gap-2">
                                                            {segment.variants?.map(variantId => (
                                                                <span 
                                                                    key={`${campaign.id}-${segment.id}-${variantId}`} 
                                                                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs"
                                                                >
                                                                    {variants.find(v => v.id === variantId)?.name || variantId}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground mb-1">Assignment Method:</div>
                                            <div>{ASSIGNMENT_METHODS.find(m => m.id === campaign.assignmentMethod)?.name}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* New Campaign Form */}
            {showNewCampaignForm && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Create New Campaign</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <Label>Campaign Name</Label>
                                    <Input
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter campaign name..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={newCampaign.startDate}
                                        onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={newCampaign.endDate}
                                        onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-4 col-span-2">
                                    <Label>Segments and Variants</Label>
                                    <div className="space-y-4">
                                        {selectedSegments.map((selected, index) => (
                                            <div key={selected.id} className="flex gap-4 items-start">
                                                <div className="flex-1">
                                                    <Label className="mb-2">Segment</Label>
                                                    <Select
                                                        value={selected.segmentId}
                                                        onValueChange={(value) => {
                                                            const newSegments = [...selectedSegments];
                                                            newSegments[index].segmentId = value;
                                                            setSelectedSegments(newSegments);
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select segment..." />
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
                                                <div className="flex-1">
                                                    <Label className="mb-2">Variants</Label>
                                                    <div className="border rounded-md p-4 space-y-2">
                                                        {variants.map(variant => (
                                                            <div key={`${selected.id}-${variant.id}`} className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`${selected.id}-${variant.id}`}
                                                                    checked={selected.variants.includes(variant.id)}
                                                                    onChange={() => {
                                                                        const newSegments = [...selectedSegments];
                                                                        const variantIndex = newSegments[index].variants.indexOf(variant.id);
                                                                        if (variantIndex === -1) {
                                                                            newSegments[index].variants.push(variant.id);
                                                                        } else {
                                                                            newSegments[index].variants.splice(variantIndex, 1);
                                                                        }
                                                                        setSelectedSegments(newSegments);
                                                                    }}
                                                                    className="h-4 w-4"
                                                                />
                                                                <label 
                                                                    htmlFor={`${selected.id}-${variant.id}`}
                                                                    className="text-sm cursor-pointer flex-grow"
                                                                >
                                                                    {variant.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                        <div className="flex gap-2 mt-2 pt-2 border-t">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newSegments = [...selectedSegments];
                                                                    newSegments[index].variants = variants.map(v => v.id);
                                                                    setSelectedSegments(newSegments);
                                                                }}
                                                            >
                                                                Select All
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newSegments = [...selectedSegments];
                                                                    newSegments[index].variants = [];
                                                                    setSelectedSegments(newSegments);
                                                                }}
                                                            >
                                                                Clear All
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {selected.variants.length > 0 && (
                                                        <div className="text-sm text-muted-foreground mt-2">
                                                            {selected.variants.length} variant{selected.variants.length > 1 ? 's' : ''} selected
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="mt-8"
                                                    onClick={() => {
                                                        const newSegments = selectedSegments.filter((_, i) => i !== index);
                                                        setSelectedSegments(newSegments);
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedSegments([...selectedSegments, { 
                                                id: `seg-${Date.now()}`,
                                                segmentId: '',
                                                variants: []
                                            }])}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Segment
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Assignment Method</Label>
                                    <Select
                                        value={newCampaign.assignmentMethod}
                                        onValueChange={(value: Campaign['assignmentMethod']) => 
                                            setNewCampaign(prev => ({ ...prev, assignmentMethod: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select method..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ASSIGNMENT_METHODS.map(method => (
                                                <SelectItem key={method.id} value={method.id}>
                                                    {method.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <Button variant="outline" onClick={() => {
                                    setShowNewCampaignForm(false);
                                    setSelectedSegments([]);
                                }}>
                                    Cancel
                                </Button>
                                <Button onClick={() => {
                                    handleAddCampaign();
                                    setSelectedSegments([]);
                                }}>
                                    Create Campaign
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 