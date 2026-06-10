const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, Header, Footer, LevelFormat
} = require('docx');
const fs = require('fs');

const BLUE = "1A3C8F";
const DARK_BLUE = "0D2B6E";
const LIGHT_BLUE = "DCE8F8";
const MID_BLUE = "2E5AAC";
const WHITE = "FFFFFF";
const LIGHT_GRAY = "F5F7FA";
const MED_GRAY = "E2E8F0";
const TEXT_DARK = "1A202C";
const TEXT_MED = "4A5568";
const ACCENT = "E8611A";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 36, color: WHITE, font: "Arial" })],
    shading: { fill: DARK_BLUE, type: ShadingType.CLEAR },
    spacing: { before: 300, after: 200 },
    indent: { left: 200, right: 200 },
    alignment: AlignmentType.LEFT,
  });
}

function heading2(text, color = BLUE) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28, color: WHITE, font: "Arial" })],
    shading: { fill: color, type: ShadingType.CLEAR },
    spacing: { before: 240, after: 160 },
    indent: { left: 160 },
    border: { left: { style: BorderStyle.SINGLE, size: 20, color: ACCENT } },
  });
}

function heading3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: DARK_BLUE, font: "Arial" })],
    spacing: { before: 200, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MID_BLUE } },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: opts.color || TEXT_DARK, font: "Arial", bold: opts.bold || false })],
    spacing: { before: 80, after: 80 },
    indent: opts.indent ? { left: 300 } : {},
  });
}

function bulletItem(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, size: 22, color: TEXT_DARK, font: "Arial" })],
    spacing: { before: 60, after: 60 },
  });
}

function spacer(size = 160) {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: size, after: 0 } });
}

function divider() {
  return new Paragraph({
    children: [new TextRun("")],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: MED_GRAY } },
    spacing: { before: 120, after: 120 },
  });
}

function phaseTag(phase, color) {
  return new Paragraph({
    children: [new TextRun({ text: `  ${phase}  `, bold: true, size: 20, color: WHITE, font: "Arial" })],
    shading: { fill: color, type: ShadingType.CLEAR },
    spacing: { before: 160, after: 80 },
    alignment: AlignmentType.LEFT,
  });
}

function infoTable(rows, colWidths) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map((row, i) =>
      new TableRow({
        children: row.map((cell, j) =>
          new TableCell({
            borders,
            width: { size: colWidths[j], type: WidthType.DXA },
            shading: { fill: i === 0 ? BLUE : (i % 2 === 0 ? LIGHT_GRAY : WHITE), type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [new Paragraph({
              children: [new TextRun({
                text: cell,
                size: 20,
                font: "Arial",
                bold: i === 0,
                color: i === 0 ? WHITE : TEXT_DARK,
              })],
              alignment: j > 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
            })],
          })
        ),
      })
    ),
  });
}

function summaryBox(lines, fillColor = LIGHT_BLUE) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: BLUE }, bottom: border, left: { style: BorderStyle.SINGLE, size: 16, color: BLUE }, right: border },
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: fillColor, type: ShadingType.CLEAR },
        margins: { top: 140, bottom: 140, left: 200, right: 200 },
        children: lines.map(l => new Paragraph({
          children: [new TextRun({ text: l.text, size: l.size || 22, font: "Arial", bold: l.bold || false, color: l.color || TEXT_DARK })],
          spacing: { before: 60, after: 60 },
          alignment: l.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        })),
      })],
    })],
  });
}

