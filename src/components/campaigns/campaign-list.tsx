'use client';

import { supabase } from '@/lib/supabase';
import { Plus, Play, Pause, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Recipient, SegmentVariantRule } from '@/lib/supabase';

interface Campaign {
    id: string;
    name: string;
    segments: string[];
    start_date: string;
    end_date: string;
    assignment_method: 'random' | 'sequential';
    status: 'draft' | 'active' | 'paused' | 'completed';
}

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

export default function CampaignList() {
    const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
    const [segments, setSegments] = React.useState<string[]>([]);
    const [isTestRunning, setIsTestRunning] = React.useState(false);
    const [showNewCampaignForm, setShowNewCampaignForm] = React.useState(false);
    const [newCampaign, setNewCampaign] = React.useState<Omit<Campaign, 'id'>>({
        name: '',
        segments: [],
        start_date: '',
        end_date: '',
        assignment_method: 'random',
        status: 'draft'
    });

    // Load campaigns and segments on mount
    React.useEffect(() => {
        loadCampaignsAndSegments();
    }, []);

    const loadCampaignsAndSegments = async () => {
        try {
            // Load campaigns
            const { data: campaignsData, error: campaignsError } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false });

            if (campaignsError) throw campaignsError;
            setCampaigns(campaignsData || []);

            // Get unique segments
            const { data: segmentData, error: segmentError } = await supabase
                .from('recipients')
                .select('segment')
                .not('segment', 'is', null);

            if (segmentError) throw segmentError;

            const uniqueSegments = Array.from(new Set(segmentData?.map(r => r.segment) || []));
            setSegments(uniqueSegments);

        } catch (error) {
            console.error('Error loading data:', error);
            alert('Failed to load campaigns. Please try again.');
        }
    };

    const handleAddCampaign = async () => {
        if (!newCampaign.name || !newCampaign.start_date || !newCampaign.end_date || newCampaign.segments.length === 0) {
            alert('Please fill in all required fields and add at least one segment');
            return;
        }

        try {
            const campaignWithId = {
                id: uuidv4(),
                ...newCampaign
            };

            const { error } = await supabase
                .from('campaigns')
                .insert([campaignWithId]);

            if (error) throw error;

            setCampaigns([campaignWithId, ...campaigns]);
            setShowNewCampaignForm(false);
            setNewCampaign({
                name: '',
                segments: [],
                start_date: '',
                end_date: '',
                assignment_method: 'random',
                status: 'draft'
            });
        } catch (error) {
            console.error('Error adding campaign:', error);
            alert('Failed to add campaign. Please try again.');
        }
    };

    const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ status: newStatus })
                .eq('id', campaignId);

            if (error) throw error;

            setCampaigns(campaigns.map(campaign =>
                campaign.id === campaignId ? { ...campaign, status: newStatus } : campaign
            ));
        } catch (error) {
            console.error('Error updating campaign status:', error);
            alert('Failed to update campaign status. Please try again.');
        }
    };

    const handleTestRun = async (campaignId: string) => {
        setIsTestRunning(true);
        try {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (!campaign) throw new Error('Campaign not found');

            // Get recipients for each segment in the campaign
            for (const segment of campaign.segments) {
                const { data: recipients, error: recipientsError } = await supabase
                    .from('recipients')
                    .select('*')
                    .eq('segment', segment);

                if (recipientsError) throw recipientsError;
                if (!recipients || recipients.length === 0) continue;

                // Get variant rules for this segment
                const { data: rules, error: rulesError } = await supabase
                    .from('segment_variant_rules')
                    .select('*')
                    .eq('segment', segment);

                if (rulesError) throw rulesError;
                if (!rules || rules.length === 0) continue;

                // Send test emails to recipients
                for (const recipient of recipients) {
                    // Randomly select a variant
                    const variant = rules[Math.floor(Math.random() * rules.length)];
                    
                    if (!variant) continue;

                    // Send the email
                    const response = await fetch('/api/send-test-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            recipient,
                            variant
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to send email to ${recipient.email}`);
                    }

                    // Record the email send
                    const { error: sendError } = await supabase
                        .from('email_sends')
                        .insert([{
                            id: uuidv4(),
                            recipient_id: recipient.id,
                            variant_rule_id: variant.id,
                            variation_used: variant.variation_key,
                            timestamp_sent: new Date().toISOString()
                        }]);

                    if (sendError) throw sendError;
                }
            }

            alert('Test run completed successfully!');
        } catch (error) {
            console.error('Error running test:', error);
            alert('Failed to complete test run. Please check the console for details.');
        } finally {
            setIsTestRunning(false);
        }
    };

    const handleRemoveCampaign = async (campaignId: string) => {
        if (!window.confirm('Are you sure you want to remove this campaign?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('campaigns')
                .delete()
                .eq('id', campaignId);

            if (error) throw error;

            setCampaigns(campaigns.filter(campaign => campaign.id !== campaignId));
        } catch (error) {
            console.error('Error removing campaign:', error);
            alert('Failed to remove campaign. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Campaign List */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
                            <Button onClick={() => setShowNewCampaignForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Campaign
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {campaigns.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <span className="font-medium">{campaign.name}</span>
                                        <span className="ml-2 text-sm text-gray-500">
                                            {campaign.segments.join(', ')}
                                        </span>
                                        <span className={`ml-2 text-sm ${
                                            campaign.status === 'active' ? 'text-green-500' :
                                            campaign.status === 'paused' ? 'text-yellow-500' :
                                            campaign.status === 'completed' ? 'text-blue-500' :
                                            'text-gray-500'
                                        }`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleTestRun(campaign.id)}
                                            disabled={isTestRunning}
                                        >
                                            {isTestRunning ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Play className="w-4 h-4 mr-2" />
                                            )}
                                            Test Run
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStatusChange(
                                                campaign.id,
                                                campaign.status === 'active' ? 'paused' : 'active'
                                            )}
                                        >
                                            {campaign.status === 'active' ? (
                                                <>
                                                    <Pause className="w-4 h-4 mr-2" />
                                                    Pause
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Activate
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveCampaign(campaign.id)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {campaigns.length === 0 && (
                                <div className="text-center text-gray-500 py-4">
                                    No campaigns created yet
                                </div>
                            )}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Campaign Name</Label>
                                    <Input
                                        value={newCampaign.name}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                                        placeholder="Enter campaign name..."
                                    />
                                </div>
                                <div>
                                    <Label>Segments</Label>
                                    <Select
                                        value={newCampaign.segments.join(',')}
                                        onValueChange={(value) => setNewCampaign({
                                            ...newCampaign,
                                            segments: value.split(',').filter(Boolean)
                                        })}
                                    >
                                        <option value="">Select segments...</option>
                                        {segments.map((segment) => (
                                            <option key={segment} value={segment}>
                                                {segment}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"
                                        value={newCampaign.start_date}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={newCampaign.end_date}
                                        onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Assignment Method</Label>
                                    <Select
                                        value={newCampaign.assignment_method}
                                        onValueChange={(value) => setNewCampaign({
                                            ...newCampaign,
                                            assignment_method: value as 'random' | 'sequential'
                                        })}
                                    >
                                        <option value="random">Random</option>
                                        <option value="sequential">Sequential</option>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowNewCampaignForm(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddCampaign}>
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