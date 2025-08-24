// Módulo de Câmera e Gerenciamento de Fotos
class CameraManager {
    constructor() {
        this.addPhotoBtn = document.getElementById('addPhotoBtn');
        this.photoInput = document.getElementById('photoInput');
        this.photoPreview = document.getElementById('photoPreview');
        this.photos = [];
        this.maxPhotos = 3;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkCameraSupport();
    }

    setupEventListeners() {
        if (this.addPhotoBtn) {
            this.addPhotoBtn.addEventListener('click', () => this.openCamera());
        }

        if (this.photoInput) {
            this.photoInput.addEventListener('change', (e) => this.handlePhotoSelection(e));
        }
    }

    checkCameraSupport() {
        // Verificar se o dispositivo suporta captura de câmera
        const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
        
        if (!hasCamera) {
            console.warn('Câmera não suportada neste dispositivo');
            // Ainda permitir upload de arquivos
            this.photoInput.removeAttribute('capture');
        }
    }

    openCamera() {
        if (this.photos.length >= this.maxPhotos) {
            this.showAlert(`Máximo de ${this.maxPhotos} fotos permitidas.`, 'warning');
            return;
        }

        // Configurar input para múltiplas fotos se ainda há espaço
        const remainingSlots = this.maxPhotos - this.photos.length;
        if (remainingSlots === 1) {
            this.photoInput.removeAttribute('multiple');
        } else {
            this.photoInput.setAttribute('multiple', '');
        }

        this.photoInput.click();
    }

    async handlePhotoSelection(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;

        // Verificar limite de fotos
        const totalPhotos = this.photos.length + files.length;
        if (totalPhotos > this.maxPhotos) {
            this.showAlert(`Máximo de ${this.maxPhotos} fotos permitidas. Selecionando apenas as primeiras.`, 'warning');
            files.splice(this.maxPhotos - this.photos.length);
        }

        // Processar cada foto
        for (const file of files) {
            try {
                await this.processPhoto(file);
            } catch (error) {
                console.error('Erro ao processar foto:', error);
                this.showAlert(`Erro ao processar ${file.name}`, 'error');
            }
        }

        // Limpar input
        event.target.value = '';
        
        // Atualizar interface
        this.updatePhotoPreview();
        this.updateAddButton();
    }

    async processPhoto(file) {
        // Validar arquivo
        if (!this.validatePhoto(file)) {
            throw new Error('Arquivo inválido');
        }

        // Criar objeto de foto
        const photo = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            dataUrl: null,
            hash: null,
            exifData: null
        };

        // Gerar preview (Data URL)
        photo.dataUrl = await this.createImagePreview(file);
        
        // Calcular hash SHA-256
        photo.hash = await this.calculateSHA256(file);
        
        // Extrair dados EXIF (se disponível)
        photo.exifData = await this.extractExifData(file);
        
        // Adicionar à lista
        this.photos.push(photo);
        
