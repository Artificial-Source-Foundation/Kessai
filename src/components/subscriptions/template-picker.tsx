import { useState, useMemo, memo } from 'react'
import { Search, FileText } from 'lucide-react'
import { SUBSCRIPTION_TEMPLATES, TEMPLATE_CATEGORIES } from '@/data/subscription-templates'
import { TemplateCard } from './template-card'
import { Button } from '@/components/ui/button'
import type { SubscriptionTemplate } from '@/data/subscription-templates'

interface TemplatePickerProps {
  onSelect: (template: SubscriptionTemplate) => void
  onStartFromScratch: () => void
}

export const TemplatePicker = memo(function TemplatePicker({
  onSelect,
  onStartFromScratch,
}: TemplatePickerProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return SUBSCRIPTION_TEMPLATES.filter((t) => {
      const matchesCategory = !selectedCategory || t.category === selectedCategory
      if (!query) return matchesCategory
      const matchesSearch =
        t.name.toLowerCase().includes(query) ||
        t.keywords.some((k) => k.includes(query)) ||
        t.category.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [search, selectedCategory])

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-border bg-input text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary h-10 w-full rounded-lg border pr-4 pl-10 font-[family-name:var(--font-sans)] text-sm focus:ring-1 focus:outline-none"
        />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-wider uppercase transition-colors ${
            !selectedCategory
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`rounded px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-medium tracking-wider uppercase transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="max-h-[50vh] overflow-y-auto overscroll-contain pr-1">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => onSelect(template)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Search className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">No templates match your search</p>
          </div>
        )}
      </div>

      {/* Start from scratch */}
      <Button variant="outline" onClick={onStartFromScratch} className="gap-2">
        <FileText className="h-4 w-4" />
        Start from scratch
      </Button>
    </div>
  )
})
