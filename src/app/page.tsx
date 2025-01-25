import React from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplateEditor from '@/components/templates/template-editor';

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center space-x-4 px-4">
          <Image
            src="/amex-logo.svg"
            alt="American Express Logo"
            width={140}
            height={40}
            priority
          />
          <h1 className="text-xl font-semibold">Marketing Email Configuration - Demo</h1>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <Tabs defaultValue="template" className="space-y-4">
          <TabsList>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <TemplateEditor />
          </TabsContent>

          <TabsContent value="segments" className="space-y-4">
            <div>Segment configuration coming soon...</div>
          </TabsContent>

          <TabsContent value="recipients" className="space-y-4">
            <div>Recipient management coming soon...</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
