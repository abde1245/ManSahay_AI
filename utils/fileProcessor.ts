
export const processFile = async (file: File): Promise<{ content: string; type: 'image' | 'file'; mimeType: string }> => {
  const mimeType = file.type;
  const fileName = file.name.toLowerCase();

  if (mimeType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          content: reader.result as string,
          type: 'image',
          mimeType: mimeType || 'image/png'
        });
      };
      reader.onerror = (e) => reject(new Error(`Image read failed: ${e}`));
      reader.readAsDataURL(file);
    });
  } 
  else if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      // Dynamically import PDF.js only when needed
      // This prevents "Failed to load app" errors if the CDN is unreachable at startup
      const pdfjsLib = await import('pdfjs-dist');
      const pdfjs = (pdfjsLib as any).default || pdfjsLib;
      
      const pdfVersion = pdfjs.version || '3.11.174';
      if (pdfjs.GlobalWorkerOptions) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.js`;
      }

      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const numPages = pdf.numPages;

      for (let i = 1; i <= numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .filter((item: any) => item && typeof item.str === 'string')
            .map((item: any) => item.str)
            .join(' ');
          
          fullText += `[Page ${i}]\n${pageText}\n\n`;
        } catch (pageError) {
          console.warn(`Error parsing page ${i}`, pageError);
          fullText += `[Page ${i}] (Error parsing content)\n\n`;
        }
      }
      
      if (!fullText.trim()) {
         fullText = "[PDF Content Empty. This might be a scanned image PDF which cannot be read by the browser parser.]";
      }

      return {
        content: fullText,
        type: 'file',
        mimeType: 'application/pdf'
      };
    } catch (error: any) {
      console.error("PDF Parsing Error Details:", error);
      throw new Error(`Failed to parse PDF: ${error.message || "Unknown error"}. Ensure the file is not password protected.`);
    }
  } 
  else if (mimeType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
     const text = await file.text();
     return {
         content: text,
         type: 'file',
         mimeType: mimeType || 'text/plain'
     };
  }
  
  throw new Error(`Unsupported file type: ${mimeType || fileName}`);
};
