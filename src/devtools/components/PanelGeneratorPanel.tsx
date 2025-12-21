import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code, Copy, Download, CheckCircle, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const iconOptions = [
  'Activity', 'AlertCircle', 'Archive', 'BarChart', 'Bell', 'Book', 'Box',
  'Calendar', 'Camera', 'Check', 'Clock', 'Cloud', 'Code', 'Database',
  'FileText', 'Filter', 'Folder', 'GitBranch', 'Globe', 'Heart', 'Home',
  'Image', 'Inbox', 'Info', 'Layers', 'Layout', 'Link', 'List', 'Lock',
  'Mail', 'Map', 'MessageSquare', 'Music', 'Package', 'Settings', 'Share',
  'Shield', 'Star', 'Tag', 'Target', 'Terminal', 'TrendingUp', 'User',
  'Users', 'Video', 'Zap'
];

export function PanelGeneratorPanel() {
  const { toast } = useToast();
  const [panelId, setPanelId] = useState('');
  const [panelName, setPanelName] = useState('');
  const [panelIcon, setPanelIcon] = useState('Star');
  const [panelDescription, setPanelDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const componentName = panelName.replace(/\s+/g, '') + 'Panel';
  const fileName = panelId.replace(/_/g, '-') + '-panel.tsx';

  const generateCode = () => {
    return `import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ${panelIcon} } from 'lucide-react';

export function ${componentName}() {
  const handleAction = () => {
    console.log('${panelName} action triggered');
    // Add your custom logic here
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <${panelIcon} className="h-5 w-5" />
          ${panelName}
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          ${panelDescription || 'Custom panel description'}
        </p>
      </div>

      {/* Status Card */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <${panelIcon} className="h-4 w-4" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge className="bg-green-500/20 text-green-500">Active</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <span>Just now</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAction} className="w-full">
            Trigger Action
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}`;
  };

  const generateRegistration = () => {
    return `// Add to your icon rail sections array:
{ id: '${panelId}', label: '${panelName}', icon: ${panelIcon} }

// Import and add to panel switch:
import { ${componentName} } from '@/panels/${fileName.replace('.tsx', '')}';

// In your renderPanel function:
case '${panelId}':
  return <${componentName} />;`;
  };

  const handleCopy = () => {
    const fullCode = generateCode() + '\n\n// REGISTRATION:\n' + generateRegistration();
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Panel code copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: fileName });
  };

  const isValid = panelId.length > 0 && panelName.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Panel Generator
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Generate boilerplate for custom DevTools panels
        </p>
      </div>

      {/* Configuration Form */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Panel ID</Label>
            <Input
              placeholder="custom_metrics"
              value={panelId}
              onChange={(e) => setPanelId(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              className="bg-background/50 border-border"
            />
            <p className="text-xs text-muted-foreground">Lowercase with underscores</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Panel Name</Label>
            <Input
              placeholder="Custom Metrics"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              className="bg-background/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Icon</Label>
            <Select value={panelIcon} onValueChange={setPanelIcon}>
              <SelectTrigger className="bg-background/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {iconOptions.map((icon) => (
                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Description (Optional)</Label>
            <Textarea
              placeholder="What does this panel do?"
              value={panelDescription}
              onChange={(e) => setPanelDescription(e.target.value)}
              className="bg-background/50 border-border min-h-[60px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {isValid && (
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Generated Code
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <CheckCircle className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground bg-background/50 p-3 rounded-lg overflow-x-auto max-h-[200px] overflow-y-auto">
              {generateCode()}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p>1. Copy or download the generated code</p>
          <p>2. Create file: <code className="bg-background/50 px-1 rounded">src/panels/{fileName}</code></p>
          <p>3. Add the panel to your icon rail sections</p>
          <p>4. Add the case to your panel switch</p>
          <p>5. Customize the panel logic!</p>
        </CardContent>
      </Card>
    </div>
  );
}
