import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  AudioLines, 
  Image, 
  FileText,
  Loader2,
  Wand2
} from 'lucide-react';

const demoTools = [
  {
    id: 'text-gen',
    name: 'Text Generation',
    description: 'Generate creative text using AI',
    icon: FileText,
    color: 'blue',
  },
  {
    id: 'image-gen',
    name: 'Image Generation',
    description: 'Create images from text prompts',
    icon: Image,
    color: 'purple',
  },
  {
    id: 'tts',
    name: 'Text to Speech',
    description: 'Convert text to natural speech',
    icon: AudioLines,
    color: 'green',
  },
];

export default function Demo() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter a prompt to continue',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setResult(`Demo result for "${prompt}" using ${selectedTool}. In production, this would connect to real AI APIs.`);
    setIsProcessing(false);
    
    toast({
      title: 'Generation complete',
      description: 'Your demo result is ready',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-signal-amber/30 bg-signal-amber/10 mb-4">
              <Sparkles className="w-4 h-4 text-signal-amber" />
              <span className="font-mono text-xs text-signal-amber">DEMO MODE</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Try Our AI Tools
            </h1>
            <p className="font-mono text-muted-foreground">
              Experience the power of shared APIs - no keys required
            </p>
          </div>

          {/* Tool selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {demoTools.map((tool) => (
              <Card 
                key={tool.id}
                className={`cursor-pointer transition-all ${
                  selectedTool === tool.id 
                    ? 'border-signal-blue ring-1 ring-signal-blue/30' 
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedTool(tool.id)}
              >
                <CardHeader className="pb-2">
                  <div className={`w-10 h-10 rounded-lg bg-signal-${tool.color}/10 border border-signal-${tool.color}/30 flex items-center justify-center mb-2`}>
                    <tool.icon className={`w-5 h-5 text-signal-${tool.color}`} />
                  </div>
                  <CardTitle className="font-mono text-sm">{tool.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Input area */}
          {selectedTool && (
            <Card className="terminal-glass">
              <CardHeader>
                <CardTitle className="font-mono text-sm flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-signal-cyan" />
                  Enter your prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe what you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="terminal-input min-h-[120px] resize-none"
                  disabled={isProcessing}
                />
                
                <Button
                  onClick={handleGenerate}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full bg-signal-green hover:bg-signal-green/90 text-background font-mono"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      GENERATE
                    </>
                  )}
                </Button>

                {/* Result */}
                {result && (
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <p className="font-mono text-sm text-foreground">{result}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
