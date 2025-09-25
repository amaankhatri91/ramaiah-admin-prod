import ApiService from '@/services/ApiService'

type ExportColumn = {
    header: string
    key: string
}

type FetchAllOptions<TItem, TRow extends object> = {
    endpoint: string
    filename: string
    basePayload?: Record<string, unknown>
    method?: 'post' | 'get'
    limitPerPage?: number
    normalize: (item: TItem, index: number) => TRow
    columns: ExportColumn[]
}

function computeOffsetFromPage(page: number) {
    return page <= 1 ? 0 : page
}

function extractRowsAndTotal(body: any): { rows: any[]; total: number } {
    let rows: any[] = []
    let total = 0

    if (Array.isArray(body)) {
        rows = body
        total = body.length
    } else if (body?.data) {
        const dataBlock = body.data as any
        rows = dataBlock.data || dataBlock.rows || dataBlock.list || dataBlock.items || []
        total = dataBlock.total ?? body.total ?? rows.length
    } else {
        rows = body?.rows || body?.list || body?.items || []
        total = body?.total ?? rows.length
    }

    return { rows, total: typeof total === 'number' ? total : rows.length }
}

function buildHtmlTable<TRow extends object>(
    rows: TRow[],
    columns: ExportColumn[]
) {
    const headers = columns.map((c) => `<th style="text-align:left">${String(c.header)}</th>`).join('')
    const body = rows
        .map((r) => {
            const tds = columns
                .map((c) => {
                    const value = (r as any)[c.key]
                    const safe = value == null ? '' : String(value)
                    return `<td style="mso-number-format:'\@'">${safe.replace?.(/</g, '&lt;').replace?.(/>/g, '&gt;')}</td>`
                })
                .join('')
            return `<tr>${tds}</tr>`
        })
        .join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body><table border="1"><thead><tr>${headers}</tr></thead><tbody>${body}</tbody></table></body></html>`
    return html
}

function triggerDownload(html: string, filename: string) {
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.xls') || filename.endsWith('.xlsx') ? filename : `${filename}.xls`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, 0)
}

export async function exportAllPagesToExcel<TItem, TRow extends object>(
    options: FetchAllOptions<TItem, TRow>
) {
    const {
        endpoint,
        filename,
        basePayload = {},
        method = 'post',
        limitPerPage = 100,
        normalize,
        columns,
    } = options

    const allItems: TRow[] = []
    let page = 1
    const hardStopPages = 1000

    // Paginate until less than limit returned
    // Backends in this codebase expect offset to be the page number except for the first page (0)
    for (let guard = 0; guard < hardStopPages; guard++) {
        const offset = computeOffsetFromPage(page)
        const payload = {
            ...basePayload,
            limit: limitPerPage,
            page,
            offset,
        } as Record<string, unknown>

        const res = await ApiService.fetchData<any, typeof payload>({
            url: endpoint,
            method,
            data: payload,
        })

        const { rows } = extractRowsAndTotal(res.data)
        const normalized = Array.isArray(rows) ? rows.map((r, idx) => normalize(r as TItem, (page - 1) * limitPerPage + idx)) : []
        allItems.push(...normalized)

        if (!Array.isArray(rows) || rows.length < limitPerPage) {
            break
        }
        page += 1
    }

    const html = buildHtmlTable(allItems, columns)
    triggerDownload(html, filename)
}


function toCsv<TRow extends object>(rows: TRow[], columns: ExportColumn[]) {
    const escapeCell = (value: unknown) => {
        if (value == null) return ''
        const str = String(value)
        // Escape quotes by doubling them per RFC4180
        const needsQuotes = /[",\n\r]/.test(str)
        const escaped = str.replace(/"/g, '""')
        return needsQuotes ? `"${escaped}"` : escaped
    }
    const header = columns.map((c) => escapeCell(c.header)).join(',')
    const body = rows
        .map((r) => columns.map((c) => escapeCell((r as any)[c.key])).join(','))
        .join('\r\n')
    return `${header}\r\n${body}`
}

function triggerCsvDownload(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, 0)
}

export async function exportAllPagesToCSV<TItem, TRow extends object>(
    options: FetchAllOptions<TItem, TRow>
) {
    const {
        endpoint,
        filename,
        basePayload = {},
        method = 'post',
        limitPerPage = 100,
        normalize,
        columns,
    } = options

    const allItems: TRow[] = []
    let page = 1
    const hardStopPages = 1000

    for (let guard = 0; guard < hardStopPages; guard++) {
        const offset = computeOffsetFromPage(page)
        const payload = {
            ...basePayload,
            limit: limitPerPage,
            page,
            offset,
        } as Record<string, unknown>

        const res = await ApiService.fetchData<any, typeof payload>({
            url: endpoint,
            method,
            data: payload,
        })

        const { rows } = extractRowsAndTotal(res.data)
        const normalized = Array.isArray(rows) ? rows.map((r, idx) => normalize(r as TItem, (page - 1) * limitPerPage + idx)) : []
        allItems.push(...normalized)

        if (!Array.isArray(rows) || rows.length < limitPerPage) {
            break
        }
        page += 1
    }

    const csv = toCsv(allItems, columns)
    triggerCsvDownload(csv, filename)
}


