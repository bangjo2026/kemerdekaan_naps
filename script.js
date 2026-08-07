const canvas = document.getElementById("twibbonCanvas");
const ctx = canvas.getContext("2d");

const photoInput = document.getElementById("photoInput");
const zoomRange = document.getElementById("zoomRange");
const rotateRange = document.getElementById("rotateRange");
const zoomValue = document.getElementById("zoomValue");
const rotateValue = document.getElementById("rotateValue");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");
const emptyState = document.getElementById("emptyState");

const overlay = new Image();
overlay.src = "assets/twibbon.png";

let photo = null;
let scale = 1;
let rotation = 0;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let lastPointer = { x: 0, y: 0 };

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (photo) {
    ctx.save();
    ctx.translate(canvas.width / 2 + offsetX, 565 + offsetY);
    ctx.rotate(rotation * Math.PI / 180);

    const baseScale = Math.max(
      (630 / photo.width),
      (630 / photo.height)
    );
    const finalScale = baseScale * scale;
    const drawW = photo.width * finalScale;
    const drawH = photo.height * finalScale;

    ctx.drawImage(photo, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  if (overlay.complete) {
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
  }
}

function resetTransform() {
  scale = 1;
  rotation = 0;
  offsetX = 0;
  offsetY = 0;
  zoomRange.value = 100;
  rotateRange.value = 0;
  zoomValue.value = "100%";
  rotateValue.value = "0°";
  draw();
}

overlay.onload = draw;

photoInput.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      photo = img;
      emptyState.hidden = true;
      downloadBtn.disabled = false;
      resetTransform();
    };
    img.onerror = () => alert("Foto tidak dapat dibuka. Coba pilih file lain.");
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

zoomRange.addEventListener("input", () => {
  scale = Number(zoomRange.value) / 100;
  zoomValue.value = `${zoomRange.value}%`;
  draw();
});

rotateRange.addEventListener("input", () => {
  rotation = Number(rotateRange.value);
  rotateValue.value = `${rotateRange.value}°`;
  draw();
});

resetBtn.addEventListener("click", resetTransform);

canvas.addEventListener("pointerdown", (event) => {
  if (!photo) return;
  dragging = true;
  canvas.setPointerCapture(event.pointerId);
  lastPointer = { x: event.clientX, y: event.clientY };
});

canvas.addEventListener("pointermove", (event) => {
  if (!dragging || !photo) return;

  const rect = canvas.getBoundingClientRect();
  const ratioX = canvas.width / rect.width;
  const ratioY = canvas.height / rect.height;

  offsetX += (event.clientX - lastPointer.x) * ratioX;
  offsetY += (event.clientY - lastPointer.y) * ratioY;
  lastPointer = { x: event.clientX, y: event.clientY };
  draw();
});

function stopDragging(event) {
  if (!dragging) return;
  dragging = false;
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
}

canvas.addEventListener("pointerup", stopDragging);
canvas.addEventListener("pointercancel", stopDragging);

downloadBtn.addEventListener("click", () => {
  if (!photo) return;
  draw();

  const link = document.createElement("a");
  link.download = "twibbon-dirgahayu-indonesia-2026.png";
  link.href = canvas.toDataURL("image/png", 1);
  link.click();
});
