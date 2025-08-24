// Módulo de Geração de PDF
class PDFGenerator {
    constructor() {
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20; // margins in mm
        this.contentWidth = this.pageWidth - (2 * this.margin);
        
        this.fonts = {
            title: { size: 16, weight: 'bold' },
            subtitle: { size: 12, weight: 'bold' },
            body: { size: 11, weight: 'normal' },
            small: { size: 9, weight: 'normal' }
        };
    }

    async generate(oficioText, formData) {
        try {
            // Verificar se jsPDF está disponível
            if (typeof window.jsPDF === 'undefined') {
                throw new Error('Biblioteca jsPDF não carregada');
            }

            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Configurar fonte padrão
            doc.setFont('helvetica');
            
            let yPosition = this.margin;
            
            // Cabeçalho
            yPosition = this.addHeader(doc, yPosition);
            
            // Conteúdo principal do ofício
            yPosition = this.addOficioContent(doc, oficioText, yPosition);
            
            // Rodapé técnico
            this.addTechnicalFooter(doc, formData);
            
            // Gerar nome do arquivo
            const fileName = this.generateFileName(formData);
            
            // Salvar PDF
            doc.save(fileName);
            
            // Tentar compartilhar se suportado
            await this.shareIfSupported(doc, fileName);
            
            return true;
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw error;
        }
    }

    addHeader(doc, yPosition) {
        // Título principal
        doc.setFontSize(this.fonts.title.size);
        doc.setFont('helvetica', 'bold');
        
        const title = 'POLÍCIA CIVIL DO ESTADO DO RIO DE JANEIRO';
        const titleWidth = doc.getTextWidth(title);
        const titleX = (this.pageWidth - titleWidth) / 2;
        
        doc.text(title, titleX, yPosition);
        yPosition += 8;
        
        // Subtítulo
        doc.setFontSize(this.fonts.subtitle.size);
        const subtitle = 'DELEGACIA ANTISSEQUESTRO - DAS';
        const subtitleWidth = doc.getTextWidth(subtitle);
        const subtitleX = (this.pageWidth - subtitleWidth) / 2;
        
        doc.text(subtitle, subtitleX, yPosition);
        yPosition += 12;
        
        // Linha separadora
        doc.setLineWidth(0.5);
        doc.line(this.margin, yPosition, this.pageWidth - this.margin, yPosition);
        yPosition += 10;
        
        return yPosition;
    }

    addOficioContent(doc, oficioText, yPosition) {
        doc.setFontSize(this.fonts.body.size);
        doc.setFont('helvetica', 'normal');
        
        // Dividir texto em linhas
        const lines = doc.splitTextToSize(oficioText, this.contentWidth);
        
        // Adicionar cada linha
        for (let i = 0; i < lines.length; i++) {
            // Verificar se precisa de nova página
            if (yPosition > this.pageHeight - 40) { // 40mm de margem inferior
                doc.addPage();
                yPosition = this.margin;
            }
            
            doc.text(lines[i], this.margin, yPosition);
            yPosition += 5; // Espaçamento entre linhas
        }
        
        return yPosition + 10;
    }

    addTechnicalFooter(doc, formData) {
        const footerY = this.pageHeight - 30; // 30mm da parte inferior
        
        // Linha separadora
        doc.setLineWidth(0.3);
        doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
        
        doc.setFontSize(this.fonts.small.size);
        doc.setFont('helvetica', 'normal');
        
        let currentY = footerY;
        
        // Data de geração
        const now = new Date();
        const dataGeracao = now.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        doc.text(`Gerado em: ${dataGeracao} (America/Sao_Paulo)`, this.margin, currentY);
        currentY += 4;
        
        // Coordenadas
        if (formData.lat && formData.lon) {
            doc.text(`Coordenadas: ${formData.lat}, ${formData.lon}`, this.margin, currentY);
            currentY += 4;
        }
        
        // Hashes dos anexos
        if (window.oficioApp && window.oficioApp.camera && window.oficioApp.camera.hasPhotos()) {
            const photos = window.oficioApp.camera.getPhotosData();
            doc.text('Anexos (hashes):', this.margin, currentY);
            currentY += 4;
            
            photos.forEach(photo => {
                const hashLine = `${photo.name} – SHA256: ${photo.hash}`;
                const lines = doc.splitTextToSize(hashLine, this.contentWidth);
                
                lines.forEach(line => {
                    doc.text(line, this.margin + 5, currentY);
                    currentY += 3;
                });
            });
        }
        
        // Referência
        const bairro = this.extractBairroFromEndereco(formData.endereco);
        const cidade = this.extractCidadeFromEndereco(formData.endereco);
        const ref = `Ref.: ${bairro}/${cidade} – ${formData.nProc}`;
        
        doc.text(ref, this.margin, currentY + 2);
    }

