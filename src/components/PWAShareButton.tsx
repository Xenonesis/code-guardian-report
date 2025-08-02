import React from 'react';
import { Button } from './ui/button';
import { Share2, Copy, Check } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { toast } from 'sonner';

interface PWAShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function PWAShareButton({ 
  title = 'Code Guardian Enterprise',
  text = 'Check out this AI-powered security analysis platform',
  url = window.location.href,
  className,
  variant = 'outline',
  size = 'default'
}: PWAShareButtonProps) {
  const { shareContent } = usePWA();
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const shareData = { title, text, url };
    
    // Try native share first
    const shared = await shareContent(shareData);
    
    if (!shared) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to share or copy link');
      }
    } else {
      toast.success('Content shared successfully!');
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
    >
      {copied ? (
        <Check className="h-4 w-4 mr-2" />
      ) : (
        <Share2 className="h-4 w-4 mr-2" />
      )}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
}