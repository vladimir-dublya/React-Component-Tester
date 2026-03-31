import { useEffect, useMemo, useState } from "react";
import "./styles.css";

type ItemStatus = "draft" | "published" | "archived";

export type TestItem = {
  id: number;
  title: string;
  description: string;
  category: "ui" | "api" | "docs";
  status: ItemStatus;
  createdAt: string;
  score: number;
  tags: string[];
};

type SortBy = "title" | "createdAt" | "score";
type SortOrder = "asc" | "desc";

export type TestComponentProps = {
  title?: string;
  pageSize?: number;
  disabled?: boolean;
  simulateDelayMs?: number;
  withRandomErrors?: boolean;
  initialItems?: TestItem[];
  onItemSelect?: (item: TestItem | null) => void;
  onItemsChange?: (items: TestItem[]) => void;
  onSubmit?: (payload: { message: string; itemsCount: number }) => void;
};

const defaultItems: TestItem[] = [
  {
    id: 1,
    title: "Refactor button states",
    description: "Unify disabled and loading styles for CTA buttons.",
    category: "ui",
    status: "draft",
    createdAt: "2026-03-20T10:15:00.000Z",
    score: 67,
    tags: ["buttons", "style", "ux"],
  },
  {
    id: 2,
    title: "Add retry for network requests",
    description: "Retry 3 times with exponential backoff for 5xx responses.",
    category: "api",
    status: "published",
    createdAt: "2026-03-24T08:30:00.000Z",
    score: 91,
    tags: ["network", "resilience"],
  },
  {
    id: 3,
    title: "Document setup flow",
    description: "Write quick-start docs for local development and CI setup.",
    category: "docs",
    status: "archived",
    createdAt: "2026-03-28T13:45:00.000Z",
    score: 54,
    tags: ["onboarding", "guide"],
  },
  {
    id: 4,
    title: "Improve table keyboard support",
    description: "Add arrow-key navigation and row focus indication.",
    category: "ui",
    status: "published",
    createdAt: "2026-03-29T07:05:00.000Z",
    score: 78,
    tags: ["a11y", "table", "keyboard"],
  },
];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(dateISO: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateISO));
}