    extractBairroFromEndereco(endereco) {
        // Tentar extrair bairro do endereço (implementação básica)
        if (!endereco) return 'N/A';
        
        const parts = endereco.split(',');
        if (parts.length >= 2) {
            return parts[1].trim();
        }
        
        return 'N/A';
    }

    extractCidadeFromEndereco(endereco) {
        // Tentar extrair cidade do endereço (implementação básica)
        if (!endereco) return 'N/A';
        
        const parts = endereco.split(',');
        if (parts.length >= 3) {
            return parts[2].trim();
        }
        
        // Procurar por "Rio de Janeiro" ou "RJ"
        if (endereco.toLowerCase().includes('rio de janeiro') || endereco.includes('RJ')) {
            return 'Rio de Janeiro';
        }
        
        return 'N/A';
    }

    generateFileName(formData) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const procStr = formData.nProc ? formData.nProc.replace(/[\/\-]/g, '_') : 'sem_proc';
        
        return `Oficio_Requisicao_Imagens_${procStr}_${dateStr}.pdf`;
    }

    async shareIfSupported(doc, fileName) {
        // Verificar se o navegador suporta Web Share API
        if (!navigator.share) return;
        
        try {
            // Converter PDF para blob
            const pdfBlob = doc.output('blob');
            
            // Criar arquivo para compartilhamento
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
            
            // Verificar se pode compartilhar arquivos
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Ofício de Requisição de Imagens - DAS/PCERJ',
                    text: 'Ofício gerado pelo sistema DAS/PCERJ',
                    files: [file]
                });
            }
        } catch (error) {
            console.log('Compartilhamento não realizado:', error.message);
            // Não é um erro crítico, apenas log
        }
    }

    // Método para pré-visualização (futuro)
    async generatePreview(oficioText, formData) {
        try {
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF('p', 'mm', 'a4');
            
            // Gerar PDF em memória
            let yPosition = this.margin;
            yPosition = this.addHeader(doc, yPosition);
            yPosition = this.addOficioContent(doc, oficioText, yPosition);
            this.addTechnicalFooter(doc, formData);
            
            // Retornar como Data URL para preview
            return doc.output('datauristring');
            
        } catch (error) {
            console.error('Erro ao gerar preview:', error);
            throw error;
        }
    }

    // Método para validar dados antes da geração
    validateData(formData) {
        const required = ['nProc', 'endereco', 'dataInicio', 'horaInicio', 'dataFim', 'horaFim'];
        const missing = [];
        
        required.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                missing.push(field);
            }
        });
        
        if (missing.length > 0) {
            throw new Error(`Campos obrigatórios não preenchidos: ${missing.join(', ')}`);
        }
        
        // Validar período
        const inicio = new Date(`${formData.dataInicio}T${formData.horaInicio}`);
        const fim = new Date(`${formData.dataFim}T${formData.horaFim}`);
        
        if (fim <= inicio) {
            throw new Error('Data/hora de término deve ser posterior ao início');
        }
        
        return true;
    }

    // Método para adicionar marca d'água (futuro)
    addWatermark(doc, text = 'DAS/PCERJ') {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(50);
            doc.setTextColor(200, 200, 200);
            doc.setFont('helvetica', 'bold');
            
            // Rotacionar e posicionar marca d'água
            doc.text(text, this.pageWidth / 2, this.pageHeight / 2, {
                angle: 45,
                align: 'center'
            });
        }
        
        // Restaurar cor do texto
        doc.setTextColor(0, 0, 0);
    }

    // Método para adicionar numeração de páginas
    addPageNumbers(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(this.fonts.small.size);
            doc.setFont('helvetica', 'normal');
            
            const pageText = `Página ${i} de ${pageCount}`;
            const textWidth = doc.getTextWidth(pageText);
            const x = this.pageWidth - this.margin - textWidth;
            const y = this.pageHeight - 10;
            
            doc.text(pageText, x, y);
        }
    }

    // Método para exportar dados como JSON (backup)
    exportFormDataAsJSON(formData) {
        const exportData = {
            ...formData,
            exportDate: new Date().toISOString(),
            photos: window.oficioApp && window.oficioApp.camera ? 
                    window.oficioApp.camera.getPhotosData() : []
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${formData.nProc || 'dados'}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Disponibilizar globalmente
window.PDFGenerator = PDFGenerator;