function creativeCard(title, lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [new TableCell({
          borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 20, color: ACCENT }, right: noBorder },
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: "FFF8F4", type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 200, right: 200 },
          children: [
            new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 22, color: ACCENT, font: "Arial" })], spacing: { before: 0, after: 80 } }),
            ...lines.map(l => new Paragraph({
              children: [new TextRun({ text: l, size: 20, color: TEXT_MED, font: "Arial" })],
              spacing: { before: 40, after: 40 },
            })),
          ],
        })],
      }),
    ],
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1000, right: 1080, bottom: 1000, left: 1080 },
      },
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "KAILASH PAPER CONVERSION  |  Digital Advertising Strategy Proposal", size: 16, color: "999999", font: "Arial" }),
              new TextRun({ text: "\t", size: 16 }),
              new TextRun({ text: "May 2026", size: 16, color: "999999", font: "Arial" }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MED_GRAY } },
            tabStops: [{ type: "right", position: 9026 }],
            spacing: { before: 0, after: 100 },
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "Confidential — Prepared for Kailash Paper Conversion Pvt. Ltd.  |  Page ", size: 16, color: "999999", font: "Arial" }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "999999", font: "Arial" }),
            ],
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: MED_GRAY } },
            spacing: { before: 100 },
            alignment: AlignmentType.CENTER,
          }),
        ],
      }),
    },
    children: [

      // ─── COVER ───────────────────────────────────────────────
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [9026],
        rows: [new TableRow({
          children: [new TableCell({
            borders: noBorders,
            width: { size: 9026, type: WidthType.DXA },
            shading: { fill: DARK_BLUE, type: ShadingType.CLEAR },
            margins: { top: 600, bottom: 600, left: 400, right: 400 },
            children: [
              new Paragraph({ children: [new TextRun({ text: "DIGITAL ADVERTISING", size: 52, bold: true, color: WHITE, font: "Arial" })], alignment: AlignmentType.LEFT, spacing: { before: 0, after: 80 } }),
              new Paragraph({ children: [new TextRun({ text: "STRATEGY PROPOSAL", size: 52, bold: true, color: "E8C97A", font: "Arial" })], alignment: AlignmentType.LEFT, spacing: { before: 0, after: 200 } }),
              new Paragraph({ children: [new TextRun({ text: "Prepared for", size: 22, color: "AABBDD", font: "Arial" })], spacing: { before: 100, after: 40 } }),
              new Paragraph({ children: [new TextRun({ text: "Kailash Paper Conversion Pvt. Ltd.", size: 28, bold: true, color: WHITE, font: "Arial" })], spacing: { before: 0, after: 200 } }),
              new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MID_BLUE } }, children: [new TextRun("")], spacing: { before: 100, after: 200 } }),
              new Paragraph({ children: [new TextRun({ text: "Platform: Meta Ads (Facebook + Instagram)", size: 22, color: "AABBDD", font: "Arial" })], spacing: { before: 60, after: 40 } }),
              new Paragraph({ children: [new TextRun({ text: "Total Investment: Rs. 2,800  |  Duration: 4-5 Weeks  |  Date: May 2026", size: 22, color: WHITE, font: "Arial" })], spacing: { before: 40, after: 60 } }),
            ],
          })],
        })],
      }),

      spacer(300),

      // ─── EXECUTIVE SUMMARY ───────────────────────────────────
      heading1("EXECUTIVE SUMMARY"),
      spacer(100),
      body("A 3-phase digital advertising strategy on Meta (Facebook + Instagram) designed to first build brand awareness among Ranchi's business community, then capture qualified leads, and finally drive high-quality conversions through a dedicated landing page."),
      spacer(120),

      infoTable(
        [
          ["Phase", "Campaign Type", "Budget", "Duration", "Goal"],
          ["Phase 1", "Brand Awareness", "Rs. 800", "7 Days", "Build Recognition"],
          ["Phase 2", "Lead Generation", "Rs. 1,000", "14 Days", "Capture Leads"],
          ["Phase 3", "Landing Page Leads", "Rs. 1,000", "7-10 Days", "Scale Quality Leads"],
          ["TOTAL", "Full Funnel Strategy", "Rs. 2,800", "4-5 Weeks", "Awareness to Conversion"],
        ],
        [1800, 2100, 1600, 1560, 2300]
      ),

      spacer(200),
      divider(),
      spacer(100),

      // ─── PHASE 1 ─────────────────────────────────────────────
      phaseTag("PHASE 1  —  WEEK 1", DARK_BLUE),
      heading2("BRAND AWARENESS CAMPAIGN"),
      spacer(100),

      summaryBox([
        { text: "Budget: Rs. 800  |  Duration: 7 Days  |  Daily Spend: Rs. 115/day  |  Objective: Reach & Awareness", bold: true, size: 22 },
        { text: "Goal: Make Ranchi's business community aware of Kailash Paper Conversion — who they are, what they do, and why they are the #1 choice.", size: 20, color: TEXT_MED },
      ]),

      spacer(160),
      heading3("Campaign Settings"),
      spacer(80),

      infoTable(
        [
          ["Setting", "Details"],
          ["Platform", "Facebook + Instagram"],
          ["Ad Formats", "Single Image + Short Video Reel (15 sec)"],
          ["Placements", "Feed, Reels, Stories"],
          ["Budget Type", "Daily Budget — Rs. 115/day"],
          ["Campaign Duration", "7 Days (Days 1-7)"],
        ],
        [3200, 6160]
      ),

      spacer(160),
      heading3("Target Audience"),
      spacer(80),

      infoTable(
        [
          ["Parameter", "Setting"],
          ["Location", "Ranchi, Jharkhand + 30km radius"],
          ["Age Range", "25 – 55 years"],
          ["Languages", "Hindi + English"],
          ["Job Titles", "Business Owner, Manager, Marketing Head, School Principal, Purchase Manager"],
          ["Interests", "Business printing, Packaging, Stationery, Corporate gifting, Branding"],
          ["Behaviors", "Small business owners, B2B decision makers"],
        ],
        [2800, 6560]
      ),

      spacer(160),
      heading3("Ad Set Budget Breakdown"),
      spacer(80),

      infoTable(
        [
          ["Ad Set", "Budget", "Audience", "Purpose"],
          ["Ad Set 1", "Rs. 350", "Business owners 25-45, Ranchi", "Core B2B reach"],
          ["Ad Set 2", "Rs. 250", "Schools, Colleges, Institutions", "Education sector"],
          ["Ad Set 3", "Rs. 200", "Retail & Food brands, Ranchi", "Packaging buyers"],
        ],
        [1600, 1400, 3800, 2560]
      ),

      spacer(160),
      heading3("Ad Creatives"),
      spacer(80),

      creativeCard("Creative 1 — Authority Image Ad", [
        "Headline: \"Ranchi's Most Trusted Printing Partner Since 1987\"",
        "Primary Text: Tata Steel. UNICEF. Reliance. Govt of Jharkhand. They all trust one name for print & packaging.",
        "Sub-copy: Kailash Paper Conversion — 100+ brands. 37+ years. Still going strong.",
        "CTA Button: Learn More",
      ]),
      spacer(80),
      creativeCard("Creative 2 — Social Proof Image Ad", [
        "Headline: \"100+ Brands. 37 Years. One Address — Ranchi.\"",
        "Primary Text: From government documents to premium gift packaging — delivering print excellence since 1987.",
        "Sub-copy: Books | Packaging | Diaries | Brochures | Photo Books",
        "CTA Button: Learn More",
      ]),
      spacer(80),
      creativeCard("Creative 3 — 15-Second Reel / Video", [
        "[0-3s] \"Looking for a printer you can trust?\"",
        "[3-8s] Fast cuts — packaging, diaries, brochures, foil stamping",
        "[8-12s] \"Trusted by Tata, UNICEF & 100+ brands\"",
        "[12-15s] \"Kailash Paper Conversion, Ranchi — Since 1987\"",
        "CTA Button: Learn More",
      ]),

      spacer(160),
      heading3("Expected Results — Phase 1"),
      spacer(80),

      infoTable(
        [
          ["Metric", "Estimated Range"],
          ["Reach", "8,000 – 15,000 people"],
          ["Impressions", "20,000 – 35,000"],
          ["Video Views", "1,500 – 4,000"],
          ["Cost Per Reach", "Rs. 0.05 – Rs. 0.10"],
          ["Outcome", "Strong brand recognition in Ranchi B2B market"],
        ],
        [3800, 5560]
      ),

      spacer(200),
      divider(),
      spacer(100),

      // ─── PHASE 2 ─────────────────────────────────────────────
      phaseTag("PHASE 2  —  WEEK 2 & 3", MID_BLUE),
      heading2("LEAD GENERATION CAMPAIGN", MID_BLUE),
      spacer(100),

      summaryBox([
        { text: "Budget: Rs. 1,000  |  Duration: 14 Days  |  Daily Spend: Rs. 130/day  |  Objective: Lead Generation", bold: true, size: 22 },
        { text: "Goal: Capture real business leads — name, phone, requirement — from warm audiences (Phase 1) and cold new audiences.", size: 20, color: TEXT_MED },
      ]),

      spacer(160),
      heading3("Campaign Settings"),
      spacer(80),

      infoTable(
        [
          ["Setting", "Details"],
          ["Platform", "Facebook + Instagram"],
          ["Ad Format", "Image + Meta Instant Lead Form"],
          ["Placements", "Feed + Stories"],
          ["Budget Type", "Daily Budget — Rs. 130/day"],
          ["Campaign Duration", "14 Days (Days 8-21)"],
        ],
        [3200, 6160]
      ),

      spacer(160),
      heading3("Target Audience Strategy"),
      spacer(80),

      infoTable(
        [
          ["Audience Type", "Description", "Priority"],
          ["Warm — Retargeting", "Phase 1 video viewers (25%+ watched), website visitors, page engagers", "HIGHEST"],
          ["Cold — New Reach", "Same B2B demographics as Phase 1 — fresh audience who didn't see Phase 1", "MEDIUM"],
          ["Lookalike", "Lookalike of page engagers and existing customers (if available)", "MEDIUM"],
        ],
        [2400, 5000, 1960]
      ),

      spacer(160),
      heading3("Ad Set Budget Breakdown"),
      spacer(80),

      infoTable(
        [
          ["Ad Set", "Budget", "Audience", "Expected CPL"],
          ["Ad Set 1", "Rs. 500", "Warm retargeting (Phase 1 viewers)", "Rs. 40-70"],
          ["Ad Set 2", "Rs. 300", "Business owners — Ranchi cold", "Rs. 80-120"],
          ["Ad Set 3", "Rs. 200", "Schools & Institutions — Jharkhand", "Rs. 60-100"],
        ],
        [1600, 1400, 3800, 2560]
      ),

      spacer(160),
      heading3("Lead Form Design"),
      spacer(80),

      summaryBox([
        { text: "Form Title: \"Get a Free Printing Quote\"", bold: true, size: 22 },
        { text: "" },
        { text: "Questions to Ask:", bold: true, size: 20 },
        { text: "1.  Your Name", size: 20 },
        { text: "2.  Phone Number", size: 20 },
        { text: "3.  Business / Organization Name", size: 20 },
        { text: "4.  What do you need? (Dropdown: Packaging & Boxes / Diaries & Notebooks / Brochures & Catalogues / Photo Books / Stationery / Other)", size: 20 },
        { text: "5.  Quantity Needed (Optional)", size: 20 },
        { text: "" },
        { text: "Thank You Message: \"Our team will call you within 24 hours with your custom quote. Call: 1800 889 4101\"", size: 20, color: TEXT_MED },
      ], "F0F4FF"),

      spacer(160),
      heading3("Ad Creatives"),
      spacer(80),

      creativeCard("Creative 1 — Direct Offer", [
        "Headline: \"Get a Free Quote for Your Printing Order\"",
        "Primary Text: Need premium printing & packaging in Ranchi?",
        "  - Books, Brochures & Catalogues",
        "  - Custom Packaging & Gift Boxes",
        "  - Corporate Diaries & Stationery",
        "  - Photo Books & Albums | Bulk orders welcome",
        "Sub-copy: Fill the form. Get a quote in 24 hours. Trusted by 100+ brands since 1987.",
        "CTA: Get Quote",
      ]),
      spacer(80),
      creativeCard("Creative 2 — Problem / Solution", [
        "Headline: \"Stop Settling for Average Printing\"",
        "Primary Text: Your brand deserves better than dull brochures and cheap packaging.",
        "  - Foil Stamping & Embossing",
        "  - UV Coating & Premium Finishes",
        "  - Rigid & Gift Boxes | Offset & Digital Printing",
        "Sub-copy: Based in Ranchi. Serving all of Jharkhand. Get your FREE quote today.",
        "CTA: Get Quote",
      ]),
      spacer(80),
      creativeCard("Creative 3 — Sector Targeting", [
        "Headline: \"Bulk Orders? We Handle It All.\"",
        "Primary Text: Running a school? Corporate? Food brand?",
        "  We print & package for: Schools, Corporates, Government, Retail & Food Brands",
        "Sub-copy: Share your requirement. Get a call back within 24 hours.",
        "Sub-copy: Kailash Paper Conversion | Est. 1987 | Ranchi",
        "CTA: Request Callback",
      ]),

      spacer(160),
      heading3("Expected Results — Phase 2"),
      spacer(80),

      infoTable(
        [
          ["Metric", "Estimated Range"],
          ["Total Leads", "8 – 20 qualified leads"],
          ["Cost Per Lead", "Rs. 50 – Rs. 120"],
          ["Lead Quality", "High — B2B, local, intent-based"],
          ["Expected Conversions", "2 – 5 paying clients"],
        ],
        [3800, 5560]
      ),

      spacer(200),
      divider(),
      spacer(100),

      // ─── PHASE 3 ─────────────────────────────────────────────
      phaseTag("PHASE 3  —  WEEK 4 ONWARDS", "1E6B3A"),
      heading2("LANDING PAGE LEAD GENERATION", "1E6B3A"),
      spacer(100),

      summaryBox([
        { text: "Budget: Rs. 1,000  |  Duration: 7-10 Days  |  Daily Spend: Rs. 130-140/day  |  Objective: Landing Page Leads", bold: true, size: 22 },
        { text: "Goal: Drive traffic to a dedicated landing page — higher trust signals, more detailed enquiries, better lead quality than instant forms.", size: 20, color: TEXT_MED },
      ], "F0FFF4"),

      spacer(160),
      heading3("Landing Page Requirements"),
      spacer(80),

      infoTable(
        [
          ["Element", "Requirement"],
          ["Main Headline", "\"Get a Custom Printing Quote in 24 Hours\""],
          ["Sub-headline", "\"Ranchi's #1 Printing & Packaging Company Since 1987\""],
          ["Trust Signals", "Client logos: Tata Steel, UNICEF, Reliance, Govt of Jharkhand"],
          ["Services Section", "All services listed with visuals (Packaging, Diaries, Books, etc.)"],
          ["Lead Form Fields", "Name, Phone, Email, Requirement, Quantity"],
          ["Social Proof", "Google Reviews 4.5 Stars + testimonials"],
          ["Primary CTA", "\"Get My Free Quote\" button — above the fold"],
          ["Mobile Optimization", "Fully responsive, fast loading on mobile"],
        ],
        [2800, 6560]
      ),

      spacer(160),
      heading3("Campaign Settings — Phase 3"),
      spacer(80),

      infoTable(
        [
          ["Setting", "Details"],
          ["Objective", "Traffic / Leads (Landing Page Conversion)"],
          ["Budget", "Rs. 1,000"],
          ["Daily Spend", "Rs. 130-140/day"],
          ["Audience", "Warm retargeting + Cold B2B Ranchi"],
          ["Ad Formats", "Image + Carousel (showing product range)"],
          ["Duration", "7-10 Days (Week 4+)"],
        ],
        [3200, 6160]
      ),

      spacer(160),
      heading3("Expected Results — Phase 3"),
      spacer(80),

      infoTable(
        [
          ["Metric", "Estimated Range"],
          ["Website Clicks", "200 – 400 clicks"],
          ["Landing Page Leads", "10 – 25 qualified leads"],
          ["Cost Per Lead", "Rs. 40 – Rs. 100"],
          ["Conversion Rate", "5% – 10%"],
          ["Lead Quality", "Highest — longer form = more serious buyers"],
        ],
        [3800, 5560]
      ),

      spacer(200),
      divider(),
      spacer(100),

      // ─── FULL BUDGET SUMMARY ─────────────────────────────────
      heading1("COMPLETE BUDGET SUMMARY"),
      spacer(120),

      infoTable(
        [
          ["Phase", "Campaign Type", "Budget", "Duration", "Primary Goal"],
          ["Phase 1", "Brand Awareness", "Rs. 800", "7 Days", "Build brand recognition in Ranchi"],
          ["Phase 2", "Lead Generation", "Rs. 1,000", "14 Days", "Capture qualified business leads"],
          ["Phase 3", "Landing Page Leads", "Rs. 1,000", "7-10 Days", "High-quality leads via landing page"],
          ["TOTAL", "Full Funnel", "Rs. 2,800", "4-5 Weeks", "Awareness to Conversion"],
        ],
        [1400, 2200, 1400, 1400, 2760]
      ),

      spacer(200),
      divider(),
      spacer(100),

      // ─── FOLLOW-UP PROCESS ───────────────────────────────────
      heading1("LEAD FOLLOW-UP PROCESS"),
      spacer(120),

      infoTable(
        [
          ["Timeframe", "Action", "Channel"],
          ["Within 1 Hour", "Send WhatsApp message to new lead", "WhatsApp Business"],
          ["Within 24 Hours", "Phone call from sales team to understand requirement", "Phone Call"],
          ["Day 3", "Follow-up message if no response received", "WhatsApp + Call"],
          ["Day 7", "Final follow-up with special offer or discount", "WhatsApp + Call"],
        ],
        [2200, 4560, 2600]
      ),

      spacer(160),
      heading3("WhatsApp First Message Template"),
      spacer(80),

      summaryBox([
        { text: "Hello [Name],", bold: true, size: 22 },
        { text: "" },
        { text: "Thank you for your interest in Kailash Paper Conversion!", size: 22 },
        { text: "" },
        { text: "We have been Ranchi's trusted printing & packaging partner since 1987.", size: 20, color: TEXT_MED },
        { text: "Our team will call you shortly to understand your requirement", size: 20, color: TEXT_MED },
        { text: "and share the best quote for your needs.", size: 20, color: TEXT_MED },
        { text: "" },
        { text: "Call: 1800 889 4101  |  kailashpaper.com", bold: true, size: 20 },
        { text: "" },
        { text: "— Team Kailash Paper", size: 20, color: TEXT_MED },
      ], "FFFBF0"),

      spacer(200),
      divider(),
      spacer(100),

      // ─── KEY RECOMMENDATIONS ─────────────────────────────────
      heading1("KEY RECOMMENDATIONS"),
      spacer(120),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [600, 8426],
        rows: [
          ["01", "Run Phase 1 fully before starting Phase 2 — warm audiences perform 3x better than cold."],
          ["02", "Respond to all leads within 1 hour — B2B leads go cold very quickly."],
          ["03", "Set up WhatsApp Business with a product catalog for faster, professional follow-up."],
          ["04", "After Phase 2, increase budget to Rs. 1,500/week if Cost Per Lead is below Rs. 100."],
          ["05", "Build and test the landing page before Phase 3 begins — mobile speed is critical."],
          ["06", "Track all leads in a Google Sheet: Name, Phone, Requirement, Follow-up Status, Outcome."],
        ].map((row, i) =>
          new TableRow({
            children: [
              new TableCell({
                borders: noBorders,
                width: { size: 600, type: WidthType.DXA },
                shading: { fill: BLUE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                verticalAlign: "center",
                children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true, size: 20, color: WHITE, font: "Arial" })], alignment: AlignmentType.CENTER })],
              }),
              new TableCell({
                borders: { top: border, bottom: border, left: noBorder, right: border },
                width: { size: 8426, type: WidthType.DXA },
                shading: { fill: i % 2 === 0 ? LIGHT_GRAY : WHITE, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 160, right: 140 },
                children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 20, font: "Arial", color: TEXT_DARK })] })],
              }),
            ],
          })
        ),
      }),

      spacer(200),
      divider(),
      spacer(100),

      // ─── ABOUT THIS STRATEGY ─────────────────────────────────
      heading1("ABOUT THIS STRATEGY"),
      spacer(120),

      summaryBox([
        { text: "Awareness  →  Interest  →  Action", bold: true, size: 26, center: true, color: BLUE },
        { text: "" },
        { text: "This 3-phase approach follows the proven marketing funnel model.", bold: true, size: 22 },
        { text: "" },
        { text: "Phase 1 warms the Ranchi B2B market — building trust and recognition before asking for anything.", size: 20, color: TEXT_MED },
        { text: "Phase 2 converts warm audiences into real leads using Meta's instant form — low friction, high intent.", size: 20, color: TEXT_MED },
        { text: "Phase 3 scales lead quality through a dedicated landing page — more context, higher commitment.", size: 20, color: TEXT_MED },
        { text: "" },
        { text: "Each phase builds on the previous one, reducing Cost Per Lead over time while increasing lead quality.", size: 20, color: TEXT_MED },
        { text: "" },
        { text: "For queries or to proceed: info@kailashpaper.com  |  1800 889 4101", size: 20, bold: true, color: BLUE, center: true },
      ]),

      spacer(200),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:\\Users\\yash\\seo\\Kailash_Paper_Ads_Strategy_2026.docx", buffer);
  console.log("Document created successfully: Kailash_Paper_Ads_Strategy_2026.docx");
});