export default function TestComponent({
  title = "Complex Test Component",
  pageSize = 3,
  disabled = false,
  simulateDelayMs = 400,
  withRandomErrors = false,
  initialItems,
  onItemSelect,
  onItemsChange,
  onSubmit,
}: TestComponentProps) {
  const [items, setItems] = useState<TestItem[]>(initialItems ?? defaultItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | TestItem["category"]>("all");
  const [status, setStatus] = useState<"all" | ItemStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<TestItem["category"]>("ui");
  const [newScore, setNewScore] = useState(50);

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  useEffect(() => {
    const selected = items.find((item) => item.id === selectedId) ?? null;
    onItemSelect?.(selected);
  }, [selectedId, items, onItemSelect]);

  const filteredItems = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    const result = items.filter((item) => {
      const matchesQuery =
        lowerQuery.length === 0 ||
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
      const matchesCategory = category === "all" || item.category === category;
      const matchesStatus = status === "all" || item.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") comparison = a.title.localeCompare(b.title);
      if (sortBy === "score") comparison = a.score - b.score;
      if (sortBy === "createdAt") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [items, query, category, status, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pagedItems = filteredItems.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  async function simulateAction() {
    setIsLoading(true);
    setError(null);
    await wait(simulateDelayMs);
    if (withRandomErrors && Math.random() < 0.25) {
      setError("Случайная ошибка для теста обработки ошибок.");
      setIsLoading(false);
      return false;
    }
    setIsLoading(false);
    return true;
  }

  async function handleAddItem() {
    if (disabled || isLoading) return;
    if (!newTitle.trim() || !newDescription.trim()) {
      setError("Заполните title и description.");
      return;
    }

    const ok = await simulateAction();
    if (!ok) return;

    const newItem: TestItem = {
      id: Date.now(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      status: "draft",
      createdAt: new Date().toISOString(),
      score: newScore,
      tags: ["new", newCategory],
    };

    setItems((prev) => [newItem, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setNewScore(50);
    setCurrentPage(1);
  }

  async function handleArchiveSelected() {
    if (disabled || isLoading || selectedId == null) return;
    const ok = await simulateAction();
    if (!ok) return;

    setItems((prev) =>
      prev.map((item) => (item.id === selectedId ? { ...item, status: "archived" } : item)),
    );
  }

  async function handleSubmit() {
    if (disabled || isLoading) return;
    const ok = await simulateAction();
    if (!ok) return;
    onSubmit?.({
      message: "Submit from TestComponent",
      itemsCount: filteredItems.length,
    });
  }

  return (
    <section
      aria-busy={isLoading}
      aria-live="polite"
      className="tc-root"
      data-testid="test-component-root"
    >
      <header className="tc-header">
        <h2 className="tc-title">{title}</h2>
        <div className="tc-meta">
          Items: <strong data-testid="items-count">{filteredItems.length}</strong>
        </div>
      </header>

      <div className="tc-filter-grid">
        <label className="tc-field">
          Search
          <input
            data-testid="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="title, description, tag..."
            disabled={disabled || isLoading}
            className="tc-input"
          />
        </label>
        <label className="tc-field">
          Category
          <select
            data-testid="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof category)}
            disabled={disabled || isLoading}
            className="tc-input"
          >
            <option value="all">all</option>
            <option value="ui">ui</option>
            <option value="api">api</option>
            <option value="docs">docs</option>
          </select>
        </label>
        <label className="tc-field">
          Status
          <select
            data-testid="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            disabled={disabled || isLoading}
            className="tc-input"
          >
            <option value="all">all</option>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label>
      </div>

      <div className="tc-toolbar">
        <label className="tc-field tc-field-inline">
          Sort by
          <select
            data-testid="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            disabled={disabled || isLoading}
            className="tc-input"
          >
            <option value="createdAt">createdAt</option>
            <option value="score">score</option>
            <option value="title">title</option>
          </select>
        </label>
        <button
          type="button"
          data-testid="toggle-sort-order"
          onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
          disabled={disabled || isLoading}
        >
          Order: {sortOrder}
        </button>
        <button
          type="button"
          data-testid="archive-selected"
          onClick={handleArchiveSelected}
          disabled={disabled || isLoading || selectedId == null}
        >
          Archive selected
        </button>
        <button type="button" data-testid="submit-btn" onClick={handleSubmit} disabled={disabled || isLoading}>
          Simulate submit
        </button>
      </div>

      <ul data-testid="items-list" className="tc-list">
        {pagedItems.length === 0 ? (
          <li className="tc-empty">No items found.</li>
        ) : (
          pagedItems.map((item) => (
            <li
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedId(item.id);
              }}
              data-testid={`item-${item.id}`}
              className={`tc-item ${selectedId === item.id ? "is-selected" : ""}`}
            >
              <div className="tc-item-top">
                <strong>{item.title}</strong>
                <span className="tc-badge">{item.category}</span>
              </div>
              <p className="tc-item-description">{item.description}</p>
              <small className="tc-item-meta">
                status: {item.status} | score: {item.score} | {formatDate(item.createdAt)}
              </small>
            </li>
          ))
        )}
      </ul>

      <div className="tc-pagination">
        <button
          type="button"
          data-testid="prev-page"
          disabled={disabled || isLoading || currentPage <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
        </button>
        <span data-testid="pagination-state" className="tc-pagination-state">
          Page {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          data-testid="next-page"
          disabled={disabled || isLoading || currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      <fieldset
        className="tc-create"
        disabled={disabled || isLoading}
      >
        <legend>Create item</legend>
        <label className="tc-field">
          Title
          <input
            data-testid="new-title-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New task title"
            className="tc-input"
          />
        </label>
        <label className="tc-field">
          Description
          <textarea
            data-testid="new-description-input"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={3}
            placeholder="Detailed description"
            className="tc-input"
          />
        </label>
        <div className="tc-create-grid">
          <label className="tc-field">
            Category
            <select
              data-testid="new-category-select"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as TestItem["category"])}
              className="tc-input"
            >
              <option value="ui">ui</option>
              <option value="api">api</option>
              <option value="docs">docs</option>
            </select>
          </label>
          <label className="tc-field">
            Score: {newScore}
            <input
              data-testid="new-score-range"
              type="range"
              min={0}
              max={100}
              step={1}
              value={newScore}
              onChange={(e) => setNewScore(Number(e.target.value))}
              className="tc-range"
            />
          </label>
        </div>
        <button type="button" data-testid="add-item-btn" onClick={handleAddItem}>
          Add item
        </button>
      </fieldset>

      {isLoading ? (
        <p data-testid="loading-state" className="tc-loading">
          Loading...
        </p>
      ) : null}

      {error ? (
        <p data-testid="error-state" className="tc-error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
