// App Principal - Coordenador de funcionalidades
class OficioApp {
    constructor() {
        this.form = document.getElementById('oficioForm');
        this.alertsContainer = document.getElementById('alerts');
        this.previewModal = document.getElementById('previewModal');
        this.previewContent = document.getElementById('previewContent');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultValues();
        this.initializeModules();
    }

    setupEventListeners() {
        // Botões principais
        document.getElementById('previewBtn').addEventListener('click', () => this.previewOficio());
        document.getElementById('generatePdfBtn').addEventListener('click', () => this.generatePDF());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearForm());
        
        // Modal
        document.getElementById('closePreviewBtn').addEventListener('click', () => this.closePreview());
        document.getElementById('editBtn').addEventListener('click', () => this.closePreview());
        document.getElementById('confirmPdfBtn').addEventListener('click', () => {
            this.closePreview();
            this.generatePDF();
        });
        
        // Controles avançados
        document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJSON());
        document.getElementById('importJsonBtn').addEventListener('click', () => this.importJSON());
        document.getElementById('jsonInput').addEventListener('change', (e) => this.handleJSONImport(e));
        
        // Validação em tempo real
        this.form.addEventListener('input', () => this.validateForm());
        this.form.addEventListener('change', () => this.validateForm());
        
        // Período das imagens
        ['dataInicio', 'horaInicio', 'dataFim', 'horaFim'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updatePeriodoPreview());
        });
        
        // Modal - fechar ao clicar fora
        this.previewModal.addEventListener('click', (e) => {
            if (e.target === this.previewModal) {
                this.closePreview();
            }
        });
        
        // Escape para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.previewModal.classList.contains('active')) {
                this.closePreview();
            }
        });
    }

    setDefaultValues() {
        // Data atual
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('dataOficio').value = hoje;
        document.getElementById('dataInicio').value = hoje;
        document.getElementById('dataFim').value = hoje;
        
        // Hora atual
        const agora = new Date();
        const horaAtual = agora.toTimeString().slice(0, 5);
        document.getElementById('horaInicio').value = horaAtual;
        
        // Hora fim (1 hora depois)
        agora.setHours(agora.getHours() + 1);
        const horaFim = agora.toTimeString().slice(0, 5);
        document.getElementById('horaFim').value = horaFim;
    }

    initializeModules() {
        // Inicializar módulos
        if (window.GeolocationManager) {
            this.geolocation = new GeolocationManager();
        }
        
        if (window.CameraManager) {
            this.camera = new CameraManager();
        }
        
        if (window.PDFGenerator) {
            this.pdfGenerator = new PDFGenerator();
        }
        
        if (window.FormValidator) {
            this.validator = new FormValidator();
        }
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        this.alertsContainer.appendChild(alert);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 5000);
    }

    validateForm() {
        if (!this.validator) return false;
        
        const isValid = this.validator.validateAll();
        const generateBtn = document.getElementById('generatePdfBtn');
        
        generateBtn.disabled = !isValid;
        
        return isValid;
    }

    updatePeriodoPreview() {
        const dataInicio = document.getElementById('dataInicio').value;
        const horaInicio = document.getElementById('horaInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const horaFim = document.getElementById('horaFim').value;
        
        const preview = document.getElementById('periodoPreview');
        
        if (dataInicio && horaInicio && dataFim && horaFim) {
            const inicioFormatado = this.formatDateTime(dataInicio, horaInicio);
            const fimFormatado = this.formatDateTime(dataFim, horaFim);
            
            preview.innerHTML = `
                <strong>Período solicitado:</strong><br>
                Das ${inicioFormatado} às ${fimFormatado}
            `;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    formatDateTime(data, hora) {
        const [ano, mes, dia] = data.split('-');
        const [h, m] = hora.split(':');
        return `${h}h${m} do dia ${dia}/${mes}/${ano}`;
    }

    previewOficio() {
        if (!this.validateForm()) {
            this.showAlert('Por favor, preencha todos os campos obrigatórios antes de pré-visualizar.', 'error');
            return;
        }

        const oficioText = this.generateOficioText();
        this.previewContent.textContent = oficioText;
        this.previewModal.classList.add('active');
        this.previewModal.setAttribute('aria-hidden', 'false');
        
        // Foco no modal para acessibilidade
        document.getElementById('closePreviewBtn').focus();
    }

    closePreview() {
        this.previewModal.classList.remove('active');
        this.previewModal.setAttribute('aria-hidden', 'true');
    }

    generateOficioText() {
        const formData = this.getFormData();
        
        // Template do ofício
        let texto = `OFÍCIO REQUISIÇÃO DE IMAGENS

DATA: ${formData.dataOficio}                                                            Procedimento: ${formData.nProc}

Srº. Proprietário / Responsável

A Polícia Civil do Estado do Rio de Janeiro, por intermédio da DELEGACIA ANTISSEQUESTRO, no uso de suas atribuições legais, com fulcro no disposto nos artigos 6º, III e 13, II, ambos do Código de Processo Penal, vem, por meio deste, REQUISITA a V.S.ª as imagens do circuito de vigilância/monitoramento instaladas no endereço:

${formData.endereco}`;

        if (formData.lat && formData.lon) {
            texto += `\n(Coordenadas: ${formData.lat}, ${formData.lon})`;
        }

        texto += `

visando à instrução em procedimento inquisitivo instaurado nesta Unidade de Polícia Judiciária.

Para os devidos fins, as imagens devem corresponder ao seguinte período: 

das ${this.formatDateTime(formData.dataInicio, formData.horaInicio)} às ${this.formatDateTime(formData.dataFim, formData.horaFim)}.

Para maior celeridade e eficiência no compartilhamento das informações, solicita-se, preferencialmente, que os arquivos sejam disponibilizados em plataformas de armazenamento em nuvem, tais como Google Drive, OneDrive, Dropbox ou equivalente, mediante a geração de um link para compartilhamento com permissão de edição dos arquivos, a ser encaminhado para os seguintes endereços de e-mail listados abaixo.

Alternativamente, o link para compartilhamento também poderá ser encaminhado para o número de telefone 2198596-7060 (via aplicativo WhatsApp).

Reforça-se que, para o adequado manuseio e análise do material requisitado, é imprescindível que os arquivos compartilhados estejam habilitados para EDIÇÃO.

Além disso, disponibilizamos a opção de entrega dos arquivos em PEN DRIVE, bastando para isso que seja realizado contato prévio para definirmos a forma de buscarmos o dispositivo. Os agendamentos podem ser feitos por meio dos contatos listados abaixo.

Ressalto, que o não atendimento a presente REQUISIÇÃO sujeitará o responsável às penas do CRIME DE DESOBEDIÊNCIA previsto no artigo 330 do Código Penal.

Por fim, imperioso advertir que a manipulação, apagamento ou qualquer modificação dos dados e imagens ora requisitados poderá acarretar no CRIME DE FRAUDE PROCESSUAL conforme prevê o artigo 347 do Código Penal.

Para maiores informações favor entrar em contato através dos contatos: 
E-mail:  das.delegaciaantissequestro@gmail.com ou laquino@pcivil.rj.gov.br
Telefone (WhatsApp): 2198596-7060`;

        // Adicionar observações se existirem
        if (formData.observacoes.trim()) {
            texto += `\n\nObservações: ${formData.observacoes}`;
        }

        // Adicionar contato do responsável se preenchido
        if (formData.respNome.trim() || formData.respTel.trim() || formData.respEmail.trim()) {
            texto += `\n\nResponsável no local: ${formData.respNome}`;
            if (formData.respTel.trim()) texto += ` – ${formData.respTel}`;
            if (formData.respEmail.trim()) texto += ` – ${formData.respEmail}`;
        }

        texto += `\n\nAtenciosamente, 

_________________________
Assinado por ordem do LEANDRO AQUINO GOUGET
Delegado de Polícia, ID 565560-9`;

        return texto;
    }

    getFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Adicionar dados que não estão no FormData
        data.dataOficio = this.formatDate(document.getElementById('dataOficio').value);
        data.dataInicio = document.getElementById('dataInicio').value;
        data.horaInicio = document.getElementById('horaInicio').value;
        data.dataFim = document.getElementById('dataFim').value;
        data.horaFim = document.getElementById('horaFim').value;
        
        return data;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const [ano, mes, dia] = dateString.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    async generatePDF() {
        if (!this.validateForm()) {
            this.showAlert('Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.', 'error');
            return;
        }

        try {
            this.showAlert('Gerando PDF...', 'info');
            
            if (this.pdfGenerator) {
                const formData = this.getFormData();
                const oficioText = this.generateOficioText();
                
                await this.pdfGenerator.generate(oficioText, formData);
                this.showAlert('PDF gerado com sucesso!', 'success');
            } else {
                throw new Error('Gerador de PDF não disponível');
            }
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            this.showAlert('Erro ao gerar PDF. Tente novamente.', 'error');
        }
    }

    clearForm() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            this.form.reset();
            this.setDefaultValues();
            
            // Limpar fotos
            if (this.camera) {
                this.camera.clearPhotos();
            }
            
            // Limpar coordenadas
            document.getElementById('lat').value = '';
            document.getElementById('lon').value = '';
            
            // Limpar preview do período
            document.getElementById('periodoPreview').style.display = 'none';
            
            // Limpar alertas
            this.alertsContainer.innerHTML = '';
            
            this.showAlert('Formulário limpo com sucesso.', 'success');
        }
    }

    exportJSON() {
        const data = {
            formData: this.getFormData(),
            photos: this.camera ? this.camera.getPhotosData() : [],
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `oficio_${data.formData.nProc || 'dados'}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showAlert('Dados exportados com sucesso!', 'success');
    }

    importJSON() {
        document.getElementById('jsonInput').click();
    }

    async handleJSONImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Restaurar dados do formulário
            if (data.formData) {
                Object.keys(data.formData).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        if (element.type === 'checkbox') {
                            element.checked = data.formData[key];
                        } else {
                            element.value = data.formData[key];
                        }
                    }
                });
            }
            
            // Restaurar fotos (se suportado)
            if (data.photos && this.camera) {
                // Implementar restauração de fotos se necessário
            }
            
            this.updatePeriodoPreview();
            this.validateForm();
            this.showAlert('Dados importados com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao importar JSON:', error);
            this.showAlert('Erro ao importar arquivo. Verifique se o formato está correto.', 'error');
        }
        
        // Limpar input
        event.target.value = '';
    }
}

// Inicializar app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.oficioApp = new OficioApp();
});

