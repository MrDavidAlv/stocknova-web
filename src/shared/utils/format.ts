export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(value);
};

export const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
