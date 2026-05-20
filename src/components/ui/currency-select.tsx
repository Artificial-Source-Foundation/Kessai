import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getCurrencyOptions, type CurrencyCode } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface CurrencySelectProps {
  value: string
  onValueChange: (value: CurrencyCode) => void
  id?: string
  placeholder?: string
  triggerClassName?: string
  className?: string
}

export function CurrencySelect({
  value,
  onValueChange,
  id,
  placeholder = 'Select currency',
  triggerClassName,
  className,
}: CurrencySelectProps) {
  const generatedId = useId()
  const listboxId = `${id ?? generatedId}-listbox`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const options = useMemo(() => getCurrencyOptions(), [])
  const selected = options.find((option) => option.value === value)
  const selectedLabel = selected?.label ?? (value ? value.toUpperCase() : placeholder)
  const normalizedQuery = query.trim().toLowerCase()
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options
    return options.filter((option) => option.searchText.includes(normalizedQuery))
  }, [normalizedQuery, options])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    searchRef.current?.focus()

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        id={id}
        type="button"
        className={cn(
          'border-input bg-background text-foreground ring-offset-background focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          triggerClassName
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
          {selectedLabel}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open ? (
        <div className="bg-popover text-popover-foreground border-border absolute z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md">
          <div className="border-border relative border-b p-2">
            <Search className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <Input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search currency"
              className="h-9 pl-8"
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>

          <div id={listboxId} role="listbox" className="max-h-72 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className="text-muted-foreground px-3 py-3 text-sm">No currencies found</p>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm outline-none',
                      isSelected && 'bg-accent/60 text-accent-foreground'
                    )}
                    onClick={() => {
                      onValueChange(option.value)
                      setOpen(false)
                      setQuery('')
                    }}
                  >
                    <span className="font-[family-name:var(--font-mono)] text-xs font-bold">
                      {option.value}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.name}</span>
                    <span className="text-muted-foreground font-[family-name:var(--font-mono)] text-xs">
                      {option.symbol}
                    </span>
                    {isSelected ? <Check className="text-primary h-4 w-4 shrink-0" /> : null}
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
