import { useRef, useState } from "react";
import { adminApi } from "@/lib/admin-api";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface Props {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export function ImageUploader({ label, value, onChange, placeholder = "https://..." }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const url = await adminApi.uploadImage(file);
      onChange(url);
    } catch {
      setError("Upload failed. Try a URL instead.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>}

      {/* URL input */}
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drag & drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Uploading…</span>
          </div>
        ) : value ? (
          <div className="flex items-center gap-3">
            <img src={value} alt="" className="w-12 h-12 object-cover rounded-md border border-border shrink-0" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            <div className="text-left">
              <p className="text-xs text-muted-foreground truncate max-w-48">{value}</p>
              <p className="text-xs text-primary mt-1">Click or drop to replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium">Click to upload or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP, GIF — max 10 MB</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
