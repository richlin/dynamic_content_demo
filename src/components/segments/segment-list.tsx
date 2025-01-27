'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Users } from "lucide-react";
import { supabase } from '@/lib/supabase';

interface Segment {
    id: string;
    name: string;
}

interface Recipient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    segments: string[];
}

const INITIAL_SEGMENTS: Segment[] = [
    { id: 'high-spender', name: 'High Spender' },
    { id: 'business-traveler', name: 'Business Traveler' },
    { id: 'budget-conscious', name: 'Budget Conscious' }
];

const generateId = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

export default function SegmentList() {
    const [segments, setSegments] = React.useState<Segment[]>([]);
    const [newSegmentName, setNewSegmentName] = React.useState('');
    const [recipientCounts, setRecipientCounts] = React.useState<Record<string, number>>({});

    // Load segments and recipient counts on mount
    React.useEffect(() => {
        loadSegmentsAndCounts();
    }, []);

    const loadSegmentsAndCounts = async () => {
        try {
            // Get unique segments from recipients table
            const { data: segmentData, error: segmentError } = await supabase
                .from('recipients')
                .select('segment')
                .not('segment', 'is', null);

            if (segmentError) throw segmentError;

            // Convert to unique segments
            const uniqueSegments = Array.from(new Set(segmentData?.map(r => r.segment) || []));
            const formattedSegments = uniqueSegments.map(name => ({
                id: name,
                name: name
            }));

            setSegments(formattedSegments);

            // Get recipient counts for each segment
            const counts: Record<string, number> = {};
            for (const segment of uniqueSegments) {
                const { count } = await supabase
                    .from('recipients')
                    .select('*', { count: 'exact', head: true })
                    .eq('segment', segment);
                
                counts[segment] = count || 0;
            }
            setRecipientCounts(counts);
        } catch (error) {
            console.error('Error loading segments:', error);
            alert('Failed to load segments. Please try again.');
        }
    };

    const handleAddSegment = async () => {
        if (!newSegmentName.trim()) {
            alert('Please enter a segment name');
            return;
        }

        const segmentId = newSegmentName.trim();
        if (segments.some(s => s.id === segmentId)) {
            alert('A segment with this name already exists');
            return;
        }

        try {
            // We don't actually insert into a segments table
            // Instead, the segment becomes valid when it's used in a recipient
            setSegments([...segments, { id: segmentId, name: segmentId }]);
            setNewSegmentName('');
        } catch (error) {
            console.error('Error adding segment:', error);
            alert('Failed to add segment. Please try again.');
        }
    };

    const handleRemoveSegment = async (segmentId: string) => {
        // Check if segment is in use
        const { count } = await supabase
            .from('recipients')
            .select('*', { count: 'exact', head: true })
            .eq('segment', segmentId);

        if (count && count > 0) {
            alert(`Cannot remove segment. It is currently assigned to ${count} recipient(s).`);
            return;
        }

        setSegments(segments.filter(s => s.id !== segmentId));
    };

    return (
        <div className="space-y-6">
            {/* Add New Segment */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Add New Segment</h2>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <Label>Segment Name</Label>
                                <Input
                                    value={newSegmentName}
                                    onChange={(e) => setNewSegmentName(e.target.value)}
                                    placeholder="Enter segment name..."
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleAddSegment}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Segment
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Segments List */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Segments</h2>
                            <span className="text-sm text-gray-500">Total: {segments.length}</span>
                        </div>
                        <div className="space-y-2">
                            {segments.map((segment) => (
                                <div
                                    key={segment.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <span className="font-medium">{segment.name}</span>
                                        <span className="ml-2 text-sm text-gray-500">
                                            ({recipientCounts[segment.id] || 0} recipients)
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveSegment(segment.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {segments.length === 0 && (
                                <div className="text-center text-gray-500 py-4">
                                    No segments added yet
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 