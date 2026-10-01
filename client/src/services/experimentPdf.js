import { jsPDF } from "jspdf";

function formatDate(value, includeTime = false) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(
    undefined,
    includeTime
      ? {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      : { day: "numeric", month: "short", year: "numeric" },
  );
}

function printable(value) {
  if (value === null || value === undefined || String(value).trim() === "")
    return "Not recorded";
  return String(value);
}

export function createExperimentPdf({
  experiment,
  researcherName,
  protocols,
  reactions,
  observations,
  history,
}) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 17;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  function ensureSpace(height = 6) {
    if (y + height <= pageHeight - margin) return;
    pdf.addPage();
    y = margin;
  }

  function addSection(title) {
    ensureSpace(12);
    pdf.setFillColor(232, 243, 244);
    pdf.roundedRect(margin, y, contentWidth, 8, 1, 1, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(18, 91, 99);
    pdf.text(title.toUpperCase(), margin + 3, y + 5.4);
    y += 12;
  }

  function addField(label, value) {
    ensureSpace(10);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(87, 112, 126);
    pdf.text(label.toUpperCase(), margin, y);
    y += 4;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(35, 59, 74);
    const lines = pdf.splitTextToSize(printable(value), contentWidth);
    lines.forEach((line) => {
      ensureSpace(5);
      pdf.text(line, margin, y);
      y += 4.5;
    });
    y += 2;
  }

  const titleLines = pdf.splitTextToSize(
    printable(experiment.title),
    contentWidth - 16,
  );
  const headerHeight = Math.max(43, 27 + titleLines.length * 8);
  pdf.setFillColor(13, 62, 91);
  pdf.rect(0, 0, pageWidth, headerHeight, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(156, 213, 212);
  pdf.text("RESEARCH LABORATORY / EXPERIMENT REPORT", margin, 13);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.text(titleLines, margin, 24);
  y = headerHeight + 10;

  addSection("Experiment details");
  addField("Researcher", researcherName);
  addField("Status", experiment.status);
  addField("Experiment date", formatDate(experiment.date));
  addField("Created", formatDate(experiment.createdAt));
  addField("Description", experiment.description);

  addSection("Result / finding");
  addField("Result", experiment.result);

  addSection(`Protocols (${protocols.length})`);
  if (!protocols.length) addField("Protocols", "No protocols recorded.");
  protocols.forEach((item, index) => {
    addField(`Protocol ${index + 1} / Materials`, item.materials);
    addField(`Protocol ${index + 1} / Steps`, item.steps);
  });

  addSection(`Reactions (${reactions.length})`);
  if (!reactions.length) addField("Reactions", "No reactions recorded.");
  reactions.forEach((item, index) => {
    addField(`Reaction ${index + 1} / Reactants`, item.reactants);
    addField(`Reaction ${index + 1} / Products`, item.products);
    addField(`Reaction ${index + 1} / Conditions`, item.conditions);
  });

  addSection(`Observations (${observations.length})`);
  if (!observations.length)
    addField("Observations", "No observations recorded.");
  observations.forEach((item, index) => {
    addField(`Observation ${index + 1} / Date`, formatDate(item.date));
    addField(`Observation ${index + 1}`, item.observation);
  });

  addSection(`Experiment history (${history.length})`);
  if (!history.length) addField("History", "No history recorded.");
  history.forEach((item) =>
    addField(item.action, formatDate(item.timestamp, true)),
  );

  const totalPages = pdf.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor(218, 229, 233);
    pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(112, 132, 143);
    pdf.text("Research Laboratory Management System", margin, pageHeight - 7);
    pdf.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 7,
      {
        align: "right",
      },
    );
  }

  pdf.setProperties({
    title: `${experiment.title} - Experiment Report`,
    subject: "Research laboratory experiment data",
    author: "Research Laboratory Management System",
  });
  return pdf;
}

export function experimentPdfFilename(title) {
  const safeTitle = String(title || "experiment")
    .trim()
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return `${safeTitle || "experiment"}.pdf`;
}
