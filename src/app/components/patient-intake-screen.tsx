import { Upload, X, FileText, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';
import { PatientInfo } from './patient-info-form';

interface PatientIntakeScreenProps {
  patientInfo: PatientInfo;
  onChange: (info: PatientInfo) => void;
  onProceed: () => void;
}

export function PatientIntakeScreen({ patientInfo, onChange, onProceed }: PatientIntakeScreenProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (field: keyof PatientInfo, value: string) => {
    onChange({ ...patientInfo, [field]: value });
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    onChange({ ...patientInfo, attachments: [...patientInfo.attachments, ...newFiles] });
  };

  const removeFile = (index: number) => {
    onChange({ ...patientInfo, attachments: patientInfo.attachments.filter((_, i) => i !== index) });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (file: File) =>
    file.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const canProceed = patientInfo.name.trim().length > 0;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-['IBM_Plex_Mono'] mb-3">MedTranslate</h1>
          <p className="font-['IBM_Plex_Mono'] text-sm text-muted-foreground">
            Medical Speech Translation System
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-lg p-8 md:p-12 shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h2 className="font-['IBM_Plex_Mono'] text-xl">Patient Information</h2>
          </div>

          <div className="space-y-6">
            {/* Name - Required */}
            <div className="space-y-2">
              <label className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                Patient Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={patientInfo.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter patient name"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg font-['Lora'] text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                autoFocus
              />
            </div>

            {/* Row: Age, Gender, MRN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-muted-foreground">Age</label>
                <input
                  type="text"
                  value={patientInfo.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="Age"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg font-['Lora'] text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-muted-foreground">Gender</label>
                <select
                  value={patientInfo.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg font-['Lora'] text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-muted-foreground">MRN</label>
                <input
                  type="text"
                  value={patientInfo.medicalRecordNumber}
                  onChange={(e) => handleChange('medicalRecordNumber', e.target.value)}
                  placeholder="Record #"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg font-['Lora'] text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="font-['IBM_Plex_Mono'] text-xs uppercase tracking-wider text-muted-foreground">
                Attachments (Optional)
              </label>

              <div
                className={`relative border-2 border-dashed rounded-lg p-8 transition-all ${
                  dragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border hover:border-primary/50'
                }`}
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
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-10 h-10 text-primary mb-3" />
                  <span className="font-['IBM_Plex_Mono'] text-sm text-foreground mb-1">
                    Drop files here or click to browse
                  </span>
                  <span className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
                    Labs, Images, Documents • Max 10MB each
                  </span>
                </label>
              </div>

              {patientInfo.attachments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-2"
                >
                  {patientInfo.attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-primary flex-shrink-0">{getFileIcon(file)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['IBM_Plex_Mono'] text-sm text-foreground truncate">{file.name}</div>
                          <div className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 rounded text-destructive transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
              <span className="text-primary">*</span> Required field
            </p>
            <button
              onClick={onProceed}
              disabled={!canProceed}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-['IBM_Plex_Mono'] hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:shadow-none group"
            >
              Start Recording Session
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="font-['IBM_Plex_Mono'] text-xs text-muted-foreground">
            Secure • HIPAA Compliant • Encrypted
          </p>
        </div>
      </motion.div>
    </div>
  );
}
