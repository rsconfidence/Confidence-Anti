import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "./layout";
import { adminApi } from "@/lib/admin-api";
import { ImageUploader } from "./image-uploader";
import { FileText, Loader2, Save, Upload } from "lucide-react";

export default function AdminSettings() {
  const [heroBackground, setHeroBackground] = useState("");
  const [resumePdf, setResumePdf] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState("");
  const resumeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi.getSettings()
      .then((settings) => {
        setHeroBackground(settings.heroBackground ?? "");
        setResumePdf(settings.resumePdf ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      await adminApi.updateSettings({ heroBackground, resumePdf });
      setMessage("Website settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (file.type !== "application/pdf") {
      setMessage("Please choose a PDF resume.");
      return;
    }
    setUploadingResume(true);
    setMessage("");
    try {
      setResumePdf(await adminApi.uploadFile(file));
      setMessage("Resume uploaded. Click Save changes to publish it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Resume upload failed.");
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-2xl font-semibold">Website Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage the public hero image and downloadable resume.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <section className="bg-background border border-border rounded-xl p-5 space-y-4">
              <div>
                <h2 className="font-semibold">Hero background</h2>
                <p className="text-sm text-muted-foreground mt-1">This image appears behind your name on the home page.</p>
              </div>
              <ImageUploader label="Background image" value={heroBackground} onChange={setHeroBackground} />
            </section>

            <section className="bg-background border border-border rounded-xl p-5 space-y-4">
              <div>
                <h2 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Resume PDF</h2>
                <p className="text-sm text-muted-foreground mt-1">Replace the PDF visitors download from your Resume page.</p>
              </div>
              <input
                ref={resumeInput}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadResume(file);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => resumeInput.current?.click()}
                disabled={uploadingResume}
                className="inline-flex items-center gap-2 border border-border rounded-lg px-4 py-2.5 text-sm hover:border-primary transition-colors disabled:opacity-50"
              >
                {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingResume ? "Uploading…" : "Upload resume PDF"}
              </button>
              {resumePdf && <a href={resumePdf} target="_blank" rel="noreferrer" className="block text-sm text-primary hover:underline break-all">{resumePdf}</a>}
            </section>

            <div className="flex items-center gap-4">
              <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save changes
              </button>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}