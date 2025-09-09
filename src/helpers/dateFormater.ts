const toDateInput = (val?: string | Date | null) => {
  if (!val) return "";
  const d = typeof val === "string" ? new Date(val) : val;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

const toSqlDate = (val?: string | Date | null) => {
  // para payload al backend
  return toDateInput(val); // mismo formato YYYY-MM-DD
};

export { toDateInput, toSqlDate };
