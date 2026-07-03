import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileImage, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  type: string;
  path: string;
}

interface Props {
  bucket: "annonces" | "avatars";
  userId: string;
  onChange: (files: UploadedFile[]) => void;
  value: UploadedFile[];
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: Record<string, string[]>;
}

export function UploadDropzone({
  bucket,
  userId,
  onChange,
  value,
  maxFiles = 5,
  maxSizeMB = 8,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".webp"], "application/pdf": [".pdf"] },
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (files: File[]) => {
      if (value.length + files.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} fichiers.`);
        return;
      }
      setUploading(true);
      setProgress(0);
      const uploaded: UploadedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`${file.name} dépasse ${maxSizeMB} Mo`);
          continue;
        }
        const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) {
          toast.error(`Erreur upload : ${error.message}`);
          continue;
        }
        const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 365);
        uploaded.push({
          url: signed?.signedUrl ?? "",
          name: file.name,
          size: file.size,
          type: file.type,
          path,
        });
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      onChange([...value, ...uploaded]);
      setUploading(false);
      setProgress(0);
    },
    [bucket, userId, value, onChange, maxFiles, maxSizeMB],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: upload,
    accept,
    maxFiles,
    disabled: uploading,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-secondary/30"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Envoi en cours… {progress}%</p>
            <div className="mt-2 h-2 w-48 overflow-hidden rounded-full bg-secondary">
              <div className="h-full bg-gradient-aks transition-all" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-primary" />
            <p className="text-sm font-medium">
              {isDragActive ? "Déposez ici…" : "Glissez-déposez vos fichiers ici ou cliquez"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, WebP, PDF · Max {maxSizeMB} Mo · {maxFiles} fichiers
            </p>
          </>
        )}
      </div>

      {value.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {value.map((f, i) => (
            <div key={f.path} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              {f.type.startsWith("image/") ? (
                <img src={f.url} alt={f.name} className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  {f.type.startsWith("image/") ? <FileImage className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} Ko</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="rounded-lg p-1 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
