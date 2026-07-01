export const tokens = {
  brand: {
    primary:     '#111111',
    accent:      '#E84E1B',
    accentHover: '#C93F0F',
    accentLight: '#FFF0EC',
    surface:     '#F8F8F8',
    border:      '#E5E5E5',
    muted:       '#6B6B6B',
  },
  font: {
    display: "'Inter', 'Segoe UI', sans-serif",
    body:    "'Inter', 'Segoe UI', sans-serif",
    mono:    "'JetBrains Mono', 'Fira Code', monospace",
  },
  spacing: {
    section: '2.5rem',
    card:    '1.5rem',
  },
  status: {
    success: '#16A34A',
    error:   '#DC2626',
    warning: '#D97706',
    info:    '#2563EB',
  },
} as const;