        console.log('Foto processada:', {
            name: photo.name,
            size: photo.size,
            hash: photo.hash
        });
    }

    validatePhoto(file) {
        // Verificar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            this.showAlert('Apenas arquivos de imagem são permitidos.', 'error');
            return false;
        }

        // Verificar tamanho (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showAlert('Arquivo muito grande. Máximo 10MB por foto.', 'error');
            return false;
        }

        return true;
    }

    createImagePreview(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            
            reader.readAsDataURL(file);
        });
    }

    async calculateSHA256(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        } catch (error) {
            console.error('Erro ao calcular SHA-256:', error);
            return 'erro-calculo-hash';
        }
    }

    async extractExifData(file) {
        // Implementação básica de extração de EXIF
        // Para uma implementação completa, seria necessária uma biblioteca como exif-js
        try {
            const dataUrl = await this.createImagePreview(file);
            const img = new Image();
            
            return new Promise((resolve) => {
                img.onload = () => {
                    const exif = {
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        fileSize: file.size,
                        lastModified: new Date(file.lastModified).toLocaleString('pt-BR'),
                        type: file.type
                    };
                    resolve(exif);
                };
                img.onerror = () => resolve(null);
                img.src = dataUrl;
            });
        } catch (error) {
            console.error('Erro ao extrair EXIF:', error);
            return null;
        }
    }

    updatePhotoPreview() {
        if (!this.photoPreview) return;

        this.photoPreview.innerHTML = '';

        this.photos.forEach((photo, index) => {
            const photoItem = this.createPhotoPreviewItem(photo, index);
            this.photoPreview.appendChild(photoItem);
        });
    }

    createPhotoPreviewItem(photo, index) {
        const item = document.createElement('div');
        item.className = 'photo-item';
        
        const sizeFormatted = this.formatFileSize(photo.size);
        const hashShort = photo.hash ? photo.hash.substring(0, 16) + '...' : 'Calculando...';
        
        item.innerHTML = `
            <img src="${photo.dataUrl}" alt="Foto ${index + 1}" class="photo-thumbnail">
            <div class="photo-info">
                <strong>${photo.name}</strong><br>
                Tamanho: ${sizeFormatted}<br>
                ${photo.exifData ? `Dimensões: ${photo.exifData.width}x${photo.exifData.height}<br>` : ''}
                ${photo.exifData ? `Modificado: ${photo.exifData.lastModified}<br>` : ''}
            </div>
            <div class="photo-hash" title="Hash SHA-256 completo: ${photo.hash}">
                SHA-256: ${hashShort}
            </div>
            <button type="button" class="btn btn-secondary" onclick="window.oficioApp.camera.removePhoto(${index})" 
                    style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                🗑️ Remover
            </button>
        `;
        
        return item;
    }

    removePhoto(index) {
        if (index >= 0 && index < this.photos.length) {
            const photo = this.photos[index];
            this.photos.splice(index, 1);
            
            this.updatePhotoPreview();
            this.updateAddButton();
            
            this.showAlert(`Foto "${photo.name}" removida.`, 'info');
        }
    }

    clearPhotos() {
        this.photos = [];
        this.updatePhotoPreview();
        this.updateAddButton();
    }

    updateAddButton() {
        if (!this.addPhotoBtn) return;

        const remaining = this.maxPhotos - this.photos.length;
        
        if (remaining > 0) {
            this.addPhotoBtn.disabled = false;
            this.addPhotoBtn.textContent = `📷 Adicionar Fotos (${remaining} restantes)`;
        } else {
            this.addPhotoBtn.disabled = true;
            this.addPhotoBtn.textContent = '📷 Limite de fotos atingido';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showAlert(message, type = 'info') {
        // Usar o sistema de alertas do app principal
        if (window.oficioApp) {
            window.oficioApp.showAlert(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // Métodos para integração com PDF
    getPhotosData() {
        return this.photos.map(photo => ({
            name: photo.name,
            size: photo.size,
            hash: photo.hash,
            type: photo.type,
            lastModified: photo.lastModified,
            exifData: photo.exifData
        }));
    }

    getPhotosForPDF() {
        return this.photos.map(photo => ({
            name: photo.name,
            dataUrl: photo.dataUrl,
            hash: photo.hash,
            size: this.formatFileSize(photo.size)
        }));
    }

    // Método para exportar fotos como ZIP (futuro)
    async exportPhotosAsZip() {
        // Implementação futura usando JSZip
        console.log('Exportação de ZIP não implementada ainda');
    }

    // Validação para geração de PDF
    hasPhotos() {
        return this.photos.length > 0;
    }

    getPhotosSummary() {
        if (this.photos.length === 0) return 'Nenhuma foto anexada';
        
        const summary = this.photos.map((photo, index) => 
            `${index + 1}. ${photo.name} (${this.formatFileSize(photo.size)}) - SHA256: ${photo.hash}`
        ).join('\n');
        
        return `Fotos anexadas (${this.photos.length}):\n${summary}`;
    }

    // Método para redimensionar imagens (otimização futura)
    async resizeImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calcular novas dimensões mantendo proporção
                let { width, height } = img;
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Desenhar imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);
                
                // Converter para blob
                canvas.toBlob(resolve, file.type, quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
}

// Disponibilizar globalmente
window.CameraManager = CameraManager;

