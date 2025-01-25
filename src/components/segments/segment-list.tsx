'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Users } from "lucide-react";

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
    const [segments, setSegments] = React.useState<Segment[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('segments');
            return saved ? JSON.parse(saved) : INITIAL_SEGMENTS;
        }
        return INITIAL_SEGMENTS;
    });

    const [newSegmentName, setNewSegmentName] = React.useState('');
    const [recipients, setRecipients] = React.useState<Recipient[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('recipients');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    const saveToLocalStorage = (updatedSegments: Segment[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('segments', JSON.stringify(updatedSegments));
        }
    };

    const getRecipientCount = (segmentId: string) => {
        return recipients.filter(r => r.segments.includes(segmentId)).length;
    };

    const handleAddSegment = () => {
        if (!newSegmentName.trim()) {
            alert('Please enter a segment name');
            return;
        }

        const id = generateId(newSegmentName);
        if (segments.some(s => s.id === id)) {
            alert('A segment with a similar name already exists');
            return;
        }

        const updatedSegments = [...segments, { id, name: newSegmentName.trim() }];
        setSegments(updatedSegments);
        saveToLocalStorage(updatedSegments);
        setNewSegmentName('');
    };

    const handleRemoveSegment = (segmentId: string) => {
        // Check if segment is in use
        const recipientsInSegment = recipients.filter(r => r.segments.includes(segmentId));
        if (recipientsInSegment.length > 0) {
            alert(`Cannot remove segment. It is currently assigned to ${recipientsInSegment.length} recipient(s).`);
            return;
        }

        const updatedSegments = segments.filter(s => s.id !== segmentId);
        setSegments(updatedSegments);
        saveToLocalStorage(updatedSegments);
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
                            <span className="text-sm text-muted-foreground">
                                {segments.length} total
                            </span>
                        </div>
                        <div className="divide-y">
                            {segments.map((segment) => {
                                const recipientCount = getRecipientCount(segment.id);
                                return (
                                    <div key={segment.id} className="py-4 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="font-medium">
                                                {segment.name}
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Users className="w-4 h-4 mr-1" />
                                                {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveSegment(segment.id)}
                                            className="text-red-600 hover:text-red-700"
                                            disabled={recipientCount > 0}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 