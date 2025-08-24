// Módulo de Validação de Formulário
class FormValidator {
    constructor() {
        this.rules = {
            nProc: {
                required: true,
                pattern: /^[\d\-\/]+$/,
                message: 'Formato inválido. Use apenas números, hífens e barras.'
            },
            endereco: {
                required: true,
                minLength: 10,
                message: 'Endereço deve ter pelo menos 10 caracteres.'
            },
            dataInicio: {
                required: true,
                message: 'Data de início é obrigatória.'
            },
            horaInicio: {
                required: true,
                message: 'Hora de início é obrigatória.'
            },
            dataFim: {
                required: true,
                message: 'Data de término é obrigatória.'
            },
            horaFim: {
                required: true,
                message: 'Hora de término é obrigatória.'
            },
            lat: {
                pattern: /^-?\d+\.\d{6}$/,
                message: 'Latitude deve ter 6 casas decimais (ex: -22.970722).'
            },
            lon: {
                pattern: /^-?\d+\.\d{6}$/,
                message: 'Longitude deve ter 6 casas decimais (ex: -43.186966).'
            },
            respEmail: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'E-mail inválido.'
            },
            respTel: {
                pattern: /^[\(\)\d\s\-\+]+$/,
                message: 'Telefone deve conter apenas números, parênteses, hífens e espaços.'
            }
        };
        
        this.setupValidation();
    }

    setupValidation() {
        // Adicionar listeners para validação em tempo real
        Object.keys(this.rules).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });

        // Validação especial para período
        ['dataInicio', 'horaInicio', 'dataFim', 'horaFim'].forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('change', () => this.validatePeriod());
            }
        });
    }

    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const rule = this.rules[fieldName];
        
        if (!field || !rule) return true;

        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Verificar se é obrigatório
        if (rule.required && !value) {
            isValid = false;
            message = 'Este campo é obrigatório.';
        }
        // Verificar comprimento mínimo
        else if (rule.minLength && value.length < rule.minLength) {
            isValid = false;
            message = rule.message || `Mínimo de ${rule.minLength} caracteres.`;
        }
        // Verificar padrão
        else if (rule.pattern && value && !rule.pattern.test(value)) {
            isValid = false;
            message = rule.message || 'Formato inválido.';
        }

        this.setFieldValidation(field, isValid, message);
        return isValid;
    }

    validatePeriod() {
        const dataInicio = document.getElementById('dataInicio').value;
        const horaInicio = document.getElementById('horaInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const horaFim = document.getElementById('horaFim').value;

        if (!dataInicio || !horaInicio || !dataFim || !horaFim) {
            return false;
        }

        const inicio = new Date(`${dataInicio}T${horaInicio}`);
        const fim = new Date(`${dataFim}T${horaFim}`);

        const isValid = fim > inicio;
        
        if (!isValid) {
            this.setFieldValidation(
                document.getElementById('dataFim'), 
                false, 
                'Data/hora de término deve ser posterior ao início.'
            );
            this.setFieldValidation(
                document.getElementById('horaFim'), 
                false, 
                'Data/hora de término deve ser posterior ao início.'
            );
        } else {
            this.clearFieldError('dataFim');
            this.clearFieldError('horaFim');
        }

        return isValid;
    }

    validateCoordinates() {
        const lat = document.getElementById('lat').value.trim();
        const lon = document.getElementById('lon').value.trim();

        // Se ambos estão vazios, é válido (opcional)
        if (!lat && !lon) return true;

        // Se apenas um está preenchido, é inválido
        if ((lat && !lon) || (!lat && lon)) {
            const message = 'Preencha tanto latitude quanto longitude, ou deixe ambos vazios.';
            if (lat && !lon) {
                this.setFieldValidation(document.getElementById('lon'), false, message);
            } else {
                this.setFieldValidation(document.getElementById('lat'), false, message);
            }
            return false;
        }

        // Validar formato das coordenadas
        const latValid = this.validateField('lat');
        const lonValid = this.validateField('lon');

        return latValid && lonValid;
    }

    validateAll() {
        let isValid = true;

        // Validar campos individuais
        Object.keys(this.rules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });

        // Validar período
        if (!this.validatePeriod()) {
            isValid = false;
        }

        // Validar coordenadas
        if (!this.validateCoordinates()) {
            isValid = false;
        }

        return isValid;
    }

    setFieldValidation(field, isValid, message = '') {
        // Remover classes anteriores
        field.classList.remove('field-valid', 'field-invalid');
        
        // Remover mensagem de erro anterior
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid && message) {
            // Adicionar classe de erro
            field.classList.add('field-invalid');
            
            // Adicionar mensagem de erro
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            errorDiv.setAttribute('role', 'alert');
            field.parentNode.appendChild(errorDiv);
        } else if (isValid && field.value.trim()) {
            // Adicionar classe de sucesso apenas se o campo tem valor
            field.classList.add('field-valid');
        }
    }

    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        if (!field) return;

        field.classList.remove('field-invalid', 'field-valid');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    clearAllErrors() {
        // Remover todas as classes de validação
        document.querySelectorAll('.field-invalid, .field-valid').forEach(field => {
            field.classList.remove('field-invalid', 'field-valid');
        });

        // Remover todas as mensagens de erro
        document.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
    }

    // Validações específicas
    validateEmail(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }

    validatePhone(phone) {
        // Remove caracteres não numéricos para validação
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }

    validateProcedimento(proc) {
        // Formato esperado: números-números/ano
        const pattern = /^\d+-\d+\/\d{4}$/;
        return pattern.test(proc);
    }

    // Formatadores
    formatPhone(phone) {
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
        } else if (clean.length === 10) {
            return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
        }
        return phone;
    }

    formatCoordinate(coord, decimals = 6) {
        const num = parseFloat(coord);
        if (isNaN(num)) return coord;
        return num.toFixed(decimals);
    }

    // Máscaras de entrada
    setupMasks() {
        // Máscara para telefone
        const phoneField = document.getElementById('respTel');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                e.target.value = this.formatPhone(e.target.value);
            });
        }

        // Máscara para coordenadas
        ['lat', 'lon'].forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.addEventListener('blur', (e) => {
                    if (e.target.value) {
                        e.target.value = this.formatCoordinate(e.target.value);
                    }
                });
            }
        });
    }
}

// Adicionar estilos CSS para validação
const validationStyles = `
.field-invalid {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.field-valid {
    border-color: #10b981 !important;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
}

.field-error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    font-weight: 500;
}

.field-error::before {
    content: "⚠️ ";
    margin-right: 0.25rem;
}
`;

// Adicionar estilos ao documento
if (!document.getElementById('validation-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'validation-styles';
    styleSheet.textContent = validationStyles;
    document.head.appendChild(styleSheet);
}

// Disponibilizar globalmente
window.FormValidator = FormValidator;

