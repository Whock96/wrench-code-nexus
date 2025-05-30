
import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Share2, Mail, MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  serviceOrderId: string;
  qrCodeToken: string;
  publicAccessEnabled: boolean;
  onTogglePublicAccess: (enabled: boolean) => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  serviceOrderId,
  qrCodeToken,
  publicAccessEnabled,
  onTogglePublicAccess,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/public/service-orders/${serviceOrderId}?token=${qrCodeToken}`;

  const handleDownload = () => {
    if (!qrRef.current) return;

    try {
      // Get the SVG element
      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) return;

      // Create a canvas to convert SVG to image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      // Set canvas size
      canvas.width = 256;
      canvas.height = 256;
      
      // Create image
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          // Download
          const link = document.createElement('a');
          link.download = `qr-code-os-${serviceOrderId}.png`;
          link.href = canvas.toDataURL();
          link.click();
        }
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o QR Code.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (!qrRef.current) return;

    try {
      const svgElement = qrRef.current.querySelector('svg');
      if (!svgElement) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Ordem de Serviço ${serviceOrderId}</title>
            <style>
              body { margin: 0; padding: 20px; text-align: center; font-family: Arial, sans-serif; }
              .qr-container { display: inline-block; padding: 20px; border: 1px solid #ccc; }
              .title { margin-bottom: 10px; font-size: 18px; font-weight: bold; }
              .subtitle { margin-bottom: 20px; color: #666; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="title">Ordem de Serviço #${serviceOrderId}</div>
              <div class="subtitle">Escaneie para acompanhar o andamento</div>
              ${svgData}
            </div>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      console.error('Error printing QR code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível imprimir o QR Code.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `Acompanhe sua ordem de serviço: ${publicUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Ordem de Serviço #${serviceOrderId}`);
    const body = encodeURIComponent(
      `Olá!\n\nVocê pode acompanhar o andamento da sua ordem de serviço através do link abaixo:\n\n${publicUrl}\n\nObrigado!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QR Code de Acesso</span>
          <div className="flex items-center space-x-2">
            <Switch
              id="public-access"
              checked={publicAccessEnabled}
              onCheckedChange={onTogglePublicAccess}
            />
            <Label htmlFor="public-access">Acesso Público</Label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {publicAccessEnabled ? (
          <>
            <div className="flex justify-center" ref={qrRef}>
              <QRCodeSVG
                value={publicUrl}
                size={200}
                level="M"
                includeMargin
              />
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              Escaneie o QR Code para acessar os detalhes da ordem de serviço
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Share2 className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Compartilhar:</div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              <strong>Link direto:</strong> {publicUrl}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>O acesso público está desabilitado.</p>
            <p className="text-sm">Ative para permitir que o cliente acompanhe a ordem de serviço.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
