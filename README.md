# Site DAS/PCERJ - Requisição de Imagens

Sistema web para geração de ofícios de requisição de imagens desenvolvido para a Delegacia Antissequestro da Polícia Civil do Estado do Rio de Janeiro.

## 📋 Funcionalidades

### ✅ Principais Recursos

- **Interface Mobile-First**: Otimizada para uso em dispositivos móveis
- **Geolocalização Automática**: Captura automática de coordenadas GPS
- **Formulário Inteligente**: Validação em tempo real e campos obrigatórios
- **Pré-visualização**: Visualize o ofício antes de gerar o PDF
- **Geração de PDF**: Exportação em formato A4 com formatação oficial
- **Captura de Fotos**: Interface para adicionar fotos da câmera (até 3 fotos)
- **Hash SHA-256**: Cálculo automático para integridade dos arquivos
- **Backup de Dados**: Exportar/importar dados em JSON

### 📱 Seções do Formulário

1. **Identificação do Procedimento**
   - Data do ofício (preenchida automaticamente)
   - Número do procedimento (obrigatório)
   - Unidade (fixa: DAS/PCERJ)

2. **Local da Câmera**
   - Endereço completo (obrigatório)
   - Coordenadas GPS (automáticas ou manuais)
   - Ponto de referência (opcional)

3. **Período das Imagens**
   - Data e hora de início (obrigatório)
   - Data e hora de término (obrigatório)
   - Preview automático do período

4. **Responsável/Contato**
   - Nome do proprietário/responsável
   - Telefone/WhatsApp
   - E-mail

5. **Preferências de Recebimento**
   - Link em nuvem (Google Drive/OneDrive/Dropbox)
   - Envio via WhatsApp: 21 98596-7060
   - Pen drive mediante agendamento

6. **Anexos**
   - Upload de fotos da câmera (máximo 3)
   - Cálculo automático de hash SHA-256

7. **Observações**
   - Campo livre para informações adicionais

## 🚀 Como Usar

### 1. Acesso ao Sistema
- Abra o arquivo `index.html` em qualquer navegador moderno
- O sistema funciona offline, sem necessidade de internet

### 2. Preenchimento do Formulário
1. **Permita o acesso à localização** quando solicitado pelo navegador
2. **Preencha o número do procedimento** (formato: 907-00059/2025)
3. **Verifique o endereço** preenchido automaticamente ou digite manualmente
4. **Defina o período** das imagens desejadas
5. **Adicione informações de contato** se necessário
6. **Selecione as preferências** de recebimento
7. **Adicione fotos** se disponíveis
8. **Inclua observações** relevantes

### 3. Geração do Ofício
1. Clique em **"Pré-visualizar Ofício"** para revisar
2. Clique em **"Gerar PDF"** para criar o documento
3. O arquivo será baixado automaticamente

### 4. Funcionalidades Avançadas
- **Exportar JSON**: Salva todos os dados para backup
- **Importar JSON**: Restaura dados de backup anterior
- **Limpar/Novo**: Reinicia o formulário

## 🔧 Requisitos Técnicos

### Navegadores Suportados
- Chrome 80+ (recomendado)
- Firefox 75+
- Safari 13+
- Edge 80+

### Permissões Necessárias
- **Localização**: Para captura automática de coordenadas
- **Câmera**: Para captura de fotos (opcional)
- **Armazenamento**: Para download de arquivos

## 📁 Estrutura de Arquivos

```
site-das-pcerj/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos CSS
├── js/
│   ├── app.js             # Aplicação principal
│   ├── validation.js      # Validação de formulário
│   ├── geolocation.js     # Geolocalização
│   ├── camera.js          # Gerenciamento de fotos
│   └── pdf-generator.js   # Geração de PDF
├── assets/                # Recursos (vazio)
└── README.md             # Esta documentação
```

## 🔒 Privacidade e Segurança

- **Dados Locais**: Todos os dados são processados localmente no navegador
- **Sem Envio Automático**: Nenhuma informação é enviada automaticamente para servidores
- **Hash SHA-256**: Integridade garantida para arquivos anexados
- **Limpeza Automática**: Dados são descartados ao sair da página

## 📞 Contatos DAS/PCERJ

- **E-mail**: das.delegaciaantissequestro@gmail.com
- **E-mail**: laquino@pcivil.rj.gov.br
- **WhatsApp**: (21) 98596-7060

## 🛠️ Suporte Técnico

### Problemas Comuns

1. **Geolocalização não funciona**
   - Verifique se permitiu o acesso à localização
   - Preencha as coordenadas manualmente se necessário

2. **PDF não é gerado**
   - Verifique se todos os campos obrigatórios estão preenchidos
   - Tente recarregar a página

3. **Fotos não são adicionadas**
   - Verifique se permitiu o acesso à câmera
   - Limite máximo de 3 fotos por ofício

### Dicas de Uso

- **Use em dispositivos móveis** para melhor experiência
- **Mantenha o navegador atualizado** para compatibilidade
- **Faça backup dos dados** importantes usando a exportação JSON
- **Teste a pré-visualização** antes de gerar o PDF final

## 📄 Formato do Ofício

O ofício gerado segue o padrão oficial da DAS/PCERJ e inclui:

- Cabeçalho institucional
- Texto padrão conforme legislação
- Informações do procedimento
- Endereço e coordenadas do local
- Período solicitado das imagens
- Instruções para entrega
- Advertências legais
- Rodapé técnico com metadados

## 🔄 Atualizações

Para atualizações do sistema, substitua os arquivos mantendo a mesma estrutura de pastas.

---

**Desenvolvido para a Delegacia Antissequestro - DAS/PCERJ**  
*Sistema de Requisição de Imagens v1.0*

