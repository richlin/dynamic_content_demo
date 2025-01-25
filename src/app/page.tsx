"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { FileText, Mail, Users, PlayCircle } from 'lucide-react';

// Import TemplateEditor dynamically to avoid hydration issues
const TemplateEditor = dynamic(() => import('@/components/templates/template-editor'), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => <div>Loading editor...</div>
});

const RecipientList = dynamic(() => import('@/components/recipients/recipient-list'), {
  ssr: false,
  loading: () => <div>Loading recipients...</div>
});

const SegmentList = dynamic(() => import('@/components/segments/segment-list'), {
  ssr: false,
  loading: () => <div>Loading segments...</div>
});

const CampaignList = dynamic(() => import('@/components/campaigns/campaign-list'), {
  ssr: false,
  loading: () => <div>Loading campaigns...</div>
});

export default function Page() {
  const [activeTab, setActiveTab] = React.useState("template");
  const [mounted, setMounted] = React.useState(false);

  // Handle mounting to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Template', url: '#template', icon: FileText },
    { name: 'Segments', url: '#segments', icon: Users },
    { name: 'Recipients', url: '#recipients', icon: Mail },
    { name: 'Campaigns', url: '#campaigns', icon: PlayCircle }
  ];

  const handleNavClick = (item: string) => {
    const tabValue = item.toLowerCase();
    setActiveTab(tabValue);
  };

  if (!mounted) {
    return null; // Return null on server-side
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container px-4">
          {/* Top bar with logo */}
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="https://www.aexp-static.com/cdaas/one/statics/axp-static-assets/1.8.0/package/dist/img/logos/dls-logo-bluebox-solid.svg"
                alt="American Express Logo"
                width={32}
                height={32}
                priority
                className="h-8 w-auto"
              />
              <div className="h-6 w-px bg-border" />
              <h1 className="text-lg font-medium">Marketing Email Configuration</h1>
            </div>
            <div className="text-sm text-muted-foreground">Demo</div>
          </div>
          
          {/* Navigation bar */}
          <div className="flex justify-center -mb-px">
            <NavBar 
              items={navItems.map(item => ({
                ...item,
                url: `#${item.name.toLowerCase()}`,
                onClick: () => handleNavClick(item.name)
              }))} 
              className="relative bottom-0 sm:top-0 transform-none !fixed-none !mb-0 !pt-0"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 mt-28">
        <Tabs value={activeTab} className="space-y-4">
          <TabsContent value="template" className="mt-6 space-y-4">
            <TemplateEditor />
          </TabsContent>

          <TabsContent value="segments" className="mt-6 space-y-4">
            <SegmentList />
          </TabsContent>

          <TabsContent value="recipients" className="mt-6 space-y-4">
            <RecipientList />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6 space-y-4">
            <CampaignList />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
