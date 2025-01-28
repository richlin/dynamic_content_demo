'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { supabase, type Segment } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface Recipient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    segments: string[];
}

export default function SegmentList() {
    const [segments, setSegments] = React.useState<Segment[]>([]);
    const [showNewSegmentForm, setShowNewSegmentForm] = React.useState(false);
    const [newSegment, setNewSegment] = React.useState({
        name: '',
        description: ''
    });

    // Load segments on mount
    React.useEffect(() => {
        loadSegments();
    }, []);

    const loadSegments = async () => {
        try {
            const { data, error } = await supabase
                .from('segments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSegments(data || []);
        } catch (error) {
            console.error('Error loading segments:', error);
            alert('Failed to load segments. Please try again.');
        }
    };

    const handleAddSegment = async () => {
        if (!newSegment.name.trim()) {
            alert('Please enter a segment name');
            return;
        }

        try {
            // Check if segment name already exists
            const { data: existingSegment, error: checkError } = await supabase
                .from('segments')
                .select('id')
                .eq('name', newSegment.name.trim())
                .single();

            if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
                throw checkError;
            }

            if (existingSegment) {
                alert('A segment with this name already exists. Please choose a different name.');
                return;
            }

            // Create the new segment
            const newSegmentData: Omit<Segment, 'created_at'> & { created_at: string } = {
                id: uuidv4(),
                name: newSegment.name.trim(),
                description: newSegment.description.trim() || '',
                created_at: new Date().toISOString()
            };

            const { error: insertError } = await supabase
                .from('segments')
                .insert([newSegmentData]);

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                throw new Error(`Failed to insert segment: ${insertError.message}`);
            }

            // Fetch the newly created segment to ensure we have the correct data
            const { data: newlyCreatedSegment, error: fetchError } = await supabase
                .from('segments')
                .select('*')
                .eq('id', newSegmentData.id)
                .single();

            if (fetchError) {
                throw new Error(`Failed to fetch new segment: ${fetchError.message}`);
            }

            setSegments([newlyCreatedSegment, ...segments]);
            setShowNewSegmentForm(false);
            setNewSegment({ name: '', description: '' });
        } catch (error) {
            console.error('Error adding segment:', error);
            alert(error instanceof Error ? `Failed to add segment: ${error.message}` : 'Failed to add segment. Please try again.');
        }
    };

    const handleRemoveSegment = async (segmentId: string) => {
        if (!window.confirm('Are you sure you want to remove this segment?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('segments')
                .delete()
                .eq('id', segmentId);

            if (error) throw error;

            setSegments(segments.filter(segment => segment.id !== segmentId));
        } catch (error) {
            console.error('Error removing segment:', error);
            alert('Failed to remove segment. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Segments</h2>
                            <Button onClick={() => setShowNewSegmentForm(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Segment
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {segments.map((segment) => (
                                <div
                                    key={segment.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <span className="font-medium">{segment.name}</span>
                                        {segment.description && (
                                            <span className="ml-2 text-sm text-gray-500">
                                                {segment.description}
                                            </span>
                                        )}
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
                                    No segments created yet
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* New Segment Form */}
            {showNewSegmentForm && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold">Create New Segment</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label>Segment Name</Label>
                                    <Input
                                        value={newSegment.name}
                                        onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                                        placeholder="Enter segment name..."
                                    />
                                </div>
                                <div>
                                    <Label>Description (Optional)</Label>
                                    <Input
                                        value={newSegment.description}
                                        onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                                        placeholder="Enter segment description..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowNewSegmentForm(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddSegment}>
                                    Create Segment
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 