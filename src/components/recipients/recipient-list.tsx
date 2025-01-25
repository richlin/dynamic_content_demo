'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface Recipient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    segments: string[];
}

// Add UUID generation function
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const INITIAL_RECIPIENTS: Recipient[] = [
    {
        id: generateId(),
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@company.com',
        segments: ['high-spender', 'business-traveler']
    },
    {
        id: generateId(),
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@business.com',
        segments: ['budget-conscious']
    }
];

const AVAILABLE_SEGMENTS = [
    { id: 'high-spender', name: 'High Spender' },
    { id: 'business-traveler', name: 'Business Traveler' },
    { id: 'budget-conscious', name: 'Budget Conscious' }
];

export default function RecipientList() {
    const [recipients, setRecipients] = React.useState<Recipient[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('recipients');
            return saved ? JSON.parse(saved) : INITIAL_RECIPIENTS;
        }
        return INITIAL_RECIPIENTS;
    });

    const [newRecipient, setNewRecipient] = React.useState<Omit<Recipient, 'id'>>({
        firstName: '',
        lastName: '',
        email: '',
        segments: []
    });

    const saveToLocalStorage = (updatedRecipients: Recipient[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('recipients', JSON.stringify(updatedRecipients));
        }
    };

    const handleRemoveRecipient = (id: string) => {
        const updatedRecipients = recipients.filter(r => r.id !== id);
        setRecipients(updatedRecipients);
        saveToLocalStorage(updatedRecipients);
    };

    const handleAddRecipient = () => {
        if (!newRecipient.firstName || !newRecipient.lastName || !newRecipient.email) {
            alert('Please fill in all fields');
            return;
        }

        if (!newRecipient.email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        const newId = generateId();
        const updatedRecipients = [...recipients, { ...newRecipient, id: newId }];
        setRecipients(updatedRecipients);
        saveToLocalStorage(updatedRecipients);

        // Reset form
        setNewRecipient({
            firstName: '',
            lastName: '',
            email: '',
            segments: []
        });
    };

    return (
        <div className="space-y-6">
            {/* Add New Recipient */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Add New Recipient</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    value={newRecipient.firstName}
                                    onChange={(e) => setNewRecipient(prev => ({ ...prev, firstName: e.target.value }))}
                                    placeholder="Enter first name..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={newRecipient.lastName}
                                    onChange={(e) => setNewRecipient(prev => ({ ...prev, lastName: e.target.value }))}
                                    placeholder="Enter last name..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={newRecipient.email}
                                    onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Enter email address..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Segments</Label>
                                <Select
                                    value={newRecipient.segments.join(',')}
                                    onValueChange={(value) => setNewRecipient(prev => ({ ...prev, segments: value.split(',').filter(Boolean) }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select segments..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AVAILABLE_SEGMENTS.map(segment => (
                                            <SelectItem key={segment.id} value={segment.id}>
                                                {segment.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleAddRecipient} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Recipient
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recipients List */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Recipients</h2>
                            <span className="text-sm text-muted-foreground">
                                {recipients.length} total
                            </span>
                        </div>
                        <div className="divide-y">
                            {recipients.map((recipient) => (
                                <div key={recipient.id} className="py-4 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="font-medium">
                                            {recipient.firstName} {recipient.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {recipient.email}
                                        </div>
                                        <div className="flex gap-2">
                                            {recipient.segments.map(segmentId => (
                                                <span
                                                    key={segmentId}
                                                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
                                                >
                                                    {AVAILABLE_SEGMENTS.find(s => s.id === segmentId)?.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveRecipient(recipient.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 