'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { supabase, type Recipient } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function RecipientList() {
    const [recipients, setRecipients] = React.useState<Recipient[]>([]);
    const [segments, setSegments] = React.useState<string[]>([]);
    const [newRecipient, setNewRecipient] = React.useState<Omit<Recipient, 'id'>>({
        first_name: '',
        email: '',
        segment: ''
    });

    // Load recipients and segments on mount
    React.useEffect(() => {
        loadRecipientsAndSegments();
    }, []);

    const loadRecipientsAndSegments = async () => {
        try {
            // Load recipients
            const { data: recipientsData, error: recipientsError } = await supabase
                .from('recipients')
                .select('*')
                .order('first_name');

            if (recipientsError) throw recipientsError;
            setRecipients(recipientsData || []);

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
            alert('Failed to load recipients. Please try again.');
        }
    };

    const handleRemoveRecipient = async (id: string) => {
        try {
            const { error } = await supabase
                .from('recipients')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRecipients(recipients.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error removing recipient:', error);
            alert('Failed to remove recipient. Please try again.');
        }
    };

    const handleAddRecipient = async () => {
        if (!newRecipient.first_name || !newRecipient.email || !newRecipient.segment) {
            alert('Please fill in all fields');
            return;
        }

        if (!newRecipient.email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        try {
            const recipientWithId = {
                id: uuidv4(),
                ...newRecipient
            };

            const { error } = await supabase
                .from('recipients')
                .insert([recipientWithId]);

            if (error) throw error;

            setRecipients([...recipients, recipientWithId]);

            // Reset form
            setNewRecipient({
                first_name: '',
                email: '',
                segment: ''
            });
        } catch (error) {
            console.error('Error adding recipient:', error);
            alert('Failed to add recipient. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Add New Recipient */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Add New Recipient</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>First Name</Label>
                                <Input
                                    value={newRecipient.first_name}
                                    onChange={(e) => setNewRecipient({ ...newRecipient, first_name: e.target.value })}
                                    placeholder="Enter first name..."
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={newRecipient.email}
                                    onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                                    placeholder="Enter email..."
                                />
                            </div>
                            <div>
                                <Label>Segment</Label>
                                <Select
                                    value={newRecipient.segment}
                                    onValueChange={(value) => setNewRecipient({ ...newRecipient, segment: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a segment..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {segments.map((segment) => (
                                            <SelectItem key={segment} value={segment}>
                                                {segment}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleAddRecipient}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Recipient
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recipients List */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Recipients</h2>
                            <span className="text-sm text-gray-500">Total: {recipients.length}</span>
                        </div>
                        <div className="space-y-2">
                            {recipients.map((recipient) => (
                                <div
                                    key={recipient.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <span className="font-medium">{recipient.first_name}</span>
                                        <span className="ml-2 text-sm text-gray-500">
                                            {recipient.email}
                                        </span>
                                        <span className="ml-2 text-sm text-blue-500">
                                            {recipient.segment}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveRecipient(recipient.id)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            {recipients.length === 0 && (
                                <div className="text-center text-gray-500 py-4">
                                    No recipients added yet
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 