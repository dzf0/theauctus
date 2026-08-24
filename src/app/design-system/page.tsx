"use client";

import { useState } from "react";
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Modal, ToastContainer, useToast } from "@/components/ui";

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { toasts, toast, dismissToast } = useToast();

  return (
    <div className="min-h-screen p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-headline text-4xl text-[#F5F0EB] mb-2">
            Design System
          </h1>
          <p className="text-[14px] text-[#6B6560]">
            TheAuctus component library and design tokens
          </p>
        </div>

        {/* Colors */}
        <section className="mb-12">
          <h2 className="font-headline text-2xl text-[#F5F0EB] mb-6">
            Colors
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Primary", hex: "#C9A87C" },
              { name: "Primary Hover", hex: "#B8956A" },
              { name: "Background", hex: "#0F0F0F" },
              { name: "Surface", hex: "#1A1A1A" },
              { name: "Border", hex: "#2A2A2A" },
              { name: "Text Primary", hex: "#F5F0EB" },
              { name: "Text Secondary", hex: "#9A9590" },
              { name: "Text Tertiary", hex: "#6B6560" },
              { name: "Success", hex: "#7CB87C" },
              { name: "Warning", hex: "#E5C07B" },
              { name: "Error", hex: "#E06C75" },
              { name: "Info", hex: "#61AFEF" },
            ].map((color) => (
              <div key={color.name}>
                <div
                  className="w-full h-16 rounded-lg border border-[#2A2A2A] mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-[12px] text-[#F5F0EB]">{color.name}</p>
                <p className="text-[11px] text-[#6B6560] font-mono">{color.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="font-headline text-2xl text-[#F5F0EB] mb-6">
            Typography
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">Display</p>
              <p className="font-headline text-[48px] text-[#F5F0EB] leading-tight">The quick brown fox</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">H1</p>
              <p className="font-headline text-[36px] text-[#F5F0EB] leading-tight">The quick brown fox</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">H2</p>
              <p className="font-headline text-[28px] text-[#F5F0EB] leading-tight">The quick brown fox</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">H3</p>
              <p className="font-headline text-[20px] text-[#F5F0EB] leading-tight">The quick brown fox</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">Body</p>
              <p className="text-[14px] text-[#F5F0EB] leading-relaxed">The quick brown fox jumps over the lazy dog. This is body text at 14px.</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-2">Caption</p>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560]">Caption text with tracking</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="font-headline text-2xl text-[#F5F0EB] mb-6">
            Buttons
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-4">Variants</p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-4">Sizes</p>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560] mb-4">States</p>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="mb-12">
          <h2 className="font-headline text-2xl text-[#F5F0EB] mb-6">
            Inputs
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Email" placeholder="you@example.com" />
            <Input label="With Error" placeholder="Invalid input" error="This field is required" />
            <Input label="With Hint" placeholder="Optional" hint="This is a hint" />
            <Input label="Search" placeholder="Search..." icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            } />
            <div className="md:col-span-2">
              <Textarea label="Message" placeholder="Tell us more..." />
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-12">
          <h2 className="font-headline text-2xl text-[#F5F0EB] mb-6">
            Cards
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>This is a default card variant</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-[#9A9590]">Card content goes here.</p>
              </CardContent>
            </Card>
            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover to see the effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-[#9A9590]">Click or hover this card.</p>
              </CardContent>
            </Card>
            <Card variant="selected">
              <CardHeader>
                <CardTitle>Selected Card</CardTitle>
                <CardDescription>This card is selected</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] text-[#9A9590]">Active/selected state.</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Card variant="stat">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.1em] text-[#6B6560]">Credits</p>
                  <p className="font-headline text-[32px] text-[#F5F0EB]">42</p>
                </div>
                <Badge variant="primary">Active</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-12">
          <h2 className="font-headline text-2xl text-[#F5F0EB] mb-6">
            Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </section>

        {/* Modal */}
        <section className="mb-12">
          <h2 className="font-headline text-2xl text-[#F5F0EB] mb-6">
            Modal
          </h2>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            description="This is a modal dialog component."
          >
            <div className="space-y-4">
              <Input label="Name" placeholder="Enter your name" />
              <Input label="Email" placeholder="Enter your email" />
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>
        </section>

        {/* Toasts */}
        <section className="mb-12">
          <h2 className="font-headline text-2xl text-[#F5F0EB] mb-6">
            Toast Notifications
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" onClick={() => toast.success("Changes saved successfully!")}>
              Success Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.error("Something went wrong.")}>
              Error Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.info("Here's some information.")}>
              Info Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.warning("Please be careful.")}>
              Warning Toast
            </Button>
          </div>
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </section>
      </div>
    </div>
  );
}
