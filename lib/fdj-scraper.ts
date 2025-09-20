import { JSDOM } from 'jsdom';
import pdf from 'pdf-parse';
import fs from 'fs';
import path from 'path';

interface LotoResult {
  date: string;
  numbers: number[];
  complementary: number;
  joker?: string;
  winners?: {
    rank: number;
    count: number;
    amount: number;
  }[];
}

export class FDJScraper {
  private baseUrl = 'https://www.fdj.fr/resultats-et-rapports-officiels';
  
  /**
   * Récupère les liens des rapports PDF pour un mois/année donné
   */
  async getReportLinks(month: number, year: number): Promise<string[]> {
    try {
      const url = `${this.baseUrl}?month=${month.toString().padStart(2, '0')}&year=${year}`;
      console.log(`🔍 Scraping FDJ pour ${month}/${year}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const html = await response.text();
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Chercher les liens PDF du Loto
      const lotoLinks: string[] = [];
      const links = document.querySelectorAll('a[href*="RÉSULTATloto"]');
      
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes('.pdf')) {
          lotoLinks.push(href);
        }
      });
      
      console.log(`📄 Trouvé ${lotoLinks.length} rapports Loto pour ${month}/${year}`);
      return lotoLinks;
      
    } catch (error) {
      console.error('❌ Erreur lors du scraping FDJ:', error);
      throw error;
    }
  }
  
  /**
   * Télécharge et parse un PDF de rapport
   */
  async downloadAndParsePDF(pdfUrl: string): Promise<LotoResult | null> {
    try {
      console.log(`📥 Téléchargement: ${pdfUrl}`);
      
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Erreur téléchargement PDF: ${response.status}`);
      }
      
      const pdfBuffer = await response.arrayBuffer();
      const pdfData = await pdf(Buffer.from(pdfBuffer));
      
      return this.parsePDFContent(pdfData.text, pdfUrl);
      
    } catch (error) {
      console.error(`❌ Erreur parsing PDF ${pdfUrl}:`, error);
      return null;
    }
  }
  
  /**
   * Parse le contenu textuel d'un PDF pour extraire les résultats
   */
  private parsePDFContent(text: string, pdfUrl: string): LotoResult | null {
    try {
      // Extraire la date du nom du fichier (format: RÉSULTATloto_20250901.pdf)
      const dateMatch = pdfUrl.match(/RÉSULTATloto_(\d{8})\.pdf/);
      if (!dateMatch) return null;
      
      const dateStr = dateMatch[1];
      const date = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
      
      // Patterns pour extraire les numéros
      const numbersMatch = text.match(/(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})/);
      const complementaryMatch = text.match(/Complémentaire[:\s]*(\d{1,2})/i);
      const jokerMatch = text.match(/Joker[:\s]*(\d{6,7})/i);
      
      if (!numbersMatch) {
        console.warn(`⚠️ Impossible d'extraire les numéros du PDF: ${pdfUrl}`);
        return null;
      }
      
      const numbers = [
        parseInt(numbersMatch[1]),
        parseInt(numbersMatch[2]),
        parseInt(numbersMatch[3]),
        parseInt(numbersMatch[4]),
        parseInt(numbersMatch[5])
      ].filter(n => n >= 1 && n <= 49);
      
      if (numbers.length !== 5) {
        console.warn(`⚠️ Nombre de numéros invalide (${numbers.length}) dans: ${pdfUrl}`);
        return null;
      }
      
      const complementary = complementaryMatch ? parseInt(complementaryMatch[1]) : null;
      if (!complementary || complementary < 1 || complementary > 10) {
        console.warn(`⚠️ Complémentaire invalide dans: ${pdfUrl}`);
        return null;
      }
      
      const result: LotoResult = {
        date,
        numbers,
        complementary,
        joker: jokerMatch ? jokerMatch[1] : undefined
      };
      
      console.log(`✅ Résultat extrait: ${date} - ${numbers.join(', ')} + ${complementary}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur parsing contenu PDF:`, error);
      return null;
    }
  }
  
  /**
   * Met à jour les tirages pour un mois donné
   */
  async updateMonth(month: number, year: number): Promise<LotoResult[]> {
    try {
      const pdfLinks = await this.getReportLinks(month, year);
      const results: LotoResult[] = [];
      
      for (const link of pdfLinks) {
        const result = await this.downloadAndParsePDF(link);
        if (result) {
          results.push(result);
        }
        
        // Pause pour éviter de surcharger le serveur FDJ
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`🎯 ${results.length} tirages mis à jour pour ${month}/${year}`);
      return results;
      
    } catch (error) {
      console.error(`❌ Erreur mise à jour ${month}/${year}:`, error);
      throw error;
    }
  }
  
  /**
   * Met à jour les derniers tirages (mois courant et précédent)
   */
  async updateLatest(): Promise<LotoResult[]> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    const results: LotoResult[] = [];
    
    // Mois courant
    try {
      const currentResults = await this.updateMonth(currentMonth, currentYear);
      results.push(...currentResults);
    } catch (error) {
      console.error('Erreur mois courant:', error);
    }
    
    // Mois précédent
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    try {
      const prevResults = await this.updateMonth(prevMonth, prevYear);
      results.push(...prevResults);
    } catch (error) {
      console.error('Erreur mois précédent:', error);
    }
    
    return results;
  }
}

