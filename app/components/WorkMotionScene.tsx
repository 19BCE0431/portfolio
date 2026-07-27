"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

const TAU = Math.PI * 2;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.roundRect(x, y, width, height, safeRadius);
}

function drawLabel(
  context: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  color = "rgba(238, 241, 248, 0.5)",
) {
  context.fillStyle = color;
  context.font = "500 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.fillText(label, x, y);
}

function drawPanel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  roundedRect(context, x, y, width, height, 8);
  context.fillStyle = "rgba(15, 17, 22, 0.78)";
  context.fill();
  context.strokeStyle = "rgba(255, 255, 255, 0.105)";
  context.lineWidth = 1;
  context.stroke();
}

function drawSignalChart(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  phase: number,
) {
  drawPanel(context, x, y, width, height);
  drawLabel(context, "MARKET SIGNALS", x + 20, y + 27);
  drawLabel(context, "LIVE", x + width - 48, y + 27, "rgba(126, 161, 255, 0.9)");

  const chartTop = y + 54;
  const chartHeight = height - 80;
  const points: Point[] = [];

  context.strokeStyle = "rgba(255, 255, 255, 0.06)";
  context.lineWidth = 1;
  for (let index = 0; index < 4; index += 1) {
    const lineY = chartTop + (chartHeight / 3) * index;
    context.beginPath();
    context.moveTo(x + 20, lineY);
    context.lineTo(x + width - 20, lineY);
    context.stroke();
  }

  for (let index = 0; index < 8; index += 1) {
    const progress = index / 7;
    const wave =
      Math.sin(progress * 7.2 + phase * TAU) * 0.13 +
      Math.sin(progress * 3.2 - phase * TAU * 0.5) * 0.08;
    const trend = 0.72 - progress * 0.36;
    points.push({
      x: x + 22 + progress * (width - 44),
      y: chartTop + (trend + wave) * chartHeight,
    });
  }

  const gradient = context.createLinearGradient(x, 0, x + width, 0);
  gradient.addColorStop(0, "rgba(128, 157, 235, 0.28)");
  gradient.addColorStop(0.52, "rgba(198, 210, 244, 0.88)");
  gradient.addColorStop(1, "rgba(80, 125, 247, 0.95)");

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.strokeStyle = gradient;
  context.lineWidth = 2;
  context.stroke();

  const activePoint = points[Math.floor(phase * points.length) % points.length];
  context.beginPath();
  context.arc(activePoint.x, activePoint.y, 4.5, 0, TAU);
  context.fillStyle = "#8eaeff";
  context.shadowColor = "rgba(86, 130, 248, 0.9)";
  context.shadowBlur = 16;
  context.fill();
  context.shadowBlur = 0;
}

function drawDecisionQueue(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  phase: number,
) {
  drawPanel(context, x, y, width, height);
  drawLabel(context, "DECISION QUEUE", x + 20, y + 27);

  const rows = [
    { label: "Customer signal", value: 0.84 },
    { label: "Product fit", value: 0.68 },
    { label: "Execution risk", value: 0.42 },
  ];

  rows.forEach((row, index) => {
    const rowY = y + 56 + index * 41;
    const pulse = 0.82 + Math.sin(phase * TAU + index * 1.8) * 0.08;
    drawLabel(context, row.label.toUpperCase(), x + 20, rowY);

    roundedRect(context, x + 20, rowY + 10, width - 40, 5, 2.5);
    context.fillStyle = "rgba(255, 255, 255, 0.08)";
    context.fill();

    roundedRect(
      context,
      x + 20,
      rowY + 10,
      (width - 40) * row.value * pulse,
      5,
      2.5,
    );
    context.fillStyle =
      index === 0 ? "rgba(93, 139, 255, 0.88)" : "rgba(218, 225, 241, 0.6)";
    context.fill();
  });
}

function drawConfidence(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  phase: number,
) {
  drawPanel(context, x, y, width, height);
  drawLabel(context, "MODEL CONFIDENCE", x + 18, y + 25);

  const value = 91 + Math.sin(phase * TAU) * 2.5;
  context.fillStyle = "rgba(246, 247, 250, 0.95)";
  context.font = "500 34px ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(`${Math.round(value)}%`, x + 18, y + 68);

  context.beginPath();
  context.arc(x + width - 34, y + 50, 13, -Math.PI / 2, Math.PI * 1.5);
  context.strokeStyle = "rgba(255, 255, 255, 0.1)";
  context.lineWidth = 3;
  context.stroke();

  context.beginPath();
  context.arc(
    x + width - 34,
    y + 50,
    13,
    -Math.PI / 2,
    -Math.PI / 2 + TAU * (value / 100),
  );
  context.strokeStyle = "#6f97ff";
  context.lineCap = "round";
  context.stroke();
  context.lineCap = "butt";
}

