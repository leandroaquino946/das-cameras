// Módulo de Geolocalização
class GeolocationManager {
    constructor() {
        this.locationBtn = document.getElementById('getLocationBtn');
        this.locationStatus = document.getElementById('locationStatus');
        this.latField = document.getElementById('lat');
        this.lonField = document.getElementById('lon');
        this.enderecoField = document.getElementById('endereco');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkGeolocationSupport();
        
        // Tentar obter localização automaticamente ao carregar
        setTimeout(() => {
            this.requestLocation();
        }, 1000);
    }

    setupEventListeners() {
        if (this.locationBtn) {
            this.locationBtn.addEventListener('click', () => this.requestLocation());
        }
    }

    checkGeolocationSupport() {
        if (!navigator.geolocation) {
            this.updateStatus('Geolocalização não suportada neste navegador.', 'error');
            this.locationBtn.disabled = true;
            return false;
        }
        return true;
    }

    async requestLocation() {
        if (!this.checkGeolocationSupport()) return;

        this.updateStatus('Obtendo localização...', 'loading');
        this.locationBtn.disabled = true;

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000 // 5 minutos
        };

        try {
            const position = await this.getCurrentPosition(options);
            await this.handleLocationSuccess(position);
        } catch (error) {
            this.handleLocationError(error);
        } finally {
            this.locationBtn.disabled = false;
        }
    }

    getCurrentPosition(options) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    }

    async handleLocationSuccess(position) {
        const { latitude, longitude } = position.coords;
        
        // Formatar coordenadas com 6 casas decimais
        const lat = latitude.toFixed(6);
        const lon = longitude.toFixed(6);
        
        // Preencher campos de coordenadas
        this.latField.value = lat;
        this.lonField.value = lon;
        
        this.updateStatus(`Localização obtida: ${lat}, ${lon}`, 'success');
        
        // Tentar reverse geocoding
        try {
            const endereco = await this.reverseGeocode(latitude, longitude);
            if (endereco) {
                this.enderecoField.value = endereco;
                this.updateStatus('Localização e endereço obtidos com sucesso!', 'success');
            }
        } catch (error) {
            console.warn('Erro no reverse geocoding:', error);
            this.updateStatus('Localização obtida. Preencha o endereço manualmente.', 'success');
        }

        // Disparar evento personalizado
        this.dispatchLocationEvent({
            latitude: lat,
            longitude: lon,
            accuracy: position.coords.accuracy
        });
    }

    handleLocationError(error) {
        let message = 'Erro ao obter localização. ';
        
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message += 'Permissão negada. Preencha as coordenadas manualmente.';
                break;
            case error.POSITION_UNAVAILABLE:
                message += 'Localização indisponível. Verifique o GPS.';
                break;
            case error.TIMEOUT:
                message += 'Tempo esgotado. Tente novamente.';
                break;
            default:
                message += 'Erro desconhecido.';
                break;
        }
        
        this.updateStatus(message, 'error');
        console.error('Erro de geolocalização:', error);
    }

    async reverseGeocode(lat, lon) {
        // Tentar diferentes serviços de reverse geocoding
        const services = [
            () => this.reverseGeocodeNominatim(lat, lon),
            () => this.reverseGeocodeViaCep(lat, lon)
        ];

        for (const service of services) {
            try {
                const result = await service();
                if (result) return result;
            } catch (error) {
                console.warn('Serviço de geocoding falhou:', error);
            }
        }

        return null;
    }

    async reverseGeocodeNominatim(lat, lon) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=pt-BR`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'DAS-PCERJ-App/1.0'
            }
        });
        
        if (!response.ok) throw new Error('Erro na API Nominatim');
        
        const data = await response.json();
        
        if (data && data.address) {
            return this.formatNominatimAddress(data.address);
        }
        
        return null;
    }

    formatNominatimAddress(address) {
        const parts = [];
        
        // Logradouro
        if (address.road) {
            parts.push(address.road);
        }
        
        // Número
        if (address.house_number) {
            parts[parts.length - 1] += `, ${address.house_number}`;
        }
        
        // Bairro
        if (address.suburb || address.neighbourhood) {
            parts.push(address.suburb || address.neighbourhood);
        }
        
        // Cidade
        if (address.city || address.town || address.village) {
            parts.push(address.city || address.town || address.village);
        }
        
        // Estado
        if (address.state) {
            parts.push(address.state);
        }
        
        // CEP
        if (address.postcode) {
            parts.push(`CEP: ${address.postcode}`);
        }
        
        return parts.join(', ');
    }

    async reverseGeocodeViaCep(lat, lon) {
        // ViaCEP não suporta reverse geocoding diretamente
        // Esta é uma implementação placeholder para futuras melhorias
        return null;
    }

    updateStatus(message, type = 'info') {
        if (!this.locationStatus) return;
        
        this.locationStatus.textContent = message;
        this.locationStatus.className = `location-status ${type}`;
        
        // Auto-limpar status após 10 segundos
        if (type !== 'loading') {
            setTimeout(() => {
                if (this.locationStatus.textContent === message) {
                    this.locationStatus.textContent = '';
                    this.locationStatus.className = 'location-status';
                }
            }, 10000);
        }
    }

    dispatchLocationEvent(locationData) {
        const event = new CustomEvent('locationObtained', {
            detail: locationData
        });
        document.dispatchEvent(event);
    }

    // Métodos utilitários
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    static formatCoordinates(lat, lon) {
        const latDir = lat >= 0 ? 'N' : 'S';
        const lonDir = lon >= 0 ? 'E' : 'W';
        
        return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lon).toFixed(6)}°${lonDir}`;
    }

    static validateCoordinates(lat, lon) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        
        return !isNaN(latitude) && 
               !isNaN(longitude) && 
               latitude >= -90 && 
               latitude <= 90 && 
               longitude >= -180 && 
               longitude <= 180;
    }

    // Método para obter localização atual sem interface
    static async getCurrentLocationSilent() {
        if (!navigator.geolocation) {
            throw new Error('Geolocalização não suportada');
        }

        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                    accuracy: position.coords.accuracy
                }),
                error => reject(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }

    // Método para monitorar mudanças de localização
    startLocationWatch() {
        if (!navigator.geolocation) return null;

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 60000
        };

        return navigator.geolocation.watchPosition(
            position => {
                const lat = position.coords.latitude.toFixed(6);
                const lon = position.coords.longitude.toFixed(6);
                
                // Atualizar apenas se a mudança for significativa (>10m)
                const currentLat = parseFloat(this.latField.value);
                const currentLon = parseFloat(this.lonField.value);
                
                if (isNaN(currentLat) || isNaN(currentLon) ||
                    GeolocationManager.calculateDistance(currentLat, currentLon, lat, lon) > 0.01) {
                    
                    this.latField.value = lat;
                    this.lonField.value = lon;
                    
                    this.dispatchLocationEvent({
                        latitude: lat,
                        longitude: lon,
                        accuracy: position.coords.accuracy
                    });
                }
            },
            error => console.warn('Erro no monitoramento de localização:', error),
            options
        );
    }

    stopLocationWatch(watchId) {
        if (watchId && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
        }
    }
}

// Disponibilizar globalmente
window.GeolocationManager = GeolocationManager;

