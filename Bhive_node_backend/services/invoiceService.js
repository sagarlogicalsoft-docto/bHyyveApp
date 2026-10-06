const fs = require("fs");
const path = require("path");

// ============================================================
// LAYOUT + THEME
// ============================================================

const PAGE_MARGIN = 30;
const CONTENT_WIDTH = 535;
const BOTTOM_LIMIT = 780;

const COLORS = {
  border: "#000000",
  text: "#000000",
  muted: "#777777",
  title: "#000000",
  headerBg: "#eeeeee",
  totalBg: "#eeeeee",
  veg: "#16a34a",
  nonVeg: "#dc2626",
};

const FONT = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
};

// ============================================================
// TABLE COLUMNS
// ============================================================

const COLUMNS = [
  { title: "Sr.No", width: 40, align: "right" },
  { title: "Image", width: 65, align: "center" },
  { title: "Service", width: 175, align: "left" },
  { title: "Rate", width: 65, align: "right" },
  { title: "Qty", width: 45, align: "right" },
  { title: "Amount", width: 72, align: "right" },
  { title: "Total", width: 73, align: "right" },
];

const SUMMARY_LABEL_WIDTH = 435;
const SUMMARY_VALUE_WIDTH =
  CONTENT_WIDTH - SUMMARY_LABEL_WIDTH;

// ============================================================
// SMALL HELPERS
// ============================================================

