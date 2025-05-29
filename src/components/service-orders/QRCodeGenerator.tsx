
import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, Download, Printer, Mail, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  serviceOrderId: string;
  qrCodeToken: string;
  publicAccessEnabled: boolean;
  onAccessToggle: (enabled: boolean) => Promise<void>;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  serviceOrderId,
  qrCodeToken,
  publicAccessEnabled,
  onAccessToggle,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const publicUrl = `${window.location.origin}/public/service-orders/${qrCodeToken}`;

  const handleToggleAccess = async () => {
    try {
      setIsLoading(true);
      await onAccessToggle(!publicAccessEnabled);
      toast({
        title: publicAccessEnabled 
          ? "Acesso público desativado" 
          : "Acesso público ativado",
        description: publicAccessEnabled 
          ? "O QR Code não poderá mais ser acessado por clientes." 
          : "O QR Code agora pode ser acessado por clientes.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao alterar acesso",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: "Link copiado!",
      description: "O link foi copiado para a área de transferência.",
    });
  };

  const handleDownloadQRCode = () => {
    const canvas = document.getElementById('service-order-qrcode') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ordem-servico-qrcode-${serviceOrderId}.png`;
      link.href = url;
      link.click();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const canvas = document.getElementById('service-order-qrcode') as HTMLCanvasElement;
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - Ordem de Serviço</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                img { max-width: 300px; margin: 20px auto; }
                p { margin: 5px 0; }
              </style>
            </head>
            <body>
              <h2>QR Code - Ordem de Serviço</h2>
              <img src="${url}" alt="QR Code" />
              <p>Escaneie para acompanhar o status da sua ordem de serviço</p>
              <p style="font-size: 12px; color: #666;">${publicUrl}</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Acompanhe o status da sua ordem de serviço: ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = 'Acompanhamento de Ordem de Serviço';
    const body = `Olá,\n\nVocê pode acompanhar o status da sua ordem de serviço através do link abaixo:\n\n${publicUrl}\n\nAtenciosamente,\nEquipe da Oficina`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">QR Code da Ordem de Serviço</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="public-access"
                checked={publicAccessEnabled}
                onCheckedChange={handleToggleAccess}
                disabled={isLoading}
              />
              <Label htmlFor="public-access">Acesso público</Label>
            </div>
          </div>

          {publicAccessEnabled ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  id="service-order-qrcode"
                  value={publicUrl}
                  size={200}
                  level="H"
                  includeMargin
                  renderAs="canvas"
                />
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Escaneie o QR Code acima ou compartilhe o link para que o cliente possa acompanhar o status da ordem de serviço.
              </p>

              <Tabs defaultValue="share" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="share">Compartilhar</TabsTrigger>
                  <TabsTrigger value="download">Download</TabsTrigger>
                  <TabsTrigger value="print">Imprimir</TabsTrigger>
                </TabsList>
                <TabsContent value="share" className="space-y-2 pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleShareWhatsApp}>
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </Button>
                    <Button variant="outline" onClick={handleShareEmail}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" onClick={handleCopyLink} className="col-span-2">
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Link
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="download" className="space-y-2 pt-2">
                  <Button variant="outline" onClick={handleDownloadQRCode} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </TabsContent>
                <TabsContent value="print" className="space-y-2 pt-2">
                  <Button variant="outline" onClick={handlePrint} className="w-full">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir QR Code
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acesso público desativado</h3>
              <p className="text-muted-foreground text-center mb-4">
                Ative o acesso público para gerar um QR Code que permita ao cliente acompanhar o status desta ordem de serviço.
              </p>
              <Button onClick={handleToggleAccess} disabled={isLoading}>
                Ativar acesso público
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
