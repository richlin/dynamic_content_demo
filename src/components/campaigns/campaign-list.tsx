'use client';

import { supabase, type Campaign as DatabaseCampaign } from '@/lib/supabase';
import { Plus, Play, Pause, X, Loader2, Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const ASSIGNMENT_METHODS = [
    { id: 'random', name: 'Random Assignment' },
    { id: 'sequential', name: 'Sequential (A/B)' },
    { id: 'weighted', name: 'Weighted (70/30)' }
];

export default function CampaignList() {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <Construction className="w-12 h-12 text-yellow-500 animate-bounce" />
                        <h2 className="text-2xl font-semibold">Coming Soon!</h2>
                        <p className="text-gray-500 max-w-md">
                            The campaign management feature is currently under construction. 
                            We're working hard to bring you powerful tools for managing your email campaigns.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 