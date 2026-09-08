import React, { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { UploadCloud, FileSpreadsheet, Download, X, CheckCircle2, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react'
import { dataService, STAGES } from '../../services/dataService'
import Card from '../ui/Card'
import PrimaryButton from '../ui/PrimaryButton'

// Contact fields a spreadsheet column can be mapped to. `name` is the only
// required one — everything else is optional, same as GoHighLevel's importer.
const CONTACT_FIELDS = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'owner', label: 'Owner' },
    { key: 'tags', label: 'Tags' },
    { key: 'stage', label: 'Pipeline Stage' },
    { key: 'source', label: 'Lead Source' },
]

// Header aliases used to auto-guess the mapping so the user usually doesn't
// have to touch the dropdowns at all — only correct them when we guess wrong.
const FIELD_ALIASES = {
    name: ['name', 'full name', 'contact name', 'contact'],
    email: ['email', 'e-mail', 'email address'],
    phone: ['phone', 'phone number', 'mobile', 'cell', 'contact number'],
    owner: ['owner', 'assigned to', 'rep', 'sales rep', 'agent'],
    tags: ['tags', 'tag', 'labels'],
    stage: ['stage', 'pipeline stage', 'status'],
    source: ['source', 'lead source', 'channel'],
}

function guessMapping(headers) {
    const mapping = {}
    const used = new Set()
    for (const field of CONTACT_FIELDS) {
        const aliases = FIELD_ALIASES[field.key]
        const match = headers.find((h, i) => !used.has(i) && aliases.includes(String(h).trim().toLowerCase()))
        if (match !== undefined) {
            mapping[field.key] = headers.indexOf(match)
            used.add(headers.indexOf(match))
        } else {
            mapping[field.key] = ''
        }
    }
    return mapping
}

function normalizeStage(raw) {
    if (!raw) return 'new'
    const v = String(raw).trim().toLowerCase()
    const byId = STAGES.find((s) => s.id === v)
    if (byId) return byId.id
    const byLabel = STAGES.find((s) => s.label.toLowerCase() === v)
    return byLabel ? byLabel.id : 'new'
}

function downloadSampleTemplate() {
    const headers = ['Name', 'Email', 'Phone', 'Owner', 'Tags', 'Pipeline Stage', 'Lead Source']
    const example = ['Ava Bennett', 'ava.bennett@example.com', '(305) 555-0110', 'Maria Chen', 'Hot Lead, Referral', 'New Lead', 'Website Form']
    const csv = [headers, example].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
}

