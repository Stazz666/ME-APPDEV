const foods = [
  { name: "Classic Cheeseburger", price: 50.00 },
  { name: "Margherita Pizza", price: 150.00 },
  { name: "Chicken Teriyaki Bowl", price: 80.00 },
  { name: "Garden Fresh Salad", price: 599.99 },
  { name: "Chocolate Lava Cake", price: 1499.00 }
];

// Add your Supabase project values here before publishing the app.
const SUPABASE_URL = "https://rovghkaizfwjsjjkjrpr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LPH-dZbbU3HeVf7yhglYOQ_pt08t0TY";
const supabaseReady = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("YOUR_") &&
  !SUPABASE_ANON_KEY.includes("YOUR_")
);
const supabaseClient = supabaseReady && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const foodSelect = document.querySelector("#food");
const priceOutput = document.querySelector("#price");
const quantityInput = document.querySelector("#quantity");
const totalOutput = document.querySelector("#total");
const form = document.querySelector("#order-form");
const statusMessage = document.querySelector("#status-message");

foods.forEach((food, index) => {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = `${food.name} - ₱${food.price.toFixed(2)}`;
  foodSelect.append(option);
});

function updatePrice() {
  const food = foods[Number(foodSelect.value)];
  const quantity = Math.max(1, Number(quantityInput.value) || 1);
  priceOutput.textContent = `₱${food.price.toFixed(2)}`;
  totalOutput.textContent = `₱${(food.price * quantity).toFixed(2)}`;
}

foodSelect.addEventListener("change", updatePrice);
quantityInput.addEventListener("input", updatePrice);
updatePrice();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusMessage.className = "status-message";
  statusMessage.textContent = "Saving your order...";

  const food = foods[Number(foodSelect.value)];
  const quantity = Math.max(1, Number(quantityInput.value) || 1);
  const order = {
    customer_name: document.querySelector("#customer-name").value.trim(),
    food_name: food.name,
    price: food.price,
    quantity,
    total: Number((food.price * quantity).toFixed(2))
  };

  try {
    if (!window.supabase) {
      throw new Error("Supabase library did not load. Check your internet connection and reload the page.");
    }
    if (!supabaseClient) {
      throw new Error("Supabase URL or key is missing in script.js.");
    }
    const { error } = await supabaseClient.from("orders").insert(order);
    if (error) {
      if (error.code === "42P01") {
        throw new Error("The orders table is missing. Run supabase-schema.sql in the Supabase SQL Editor.");
      }
      if (error.code === "42501") {
        throw new Error("Supabase permission denied. Run supabase-schema.sql again to create the insert policy.");
      }
      throw new Error(error.message || "Supabase could not save the order.");
    }
    statusMessage.textContent = "Order successfully placed!";
    form.reset();
    updatePrice();
  } catch (error) {
    statusMessage.className = "status-message error";
    statusMessage.textContent = error.message;
  }
});
