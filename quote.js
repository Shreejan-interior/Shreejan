"use strict";

(() => {
  const STORAGE_KEY = "shreejan-quote-state";
  const builder = document.querySelector("#quote-builder");
  const roomList = document.querySelector("#room-list");
  const quoteItems = document.querySelector("#quote-items");
  const totalsElement = document.querySelector("#quote-totals");
  const whatsappQuote = document.querySelector("#whatsapp-quote");
  const rates = { Essential: 1200, Premium: 1900, Luxury: 3000 };
  const serviceDetails = {
    visualisation: { label: "3D visualisation", rate: 6000, basis: "per room" },
    supervision: { label: "Site supervision", rate: 60, basis: "per sq ft" },
    management: { label: "Project management", rate: 0.04, basis: "of works" },
    styling: { label: "Styling & soft furnishing", rate: 18000, basis: "per room" },
    lighting: { label: "Lighting design", rate: 40, basis: "per sq ft" },
    model: { label: "Model room (hotels)", rate: 250000, basis: "fixed" }
  };
  const byName = (name) => builder.elements.namedItem(name);
  const today = new Date();
  const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const isoMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
  const newQuoteNumber = () => `SJ-${isoMonth}-${String(Math.floor(100 + Math.random() * 900)).padStart(3, "0")}`;

  const makeRoom = (name = "", area = "", tier = "Essential") => ({ name, area, tier });
  const twoBhkRooms = () => [
    makeRoom("Living & dining", 320, "Premium"),
    makeRoom("Master bedroom", 180, "Premium"),
    makeRoom("Second bedroom", 140, "Essential"),
    makeRoom("Kitchen", 110, "Luxury"),
    makeRoom("Bathrooms (2)", 90, "Premium")
  ];
  const threeBhkRooms = () => [
    makeRoom("Living & dining", 400, "Premium"),
    makeRoom("Master bedroom", 220, "Premium"),
    makeRoom("Second bedroom", 170, "Essential"),
    makeRoom("Third bedroom", 160, "Essential"),
    makeRoom("Kitchen", 120, "Luxury"),
    makeRoom("Bathrooms (3)", 135, "Premium")
  ];
  const villaRooms = () => [
    makeRoom("Great room & dining", 900, "Luxury"),
    makeRoom("Kitchen & pantry", 300, "Luxury"),
    makeRoom("Master suite", 600, "Luxury"),
    makeRoom("Guest bedrooms (4)", 1400, "Premium"),
    makeRoom("Bathrooms (5)", 450, "Luxury"),
    makeRoom("Terrace & pool deck", 1200, "Premium"),
    makeRoom("Owner's lock-off suite", 350, "Premium")
  ];
  const initialState = () => ({
    clientName: "",
    clientContact: "",
    address: "",
    projectType: "Full home",
    rooms: twoBhkRooms(),
    services: [],
    feePercent: 8,
    discountPercent: 0,
    gstPercent: 18,
    validDays: 30,
    quoteNumber: newQuoteNumber(),
    notes: ""
  });
  const validRoom = (room) => room && typeof room.name === "string" &&
    ["Essential", "Premium", "Luxury"].includes(room.tier);
  const sanitizeState = (value) => {
    if (!value || typeof value !== "object" || !Array.isArray(value.rooms)) return null;
    return {
      ...initialState(),
      clientName: typeof value.clientName === "string" ? value.clientName : "",
      clientContact: typeof value.clientContact === "string" ? value.clientContact : "",
      address: typeof value.address === "string" ? value.address : "",
      projectType: typeof value.projectType === "string" ? value.projectType : "Full home",
      rooms: value.rooms.filter(validRoom).map((room) => makeRoom(
        room.name.slice(0, 100),
        Number.isFinite(Number(room.area)) && Number(room.area) >= 0 ? Number(room.area) : "",
        room.tier
      )),
      services: Array.isArray(value.services) ? value.services.filter((item) => Object.prototype.hasOwnProperty.call(serviceDetails, item)) : [],
      feePercent: Number.isFinite(Number(value.feePercent)) ? Number(value.feePercent) : 8,
      discountPercent: Number.isFinite(Number(value.discountPercent)) ? Number(value.discountPercent) : 0,
      gstPercent: Number.isFinite(Number(value.gstPercent)) ? Number(value.gstPercent) : 18,
      validDays: Number.isFinite(Number(value.validDays)) && Number(value.validDays) > 0 ? Number(value.validDays) : 30,
      quoteNumber: typeof value.quoteNumber === "string" && /^SJ-\d{6}-\d{3}$/.test(value.quoteNumber) ? value.quoteNumber : newQuoteNumber(),
      notes: typeof value.notes === "string" ? value.notes : ""
    };
  };
  let state = initialState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const restored = sanitizeState(JSON.parse(saved));
      if (restored) state = restored;
      else console.warn("Saved quote data had an invalid structure; starting a fresh quote.");
    }
  } catch (error) {
    console.warn("Could not restore the saved quote. Starting a fresh quote.", error);
  }

  const formatMoney = (amount) => `₹${Math.round(Number.isFinite(amount) ? amount : 0).toLocaleString("en-IN")}`;
  const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const numericValue = (name) => {
    const value = Number(byName(name).value);
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  };
  const setFormValues = () => {
    for (const name of ["clientName", "clientContact", "address", "projectType", "feePercent", "discountPercent", "gstPercent", "validDays", "quoteNumber", "notes"]) {
      byName(name).value = state[name];
    }
    builder.querySelectorAll('input[name="service"]').forEach((input) => {
      input.checked = state.services.includes(input.value);
    });
  };
  const renderRooms = () => {
    roomList.innerHTML = state.rooms.map((room, index) => `
      <div class="room-row" data-room-index="${index}">
        <div class="field"><label for="room-name-${index}">Room name</label><input id="room-name-${index}" data-room-field="name" value="${escapeHtml(room.name)}" maxlength="100" placeholder="Room or space"></div>
        <div class="field"><label for="room-area-${index}">Area sq ft</label><input id="room-area-${index}" data-room-field="area" type="number" min="0" step="1" value="${room.area}" placeholder="sq ft"></div>
        <div class="field"><label for="room-tier-${index}">Finish tier</label><select id="room-tier-${index}" data-room-field="tier">${Object.keys(rates).map((tier) => `<option${room.tier === tier ? " selected" : ""}>${tier}</option>`).join("")}</select></div>
        <button class="remove-room" type="button" data-remove-room="${index}" aria-label="Remove ${escapeHtml(room.name || `room ${index + 1}`)}">×</button>
      </div>`).join("");
  };
  const addServiceRows = (items, totalArea, roomCount, works) => {
    for (const key of state.services) {
      const detail = serviceDetails[key];
      let quantity = 1;
      let rate = detail.rate;
      let amount = detail.rate;
      if (key === "visualisation" || key === "styling") {
        quantity = roomCount;
        amount = detail.rate * quantity;
      } else if (key === "supervision" || key === "lighting") {
        quantity = totalArea;
        amount = detail.rate * quantity;
      } else if (key === "management") {
        rate = works * detail.rate;
        amount = rate;
      }
      items.push({
        name: detail.label,
        sub: key === "management" ? "4% of works" : detail.basis,
        quantity,
        rate,
        amount
      });
    }
  };
  const appendTotal = (label, amount, extra = "") => `<div class="total-row"><span>${label}${extra}</span><span>${formatMoney(amount)}</span></div>`;
  const renderPreview = () => {
    const roomItems = state.rooms.map((room, index) => {
      const name = room.name.trim();
      const area = Math.max(0, Number(room.area) || 0);
      const rate = rates[room.tier];
      return {
        name: name || `Room ${index + 1}`,
        sub: name ? `${room.tier} finish` : area ? "Add a room name" : "Add a room name and area",
        quantity: area,
        rate,
        amount: area * rate,
        active: Boolean(name || area)
      };
    });
    const totalArea = roomItems.reduce((sum, room) => sum + room.quantity, 0);
    const works = roomItems.reduce((sum, room) => sum + room.amount, 0);
    const designFee = works * numericValue("feePercent") / 100;
    const items = [...roomItems];
    addServiceRows(items, totalArea, roomItems.filter((room) => room.active).length, works);
    const addOns = items.slice(roomItems.length).reduce((sum, item) => sum + item.amount, 0);
    const subtotal = works + designFee + addOns;
    const discount = subtotal * numericValue("discountPercent") / 100;
    const gst = (subtotal - discount) * numericValue("gstPercent") / 100;
    const total = subtotal - discount + gst;
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const validUntil = new Date(todayAtMidnight);
    validUntil.setDate(validUntil.getDate() + numericValue("validDays"));

    document.querySelector('[data-preview="number"]').textContent = state.quoteNumber;
    document.querySelector('[data-preview="date"]').textContent = dateFormat.format(todayAtMidnight);
    document.querySelector('[data-preview="valid-until"]').textContent = dateFormat.format(validUntil);
    document.querySelector('[data-preview="client"]').textContent = state.clientName.trim() || "Client name";
    document.querySelector('[data-preview="contact"]').textContent = state.clientContact.trim() || "Phone or email";
    document.querySelector('[data-preview="project"]').textContent = state.projectType || "Project type";
    document.querySelector('[data-preview="address"]').textContent = state.address.trim() || "Site address";
    document.querySelector('[data-preview="notes"]').textContent = state.notes.trim() || "No additional notes.";
    const whatsappUrl = new URL("https://wa.me/917742517708");
    whatsappUrl.searchParams.set("text", `Hello, I have a query about quote ${state.quoteNumber} for ${state.projectType}. The current estimate is ${formatMoney(total)}. Please get in touch.`);
    whatsappQuote.href = whatsappUrl.toString();
    quoteItems.innerHTML = items.map((item) => `<tr><td>${escapeHtml(item.name)}<small>${escapeHtml(item.sub)}</small><small class="rate-mobile">${formatMoney(item.rate)} each</small></td><td>${item.quantity.toLocaleString("en-IN")}</td><td>${formatMoney(item.rate)}</td><td>${formatMoney(item.amount)}</td></tr>`).join("") || '<tr><td colspan="4">Add a room to begin your estimate.</td></tr>';
    const totals = [
      appendTotal("Works", works, ` <small>(${roomItems.length} rooms · ${totalArea.toLocaleString("en-IN")} sq ft)</small>`),
      appendTotal("Design fee & services", designFee + addOns),
      appendTotal("Subtotal", subtotal)
    ];
    if (discount > 0) totals.push(appendTotal(`Discount (${numericValue("discountPercent")}%)`, -discount));
    totals.push(appendTotal(`GST (${numericValue("gstPercent")}%)`, gst));
    totals.push(`<div class="total-row total-grand"><span>Total</span><span>${formatMoney(total)}</span></div>`);
    totalsElement.innerHTML = totals.join("");
  };
  const persistAndRender = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Could not save this quote in local storage.", error);
    }
    renderPreview();
  };
  const syncStateFromForm = () => {
    for (const name of ["clientName", "clientContact", "address", "projectType", "quoteNumber", "notes"]) state[name] = byName(name).value;
    for (const name of ["feePercent", "discountPercent", "gstPercent", "validDays"]) state[name] = byName(name).value === "" ? 0 : numericValue(name);
    state.services = Array.from(builder.querySelectorAll('input[name="service"]:checked'), (input) => input.value);
  };
  const setPreset = (preset) => {
    state.rooms = preset === "villa" ? villaRooms() : preset === "3bhk" ? threeBhkRooms() : twoBhkRooms();
    state.services = preset === "villa"
      ? ["visualisation", "supervision", "management", "styling", "lighting"]
      : ["visualisation", "supervision"];
    state.projectType = preset === "villa" ? "Villa" : "Full home";
    setFormValues();
    renderRooms();
    persistAndRender();
  };

  setFormValues();
  renderRooms();
  renderPreview();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save the initial quote in local storage.", error);
  }

  const updateRoomFromEvent = (event) => {
    const target = event.target;
    const row = target.closest("[data-room-index]");
    if (!row || !target.dataset.roomField) return;
    const room = state.rooms[Number(row.dataset.roomIndex)];
    if (!room || !["name", "area", "tier"].includes(target.dataset.roomField)) return;
    room[target.dataset.roomField] = target.value;
    persistAndRender();
  };
  roomList.addEventListener("input", updateRoomFromEvent);
  roomList.addEventListener("change", (event) => {
    if (event.target.matches("select[data-room-field]")) updateRoomFromEvent(event);
  });
  builder.addEventListener("input", (event) => {
    if (event.target.closest("[data-room-index]")) return;
    syncStateFromForm();
    persistAndRender();
  });
  builder.addEventListener("change", (event) => {
    if (event.target.closest("[data-room-index]")) return;
    syncStateFromForm();
    persistAndRender();
  });
  roomList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-room]");
    if (!button) return;
    state.rooms.splice(Number(button.dataset.removeRoom), 1);
    renderRooms();
    persistAndRender();
  });
  document.querySelector("#add-room").addEventListener("click", () => {
    state.rooms.push(makeRoom("", "", "Essential"));
    renderRooms();
    persistAndRender();
    roomList.querySelector(".room-row:last-child [data-room-field='name']").focus();
  });
  document.querySelector("#preset-2bhk").addEventListener("click", () => setPreset("2bhk"));
  document.querySelector("#preset-3bhk").addEventListener("click", () => setPreset("3bhk"));
  document.querySelector("#preset-villa").addEventListener("click", () => setPreset("villa"));
  document.querySelector("#clear-quote").addEventListener("click", () => {
    state = initialState();
    setFormValues();
    renderRooms();
    persistAndRender();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const pdfMessage = document.querySelector("#pdf-message");
  document.querySelector("#download-quote").addEventListener("click", () => {
    pdfMessage.classList.add("visible");
    window.print();
  });
})();
