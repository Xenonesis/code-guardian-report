import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pdfExportService } from '../../services/export/pdfExportService';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { NotificationTemplates } from '@/utils/notificationTemplates';
import { toast } from 'sonner';

import { logger } from '@/utils/logger';
interface PDFDownloadButtonProps {
  results: AnalysisResults;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
  customTitle?: string;
}

export const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  results,
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  customTitle
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!results) {
      toast.error('No analysis results available for download');
      return;
    }

    setIsGenerating(true);
    
    try {
      const pdfBlob = await pdfExportService.generateReport(results, {
        customTitle
      });

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `code-guardian-report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      // Show success notification
      toast.success(
        NotificationTemplates.exportSuccess('PDF').title,
        {
          description: NotificationTemplates.exportSuccess('PDF').description
        }
      );
    } catch (error) {
      logger.error('PDF generation failed:', error);
      toast.error(
        NotificationTemplates.exportError().title,
        {
          description: NotificationTemplates.exportError().description
        }
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating || !results}
      variant={variant}
      size={size}
      className={`${className} ${isGenerating ? 'cursor-not-allowed' : ''}`}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : showIcon ? (
        <Download className="h-4 w-4 mr-2" />
      ) : (
        <FileText className="h-4 w-4 mr-2" />
      )}
      {isGenerating ? 'Generating PDF...' : 'Download Report'}
    </Button>
  );
}; 