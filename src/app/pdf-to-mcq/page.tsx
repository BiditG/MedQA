'use client'

import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export default function PdfToMcqPage() {
  return (
    <div className="w-full">
      <PageHeader
        title="PDF/Image → MCQ"
        subtitle="Turn study material into practice questions (UI only)."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pdf">
              <TabsList>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>
              <TabsContent value="pdf">
                <div className="mt-3 rounded-2xl border border-dashed p-6 text-center text-sm">
                  Drag & drop a PDF here, or{' '}
                  <Button variant="link">choose file</Button>
                </div>
              </TabsContent>
              <TabsContent value="image">
                <div className="mt-3 rounded-2xl border border-dashed p-6 text-center text-sm">
                  Drag & drop images here, or{' '}
                  <Button variant="link">choose files</Button>
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-4 flex items-center gap-2">
              <Badge className="bg-muted text-foreground/80">
                No files selected
              </Badge>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <label>Number of MCQs</label>
              <Input type="number" defaultValue={10} />
              <label>Difficulty</label>
              <Input placeholder="Easy/Medium/Hard" />
              <label>Include explanations</label>
              <Input type="checkbox" aria-label="Include explanations" />
              <label>Tags</label>
              <Input placeholder="Subject, Topic" />
              <div className="mt-2 flex gap-2">
                <Button disabled>Generate</Button>
                <Button variant="outline" disabled>
                  Export
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                We don’t upload your files in this demo.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="mt-2 h-16 w-full rounded-2xl" />
              <Skeleton className="mt-2 h-16 w-full rounded-2xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