export default function ImportContacts({ onImported }) {
    const [step, setStep] = useState('upload') // upload -> map -> preview -> done
    const [fileName, setFileName] = useState('')
    const [headers, setHeaders] = useState([])
    const [rows, setRows] = useState([]) // raw 2D array, no header row
    const [mapping, setMapping] = useState({})
    const [dragOver, setDragOver] = useState(false)
    const [importing, setImporting] = useState(false)
    const [result, setResult] = useState(null)
    const [parseError, setParseError] = useState('')
    const fileInputRef = useRef(null)

    const reset = () => {
        setStep('upload')
        setFileName('')
        setHeaders([])
        setRows([])
        setMapping({})
        setResult(null)
        setParseError('')
    }

    const parseFile = (file) => {
        setParseError('')
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(e.target.result, { type: 'array' })
                const sheet = workbook.Sheets[workbook.SheetNames[0]]
                const asRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' })
                const [headerRow, ...dataRows] = asRows
                if (!headerRow || headerRow.length === 0) {
                    setParseError('That sheet looks empty — check it has a header row and at least one contact.')
                    return
                }
                const cleanHeaders = headerRow.map((h) => String(h).trim())
                const cleanRows = dataRows.filter((r) => r.some((cell) => String(cell).trim() !== ''))
                if (cleanRows.length === 0) {
                    setParseError('No contact rows found below the header row.')
                    return
                }
                setFileName(file.name)
                setHeaders(cleanHeaders)
                setRows(cleanRows)
                setMapping(guessMapping(cleanHeaders))
                setStep('map')
            } catch (err) {
                setParseError('Could not read that file. Make sure it\'s a .xlsx, .xls, or .csv export.')
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (file) parseFile(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) parseFile(file)
    }

    const mappedRows = rows.map((r) => ({
        name: mapping.name !== '' ? r[mapping.name] : '',
        email: mapping.email !== '' ? r[mapping.email] : '',
        phone: mapping.phone !== '' ? r[mapping.phone] : '',
        owner: mapping.owner !== '' ? r[mapping.owner] : '',
        tags: mapping.tags !== '' ? r[mapping.tags] : '',
        stage: mapping.stage !== '' ? normalizeStage(r[mapping.stage]) : 'new',
        source: mapping.source !== '' ? r[mapping.source] : 'Import',
    }))

    const validRows = mappedRows.filter((r) => r.name && String(r.name).trim())
    const missingNameCount = mappedRows.length - validRows.length
    const nameIsMapped = mapping.name !== '' && mapping.name !== undefined

    const runImport = async () => {
        setImporting(true)
        try {
            const res = await dataService.importContacts(validRows)
            setResult(res)
            setStep('done')
            onImported?.()
        } catch (err) {
            setResult({ imported: 0, skipped: 0, errors: [err.message || 'Import failed'] })
            setStep('done')
        } finally {
            setImporting(false)
        }
    }

    return (
        <Card className="p-6 max-w-3xl">
            {/* ---------------------------------------------------------------- */}
            {/* Step 1: upload                                                    */}
            {/* ---------------------------------------------------------------- */}
            {step === 'upload' && (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-display font-semibold text-base">Import contacts</h3>
                        <p className="text-sm text-subink mt-1">
                            Upload a spreadsheet exported from another CRM or built by hand. You'll be able to map
                            its columns and preview everything before anything is saved.
                        </p>
                    </div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl2 py-12 px-6 cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-line hover:bg-canvas'}`}
                    >
                        <UploadCloud size={28} className="text-subink" />
                        <p className="text-sm font-medium text-ink">Drag & drop a file, or click to browse</p>
                        <p className="text-xs text-subink">.xlsx, .xls, or .csv</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    {parseError && (
                        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <span>{parseError}</span>
                        </div>
                    )}

                    <button
                        onClick={downloadSampleTemplate}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                        <Download size={14} />
                        Download a sample template
                    </button>
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Step 2: map columns                                               */}
            {/* ---------------------------------------------------------------- */}
            {step === 'map' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-display font-semibold text-base">Map your columns</h3>
                            <p className="text-sm text-subink mt-1 flex items-center gap-1.5">
                                <FileSpreadsheet size={14} />
                                {fileName} · {rows.length} row{rows.length === 1 ? '' : 's'} found
                            </p>
                        </div>
                        <button onClick={reset} className="p-1.5 rounded-lg hover:bg-canvas text-subink">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="border border-line rounded-lg divide-y divide-line">
                        {CONTACT_FIELDS.map((field) => (
                            <div key={field.key} className="flex items-center justify-between gap-4 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-ink">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </p>
                                    {field.key === 'stage' && <p className="text-xs text-subink">Unrecognized values default to "New Lead"</p>}
                                </div>
                                <select
                                    value={mapping[field.key] ?? ''}
                                    onChange={(e) => setMapping((m) => ({ ...m, [field.key]: e.target.value === '' ? '' : Number(e.target.value) }))}
                                    className="bg-canvas border border-line rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary min-w-[180px]"
                                >
                                    <option value="">Don't import</option>
                                    {headers.map((h, i) => (
                                        <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>

                    {!nameIsMapped && (
                        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <span>Map a column to Full Name before continuing — it's required for every contact.</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                        <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-subink hover:text-ink">
                            <ArrowLeft size={14} /> Back
                        </button>
                        <PrimaryButton onClick={() => setStep('preview')} className={!nameIsMapped ? 'opacity-50 pointer-events-none' : ''}>
                            Preview import
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Step 3: preview                                                   */}
            {/* ---------------------------------------------------------------- */}
            {step === 'preview' && (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-display font-semibold text-base">Review before importing</h3>
                        <p className="text-sm text-subink mt-1">
                            {validRows.length} contact{validRows.length === 1 ? '' : 's'} ready to import
                            {missingNameCount > 0 && <span className="text-amber-600"> · {missingNameCount} skipped (missing name)</span>}
                            . Rows with an email already in your CRM will be skipped automatically.
                        </p>
                    </div>

                    <div className="border border-line rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-80 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-canvas">
                                    <tr className="text-left text-xs text-subink border-b border-line">
                                        <th className="px-3.5 py-2 font-medium">Name</th>
                                        <th className="px-3.5 py-2 font-medium">Email</th>
                                        <th className="px-3.5 py-2 font-medium">Phone</th>
                                        <th className="px-3.5 py-2 font-medium">Owner</th>
                                        <th className="px-3.5 py-2 font-medium">Stage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {validRows.slice(0, 50).map((r, i) => (
                                        <tr key={i} className="border-b border-line/60">
                                            <td className="px-3.5 py-2 font-medium text-ink">{r.name}</td>
                                            <td className="px-3.5 py-2 text-subink">{r.email || '—'}</td>
                                            <td className="px-3.5 py-2 text-subink">{r.phone || '—'}</td>
                                            <td className="px-3.5 py-2 text-subink">{r.owner || '—'}</td>
                                            <td className="px-3.5 py-2 text-subink capitalize">{STAGES.find((s) => s.id === r.stage)?.label || 'New Lead'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {validRows.length > 50 && (
                            <p className="text-xs text-subink text-center py-2 border-t border-line">
                                +{validRows.length - 50} more row{validRows.length - 50 === 1 ? '' : 's'} not shown
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <button onClick={() => setStep('map')} className="inline-flex items-center gap-1.5 text-sm text-subink hover:text-ink">
                            <ArrowLeft size={14} /> Back to mapping
                        </button>
                        <PrimaryButton onClick={runImport} className={importing ? 'opacity-70 pointer-events-none' : ''}>
                            {importing
                                ? <span className="inline-flex items-center gap-1.5"><Loader2 size={14} className="animate-spin" /> Importing…</span>
                                : `Import ${validRows.length} contact${validRows.length === 1 ? '' : 's'}`}
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* Step 4: done                                                      */}
            {/* ---------------------------------------------------------------- */}
            {step === 'done' && result && (
                <div className="space-y-4">
                    <div className="flex flex-col items-center text-center py-6">
                        {result.errors.length === 0 ? (
                            <CheckCircle2 size={36} className="text-emerald-500 mb-3" />
                        ) : (
                            <AlertTriangle size={36} className="text-amber-500 mb-3" />
                        )}
                        <h3 className="font-display font-semibold text-lg">Import complete</h3>
                        <p className="text-sm text-subink mt-1.5">
                            {result.imported} contact{result.imported === 1 ? '' : 's'} imported
                            {result.skipped > 0 && `, ${result.skipped} skipped as duplicates`}.
                        </p>
                        {result.errors.length > 0 && (
                            <p className="text-sm text-red-600 mt-1.5">{result.errors[0]}</p>
                        )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={reset} className="text-sm text-subink hover:text-ink px-3.5 py-2">
                            Import another file
                        </button>
                        <PrimaryButton onClick={() => onImported?.(true)}>
                            View contacts
                        </PrimaryButton>
                    </div>
                </div>
            )}
        </Card>
    )
}