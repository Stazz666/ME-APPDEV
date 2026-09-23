const foods = [
  { name: "Classic Cheeseburger", price: 50.00 },
  { name: "Margherita Pizza", price: 150.00 },
  { name: "Chicken Teriyaki Bowl", price: 89.00 },
  { name: "Garden Fresh Salad", price: 159.00 },
  { name: "Chocolate Lava Cake", price: 1250.00 }
];

const SUPABASE_URL = "https://rovghkaizfwjsjjkjrpr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LPH-dZbbU3HeVf7yhglYOQ_pt08t0TY";

const foodSelect = document.querySelector("#food");
const priceOutput = document.querySelector("#price");
const quantityInput = document.querySelector("#quantity");
const totalOutput = document.querySelector("#total");
const form = document.querySelector("#order-form");
const statusMessage = document.querySelector("#status-message");

// Load food choices
function loadFoods() {
  foodSelect.innerHTML = "";

  foods.forEach((food, index) => {
    const option = document.createElement("option");

    option.value = index;
    option.textContent = `${food.name} - ₱${food.price.toFixed(2)}`;

    foodSelect.appendChild(option);
  });

  foodSelect.selectedIndex = 0;
  updatePrice();
}

// Update price and total
function updatePrice() {
  const index = Number(foodSelect.value);
  const food = foods[index];

  if (!food) {
    priceOutput.textContent = "₱0.00";
    totalOutput.textContent = "₱0.00";
    return;
  }

  const quantity = Math.max(
    1,
    Number(quantityInput.value) || 1
  );

  priceOutput.textContent = `₱${food.price.toFixed(2)}`;
  totalOutput.textContent =
    `₱${(food.price * quantity).toFixed(2)}`;
}

foodSelect.addEventListener("change", updatePrice);
quantityInput.addEventListener("input", updatePrice);

// Load choices when page starts
loadFoods();

// Submit order
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  statusMessage.className = "status-message";
  statusMessage.textContent = "Saving your order...";

  const index = Number(foodSelect.value);
  const food = foods[index];

  if (!food) {
    statusMessage.className = "status-message error";
    statusMessage.textContent = "Please choose a food.";
    return;
  }

  const quantity = Math.max(
    1,
    Number(quantityInput.value) || 1
  );

  const order = {
    customer_name:
      document.querySelector("#customer-name").value.trim(),

    food_name: food.name,
    price: food.price,
    quantity: quantity,
    total: Number(
      (food.price * quantity).toFixed(2)
    )
  };

  try {
    if (!window.supabase) {
      throw new Error(
        "Supabase library did not load. Please reload the page."
      );
    }

    const supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    const { error } = await supabaseClient
      .from("orders")
      .insert(order);

    if (error) {
      throw new Error(error.message);
    }

    statusMessage.textContent =
      "Order successfully placed!";

    form.reset();

    foodSelect.selectedIndex = 0;
    quantityInput.value = 1;

    updatePrice();

  } catch (error) {
    statusMessage.className = "status-message error";
    statusMessage.textContent = error.message;
  }
});