const money = (value) =>
  `$ ${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value || "")
    : date.toISOString().slice(0, 10);
};

// ============================================================
// MAIN TEMPLATE
// ============================================================

const drawRestaurantInvoice = (pdf, result) => {
  const customerName =
    `${result.fname || ""} ${result.lname || ""}`.trim();

  const address =
    result.delivery_address || "N/A";

  // ==========================================================
  // PAGE HELPER
  // ==========================================================

  const startNewPage = () => {
    pdf.addPage();
    return PAGE_MARGIN;
  };

  // ==========================================================
  // LABEL + VALUE
  // ==========================================================

  const labelValue = (
    label,
    value,
    x,
    y,
    width,
    align = "left"
  ) => {
    const labelText = `${label} `;
    const valueText = String(value ?? "");

    pdf
      .fontSize(10)
      .fillColor(COLORS.text);

    if (align === "left") {
      pdf
        .font(FONT.bold)
        .text(labelText, x, y, {
          width,
          continued: true,
        })
        .font(FONT.regular)
        .text(valueText, {
          continued: false,
        });

      return;
    }

    const labelWidth = pdf
      .font(FONT.bold)
      .widthOfString(labelText);

    const valueWidth = pdf
      .font(FONT.regular)
      .widthOfString(valueText);

    const totalWidth =
      labelWidth + valueWidth;

    const startX =
      align === "right"
        ? x + width - totalWidth
        : x + (width - totalWidth) / 2;

    pdf
      .font(FONT.bold)
      .text(labelText, startX, y, {
        lineBreak: false,
      });

    pdf
      .font(FONT.regular)
      .text(
        valueText,
        startX + labelWidth,
        y,
        {
          lineBreak: false,
        }
      );

    pdf.x = x;
    pdf.y = y + pdf.currentLineHeight();
  };

  // ==========================================================
  // HEADER
  // ==========================================================

  // Main invoice title
  // EDITION: reduced size + black color
  pdf
    .font(FONT.bold)
    .fontSize(18)
    .fillColor(COLORS.text)
    .text(
      "bHyyve Invoice",
      PAGE_MARGIN,
      PAGE_MARGIN,
      {
        width: CONTENT_WIDTH,
        align: "center",
      }
    );

  pdf.moveDown(0.55);

  labelValue(
    "Customer Name:",
    customerName || "N/A",
    PAGE_MARGIN,
    pdf.y,
    CONTENT_WIDTH,
    "right"
  );

  pdf.moveDown(0.75);

  // Header separator
  pdf
    .moveTo(
      PAGE_MARGIN,
      pdf.y
    )
    .lineTo(
      PAGE_MARGIN + CONTENT_WIDTH,
      pdf.y
    )
    .lineWidth(0.8)
    .strokeColor(COLORS.border)
    .stroke();

  pdf.moveDown(0.9);

  // Invoice section heading
  pdf
    .font(FONT.bold)
    .fontSize(15)
    .fillColor(COLORS.text)
    .text(
      "Invoice",
      PAGE_MARGIN,
      pdf.y
    );

  pdf.moveDown(0.55);

  // ==========================================================
  // INVOICE / CUSTOMER DETAILS
  // ==========================================================

  const halfWidth =
    CONTENT_WIDTH / 2;

  const infoPadding = 8;

  const drawInfoRow = (
    left,
    right
  ) => {
    const rowY = pdf.y;

    const innerWidth =
      halfWidth -
      infoPadding * 2;

    const measure = (cell) => {
      if (!cell) return 0;

      pdf
        .font(
          cell.bold
            ? FONT.bold
            : FONT.regular
        )
        .fontSize(9.5);

      const text = cell.label
        ? `${cell.label} ${cell.value}`
        : cell.plain;

      return pdf.heightOfString(
        String(text || " "),
        {
          width: innerWidth,
        }
      );
    };

    const rowHeight =
      Math.max(
        26,
        Math.max(
          measure(left),
          measure(right)
        ) + 16
      );

    // Left cell
    pdf
      .lineWidth(0.8)
      .strokeColor(COLORS.border)
      .rect(
        PAGE_MARGIN,
        rowY,
        halfWidth,
        rowHeight
      )
      .stroke();

    // Right cell
    pdf
      .rect(
        PAGE_MARGIN + halfWidth,
        rowY,
        halfWidth,
        rowHeight
      )
      .stroke();

    const textY =
      rowY + 8;

    // --------------------------------------------------------
    // LEFT
    // --------------------------------------------------------

    if (left?.label) {
      labelValue(
        left.label,
        left.value,
        PAGE_MARGIN +
          infoPadding,
        textY,
        innerWidth
      );
    } else if (left?.plain) {
      pdf
        .font(
          left.bold
            ? FONT.bold
            : FONT.regular
        )
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          left.plain,
          PAGE_MARGIN +
            infoPadding,
          textY,
          {
            width: innerWidth,
          }
        );
    }

    // --------------------------------------------------------
    // RIGHT
    // --------------------------------------------------------

    if (
      right?.plain !==
      undefined
    ) {
      pdf
        .font(
          right.bold
            ? FONT.bold
            : FONT.regular
        )
        .fontSize(9)
        .fillColor(COLORS.text)
        .text(
          String(right.plain),
          PAGE_MARGIN +
            halfWidth +
            infoPadding,
          textY,
          {
            width: innerWidth,
            align: "right",
          }
        );
    }

    pdf.y =
      rowY + rowHeight;
  };

  drawInfoRow(
    {
      label: "Invoice:",
      value: `#${result.invoice_number || ""}`,
    },
    {
      plain: "Customer Details",
      bold: true,
    }
  );

  drawInfoRow(
    {
      label: "Order Date:",
      value: formatDate(
        result.date
      ),
    },
    {
      plain:
        customerName ||
        "N/A",
    }
  );

  drawInfoRow(
    {
      label: "Booking Id :",
      value:
        result.booking_id ||
        "",
    },
    {
      plain: address,
    }
  );

  drawInfoRow(
    null,
    {
      plain:
        result.mobile ||
        "",
    }
  );

  // ==========================================================
  // SERVICE INVOICE TABLE
  // ==========================================================

  let y =
    pdf.y + 22;

  // Section heading
  pdf
    .font(FONT.bold)
    .fontSize(13)
    .fillColor(COLORS.text)
    .text(
      "Service Invoice",
      PAGE_MARGIN,
      y
    );

  y =
    pdf.y + 8;

  const HEADER_HEIGHT = 28;

  // ==========================================================
  // TABLE HEADER
  // ==========================================================

  const drawTableHeader = (
    top
  ) => {
    let x =
      PAGE_MARGIN;

    COLUMNS.forEach(
      (column) => {
        pdf
          .rect(
            x,
            top,
            column.width,
            HEADER_HEIGHT
          )
          .fillAndStroke(
            COLORS.headerBg,
            COLORS.border
          );

        pdf
          .font(FONT.bold)
          .fontSize(8.5)
          .fillColor(
            COLORS.text
          )
          .text(
            column.title,
            x + 5,
            top + 10,
            {
              width:
                column.width -
                10,

              align:
                column.align ===
                "center"
                  ? "center"
                  : "left",
            }
          );

        x +=
          column.width;
      }
    );

    return (
      top +
      HEADER_HEIGHT
    );
  };

  y =
    drawTableHeader(y);

  // ==========================================================
  // PRODUCTS
  // ==========================================================

  const products =
    result.product_list ||
    [];

  if (!products.length) {
    pdf
      .lineWidth(0.8)
      .rect(
        PAGE_MARGIN,
        y,
        CONTENT_WIDTH,
        32
      )
      .stroke(
        COLORS.border
      );

    pdf
      .font(FONT.regular)
      .fontSize(9)
      .fillColor(
        COLORS.text
      )
      .text(
        "No items found for this order.",
        PAGE_MARGIN,
        y + 11,
        {
          width:
            CONTENT_WIDTH,
          align: "center",
        }
      );

    y += 32;
  }

  products.forEach(
    (item, index) => {
      const serviceWidth =
        COLUMNS[2].width -
        12;

      const itemType =
        String(
          item.item_type ||
            ""
        ).toLowerCase();

      const typeLabel =
        itemType === "veg"
          ? "(Veg)"
          : itemType ===
              "non-veg"
          ? "(Non-Veg)"
          : "";

      const typeColor =
        itemType === "veg"
          ? COLORS.veg
          : COLORS.nonVeg;

      const description =
        item.description ||
        "";

      // --------------------------------------------------------
      // Measure service content
      // --------------------------------------------------------

      pdf
        .font(FONT.bold)
        .fontSize(8.5);

      const nameHeight =
        pdf.heightOfString(
          item.name || "",
          {
            width:
              serviceWidth,
          }
        );

      pdf
        .font(FONT.regular)
        .fontSize(8);

      const typeHeight =
        typeLabel
          ? pdf.heightOfString(
              typeLabel,
              {
                width:
                  serviceWidth,
              }
            )
          : 0;

      pdf.fontSize(7.5);

      const descHeight =
        description
          ? pdf.heightOfString(
              description,
              {
                width:
                  serviceWidth,
              }
            )
          : 0;

      const rowHeight =
        Math.max(
          50,
          nameHeight +
            typeHeight +
            descHeight +
            20
        );

      // --------------------------------------------------------
      // Page break
      // --------------------------------------------------------

      if (
        y + rowHeight >
        BOTTOM_LIMIT
      ) {
        y =
          startNewPage();

        y =
          drawTableHeader(y);
      }

      // --------------------------------------------------------
      // Amounts
      // --------------------------------------------------------

      const price =
        Number(
          item.price || 0
        );

      const quantity =
        Number(
          item.quantity || 0
        );

      const lineAmount =
        price * quantity;

      const lineTotal =
        item.final_amount ??
        lineAmount;

      const cellValues = [
        String(index + 1),
        null,
        null,
        money(price),
        String(quantity),
        money(lineAmount),
        money(lineTotal),
      ];

      // --------------------------------------------------------
      // Draw cells
      // --------------------------------------------------------

      let x =
        PAGE_MARGIN;

      COLUMNS.forEach(
        (
          column,
          columnIndex
        ) => {
          pdf
            .lineWidth(0.8)
            .rect(
              x,
              y,
              column.width,
              rowHeight
            )
            .stroke(
              COLORS.border
            );

          // ----------------------------------------------------
          // IMAGE
          // ----------------------------------------------------

          if (
            columnIndex === 1
          ) {
            if (item.image) {
              const imagePath =
                path.join(
                  __dirname,
                  "../../assets/images",
                  item.image
                );

              try {
                if (
                  fs.existsSync(
                    imagePath
                  )
                ) {
                  pdf.image(
                    imagePath,
                    x + 8,
                    y + 8,
                    {
                      fit: [
                        column.width -
                          16,
                        Math.min(
                          rowHeight -
                            16,
                          60
                        ),
                      ],
                      align:
                        "center",
                      valign:
                        "top",
                    }
                  );
                }
              } catch (error) {
                console.log(
                  "Invoice item image could not be rendered:",
                  imagePath
                );
              }
            }

          // ----------------------------------------------------
          // SERVICE
          // ----------------------------------------------------

          } else if (
            columnIndex === 2
          ) {
            let textY =
              y + 8;

            // Service name
            pdf
              .font(FONT.bold)
              .fontSize(8.5)
              .fillColor(
                COLORS.text
              )
              .text(
                item.name || "",
                x + 6,
                textY,
                {
                  width:
                    serviceWidth,
                }
              );

            textY +=
              nameHeight + 1;

            // Veg / Non-Veg
            if (typeLabel) {
              pdf
                .font(
                  FONT.regular
                )
                .fontSize(8)
                .fillColor(
                  typeColor
                )
                .text(
                  typeLabel,
                  x + 6,
                  textY,
                  {
                    width:
                      serviceWidth,
                  }
                );

              textY +=
                typeHeight + 1;
            }

            // Description
            if (description) {
              pdf
                .font(
                  FONT.regular
                )
                .fontSize(7.5)
                .fillColor(
                  COLORS.muted
                )
                .text(
                  description,
                  x + 6,
                  textY,
                  {
                    width:
                      serviceWidth,
                  }
                );
            }

          // ----------------------------------------------------
          // NORMAL CELLS
          // ----------------------------------------------------

          } else {
            pdf
              .font(
                FONT.regular
              )
              .fontSize(8.5)
              .fillColor(
                COLORS.text
              )
              .text(
                cellValues[
                  columnIndex
                ],
                x + 5,
                y + 8,
                {
                  width:
                    column.width -
                    10,
                  align:
                    column.align,
                }
              );
          }

          x +=
            column.width;
        }
      );

      y +=
        rowHeight;
    }
  );

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summaryRows = [
    [
      "Discount",
      `${result.discount_percent || "0%"} ($ ${Number(
        result.discount_amount || 0
      ).toFixed(2)})`,
    ],
    [
      "HST",
      `${result.hst || "13%"} ($ ${Number(
        result.hst_amount || 0
      ).toFixed(2)})`,
    ],
    [
      "Delivery Type",
      result.delivery_type ||
        "Pickup / Dine-in",
    ],
    [
      "Delivery Charge",
      money(
        result.delivery_charge
      ),
    ],
    [
      "Final Amount",
      money(
        result.total_amount
      ),
    ],
  ];

  summaryRows.forEach(
    ([label, value], index) => {
      const isFinal =
        index ===
        summaryRows.length - 1;

      const rowHeight = 26;

      if (
        y + rowHeight >
        BOTTOM_LIMIT
      ) {
        y =
          startNewPage();
      }

      // --------------------------------------------------------
      // FINAL AMOUNT
      // --------------------------------------------------------

      if (isFinal) {
        pdf
          .rect(
            PAGE_MARGIN,
            y,
            SUMMARY_LABEL_WIDTH,
            rowHeight
          )
          .fillAndStroke(
            COLORS.totalBg,
            COLORS.border
          );

        pdf
          .rect(
            PAGE_MARGIN +
              SUMMARY_LABEL_WIDTH,
            y,
            SUMMARY_VALUE_WIDTH,
            rowHeight
          )
          .fillAndStroke(
            COLORS.totalBg,
            COLORS.border
          );

      // --------------------------------------------------------
      // NORMAL ROW
      // --------------------------------------------------------

      } else {
        pdf
          .lineWidth(0.8)
          .rect(
            PAGE_MARGIN,
            y,
            SUMMARY_LABEL_WIDTH,
            rowHeight
          )
          .stroke(
            COLORS.border
          );

        pdf
          .lineWidth(0.8)
          .rect(
            PAGE_MARGIN +
              SUMMARY_LABEL_WIDTH,
            y,
            SUMMARY_VALUE_WIDTH,
            rowHeight
          )
          .stroke(
            COLORS.border
          );
      }

      const font =
        isFinal
          ? FONT.bold
          : FONT.regular;

      const size =
        isFinal
          ? 9.5
          : 8.5;

      pdf
        .font(font)
        .fontSize(size)
        .fillColor(
          COLORS.text
        )
        .text(
          label,
          PAGE_MARGIN + 8,
          y + 9,
          {
            width:
              SUMMARY_LABEL_WIDTH -
              16,
            align: "right",
          }
        )
        .text(
          value,
          PAGE_MARGIN +
            SUMMARY_LABEL_WIDTH +
            6,
          y + 9,
          {
            width:
              SUMMARY_VALUE_WIDTH -
              12,
            align: "right",
          }
        );

      y +=
        rowHeight;
    }
  );

  // ==========================================================
  // FOOTER CUSTOMER DETAILS
  // ==========================================================

  y += 22;

  if (
    y + 50 >
    BOTTOM_LIMIT
  ) {
    y =
      startNewPage();
  }

  labelValue(
    "User Name:",
    customerName || "N/A",
    PAGE_MARGIN + 4,
    y,
    CONTENT_WIDTH
  );

  labelValue(
    "Address:",
    address,
    PAGE_MARGIN + 4,
    pdf.y + 2,
    CONTENT_WIDTH
  );

  labelValue(
    "Phone No:",
    result.mobile || "",
    PAGE_MARGIN + 4,
    pdf.y + 2,
    CONTENT_WIDTH
  );
};

// ============================================================
// PAGE FOOTER
// ============================================================

const addInvoicePageNumbers = (
  pdf
) => {
  const pageRange =
    pdf.bufferedPageRange();

  for (
    let i = 0;
    i < pageRange.count;
    i++
  ) {
    pdf.switchToPage(
      pageRange.start + i
    );

    pdf.page.margins.bottom = 0;

    const footerY =
      pdf.page.height - 45;

    // Footer separator
    pdf
      .moveTo(
        PAGE_MARGIN,
        footerY
      )
      .lineTo(
        PAGE_MARGIN +
          CONTENT_WIDTH,
        footerY
      )
      .lineWidth(0.8)
      .strokeColor(
        COLORS.border
      )
      .stroke();

    // Page number
    pdf
      .font(FONT.regular)
      .fontSize(8)
      .fillColor(
        COLORS.muted
      )
      .text(
        `Page ${i + 1} of ${pageRange.count}`,
        PAGE_MARGIN,
        footerY + 8,
        {
          width:
            CONTENT_WIDTH,
          align: "center",
          lineBreak: false,
        }
      );
  }
};

module.exports = {
  drawRestaurantInvoice,
  addInvoicePageNumbers,
};