function drawFlow(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  phase: number,
  pointer: Point,
) {
  const nodes = [
    { x: width * 0.54, y: height * 0.26, label: "SIGNAL" },
    { x: width * 0.69, y: height * 0.45, label: "MODEL" },
    { x: width * 0.57, y: height * 0.7, label: "CHOICE" },
    { x: width * 0.84, y: height * 0.72, label: "ACTION" },
  ];

  const parallaxX = pointer.x * 8;
  const parallaxY = pointer.y * 6;

  context.strokeStyle = "rgba(149, 170, 224, 0.16)";
  context.lineWidth = 1;
  context.beginPath();
  nodes.forEach((node, index) => {
    const x = node.x + parallaxX;
    const y = node.y + parallaxY;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();

  nodes.forEach((node, index) => {
    const x = node.x + parallaxX;
    const y = node.y + parallaxY;
    const pulse = 1 + Math.sin(phase * TAU * 1.3 + index) * 0.18;

    context.beginPath();
    context.arc(x, y, 14 * pulse, 0, TAU);
    context.fillStyle = "rgba(28, 33, 46, 0.96)";
    context.fill();
    context.strokeStyle =
      index === Math.floor(phase * nodes.length) % nodes.length
        ? "rgba(112, 151, 255, 0.9)"
        : "rgba(255, 255, 255, 0.16)";
    context.stroke();

    drawLabel(context, node.label, x + 22, y + 4);
  });

  const segmentProgress = phase * (nodes.length - 1);
  const segment = Math.min(nodes.length - 2, Math.floor(segmentProgress));
  const local = segmentProgress - segment;
  const start = nodes[segment];
  const end = nodes[segment + 1];
  const x = start.x + (end.x - start.x) * local + parallaxX;
  const y = start.y + (end.y - start.y) * local + parallaxY;

  context.beginPath();
  context.arc(x, y, 3.5, 0, TAU);
  context.fillStyle = "#8cafff";
  context.shadowColor = "#5d8cff";
  context.shadowBlur = 18;
  context.fill();
  context.shadowBlur = 0;
}

export function WorkMotionScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let isVisible = true;
    let lastRenderTime = 0;
    let pointer = { x: 0, y: 0 };
    let targetPointer = { x: 0, y: 0 };

    const resize = () => {
      const bounds = wrapper.getBoundingClientRect();
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        bounds.width < 760 ? 1.25 : 1.5,
      );
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const handlePointer = (event: PointerEvent) => {
      const bounds = wrapper.getBoundingClientRect();
      targetPointer = {
        x: (event.clientX - bounds.left) / bounds.width - 0.5,
        y: (event.clientY - bounds.top) / bounds.height - 0.5,
      };
    };

    const handlePointerLeave = () => {
      targetPointer = { x: 0, y: 0 };
    };

    const render = (time: number) => {
      if (!isVisible) return;

      const targetFrameDuration = width < 760 ? 1000 / 30 : 1000 / 45;
      if (
        !shouldReduceMotion &&
        time - lastRenderTime < targetFrameDuration
      ) {
        frame = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = time;

      const phase = shouldReduceMotion ? 0.28 : (time % 12000) / 12000;
      pointer = {
        x: pointer.x + (targetPointer.x - pointer.x) * 0.045,
        y: pointer.y + (targetPointer.y - pointer.y) * 0.045,
      };

      context.clearRect(0, 0, width, height);

      const background = context.createRadialGradient(
        width * 0.76,
        height * 0.46,
        0,
        width * 0.76,
        height * 0.46,
        Math.max(width, height) * 0.72,
      );
      background.addColorStop(0, "rgba(30, 39, 62, 0.76)");
      background.addColorStop(0.46, "rgba(12, 15, 23, 0.72)");
      background.addColorStop(1, "#070709");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      const gridSize = Math.max(56, width / 18);
      context.strokeStyle = "rgba(255, 255, 255, 0.032)";
      context.lineWidth = 1;
      for (let x = width * 0.4; x < width; x += gridSize) {
        context.beginPath();
        context.moveTo(x + pointer.x * 5, 0);
        context.lineTo(x + pointer.x * 5, height);
        context.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        context.beginPath();
        context.moveTo(width * 0.38, y + pointer.y * 4);
        context.lineTo(width, y + pointer.y * 4);
        context.stroke();
      }

      if (width < 760) {
        drawSignalChart(
          context,
          width * 0.12 + pointer.x * 5,
          height * 0.12 + pointer.y * 4,
          width * 0.76,
          height * 0.45,
          phase,
        );
        drawConfidence(
          context,
          width * 0.38 - pointer.x * 5,
          height * 0.63 - pointer.y * 4,
          width * 0.5,
          height * 0.22,
          phase,
        );
      } else {
        drawFlow(context, width, height, phase, pointer);
        drawSignalChart(
          context,
          width * 0.61 + pointer.x * 8,
          height * 0.12 + pointer.y * 6,
          Math.min(350, width * 0.27),
          Math.min(220, height * 0.29),
          phase,
        );
        drawDecisionQueue(
          context,
          width * 0.68 - pointer.x * 7,
          height * 0.57 - pointer.y * 5,
          Math.min(300, width * 0.24),
          Math.min(190, height * 0.25),
          phase,
        );
        drawConfidence(
          context,
          width * 0.47 + pointer.x * 6,
          height * 0.5 + pointer.y * 5,
          Math.min(220, width * 0.18),
          96,
          phase,
        );
      }

      if (!shouldReduceMotion) frame = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        cancelAnimationFrame(frame);
        if (isVisible) frame = requestAnimationFrame(render);
      },
      { threshold: 0.01 },
    );
    resizeObserver.observe(wrapper);
    visibilityObserver.observe(wrapper);
    wrapper.addEventListener("pointermove", handlePointer);
    wrapper.addEventListener("pointerleave", handlePointerLeave);
    resize();
    render(performance.now());

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      wrapper.removeEventListener("pointermove", handlePointer);
      wrapper.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [shouldReduceMotion]);

  return (
    <div ref={wrapperRef} className="lux-work-motion" aria-hidden="true">
      <canvas ref={canvasRef} />
      <div className="lux-work-motion-vignette" />
      <div className="lux-work-motion-status">
        <span>Live decision system</span>
        <i />
      </div>
    </div>
  );
}
