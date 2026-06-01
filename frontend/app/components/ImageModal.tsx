'use client';

import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';
import { Attachment } from '../types';

interface ImageModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  const handleDownload = () => {
    if (!attachment.dataUrl) return;
    const a = document.createElement('a');
    a.href = attachment.dataUrl;
    a.download = attachment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between text-zinc-300 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate max-w-xs sm:max-w-md">
              {attachment.name}
            </span>
            <span className="text-xs text-zinc-500">
              ({(attachment.size / 1024).toFixed(1)} KB)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {attachment.dataUrl && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-xs"
                title="Download original file"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
              title="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Box */}
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 shadow-2xl flex items-center justify-center max-h-[80vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={attachment.dataUrl}
            alt={attachment.name}
            className="max-h-[80vh] w-auto max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};
