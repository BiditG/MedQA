'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function PathogenesisPage() {
  const [topic, setTopic] = useState('')
  const [flowchart, setFlowchart] = useState('')
  const [steps, setSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [source, setSource] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const cyRef = useRef<any>(null)
  const editModeRef = useRef(false)
  const [allDiseases, setAllDiseases] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const clear = () => {
    setTopic('')
    setFlowchart('')
    setSteps([])
    setSource(null)
    setWarning(null)
    setActiveStep(null)
  }

  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setFlowchart('')
    setSteps([])
    setSource(null)
    setWarning(null)
    setActiveStep(null)
    try {
      // Client-side CSV-first: fetch the CSV from public and parse it
      const csvUrl = '/data/pathogenesis.csv'
      const resp = await fetch(csvUrl)
      if (!resp.ok) throw new Error('Failed to load CSV')
      const text = await resp.text()
      const rows = parseCsv(text)
      if (!rows || rows.length < 2) {
        setWarning('CSV is empty or malformed')
        return
      }
      const header = rows[0].map((h: string) => h.toLowerCase())
      const diseaseIdx = header.indexOf('disease')
      const pathIdx = header.indexOf('pathogenesis')
      const sourceIdx = header.indexOf('source')
      if (diseaseIdx === -1 || pathIdx === -1) {
        setWarning('CSV missing expected columns')
        return
      }

      const match = rows
        .slice(1)
        .find(
          (cols: string[]) =>
            (cols[diseaseIdx] || '').toLowerCase() ===
            topic.trim().toLowerCase(),
        )
      if (!match) {
        setWarning('No CSV entry found for this topic')
        return
      }
      const rawPath = match[pathIdx] || ''
      const src = match[sourceIdx] || 'Manual'
      setSource(src)
      // split into steps using arrow-like separators or numeric prefixes
      const parsedSteps = rawPath
        .split(/→|->|\u2192|\u2013|\|/)
        .map((s: string) => s.replace(/^\d+\.?\s*/, '').trim())
        .filter(Boolean)
      setSteps(parsedSteps)
      setFlowchart(buildMermaidFromSteps(parsedSteps, topic))
    } catch (e) {
      console.error(e)
      setWarning('Failed to call API or generate flowchart; showing fallback.')
      setFlowchart(
        `graph TD\nA[${topic}] --> B[Initiating event] --> C[Host response] --> D[Pathological change] --> E[Clinical manifestations]`,
      )
    } finally {
      setLoading(false)
    }
  }

  // preload disease names for dropdown search
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const resp = await fetch('/data/pathogenesis.csv')
        if (!resp.ok) return
        const text = await resp.text()
        const rows = parseCsv(text)
        if (!rows || rows.length < 2) return
        const header = rows[0].map((h: string) => h.toLowerCase())
        const diseaseIdx = header.indexOf('disease')
        if (diseaseIdx === -1) return
        const names = rows
          .slice(1)
          .map((r) => (r[diseaseIdx] || '').trim())
          .filter(Boolean)
        if (mounted) setAllDiseases(names)
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const updateSuggestions = (q: string) => {
    if (!q) {
      setSuggestions([])
      setShowSuggestions(false)
      setHighlightIndex(-1)
      return
    }
    const ql = q.trim().toLowerCase()
    const matched = allDiseases
      .filter((n) => n.toLowerCase().includes(ql))
      .slice(0, 10)
    setSuggestions(matched)
    setShowSuggestions(matched.length > 0)
    setHighlightIndex(-1)
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const sel =
        highlightIndex >= 0 ? suggestions[highlightIndex] : suggestions[0]
      if (sel) {
        setTopic(sel)
        setShowSuggestions(false)
        setSuggestions([])
        setHighlightIndex(-1)
        // trigger generate
        setTimeout(() => generate(), 0)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // client-side CSV parser: handles quoted fields and CRLF
  function parseCsv(text: string) {
    const rows: string[][] = []
    let cur: string[] = []
    let field = ''
    let inQuotes = false
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"'
            i++
          } else {
            inQuotes = false
          }
        } else {
          field += ch
        }
      } else {
        if (ch === '"') {
          inQuotes = true
        } else if (ch === ',') {
          cur.push(field)
          field = ''
        } else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i++
          cur.push(field)
          rows.push(cur)
          cur = []
          field = ''
        } else {
          field += ch
        }
      }
    }
    if (field !== '' || cur.length > 0) {
      cur.push(field)
      rows.push(cur)
    }
    // trim cells
    return rows.map((r) => r.map((c) => c.trim()))
  }

  const buildMermaidFromSteps = (s: string[], title?: string) => {
    if (!s || s.length === 0)
      return `graph TD\nA[${title || 'Topic'}] --> B[No data]`
    let m = 'graph TD\n'
    s.forEach((st, i) => {
      const id = `S${i}`
      m += `${id}[${escapeBrackets(st)}]`
      if (i < s.length - 1) m += ` --> S${i + 1}`
      m += '\n'
    })
    return m
  }

  // deterministic SVG builder as a guaranteed fallback when mermaid is not available
  const buildSvgFromSteps = (s: string[]) => {
    const width = 760
    const nodeW = 680
    const nodeH = 64
    const gap = 24
    const padding = 20
    const totalHeight = s.length * (nodeH + gap) + padding * 2
    const nodes: string[] = []
    const arrows: string[] = []

    s.forEach((text, i) => {
      const x = (width - nodeW) / 2
      const y = padding + i * (nodeH + gap)
      const id = `S${i}`
      // sanitize text for HTML
      const safe = escapeBrackets(text)
      nodes.push(`
        <g id="${id}" class="flow-node">
          <rect x="${x}" y="${y}" rx="8" ry="8" width="${nodeW}" height="${nodeH}" fill="#ffffff" stroke="#111827" stroke-width="1.5" />
          <foreignObject x="${x + 12}" y="${y + 8}" width="${nodeW - 24}" height="${nodeH - 16}">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; font-size:14px; color:#0f172a; line-height:1.2;">${safe}</div>
          </foreignObject>
        </g>
      `)
      if (i < s.length - 1) {
        const x1 = width / 2
        const y1 = y + nodeH
        const x2 = width / 2
        const y2 = y + nodeH + gap
        // simple vertical arrow
        arrows.push(
          `<path d="M ${x1} ${y1 + 6} L ${x2} ${y2 - 6}" stroke="#374151" stroke-width="2" fill="none" marker-end="url(#arrow)" />`,
        )
      }
    })

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#374151" />
          </marker>
          <style>
            .flow-node:hover rect { stroke: #2563eb; }
            .flow-node.highlight rect { stroke: #ef4444; stroke-width:2.5; }
          </style>
        </defs>
        ${arrows.join('\n')}
        ${nodes.join('\n')}
      </svg>
    `
    return svg
  }

  useEffect(() => {
    // when steps change and no mermaid yet, build one
    if (steps.length > 0 && !flowchart) {
      setFlowchart(buildMermaidFromSteps(steps, topic))
    }
  }, [steps])

  useEffect(() => {
    if (!flowchart || !mermaidRef.current) return
    let cancelled = false
    console.debug('Rendering mermaid diagram (dynamic import)', {
      flowchart,
      steps,
    })
    mermaidRef.current.innerHTML = ''
    const id = 'mermaid-' + Date.now()

    ;(async () => {
      // Try Cytoscape first for nicer styled flowcharts
      try {
        const cytoscapeModule = await import('cytoscape')
        const cytoscapeDagre = await import('cytoscape-dagre')
        const cytoscape = cytoscapeModule.default || cytoscapeModule
        const dagre = cytoscapeDagre.default || cytoscapeDagre
        if (cytoscape && dagre && typeof cytoscape.use === 'function') {
          // register dagre
          try {
            cytoscape.use(dagre)
          } catch (e) {
            /* ignore if already registered */
          }
          // destroy previous instance if exists
          if (cyRef.current && cyRef.current.destroy) {
            try {
              cyRef.current.destroy()
            } catch (_) {}
            cyRef.current = null
          }

          // prepare container
          const container = mermaidRef.current
          // set height based on steps
          if (container) {
            container.style.width = '100%'
            container.style.height = Math.max(320, steps.length * 120) + 'px'
          }
          // build elements
          const elements: any[] = []
          steps.forEach((st, i) => {
            elements.push({ data: { id: `S${i}`, label: st } })
            if (i < steps.length - 1)
              elements.push({
                data: { id: `e${i}`, source: `S${i}`, target: `S${i + 1}` },
              })
          })

          // style: palette
          const palette = [
            '#ef4444',
            '#f97316',
            '#f59e0b',
            '#10b981',
            '#06b6d4',
            '#3b82f6',
            '#8b5cf6',
          ]

          const cy = cytoscape({
            container,
            elements,
            style: [
              {
                selector: 'node',
                style: {
                  label: 'data(label)',
                  'text-wrap': 'wrap',
                  'text-max-width': '200',
                  'background-color': (ele: any) => {
                    const idx = parseInt(ele.id().replace('S', '')) || 0
                    return palette[idx % palette.length]
                  },
                  color: '#ffffff',
                  'text-valign': 'center',
                  'text-halign': 'center',
                  width: 300,
                  height: 80,
                  'font-size': 12,
                  shape: 'roundrectangle',
                  'overlay-padding': 6,
                },
              },
              {
                selector: 'node.pulse',
                style: {
                  width: 360,
                  height: 96,
                  'transition-property': 'width, height',
                  'transition-duration': 240,
                },
              },
              {
                selector: 'edge',
                style: {
                  width: 3,
                  'line-color': '#64748b',
                  'target-arrow-shape': 'triangle',
                  'target-arrow-color': '#64748b',
                  'curve-style': 'bezier',
                },
              },
              {
                selector: '.highlight',
                style: {
                  'border-color': '#111827',
                  'border-width': 3,
                },
              },
            ],
            layout: {
              name: 'dagre',
              rankDir: 'TB',
              nodeSep: 40,
              edgeSep: 10,
            } as any,
          })

          cyRef.current = cy
          // small zoom to fit
          try {
            cy.fit()
          } catch (_) {}
          return
        }
      } catch (e) {
        console.warn(
          'Cytoscape render failed or not available, falling back',
          e,
        )
      }
      // Try Cytoscape renderer first for nicer visuals
      try {
        const cytoscape = (await import('cytoscape')) as any
        const dagre = (await import('cytoscape-dagre')) as any
        // register extension
        if (cytoscape && dagre && typeof cytoscape.use === 'function') {
          cytoscape.use(dagre.default || dagre)
        }

        // build nodes/edges from steps
        const elements: any[] = []
        steps.forEach((st, i) => {
          elements.push({ data: { id: `S${i}`, label: st } })
          if (i < steps.length - 1)
            elements.push({
              data: { id: `e${i}`, source: `S${i}`, target: `S${i + 1}` },
            })
        })

        // clear container
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = ''
          const cyContainer = document.createElement('div')
          cyContainer.style.width = '100%'
          cyContainer.style.height = '520px'
          mermaidRef.current.appendChild(cyContainer)

          const cy = cytoscape.default
            ? cytoscape.default({
                container: cyContainer,
                elements,
                style: [
                  {
                    selector: 'node',
                    style: {
                      label: 'data(label)',
                      'text-wrap': 'wrap',
                      'text-max-width': '200',
                      'background-color': '#ffffff',
                      'border-width': '2',
                      'border-color': '#0f172a',
                      padding: '10',
                      'font-size': '13',
                      color: '#0f172a',
                    },
                  },
                  {
                    selector: 'node.pulse',
                    style: {
                      width: 360,
                      height: 96,
                      'transition-property': 'width,height',
                      'transition-duration': 240 as any,
                    },
                  },
                  {
                    selector: 'edge',
                    style: {
                      'curve-style': 'bezier',
                      'target-arrow-shape': 'triangle',
                      'line-color': '#9ca3af',
                      'target-arrow-color': '#9ca3af',
                      width: '2',
                    },
                  },
                  {
                    selector: '.highlight',
                    style: { 'border-color': '#ef4444', 'border-width': '3' },
                  },
                ],
                layout: {
                  name: 'dagre',
                  rankDir: 'TB',
                  nodeSep: 40,
                  rankSep: 50,
                } as any,
              })
            : cytoscape({
                container: cyContainer,
                elements,
                style: [
                  {
                    selector: 'node',
                    style: {
                      label: 'data(label)',
                      'text-wrap': 'wrap',
                      'text-max-width': '200',
                      'background-color': '#ffffff',
                      'border-width': '2',
                      'border-color': '#0f172a',
                      padding: '10',
                      'font-size': '13',
                      color: '#0f172a',
                    },
                  },
                  {
                    selector: 'node.pulse',
                    style: {
                      width: 360,
                      height: 96,
                      'transition-property': 'width,height',
                      'transition-duration': 240 as any,
                    },
                  },
                  {
                    selector: 'edge',
                    style: {
                      'curve-style': 'bezier',
                      'target-arrow-shape': 'triangle',
                      'line-color': '#9ca3af',
                      'target-arrow-color': '#9ca3af',
                      width: '2',
                    },
                  },
                  {
                    selector: '.highlight',
                    style: { 'border-color': '#ef4444', 'border-width': '3' },
                  },
                ],
                layout: {
                  name: 'dagre',
                  rankDir: 'TB',
                  nodeSep: 40,
                  rankSep: 50,
                } as any,
              })

          // attach click handlers to sync with steps list
          cy.nodes().forEach((n: any) =>
            n.on('tap', () => {
              const id = n.id().replace(/^S/, '')
              const idx = Number(id)
              setActiveStep(idx)
              if (editModeRef.current) {
                const current = n.data('label') || ''
                setEditingIndex(idx)
                setEditingText(current)
                setShowEditModal(true)
              }
            }),
          )

          // cleanup when unmounting
          return () => {
            try {
              cy.destroy && cy.destroy()
            } catch (e) {}
          }
        }
        // end mermaidRef.current guard
      } catch (cyErr) {
        console.debug(
          'Cytoscape render unavailable, falling back to mermaid/SVG',
          cyErr,
        )
      }

      try {
        const mermaid = (await import('mermaid')) as any
        // initialize mermaid safely
        if (mermaid && typeof mermaid.initialize === 'function') {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'loose',
            theme: 'default',
          })
        }

        // prefer mermaid.mermaidAPI.render if available
        if (
          mermaid &&
          mermaid.mermaidAPI &&
          typeof mermaid.mermaidAPI.render === 'function'
        ) {
          let produced = false
          mermaid.mermaidAPI.render(id, flowchart, (svgCode: string) => {
            produced = !!svgCode
            if (cancelled) return
            if (mermaidRef.current) mermaidRef.current.innerHTML = svgCode
          })
          // if render didn't produce svg, fall through to fallback below
          if (produced) return
        }

        // fallback to mermaid.render (older versions) or mermaid.init
        if (mermaid && typeof mermaid.render === 'function') {
          // some builds expose mermaid.render that accepts (elementId, graphDefinition)
          try {
            const svg = mermaid.render(id, flowchart)
            if (!cancelled && mermaidRef.current)
              mermaidRef.current.innerHTML = svg
            return
          } catch (e) {
            // ignore and try init fallback
            console.warn('mermaid.render failed, trying init fallback', e)
          }
        }

        // last resort: inject a .mermaid container and call init — if still nothing, use deterministic SVG
        let hadOutput = false
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div class="mermaid">${flowchart}</div>`
          if (mermaid && typeof mermaid.init === 'function') {
            try {
              mermaid.init(undefined, mermaidRef.current)
              hadOutput = mermaidRef.current.querySelector('svg') !== null
            } catch (e) {
              console.error('mermaid.init failed', e)
            }
          }
        }

        if (!hadOutput) {
          // use deterministic SVG fallback built from parsed steps
          try {
            const svg = buildSvgFromSteps(steps)
            if (!cancelled && mermaidRef.current)
              mermaidRef.current.innerHTML = svg
          } catch (e) {
            console.error('SVG fallback failed', e)
            if (mermaidRef.current)
              mermaidRef.current.innerHTML =
                '<div className="text-red-600">Error rendering diagram</div>'
          }
        }
      } catch (err) {
        console.error('Failed to load mermaid dynamically', err)
        if (mermaidRef.current)
          mermaidRef.current.innerHTML =
            '<div className="text-red-600">Error rendering diagram</div>'
      }
    })()

    return () => {
      cancelled = true
    }
  }, [flowchart])

  const copyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(flowchart)
    } catch (_) {}
  }

  const exportSvg = () => {
    if (!mermaidRef.current) return
    const svg = mermaidRef.current.querySelector('svg')
    if (!svg) return
    const serializer = new XMLSerializer()
    const src = serializer.serializeToString(svg)
    const blob = new Blob([src], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${topic || 'diagram'}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    editModeRef.current = editMode
  }, [editMode])

  // in-app edit modal state
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  // toast state for confirmations
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (showEditModal && editTextareaRef.current) {
      editTextareaRef.current.focus()
      // move cursor to end
      const val = editTextareaRef.current.value
      editTextareaRef.current.setSelectionRange(val.length, val.length)
    }
  }, [showEditModal])

  // show a temporary toast message
  const showToast = (msg: string, ms = 2800) => {
    setToastMessage(msg)
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    const id = window.setTimeout(() => setToastMessage(null), ms)
    toastTimerRef.current = id
  }

  // trigger a quick pulse animation on a node (cytoscape or SVG fallback)
  const triggerPulse = (idx: number) => {
    try {
      const cy = cyRef.current
      if (cy && typeof cy.getElementById === 'function') {
        const node = cy.getElementById(`S${idx}`)
        if (node && typeof node.addClass === 'function') {
          node.addClass('pulse')
          setTimeout(() => {
            try {
              node.removeClass('pulse')
            } catch (_) {}
          }, 520)
          return
        }
      }
    } catch (e) {}

    // SVG fallback
    try {
      const svg = mermaidRef.current?.querySelector('svg')
      const el = svg?.querySelector(`#S${idx}`)
      if (el) {
        el.classList.add('pulse')
        setTimeout(() => el.classList.remove('pulse'), 520)
      }
    } catch (e) {}
  }

  const downloadDataUrl = (filename: string, dataUrl: string) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
  }

  const exportPng = async () => {
    const cy = cyRef.current
    if (cy && typeof cy.png === 'function') {
      const png = cy.png({ full: true, scale: 2 })
      downloadDataUrl(`${topic || 'diagram'}.png`, png)
      return
    }
    // fallback: convert SVG to PNG
    const svg = mermaidRef.current?.querySelector('svg') as SVGElement | null
    if (!svg) return
    const serializer = new XMLSerializer()
    const src = serializer.serializeToString(svg)
    const img = new Image()
    const svgBlob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const png = canvas.toDataURL('image/png')
        downloadDataUrl(`${topic || 'diagram'}.png`, png)
      }
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const exportJpg = async () => {
    const cy = cyRef.current
    if (cy && typeof cy.png === 'function') {
      const png = cy.png({ full: true, scale: 2 })
      // convert png to jpg via canvas
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          const jpg = canvas.toDataURL('image/jpeg', 0.92)
          downloadDataUrl(`${topic || 'diagram'}.jpg`, jpg)
        }
      }
      img.src = png
      return
    }
    // fallback to SVG->PNG->JPG
    await exportPng()
  }

  const exportPdf = async () => {
    const cy = cyRef.current
    try {
      const { jsPDF } = await import('jspdf')
      if (cy && typeof cy.png === 'function') {
        const png = cy.png({ full: true, scale: 2 })
        const doc = new jsPDF({ orientation: 'portrait' })
        const img = new Image()
        img.onload = () => {
          const pdfW = doc.internal.pageSize.getWidth()
          const pdfH = doc.internal.pageSize.getHeight()
          // fit image to page width
          doc.addImage(png, 'PNG', 0, 0, pdfW, (img.height / img.width) * pdfW)
          doc.save(`${topic || 'diagram'}.pdf`)
        }
        img.src = png
        return
      }
      // fallback: use SVG converted to PNG
      const svg = mermaidRef.current?.querySelector('svg') as SVGElement | null
      if (!svg) return
      const serializer = new XMLSerializer()
      const src = serializer.serializeToString(svg)
      const img = new Image()
      const svgBlob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width * 2
        canvas.height = img.height * 2
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const png = canvas.toDataURL('image/png')
          const doc = new jsPDF({ orientation: 'portrait' })
          const pdfW = doc.internal.pageSize.getWidth()
          doc.addImage(
            png,
            'PNG',
            0,
            0,
            pdfW,
            (canvas.height / canvas.width) * pdfW,
          )
          doc.save(`${topic || 'diagram'}.pdf`)
        }
        URL.revokeObjectURL(url)
      }
      img.src = url
    } catch (e) {
      console.error('PDF export failed', e)
    }
  }

  const onStepClick = (i: number) => {
    setActiveStep(i)
    // If in edit mode, prompt to edit the step text and update state + renderers
    if (editModeRef.current) {
      const current = steps[i] || ''
      setEditingIndex(i)
      setEditingText(current)
      setShowEditModal(true)
      return
    }

    // simple highlight: add a CSS class to corresponding node if present
    const nodeId = `S${i}`
    const svg = mermaidRef.current?.querySelector('svg')
    if (!svg) return
    // remove existing highlights
    svg
      .querySelectorAll('.path-highlight')
      .forEach((n) => n.classList.remove('path-highlight'))
    // mermaid tends to use generated ids like S0, S1 on nodes; our fallback uses group ids S0 etc.
    svg
      .querySelectorAll('.highlight')
      .forEach((n) => n.classList.remove('highlight'))
    const el = svg.querySelector(`#${nodeId}`)
    if (el) {
      // depending on structure, apply class to rect or group
      el.classList.add('highlight')
      const targetRect = el.querySelector('rect')
      if (targetRect) targetRect.classList.add('highlight')
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pathogenesis Maker</h1>
        <div className="flex items-center gap-2">
          {source && <Badge>{source}</Badge>}
          {warning && (
            <Badge className="bg-yellow-200 text-yellow-900">Warning</Badge>
          )}
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Generate a flowchart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                placeholder="e.g. Tuberculosis"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value)
                  updateSuggestions(e.target.value)
                }}
                onKeyDown={onInputKeyDown}
                onFocus={() => updateSuggestions(topic)}
              />
              {showSuggestions && (
                <ul className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded border border-slate-200 bg-white shadow-sm">
                  {suggestions.map((s, idx) => (
                    <li
                      key={s}
                      className={`cursor-pointer px-3 py-2 hover:bg-slate-100 ${highlightIndex === idx ? 'bg-slate-100' : ''}`}
                      onMouseDown={(ev) => {
                        ev.preventDefault()
                        setTopic(s)
                        setShowSuggestions(false)
                        setSuggestions([])
                        setHighlightIndex(-1)
                        setTimeout(() => generate(), 0)
                      }}
                      onMouseEnter={() => setHighlightIndex(idx)}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={generate}
                disabled={loading}
                className="whitespace-nowrap"
              >
                {loading ? 'Generating...' : 'Generate'}
              </Button>
              <Button
                variant="ghost"
                onClick={clear}
                className="whitespace-nowrap"
              >
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditMode((m) => !m)}
                className="whitespace-nowrap"
              >
                {editMode ? 'Exit edit' : 'Edit'}
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={copyMermaid}
              disabled={!flowchart}
              className="whitespace-nowrap"
            >
              Copy Mermaid
            </Button>
            <Button
              variant="outline"
              onClick={exportSvg}
              disabled={!flowchart}
              className="whitespace-nowrap"
            >
              Export SVG
            </Button>
            <Button
              variant="outline"
              onClick={exportPng}
              disabled={!flowchart}
              className="whitespace-nowrap"
            >
              Export PNG
            </Button>
            <Button
              variant="outline"
              onClick={exportJpg}
              disabled={!flowchart}
              className="whitespace-nowrap"
            >
              Export JPG
            </Button>
            <Button
              variant="outline"
              onClick={exportPdf}
              disabled={!flowchart}
              className="whitespace-nowrap"
            >
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:sticky md:top-24 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {steps.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No steps yet. Generate a flowchart.
                </div>
              )}
              <ol className="list-decimal space-y-2 pl-5">
                {steps.map((s, i) => (
                  <li
                    key={i}
                    className={`cursor-pointer rounded p-2 ${activeStep === i ? 'bg-slate-200' : ''}`}
                    onClick={() => onStepClick(i)}
                  >
                    {s}
                  </li>
                ))}
              </ol>
              {warning && (
                <div className="mt-2 text-sm text-yellow-700">{warning}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Flowchart</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={mermaidRef}
                className="h-[50vh] min-h-[360px] overflow-auto rounded bg-gray-50 md:h-[60vh]"
              />
              {!flowchart && (
                <div className="text-sm text-muted-foreground">
                  No diagram yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Edit modal */}
      {showEditModal && editingIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 z-40 bg-black/40"
            onClick={() => setShowEditModal(false)}
          />
          <div className="z-50 w-11/12 max-w-2xl rounded bg-white p-4 shadow-lg">
            <h3 className="mb-2 text-lg font-semibold">Edit step</h3>
            <textarea
              ref={editTextareaRef}
              className="min-h-[120px] w-full rounded border p-2"
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingIndex(null)
                  setEditingText('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const idx = editingIndex
                  const updated = editingText
                  setSteps((prev) => {
                    const copy = [...prev]
                    copy[idx] = updated
                    setFlowchart(buildMermaidFromSteps(copy, topic))
                    return copy
                  })
                  // update Cytoscape node if exists
                  try {
                    const cy = cyRef.current
                    if (cy && typeof cy.getElementById === 'function') {
                      const node = cy.getElementById(`S${idx}`)
                      if (node && typeof node.data === 'function')
                        node.data('label', updated)
                    }
                  } catch (e) {}
                  // trigger UI feedback
                  setShowEditModal(false)
                  setEditingIndex(null)
                  setEditingText('')
                  showToast('Saved changes')
                  if (typeof idx === 'number' && idx !== null) triggerPulse(idx)
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-4 z-[9999]">
          <div className="animate-fade-in rounded bg-slate-900 px-4 py-2 text-white shadow-lg">
            {toastMessage}
          </div>
        </div>
      )}
      <style>{`
        .flow-node.pulse rect { transform-origin: center; transition: transform 240ms ease; transform: scale(1.04); }
        svg .pulse rect { transform-origin: center; transition: transform 240ms ease; transform: scale(1.04); }
        svg .pulse { transition: transform 240ms ease; transform-origin: center; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: toastIn 220ms ease both }
      `}</style>
    </div>
  )
}

function escapeBrackets(s: string) {
  return s.replace(/\]/g, '').replace(/\[/g, '')
}
