import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Download, Upload, FileUp, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImportDialog } from '@/components/settings/import-dialog'
import { CSVImportWizard } from '@/components/settings/csv-import-wizard'
import {
  exportData,
  saveBackupToFile,
  importData,
  validateBackupData,
  readFileAsJson,
} from '@/lib/data-management'

interface DataManagementProps {
  onDataChanged: () => void
}

export function DataManagement({ onDataChanged }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showImportConfirm, setShowImportConfirm] = useState(false)
  const [showImportOptions, setShowImportOptions] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCSVImportWizard, setShowCSVImportWizard] = useState(false)
  const [pendingImportData, setPendingImportData] = useState<unknown>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportData()
      const saved = await saveBackupToFile(data)
      if (saved) {
        toast.success('Backup saved successfully')
      }
    } catch (error) {
      toast.error('Failed to export data')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const openBackupImport = () => {
    setShowImportOptions(false)
    fileInputRef.current?.click()
  }

  const openStructuredImport = () => {
    setShowImportOptions(false)
    setShowImportDialog(true)
  }

  const openCSVImport = () => {
    setShowImportOptions(false)
    setShowCSVImportWizard(true)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await readFileAsJson(file)

      if (!validateBackupData(data)) {
        toast.error('Invalid backup file format')
        return
      }

      setPendingImportData(data)
      setShowImportConfirm(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to read file')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImportConfirm = async () => {
    if (!pendingImportData || !validateBackupData(pendingImportData)) return

    setIsImporting(true)
    setShowImportConfirm(false)

    try {
      const result = await importData(pendingImportData, { clearExisting: true })

      if (result.success) {
        toast.success(result.message)
        onDataChanged()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Import failed')
      console.error('Import error:', error)
    } finally {
      setIsImporting(false)
      setPendingImportData(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-border bg-muted/30 flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <p className="text-foreground font-[family-name:var(--font-sans)] text-sm font-medium">
            Export Data
          </p>
          <p className="text-muted-foreground text-xs">
            Download all subscriptions and settings as a backup file
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="w-full justify-center gap-2 sm:w-auto sm:self-start"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Backup'}
        </Button>
      </div>

      <div className="border-border bg-muted/30 flex flex-col gap-4 rounded-lg border p-4">
        <div className="flex flex-col gap-1">
          <p className="text-foreground font-[family-name:var(--font-sans)] text-sm font-medium">
            Import Data
          </p>
          <p className="text-muted-foreground text-xs">
            Restore a backup or import subscriptions from another source
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowImportOptions(true)}
          disabled={isImporting}
          className="w-full justify-center gap-2 sm:w-auto sm:self-start"
        >
          <Upload className="h-4 w-4" />
          {isImporting ? 'Importing...' : 'Import Data'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <ConfirmDialog
        open={showImportConfirm}
        onOpenChange={setShowImportConfirm}
        title="Import Backup?"
        description="This will replace all your current data with the backup. This action cannot be undone."
        confirmLabel="Import"
        onConfirm={handleImportConfirm}
      />

      <Dialog open={showImportOptions} onOpenChange={setShowImportOptions}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
            <DialogDescription>Choose how you want to bring data into Kessai.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 pt-2">
            <button
              type="button"
              onClick={openBackupImport}
              className="border-border bg-muted/30 hover:border-border-hover hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-4 text-left transition-colors"
            >
              <Upload className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-foreground text-sm font-medium">Restore Backup</p>
                <p className="text-muted-foreground text-xs">
                  Import a full Kessai backup from a JSON file.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={openStructuredImport}
              className="border-border bg-muted/30 hover:border-border-hover hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-4 text-left transition-colors"
            >
              <FileUp className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-foreground text-sm font-medium">Import Subscriptions</p>
                <p className="text-muted-foreground text-xs">
                  Import from CSV, Wallos, and other supported app formats.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={openCSVImport}
              className="border-border bg-muted/30 hover:border-border-hover hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-4 text-left transition-colors"
            >
              <FileSpreadsheet className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-foreground text-sm font-medium">Import Bank CSV</p>
                <p className="text-muted-foreground text-xs">
                  Detect recurring charges from a bank statement with column mapping.
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onDataChanged={onDataChanged}
      />

      <CSVImportWizard
        open={showCSVImportWizard}
        onOpenChange={setShowCSVImportWizard}
        onDataChanged={onDataChanged}
      />
    </div>
  )
}
