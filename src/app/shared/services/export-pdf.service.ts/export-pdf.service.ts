import { Dream, TagModel, OfficialTags } from "@/app/models/dream.model";
import { Injectable } from "@angular/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Platform } from "@ionic/angular";
import jsPDF from "jspdf";

@Injectable({
  providedIn: "root",
})
export class DreamPdfService {
  constructor(private platform: Platform) {}

  /**
   * Generates and exports a PDF with the user's dreams
   * @param dreams Array of Dream objects to export
   * @param filename Optional custom filename (default: 'my-dreams.pdf')
   */
  async exportDreamsToPdf(
    dreams: Dream[],
    filename: string = "my-dreams.pdf"
  ): Promise<void> {
    if (!dreams || dreams.length === 0) {
      throw new Error("No dreams to export");
    }

    // Ensure filename has .pdf extension
    if (!filename.endsWith(".pdf")) {
      filename += ".pdf";
    }

    const pdf = this.generatePdf(dreams);
    const pdfBlob = pdf.output("blob");

    if (this.platform.is("capacitor")) {
      // Mobile (Android/iOS)
      await this.savePdfMobile(pdfBlob, filename);
    } else {
      // Web browser
      this.savePdfWeb(pdf, filename);
    }
  }

  /**
   * Generates the PDF document
   */
  private generatePdf(dreams: Dream[]): jsPDF {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPosition = margin;

    // Title page
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("My Dream Journal", pageWidth / 2, yPosition, { align: "center" });

    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(
      `Exported on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    yPosition += 5;
    pdf.text(`Total Dreams: ${dreams.length}`, pageWidth / 2, yPosition, {
      align: "center",
    });

    // Calculate statistics
    const lucidCount = dreams.filter((d) => d.isLucid).length;
    const nightmareCount = dreams.filter((d) => d.isNightmare).length;
    const normalCount = dreams.length - lucidCount - nightmareCount;

    yPosition += 5;
    pdf.setFontSize(10);
    pdf.text(
      `Lucid: ${lucidCount} | Normal: ${normalCount} | Nightmares: ${nightmareCount}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    // Sort dreams by date (newest first)
    const sortedDreams = [...dreams].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    // Add each dream
    sortedDreams.forEach((dream, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      } else {
        yPosition += 15;
      }

      // Dream title
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      const titleLines = pdf.splitTextToSize(
        dream.title || "Untitled Dream",
        maxWidth
      );
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 7;

      // Dream date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(100, 100, 100);
      const dateStr = new Date(dream.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      pdf.text(dateStr, margin, yPosition);
      yPosition += 6;

      // Tags
      pdf.setFont("helvetica", "normal");
      if (dream.tags && dream.tags.length > 0) {
        const allTags = dream.tags.map((tag) => tag.name).join(", ");
        pdf.text(`Tags: ${allTags}`, margin, yPosition);
        yPosition += 6;
      }

      // Dream description/content
      if (dream.description) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        yPosition += 2;

        const contentLines = pdf.splitTextToSize(dream.description, maxWidth);

        // Handle content that spans multiple pages
        for (let i = 0; i < contentLines.length; i++) {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(contentLines[i], margin, yPosition);
          yPosition += 6;
        }
      }

      // Separator line
      if (index < sortedDreams.length - 1) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        } else {
          yPosition += 5;
        }
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      }
    });

    return pdf;
  }

  /**
   * Save PDF on mobile devices (Android/iOS)
   */
  private async savePdfMobile(blob: Blob, filename: string): Promise<void> {
    try {
      // Convert blob to base64
      const base64Data = await this.blobToBase64(blob);
      const base64String = base64Data.split(",")[1];

      // Save to filesystem
      const result = await Filesystem.writeFile({
        path: filename,
        data: base64String,
        directory: Directory.Documents,
        recursive: true,
      });

      console.log("PDF saved to:", result.uri);

      // Share the file
      await Share.share({
        title: "Export Dreams",
        text: "My Dream Journal",
        url: result.uri,
        dialogTitle: "Share your dreams",
      });
    } catch (error) {
      console.error("Error saving PDF on mobile:", error);
      throw new Error("Failed to save PDF on mobile device");
    }
  }

  /**
   * Save PDF on web browser
   */
  private savePdfWeb(pdf: jsPDF, filename: string): void {
    pdf.save(filename);
  }

  /**
   * Convert Blob to Base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Preview PDF in browser (web only)
   */
  async previewDreamsPdf(dreams: Dream[]): Promise<void> {
    if (this.platform.is("capacitor")) {
      console.warn("PDF preview is only available on web");
      return;
    }

    const pdf = this.generatePdf(dreams);
    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, "_blank");
  }
}
