import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

export interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  medicalRecordNumber: string;
  attachments: File[];
}

interface PatientInfoFormProps {
  patientInfo: PatientInfo;
  onChange: (info: PatientInfo) => void;
  disabled?: boolean;
}

export function PatientInfoForm({ patientInfo, onChange, disabled }: PatientInfoFormProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (field: keyof PatientInfo, value: string) => {
    onChange({ ...patientInfo, [field]: value });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    onChange({
      ...patientInfo,
      attachments: [...patientInfo.attachments, ...newFiles],
    });
  };

  const removeFile = (index: number) => {
    const newAttachments = patientInfo.attachments.filter((_, i) => i !== index);
    onChange({ ...patientInfo, attachments: newAttachments });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 w-full max-w-6xl">
      <div className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-muted-foreground mb-4">
        Patient Information
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
            Name
          </label>
          <input
            type="text"
            value={patientInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={disabled}
            placeholder="Patient name"
            className="px-3 py-2 bg-background border border-border rounded font-['Lora'] text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
            Age
          </label>
          <input
            type="text"
            value={patientInfo.age}
            onChange={(e) => handleChange('age', e.target.value)}
            disabled={disabled}
            placeholder="Age"
            className="px-3 py-2 bg-background border border-border rounded font-['Lora'] text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
            Gender
          </label>
          <select
            value={patientInfo.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            disabled={disabled}
            className="px-3 py-2 bg-background border border-border rounded font-['Lora'] text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
            MRN
          </label>
          <input
            type="text"
            value={patientInfo.medicalRecordNumber}
            onChange={(e) => handleChange('medicalRecordNumber', e.target.value)}
            disabled={disabled}
            placeholder="Medical Record #"
            className="px-3 py-2 bg-background border border-border rounded font-['Lora'] text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          />
        </div>
      </div>

      {/* File Upload Area */}
      <div className="mt-4">
        <label className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground mb-2 block">
          Attachments (Labs, Images, Documents)
        </label>

        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={disabled}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="font-['IBM_Plex_Mono'] text-sm text-foreground mb-1">
              Click to upload or drag and drop
            </span>
            <span className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
              PDF, Images, Documents (Max 10MB each)
            </span>
          </label>
        </div>

        {/* Uploaded Files List */}
        {patientInfo.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {patientInfo.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded border border-border"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-primary flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-['IBM_Plex_Mono'] text-sm text-foreground truncate">
                      {file.name}
                    </div>
                    <div className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  className="flex-shrink-0 p-1 hover:bg-destructive/20 rounded text-destructive transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
