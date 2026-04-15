import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Copy, CheckCircle } from "lucide-react";
import type { EventDTO } from "@/types/event";
import { toast } from "sonner";

interface Props {
  event: EventDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventQRDialog: React.FC<Props> = ({ event, open, onOpenChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const checkInUrl = `${window.location.origin}/checkin/${event.id}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      toast.success("Check-in link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownload = () => {
    // Find the canvas rendered by QRCodeCanvas
    const canvas = document.getElementById("event-qr-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${event.title.replace(/\s+/g, "_")}_QR.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code — {event.title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          {/* QR code */}
          <div className="rounded-xl border p-4 bg-white shadow-sm">
            <QRCodeCanvas
              id="event-qr-canvas"
              value={checkInUrl}
              size={220}
              includeMargin
              level="M"
            />
          </div>

          <p className="text-xs text-center text-muted-foreground break-all px-2">
            {checkInUrl}
          </p>

          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-1.5" />Copy link
            </Button>
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1.5" />Download QR
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Attendees scan this code or visit the link to check in without needing an account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
