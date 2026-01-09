export const formatDate = (dateString) => {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("en-GB", options);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatTime = (timeString) => {
  if (!timeString) return "";
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
