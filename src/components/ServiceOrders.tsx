import React, { useState, useMemo } from 'react';
import { ServiceOrder, Seller, OSStatus } from '../types';
import { formatCurrency, formatDateDisplay } from '../utils';
import { 
  ClipboardList, Plus, Search, Filter, Printer, Trash2, Edit2, Eye, 
  Check, X, Phone, MapPin, Lock, FileText, FileSpreadsheet, Sparkles
} from 'lucide-react';

interface ServiceOrdersProps {
  sellers: Seller[];
  serviceOrders: ServiceOrder[];
  storeLogo: string;
  onAddOS: (os: Omit<ServiceOrder, 'id' | 'osNumber' | 'createdAt'>) => void;
  onUpdateOS: (os: ServiceOrder) => void;
  onDeleteOS: (id: string) => void;
  triggerClick: () => void;
}

export default function ServiceOrders({
  sellers,
  serviceOrders,
  storeLogo,
  onAddOS,
  onUpdateOS,
  onDeleteOS,
  triggerClick
}: ServiceOrdersProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewing, setIsViewing] = useState<ServiceOrder | null>(null);
  const [editingOS, setEditingOS] = useState<ServiceOrder | null>(null);

  // Estados do formulário (Novo / Edição)
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCpf, setClientCpf] = useState('');
  const [device, setDevice] = useState('');
  const [model, setModel] = useState('');
  const [patternLock, setPatternLock] = useState<number[]>([]);
  const [textPassword, setTextPassword] = useState('');
  const [accessories, setAccessories] = useState('');
  const [notes, setNotes] = useState('');
  const [defect, setDefect] = useState('');
  const [budget, setBudget] = useState('');
  const [whatWasDone, setWhatWasDone] = useState('');
  const [status, setStatus] = useState<OSStatus>('Nova');
  const [value, setValue] = useState('');
  const [technicianId, setTechnicianId] = useState('');

  // Pedido de peças (Encomendar peça para OS)
  const [partRequired, setPartRequired] = useState(false);
  const [partName, setPartName] = useState('');
  const [partLink, setPartLink] = useState('');
  const [partDeliveryTime, setPartDeliveryTime] = useState('');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterTechnician, setFilterTechnician] = useState<string>('todos');

  // Desenho dos 9 pontos de padrão de senha
  const getCoords = (num: number) => {
    const row = Math.floor((num - 1) / 3);
    const col = (num - 1) % 3;
    return { x: 30 + col * 55, y: 30 + row * 55 };
  };

  const handleDotClick = (num: number) => {
    triggerClick();
    if (!patternLock.includes(num)) {
      setPatternLock([...patternLock, num]);
    } else if (patternLock[patternLock.length - 1] === num) {
      setPatternLock(patternLock.slice(0, -1));
    }
  };

  const clearPattern = () => {
    triggerClick();
    setPatternLock([]);
  };

  // Resetar formulário
  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setClientAddress('');
    setClientCpf('');
    setDevice('');
    setModel('');
    setPatternLock([]);
    setTextPassword('');
    setAccessories('');
    setNotes('');
    setDefect('');
    setBudget('');
    setWhatWasDone('');
    setStatus('Nova');
    setValue('');
    setTechnicianId('');
    setPartRequired(false);
    setPartName('');
    setPartLink('');
    setPartDeliveryTime('');
    setEditingOS(null);
  };

  const handleOpenNewOS = () => {
    triggerClick();
    resetForm();
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    triggerClick();
    setIsFormOpen(false);
    resetForm();
  };

  // Editar OS
  const handleEditOS = (os: ServiceOrder) => {
    triggerClick();
    setEditingOS(os);
    setClientName(os.clientName);
    setClientPhone(os.clientPhone);
    setClientAddress(os.clientAddress || '');
    setClientCpf(os.clientCpf || '');
    setDevice(os.device);
    setModel(os.model);
    setPatternLock(os.patternLock || []);
    setTextPassword(os.textPassword || '');
    setAccessories(os.accessories || '');
    setNotes(os.notes || '');
    setDefect(os.defect);
    setBudget(os.budget);
    setWhatWasDone(os.whatWasDone);
    setStatus(os.status);
    setValue(os.value.toString());
    setTechnicianId(os.technicianId || '');
    setPartRequired(os.partRequired || false);
    setPartName(os.partName || '');
    setPartLink(os.partLink || '');
    setPartDeliveryTime(os.partDeliveryTime || '');
    setIsFormOpen(true);
  };

  // Submissão do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerClick();

    const numericValue = parseFloat(value.replace(',', '.')) || 0;

    const osData = {
      clientName,
      clientPhone,
      clientAddress: clientAddress || undefined,
      clientCpf: clientCpf || undefined,
      device,
      model,
      patternLock: patternLock.length > 0 ? patternLock : undefined,
      textPassword: textPassword || undefined,
      accessories: accessories || undefined,
      notes: notes || undefined,
      defect,
      budget,
      whatWasDone,
      status,
      value: numericValue,
      technicianId: technicianId || undefined,
      partRequired,
      partName: partRequired ? partName : undefined,
      partLink: partRequired ? partLink : undefined,
      partDeliveryTime: partRequired ? partDeliveryTime : undefined,
    };

    if (editingOS) {
      onUpdateOS({
        ...editingOS,
        ...osData,
      });
    } else {
      onAddOS(osData);
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Filtragem das OSs
  const filteredOrders = useMemo(() => {
    return serviceOrders.filter((os) => {
      const matchSearch = 
        os.osNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        os.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        os.clientPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (os.clientCpf && os.clientCpf.includes(searchQuery)) ||
        os.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        os.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === 'todos' || os.status === filterStatus;
      const matchTech = filterTechnician === 'todos' || os.technicianId === filterTechnician;

      return matchSearch && matchStatus && matchTech;
    });
  }, [serviceOrders, searchQuery, filterStatus, filterTechnician]);

  // Função para abrir conversa do WhatsApp
  const handleWhatsappRedirect = (phone: string) => {
    triggerClick();
    // Limpar o telefone para conter apenas números
    const cleanPhone = phone.replace(/\D/g, '');
    // Adicionar código do país se necessário (DDI 55 se tiver 10 ou 11 dígitos)
    const formattedPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}`, '_blank');
  };

  // Imprimir a Ordem de Serviço
  const handlePrint = (os: ServiceOrder) => {
    triggerClick();
    
    // Obter o nome do técnico
    const techName = sellers.find(s => s.id === os.technicianId)?.name || 'Nenhum';

    // Formatar o padrão de senha visualmente para texto se houver
    const patternText = os.patternLock && os.patternLock.length > 0 
      ? `Padrão de desenho: ${os.patternLock.join(' ➔ ')}` 
      : 'Não cadastrado';

    // Criar uma nova janela temporária para impressão de alta qualidade
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, libere popups no navegador para imprimir a OS.');
      return;
    }

    // Logo da Loja (ou ícone padrão se não tiver)
    const logoHtml = storeLogo 
      ? `<img src="${storeLogo}" alt="Logo da Loja" style="max-height: 70px; object-fit: contain;" />`
      : `<div style="font-weight: 800; font-size: 20px; color: #059669; display: flex; align-items: center; gap: 8px;">
          <span style="background-color: #e6f4ea; padding: 6px 12px; border-radius: 8px;">🔧</span>
          <span>ASSISTÊNCIA TÉCNICA</span>
         </div>`;

    const warrantyTerms = `
      <ol style="margin: 0; padding-left: 15px; font-size: 10px; color: #4b5563; line-height: 1.4;">
        <li><strong>PRAZO DE GARANTIA:</strong> Nos termos do art. 26, II do CDC, a garantia é de 90 (noventa) dias para o serviço realizado e peças substituídas, contados a partir da data de retirada do aparelho.</li>
        <li><strong>EXCLUSÃO DE GARANTIA:</strong> A garantia perderá sua validade automaticamente se o aparelho apresentar sinais de: quedas, esmagamento, entrada de líquidos/umidade, violação dos lacres de segurança internos/externos, ou tentativa de reparo por terceiros.</li>
        <li><strong>PRAZO PARA RETIRADA:</strong> Aparelhos prontos e não retirados em até 90 (noventa) dias a contar da notificação serão considerados abandonados nos termos da lei, podendo ser alienados ou reciclados para cobrir custos de armazenamento, peças e mão de obra.</li>
        <li><strong>BACKUP DE DADOS:</strong> A loja não se responsabiliza por perda de dados, fotos, contatos e aplicativos durante o processo de reparo. O backup prévio dos dados é de total responsabilidade do cliente.</li>
        <li><strong>APARELHOS MOlhados/APAGADOS:</strong> Em caso de aparelhos que deram entrada desligados ou com contato com líquido, o cliente declara estar ciente de que podem ocorrer danos adicionais irreversíveis durante a tentativa de reparo.</li>
      </ol>
    `;

    // Gerar um Grid 3x3 estático em SVG para a impressão mostrar o desenho do padrão!
    let printPatternSvg = '';
    if (os.patternLock && os.patternLock.length > 0) {
      const getPrintCoords = (num: number) => {
        const row = Math.floor((num - 1) / 3);
        const col = (num - 1) % 3;
        return { x: 25 + col * 40, y: 25 + row * 40 };
      };

      const lines = os.patternLock.map((dot, index) => {
        if (index === 0) return '';
        const prev = getPrintCoords(os.patternLock![index - 1]);
        const curr = getPrintCoords(dot);
        return `<line x1="${prev.x}" y1="${prev.y}" x2="${curr.x}" y2="${curr.y}" stroke="#059669" stroke-width="3" stroke-linecap="round" />`;
      }).join('');

      const dots = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
        const coords = getPrintCoords(num);
        const isSelected = os.patternLock!.includes(num);
        const seqIndex = os.patternLock!.indexOf(num);
        return `
          <circle cx="${coords.x}" cy="${coords.y}" r="8" fill="${isSelected ? '#059669' : '#ffffff'}" stroke="${isSelected ? '#047857' : '#cbd5e1'}" stroke-width="1.5" />
          ${isSelected ? `<text x="${coords.x}" y="${coords.y + 3}" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#ffffff">${seqIndex + 1}</text>` : ''}
        `;
      }).join('');

      printPatternSvg = `
        <svg width="130" height="130" style="border: 1px solid #e5e7eb; border-radius: 6px; background-color: #f9fafb; margin: auto; display: block;">
          ${lines}
          ${dots}
        </svg>
      `;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Ordem de Serviço ${os.osNumber}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 11px; line-height: 1.3; color: #1f2937; margin: 0; padding: 0; }
          .os-container { max-width: 800px; margin: auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px; }
          .store-info { text-align: left; }
          .os-title { text-align: right; }
          .os-number { font-size: 20px; font-weight: bold; color: #059669; }
          .os-date { font-size: 11px; color: #6b7280; font-weight: 500; }
          
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
          .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 15px; }
          .grid-left-right { display: grid; grid-template-columns: 2.5fr 1fr; gap: 15px; margin-bottom: 15px; }

          .section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; background-color: #ffffff; }
          .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px; margin-bottom: 8px; }
          
          .label-val { display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px dotted #f3f4f6; pb: 2px; }
          .label-val strong { color: #374151; font-size: 10px; }
          .label-val span { font-weight: 500; }

          .block-text { margin-bottom: 6px; font-size: 10.5px; }
          .block-text strong { display: block; font-size: 9px; text-transform: uppercase; color: #6b7280; margin-bottom: 2px; }
          .block-text p { margin: 0; padding: 6px; background-color: #f9fafb; border-radius: 4px; border-left: 2px solid #059669; white-space: pre-wrap; font-size: 10px; color: #111827; }

          .pattern-box { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 8px; background-color: #fafafa; }
          .pattern-title { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #6b7280; margin-bottom: 6px; text-align: center; }

          .warranty-box { margin-top: 15px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; background-color: #f9fafb; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; margin-bottom: 20px; }
          .sig-line { width: 45%; border-top: 1px solid #9ca3af; text-align: center; padding-top: 5px; font-size: 9px; color: #4b5563; }

          .divider-dashed { border-top: 1px dashed #9ca3af; margin: 40px 0; position: relative; }
          .divider-tag { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background-color: #ffffff; padding: 0 10px; font-size: 8px; font-weight: bold; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; }

          .badge-status { font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; display: inline-block; background-color: #e6f4ea; color: #059669; border: 1px solid #a7f3d0; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="os-container">
          
          <!-- VIA DA LOJA -->
          <div class="header">
            <div class="store-info">
              ${logoHtml}
              <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">Faturamento, Peças e Serviços para Informática & Celular</div>
            </div>
            <div class="os-title">
              <span class="badge-status">VIA DA LOJA</span>
              <div class="os-number">${os.osNumber}</div>
              <div class="os-date">Entrada: ${formatDateDisplay(os.createdAt)}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="section">
              <div class="section-title">Dados do Cliente</div>
              <div class="label-val"><strong>Nome:</strong> <span>${os.clientName}</span></div>
              <div class="label-val"><strong>WhatsApp:</strong> <span>${os.clientPhone}</span></div>
              <div class="label-val"><strong>CPF:</strong> <span>${os.clientCpf || 'Não cadastrado'}</span></div>
              <div class="label-val"><strong>Endereço:</strong> <span>${os.clientAddress || 'Não cadastrado'}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Aparelho & Senhas</div>
              <div class="label-val"><strong>Equipamento:</strong> <span>${os.device}</span></div>
              <div class="label-val"><strong>Modelo:</strong> <span>${os.model}</span></div>
              <div class="label-val"><strong>Senha Comum:</strong> <span>${os.textPassword || 'Sem senha comum'}</span></div>
              <div class="label-val"><strong>Técnico Resp:</strong> <span>${techName}</span></div>
            </div>
          </div>

          <div class="grid-left-right">
            <div class="section" style="display: flex; flex-direction: column; gap: 8px;">
              <div class="section-title">Detalhes do Serviço</div>
              
              <div class="grid-2" style="margin-bottom: 0;">
                <div class="label-val" style="margin-bottom: 0;"><strong>Acessórios:</strong> <span>${os.accessories || 'Nenhum'}</span></div>
                <div class="label-val" style="margin-bottom: 0;"><strong>Observações:</strong> <span>${os.notes || 'Nenhuma'}</span></div>
              </div>

              <div class="block-text">
                <strong>Defeito Relatado pelo Cliente</strong>
                <p>${os.defect}</p>
              </div>

              <div class="block-text" style="margin-bottom: 0;">
                <strong>Orçamento Proposto / Peças</strong>
                <p>${os.budget || 'Pendente de orçamento'}</p>
              </div>
            </div>

            <div class="section" style="display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="section-title" style="text-align: center;">Padrão Gráfico</div>
                ${printPatternSvg || '<div style="font-size: 9px; color: #9ca3af; text-align: center; margin-top: 30px;">Sem padrão desenhado</div>'}
              </div>
              
              <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 8px; margin-top: 10px;">
                <span style="font-size: 8px; text-transform: uppercase; color: #6b7280; display: block; margin-bottom: 2px;">Valor Total do Serviço</span>
                <span style="font-size: 16px; font-weight: bold; color: #059669; font-family: monospace;">${formatCurrency(os.value)}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">O que foi executado (Laudo Técnico)</div>
            <div class="block-text" style="margin-bottom: 0;">
              <p>${os.whatWasDone || 'Aguardando início do reparo'}</p>
            </div>
          </div>

          <div class="signatures" style="margin-top: 30px; margin-bottom: 10px;">
            <div class="sig-line">Assinatura do Técnico</div>
            <div class="sig-line">Responsável pelo Recebimento</div>
          </div>


          <!-- LINHA DE CORTE -->
          <div class="divider-dashed">
            <span class="divider-tag">Destaque para o cliente</span>
          </div>


          <!-- VIA DO CLIENTE -->
          <div class="header">
            <div class="store-info">
              ${logoHtml}
              <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">Faturamento, Peças e Serviços para Informática & Celular</div>
            </div>
            <div class="os-title">
              <span class="badge-status">VIA DO CLIENTE</span>
              <div class="os-number">${os.osNumber}</div>
              <div class="os-date">Entrada: ${formatDateDisplay(os.createdAt)}</div>
            </div>
          </div>

          <div class="grid-2">
            <div class="section">
              <div class="section-title">Dados do Cliente</div>
              <div class="label-val"><strong>Nome:</strong> <span>${os.clientName}</span></div>
              <div class="label-val"><strong>WhatsApp:</strong> <span>${os.clientPhone}</span></div>
              <div class="label-val"><strong>CPF:</strong> <span>${os.clientCpf || 'Não cadastrado'}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Equipamento & Orçamento</div>
              <div class="label-val"><strong>Aparelho/Modelo:</strong> <span>${os.device} ${os.model}</span></div>
              <div class="label-val"><strong>Acessórios Inclusos:</strong> <span>${os.accessories || 'Nenhum'}</span></div>
              <div class="label-val"><strong>Orçamento Estimado:</strong> <span style="font-weight: bold; color: #059669;">${formatCurrency(os.value)}</span></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Defeito Reclamado</div>
            <p style="margin: 0; font-size: 9.5px; color: #374151;">${os.defect}</p>
          </div>

          <div class="warranty-box">
            <div class="section-title" style="border-bottom-color: #e5e7eb; padding-bottom: 3px; margin-bottom: 6px; color: #374151;">Termos de Garantia e Condições de Serviço</div>
            ${warrantyTerms}
          </div>

          <div class="signatures">
            <div class="sig-line">Assinatura do Cliente</div>
            <div class="sig-line">Assinatura da Loja / Carimbo</div>
          </div>

        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Aguardar o carregamento das imagens antes de imprimir
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      // Não fechar imediatamente para o usuário ver o diálogo
    };
  };

  // Exportar ordens de serviço formatado em HTML Spreadsheet (conforme o pedido de Marcos)
  const handleExportExcelOS = () => {
    triggerClick();
    
    let rowsHtml = '';
    filteredOrders.forEach((os) => {
      const techName = sellers.find(s => s.id === os.technicianId)?.name || 'Nenhum';
      rowsHtml += `
        <tr>
          <td class="text-center font-bold">${os.osNumber}</td>
          <td class="text-center">${formatDateDisplay(os.createdAt)}</td>
          <td>${os.clientName}</td>
          <td class="text-center">${os.clientPhone}</td>
          <td>${os.device} ${os.model}</td>
          <td>${os.defect}</td>
          <td>${os.status}</td>
          <td>${techName}</td>
          <td class="text-right font-bold">${formatCurrency(os.value)}</td>
        </tr>
      `;
    });

    const totalVal = filteredOrders.reduce((acc, curr) => acc + curr.value, 0);

    const spreadsheetHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          table { border-collapse: collapse; width: 100%; font-size: 14px; }
          th { font-size: 14px; font-weight: bold; background-color: #059669; color: white; border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
          td { font-size: 14px; border: 1px solid #e2e8f0; padding: 10px; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .title { font-size: 18px; font-weight: bold; color: #047857; margin-bottom: 10px; }
          .footer-total { background-color: #ecfdf5; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="title">Relatório Consolidado de Ordens de Serviço (OS)</div>
        <p>Exportado em: ${new Date().toLocaleDateString('pt-BR')} | Total de Registros: ${filteredOrders.length}</p>
        <table>
          <thead>
            <tr>
              <th style="text-align: center; width: 100px;">Nº da OS</th>
              <th style="text-align: center; width: 100px;">Data de Entrada</th>
              <th style="width: 200px;">Cliente</th>
              <th style="text-align: center; width: 130px;">WhatsApp</th>
              <th style="width: 180px;">Equipamento / Modelo</th>
              <th style="width: 250px;">Defeito</th>
              <th style="width: 110px;">Status</th>
              <th style="width: 140px;">Técnico Resp.</th>
              <th style="text-align: right; width: 120px;">Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="footer-total">
              <td colspan="8" class="text-right font-bold">TOTAL GERAL:</td>
              <td class="text-right font-bold" style="color: #047857;">${formatCurrency(totalVal)}</td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([spreadsheetHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Ordens_Servico_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeClass = (s: OSStatus) => {
    switch (s) {
      case 'Nova':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Orçamento':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Aprovada':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Em Reparo':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Pronta':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Entregue':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Sem Conserto':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6" id="service-orders-container">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-600" />
            Ordens de Serviço (OS)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Controle de reparos de informática e celular, controle de padrões de desenho de tela, orçamentos e termos de garantia impressos.
          </p>
        </div>
        <button
          onClick={handleOpenNewOS}
          id="new-os-btn"
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" /> Nova OS
        </button>
      </div>

      {/* PAINEL DE FILTROS E BUSCA */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por OS, cliente, telefone, CPF, equipamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-none bg-white focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.8 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 w-full sm:w-auto cursor-pointer"
          >
            <option value="todos">Status: Todos</option>
            <option value="Nova">Nova</option>
            <option value="Orçamento">Orçamento</option>
            <option value="Aprovada">Aprovada</option>
            <option value="Em Reparo">Em Reparo</option>
            <option value="Pronta">Pronta</option>
            <option value="Entregue">Entregue</option>
            <option value="Sem Conserto">Sem Conserto</option>
          </select>

          {/* Filtro Técnico */}
          <select
            value={filterTechnician}
            onChange={(e) => setFilterTechnician(e.target.value)}
            className="px-2.5 py-1.8 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 w-full sm:w-auto cursor-pointer"
          >
            <option value="todos">Técnico: Todos</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Exportar Excel formatado */}
          <button
            onClick={handleExportExcelOS}
            title="Exportar OS formatado para Excel (Tamanho 14)"
            className="px-3 py-1.8 border border-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-50 flex items-center gap-1 w-full sm:w-auto justify-center cursor-pointer font-semibold"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Exportar (Excel)
          </button>
        </div>
      </div>

      {/* LISTA DE ORDENS DE SERVIÇO */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs">
            <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            Nenhuma Ordem de Serviço cadastrada ou encontrada para os filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-600">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5 w-24 text-center">Nº da OS</th>
                  <th scope="col" className="px-6 py-3.5">Cliente / Telefone</th>
                  <th scope="col" className="px-6 py-3.5">Equipamento / Modelo</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Status</th>
                  <th scope="col" className="px-6 py-3.5">Técnico Responsável</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Valor</th>
                  <th scope="col" className="px-6 py-3.5 text-center w-36">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((os) => {
                  const techName = sellers.find(s => s.id === os.technicianId)?.name || 'Nenhum';
                  return (
                    <tr key={os.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-900 text-center font-mono text-xs">
                        {os.osNumber}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-800">{os.clientName}</div>
                        <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                          <span>{os.clientPhone}</span>
                          <button
                            onClick={() => handleWhatsappRedirect(os.clientPhone)}
                            title="Chamar no WhatsApp"
                            className="p-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded transition-colors cursor-pointer"
                          >
                            <Phone className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-700">{os.device}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{os.model}</div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(os.status)}`}>
                          {os.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-600">
                        {techName}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-900 font-mono text-xs">
                        {formatCurrency(os.value)}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => { triggerClick(); setIsViewing(os); }}
                            title="Visualizar OS"
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditOS(os)}
                            title="Editar OS"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(os)}
                            title="Imprimir OS Completa (com garantia)"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir permanentemente a OS ${os.osNumber}?`)) {
                                triggerClick();
                                onDeleteOS(os.id);
                              }
                            }}
                            title="Excluir OS"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL / FORMULÁRIO DE NOVA / EDIÇÃO DE OS */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="os-form-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Cabeçalho Modal */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-emerald-600" />
                {editingOS ? `Editar OS (${editingOS.osNumber})` : 'Nova Ordem de Serviço'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Corpo Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">
              
              {/* SESSÃO 1: DADOS DO CLIENTE */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <span>1. Dados Cadastrais do Cliente</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo dos Santos"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: (11) 98765-4321"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      placeholder="Rua, número, bairro, cidade"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      CPF (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 123.456.789-00"
                      value={clientCpf}
                      onChange={(e) => setClientCpf(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SESSÃO 2: APARELHO E SENHAS */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <span>2. Especificações do Aparelho & Segurança</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Lado Esquerdo: Campos de Texto */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Aparelho / Equipamento *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Celular Motorola, Notebook Dell"
                        value={device}
                        onChange={(e) => setDevice(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Modelo do Equipamento *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Moto G60, Inspiron 15 3000"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Senha Comum / Pin (Caso não seja Padrão)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 1234, asdf@2026"
                        value={textPassword}
                        onChange={(e) => setTextPassword(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Lado Direito: Padrão de 9 Pontos */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col items-center justify-between">
                    <div className="w-full flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Senha Padrão (9 pontos)
                      </span>
                      {patternLock.length > 0 && (
                        <button
                          type="button"
                          onClick={clearPattern}
                          className="text-[9px] font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    {/* SVG interativo para desenhar o padrão */}
                    <div className="relative touch-none select-none">
                      <svg className="w-40 h-40 bg-white border border-slate-100 rounded-lg shadow-inner">
                        {/* Linhas */}
                        {patternLock.map((dot, index) => {
                          if (index === 0) return null;
                          const prev = getCoords(patternLock[index - 1]);
                          const curr = getCoords(dot);
                          return (
                            <line
                              key={index}
                              x1={prev.x}
                              y1={prev.y}
                              x2={curr.x}
                              y2={curr.y}
                              stroke="#10b981"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                            />
                          );
                        })}
                        {/* Pontos */}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                          const coords = getCoords(num);
                          const isSelected = patternLock.includes(num);
                          const seqIndex = patternLock.indexOf(num);
                          return (
                            <g
                              key={num}
                              onClick={() => handleDotClick(num)}
                              className="cursor-pointer"
                            >
                              <circle
                                cx={coords.x}
                                cy={coords.y}
                                r="12"
                                fill={isSelected ? '#10b981' : '#f1f5f9'}
                                stroke={isSelected ? '#047857' : '#cbd5e1'}
                                strokeWidth="1.5"
                              />
                              {isSelected ? (
                                <text
                                  x={coords.x}
                                  y={coords.y + 3}
                                  textAnchor="middle"
                                  fontSize="8"
                                  fontWeight="bold"
                                  className="fill-white font-mono"
                                >
                                  {seqIndex + 1}
                                </text>
                              ) : (
                                <circle
                                  cx={coords.x}
                                  cy={coords.y}
                                  r="3"
                                  fill="#94a3b8"
                                />
                              )}
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    <div className="text-[10px] text-slate-500 text-center mt-2 font-mono truncate max-w-full">
                      {patternLock.length > 0 
                        ? `Sequência: ${patternLock.join(' ➔ ')}` 
                        : 'Clique nos pontos na sequência'}
                    </div>
                  </div>

                </div>
              </div>

              {/* SESSÃO 3: DETALHES DE ENTRADA, ACESSÓRIOS E OBSERVAÇÕES */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <span>3. Acessórios & Condição Física</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Acessórios Deixados com o Aparelho
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Carregador Original, Cabo, Cartão SD, Capinha"
                      value={accessories}
                      onChange={(e) => setAccessories(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Observações Físicas / Estado Geral
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Aparelho com marcas de uso e tela trincada no canto superior"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SESSÃO 4: DETALHES TÉCNICOS, TEXTAREAS LIMITADAS */}
              <div className="space-y-4 pt-2">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <span>4. Laudos Técnicos & Orçamento</span>
                </h4>

                {/* Defeito (Até 600 caracteres) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Defeito / Sintoma Relatado * (Máx 600 caracteres)
                    </label>
                    <span className={`text-[10px] font-mono ${defect.length > 550 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                      {defect.length} / 600
                    </span>
                  </div>
                  <textarea
                    required
                    maxLength={600}
                    rows={3}
                    placeholder="Descreva minuciosamente qual o defeito apresentado pelo aparelho ou qual a reclamação do cliente..."
                    value={defect}
                    onChange={(e) => setDefect(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white resize-none"
                  />
                </div>

                {/* Orçamento (Até 300 caracteres) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Orçamento Previsto / Peças de Reposição (Máx 300 caracteres)
                    </label>
                    <span className={`text-[10px] font-mono ${budget.length > 270 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                      {budget.length} / 300
                    </span>
                  </div>
                  <textarea
                    maxLength={300}
                    rows={2}
                    placeholder="Ex: Peça R$ 120,00 + Mão de obra R$ 80,00. Substituição de tela original Lcd..."
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white resize-none"
                  />
                </div>

                {/* O que foi feito (Até 500 caracteres) */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      O que foi executado / Diagnóstico Final (Máx 500 caracteres)
                    </label>
                    <span className={`text-[10px] font-mono ${whatWasDone.length > 450 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                      {whatWasDone.length} / 500
                    </span>
                  </div>
                  <textarea
                    maxLength={500}
                    rows={2.5}
                    placeholder="Relate o que foi executado de conserto, quais testes foram realizados para comprovação da correção..."
                    value={whatWasDone}
                    onChange={(e) => setWhatWasDone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white resize-none"
                  />
                </div>
              </div>

              {/* SESSÃO 4.5: PEDIDO DE PEÇA / ENCOMENDA */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-xs select-none">
                  <input
                    type="checkbox"
                    checked={partRequired}
                    onChange={(e) => {
                      triggerClick();
                      setPartRequired(e.target.checked);
                    }}
                    className="h-4 w-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>⚠️ Preciso encomendar/pedir uma peça especial para este cliente?</span>
                </label>

                {partRequired && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 animate-fade-in">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Nome da Peça *
                      </label>
                      <input
                        type="text"
                        required={partRequired}
                        placeholder="Ex: Conector de carga iPhone 11"
                        value={partName}
                        onChange={(e) => setPartName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Link do Fornecedor / Anúncio (Opcional)
                      </label>
                      <input
                        type="url"
                        placeholder="Ex: https://produto.mercadolivre.com.br/..."
                        value={partLink}
                        onChange={(e) => setPartLink(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Tempo Estimado de Entrega *
                      </label>
                      <input
                        type="text"
                        required={partRequired}
                        placeholder="Ex: 5 a 7 dias úteis, Chega amanhã"
                        value={partDeliveryTime}
                        onChange={(e) => setPartDeliveryTime(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SESSÃO 5: VALORES, TÉCNICO E STATUS */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                  <span>5. Valores, Encerramento & Controle</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Valor do Serviço (R$)
                    </label>
                    <input
                      type="text"
                      placeholder="0,00"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Técnico Responsável
                    </label>
                    <select
                      value={technicianId}
                      onChange={(e) => setTechnicianId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white cursor-pointer"
                    >
                      <option value="">Selecione o técnico</option>
                      {sellers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Status da OS *
                    </label>
                    <select
                      required
                      value={status}
                      onChange={(e) => setStatus(e.target.value as OSStatus)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white cursor-pointer"
                    >
                      <option value="Nova">Nova (Aparelho Deixado)</option>
                      <option value="Orçamento">Orçamento (Aguardando Aprovação)</option>
                      <option value="Aprovada">Aprovada (Serviço Autorizado)</option>
                      <option value="Em Reparo">Em Reparo</option>
                      <option value="Pronta">Pronta (Aguardando Retirada)</option>
                      <option value="Entregue">Entregue (Concluído)</option>
                      <option value="Sem Conserto">Sem Conserto / Devolvido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ações formulário */}
              <div className="flex gap-3 justify-end pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 cursor-pointer font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors"
                >
                  {editingOS ? 'Salvar Alterações' : 'Gravar Ordem de Serviço'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VISUALIZAR DETALHES DE OS (MODAL DE CONSULTA) */}
      {isViewing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="os-view-modal">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto flex flex-col">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-md">
                  {isViewing.osNumber}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Cadastrado em {formatDateDisplay(isViewing.createdAt)}
                </span>
              </div>
              <button
                onClick={() => { triggerClick(); setIsViewing(null); }}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 text-xs">
              
              {/* Cliente */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Dados do Cliente</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><strong>Nome:</strong> <span className="text-slate-800">{isViewing.clientName}</span></div>
                  <div>
                    <strong>WhatsApp:</strong> 
                    <span className="text-slate-800 ml-1 inline-flex items-center gap-1">
                      {isViewing.clientPhone}
                      <button
                        onClick={() => handleWhatsappRedirect(isViewing.clientPhone)}
                        className="p-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded transition-colors cursor-pointer"
                        title="Abrir WhatsApp"
                      >
                        <Phone className="h-3 w-3" />
                      </button>
                    </span>
                  </div>
                  <div><strong>CPF:</strong> <span className="text-slate-800">{isViewing.clientCpf || '-'}</span></div>
                  <div><strong>Endereço:</strong> <span className="text-slate-800">{isViewing.clientAddress || '-'}</span></div>
                </div>
              </div>

              {/* Aparelho e Senhas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200/80 p-4 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Especificações do Aparelho</h4>
                  <div><strong>Aparelho:</strong> <span className="text-slate-800 font-semibold">{isViewing.device}</span></div>
                  <div><strong>Modelo:</strong> <span className="text-slate-800 font-semibold">{isViewing.model}</span></div>
                  <div><strong>Acessórios:</strong> <span className="text-slate-700">{isViewing.accessories || 'Nenhum'}</span></div>
                  <div><strong>Observações:</strong> <span className="text-slate-700">{isViewing.notes || 'Nenhuma'}</span></div>
                  <div className="pt-2 border-t border-slate-100">
                    <strong>Senha Comum:</strong> <span className="text-slate-900 font-mono font-semibold bg-slate-100 px-1.5 py-0.5 rounded">{isViewing.textPassword || 'Sem senha comum'}</span>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-200/80 p-4 rounded-xl flex flex-col items-center justify-center">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 w-full text-left">Padrão Desenhado</h4>
                  {isViewing.patternLock && isViewing.patternLock.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <svg className="w-32 h-32 bg-white border border-slate-100 rounded-lg">
                        {isViewing.patternLock.map((dot, index) => {
                          if (index === 0) return null;
                          const prev = getCoords(dot);
                          const curr = getCoords(isViewing.patternLock![index - 1]);
                          // Escalar coords do grid de 40 para 32 (multiplicar por 130/160 aprox)
                          const scale = 32 / 40;
                          return (
                            <line
                              key={index}
                              x1={prev.x * 0.75}
                              y1={prev.y * 0.75}
                              x2={curr.x * 0.75}
                              y2={curr.y * 0.75}
                              stroke="#10b981"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                            />
                          );
                        })}
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                          const coords = getCoords(num);
                          const isSelected = isViewing.patternLock!.includes(num);
                          const seqIndex = isViewing.patternLock!.indexOf(num);
                          const cx = coords.x * 0.75;
                          const cy = coords.y * 0.75;
                          return (
                            <g key={num}>
                              <circle
                                cx={cx}
                                cy={cy}
                                r="10"
                                fill={isSelected ? '#10b981' : '#f1f5f9'}
                                stroke={isSelected ? '#047857' : '#cbd5e1'}
                                strokeWidth="1"
                              />
                              {isSelected ? (
                                <text
                                  x={cx}
                                  y={cy + 3}
                                  textAnchor="middle"
                                  fontSize="8"
                                  fontWeight="bold"
                                  className="fill-white font-mono"
                                >
                                  {seqIndex + 1}
                                </text>
                              ) : (
                                <circle cx={cx} cy={cy} r="2" fill="#94a3b8" />
                              )}
                            </g>
                          );
                        })}
                      </svg>
                      <span className="text-[10px] font-mono text-slate-500 mt-2">
                        Seq: {isViewing.patternLock.join(' ➔ ')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Nenhum padrão desenhado cadastrado.</span>
                  )}
                </div>
              </div>

              {/* Textareas de Laudo */}
              <div className="space-y-3.5 pt-1">
                <div className="border-l-3 border-emerald-500 pl-3 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Defeito Informado</span>
                  <p className="text-slate-800 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap">{isViewing.defect}</p>
                </div>

                <div className="border-l-3 border-emerald-500 pl-3 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Orçamento / Peças</span>
                  <p className="text-slate-800 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap">{isViewing.budget || 'Nenhum orçamento cadastrado'}</p>
                </div>

                <div className="border-l-3 border-emerald-500 pl-3 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Laudo do Técnico / O que foi Feito</span>
                  <p className="text-slate-800 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap">{isViewing.whatWasDone || 'Aparelho aguardando início de reparos'}</p>
                </div>

                {isViewing.partRequired && (
                  <div className="border-l-3 border-amber-500 bg-amber-50/35 p-3 rounded-lg border border-amber-200/50 space-y-1.5 animate-fade-in">
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block flex items-center gap-1">
                      <span>📦 Peça Especial Solicitada para este Reparo</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      <div><strong>Peça:</strong> <span className="font-semibold text-slate-900">{isViewing.partName}</span></div>
                      <div><strong>Prazo estimado:</strong> <span className="font-semibold text-slate-900">{isViewing.partDeliveryTime}</span></div>
                      {isViewing.partLink && (
                        <div className="sm:col-span-2">
                          <strong>Link do fornecedor:</strong>{' '}
                          <a 
                            href={isViewing.partLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-600 font-medium hover:underline inline-flex items-center gap-0.5"
                          >
                            Abrir Link de Compra 🔗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status, Técnico e Valor */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 pt-4">
                <div className="space-y-1.5">
                  <div>
                    <strong>Status:</strong> 
                    <span className={`inline-block ml-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(isViewing.status)}`}>
                      {isViewing.status}
                    </span>
                  </div>
                  <div>
                    <strong>Técnico Resp:</strong> <span className="text-slate-700 font-semibold">{sellers.find(s => s.id === isViewing.technicianId)?.name || 'Nenhum'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Total Conserto</span>
                  <span className="text-lg font-bold text-emerald-600 font-mono">{formatCurrency(isViewing.value)}</span>
                </div>
              </div>

              {/* Botões de Ações */}
              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => { triggerClick(); handlePrint(isViewing); }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="h-4 w-4" /> Imprimir Recibo Completo
                </button>
                <button
                  onClick={() => { triggerClick(); setIsViewing(null); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs hover:bg-slate-50 cursor-pointer font-semibold transition-colors"
                >
                  Fechar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
