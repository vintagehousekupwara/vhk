import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-brand-bg z-[9999] flex flex-col items-center justify-center">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-brand-primary/20 rounded-full"></div>
      </div>
      <p className="mt-4 font-serif text-brand-text tracking-widest uppercase text-xs animate-pulse">
        Loading Experience...
      </p>
    </div>
  );
}