const API_URL = import.meta.env.VITE_API_URL;
const API = `${API_URL}/cart`;

const handleResponse = async (res: Response) => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const getCart = async (userId: string) => {
  const res = await fetch(`${API}/${userId}`);
  return handleResponse(res);
};

export const addToCart = async (userId: string, product: any) => {
  const res = await fetch(`${API}/${userId}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      productId: product._id,
      name: product.title,
      price: product.price,
      discount: product.discount,
      image: product.images?.[0],
      stock: product.stock,
      quantity: product.quantity || 1,
      selectedColor: product.selectedColor || product.color || "",
      selectedSize: product.selectedSize || product.size || "",
     }),
  });
  return handleResponse(res);
};

export const updateQuantity = async (
  userId: string,
  productId: string,
  selectedColor: string,
  selectedSize: string,
  quantity: number
) => {
  const res = await fetch(`${API}/${userId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, selectedColor, selectedSize, quantity }),
  });
  return handleResponse(res);
};

export const removeFromCart = async (userId: string, productId: string, selectedColor: string, selectedSize: string) => {
  const res = await fetch(`${API}/${userId}/remove/${productId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, selectedColor, selectedSize }),
  });
  return handleResponse(res);
};

export const clearCart = async (userId: string) => {
  const res = await fetch(`${API}/${userId}/clear`, { method: "DELETE" });
  return handleResponse(res);
};
