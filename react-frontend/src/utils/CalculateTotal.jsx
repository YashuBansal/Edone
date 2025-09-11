export const calculateOrderTotal = (items = []) => {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalDiscount = items.reduce(
    (acc, item) => acc + item.price * (item.discount / 100) * item.quantity,
    0
  );

  const totalGst = items.reduce(
    (acc, item) =>
      acc +
      (item.price - item.price * (item.discount / 100)) *
        (item.gst / 100) *
        item.quantity,
    0
  );

  const grandTotal = subtotal - totalDiscount + totalGst;

  return { subtotal, totalDiscount, totalGst, grandTotal };
};