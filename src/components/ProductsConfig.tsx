/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils';
import { 
  Package, Plus, Edit2, Trash2, Check, X, Search, 
  FileSpreadsheet, AlertTriangle, CheckCircle2, ShieldAlert 
} from 'lucide-react';

interface ProductsConfigProps {
  products: Product[];
  onAddProduct: (newProduct: Omit<Product, 'id'>) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (id: string) => void;
  triggerClick: () => void;
}

export default function ProductsConfig({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  triggerClick,
}: ProductsConfigProps) {
  const [name, setName] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'running-out' | 'out-of-stock'>('all');

  // Fields for editing
  const [editName, setEditName] = useState('');
  const [editStock, setEditStock] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterStock === 'running-out') {
        return p.stockQuantity === 1;
      }
      if (filterStock === 'out-of-stock') {
        return p.stockQuantity === 0;
      }
      return true;
    });
  }, [products, searchQuery, filterStock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerClick();

    if (!name.trim()) return;
    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
    const parsedStock = Number(stockQuantity) || 0;

    onAddProduct({
      name: name.trim(),
      stockQuantity: parsedStock,
      price: parsedPrice,
    });

    setName('');
    setStockQuantity('');
    setPrice('');
  };

  const startEdit = (p: Product) => {
    triggerClick();
    setEditingId(p.id);
    setEditName(p.name);
    setEditStock(p.stockQuantity);
    setEditPrice(p.price.toString().replace('.', ','));
  };

  const cancelEdit = () => {
    triggerClick();
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    triggerClick();
    if (!editName.trim()) return;
    const parsedPrice = parseFloat(editPrice.replace(',', '.')) || 0;

    onUpdateProduct({
      id,
      name: editName.trim(),
      stockQuantity: editStock,
      price: parsedPrice,
    });

    setEditingId(null);
  };

  // Excel Report generation with EXACTLY 2 tabs: "Acabou" (stock=0) and "Restam 1" (stock=1) using SpreadsheetML
  const generateExcelReport = () => {
    triggerClick();

    const acabou = products.filter(p => p.stockQuantity === 0);
    const restam1 = products.filter(p => p.stockQuantity === 1);

    if (acabou.length === 0 && restam1.length === 0) {
      alert('Nenhum item está zerado ou restando apenas 1 unidade no estoque para gerar o relatório.');
      return;
    }

    // Build SpreadsheetML XML
    let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>Controle de Caixa</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="HeaderRed">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="12" ss:Color="#FFFFFF" ss:Bold="1"/>
      <Interior ss:Color="#EF4444" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="HeaderOrange">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="12" ss:Color="#FFFFFF" ss:Bold="1"/>
      <Interior ss:Color="#F59E0B" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="Item">
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
    </Style>
    <Style ss:ID="ItemBold">
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
    </Style>
    <Style ss:ID="ItemRed">
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="11" ss:Color="#EF4444" ss:Bold="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="Currency"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
    </Style>
  </Styles>
  
  <Worksheet ss:Name="Acabou (Zerados)">
    <Table ss:DefaultRowHeight="24">
      <Column ss:Width="250"/>
      <Column ss:Width="100"/>
      <Column ss:Width="120"/>
      <Row ss:Height="28">
        <Cell ss:StyleID="HeaderRed"><Data ss:Type="String">Nome da Mercadoria</Data></Cell>
        <Cell ss:StyleID="HeaderRed"><Data ss:Type="String">Qtd em Estoque</Data></Cell>
        <Cell ss:StyleID="HeaderRed"><Data ss:Type="String">Preço Unitário (R$)</Data></Cell>
      </Row>`;

    if (acabou.length === 0) {
      xml += `
      <Row>
        <Cell ss:MergeAcross="2" ss:StyleID="Item" ss:HAlign="Center">
          <Data ss:Type="String">Nenhuma mercadoria com estoque zerado no momento!</Data>
        </Cell>
      </Row>`;
    } else {
      acabou.forEach((p) => {
        xml += `
      <Row>
        <Cell ss:StyleID="ItemBold"><Data ss:Type="String">${p.name}</Data></Cell>
        <Cell ss:StyleID="ItemRed" ss:HAlign="Center"><Data ss:Type="Number">${p.stockQuantity}</Data></Cell>
        <Cell ss:StyleID="Item" ss:HAlign="Right"><Data ss:Type="String">${formatCurrency(p.price)}</Data></Cell>
      </Row>`;
      });
    }

    xml += `
    </Table>
  </Worksheet>

  <Worksheet ss:Name="Resta 1 Unidade">
    <Table ss:DefaultRowHeight="24">
      <Column ss:Width="250"/>
      <Column ss:Width="100"/>
      <Column ss:Width="120"/>
      <Row ss:Height="28">
        <Cell ss:StyleID="HeaderOrange"><Data ss:Type="String">Nome da Mercadoria</Data></Cell>
        <Cell ss:StyleID="HeaderOrange"><Data ss:Type="String">Qtd em Estoque</Data></Cell>
        <Cell ss:StyleID="HeaderOrange"><Data ss:Type="String">Preço Unitário (R$)</Data></Cell>
      </Row>`;

    if (restam1.length === 0) {
      xml += `
      <Row>
        <Cell ss:MergeAcross="2" ss:StyleID="Item" ss:HAlign="Center">
          <Data ss:Type="String">Nenhuma mercadoria com exatamente 1 unidade em estoque!</Data>
        </Cell>
      </Row>`;
    } else {
      restam1.forEach((p) => {
        xml += `
      <Row>
        <Cell ss:StyleID="ItemBold"><Data ss:Type="String">${p.name}</Data></Cell>
        <Cell ss:StyleID="ItemRed" ss:HAlign="Center"><Data ss:Type="Number">${p.stockQuantity}</Data></Cell>
        <Cell ss:StyleID="Item" ss:HAlign="Right"><Data ss:Type="String">${formatCurrency(p.price)}</Data></Cell>
      </Row>`;
      });
    }

    xml += `
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_Estoque_Acabando_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const zeradosCount = useMemo(() => products.filter(p => p.stockQuantity === 0).length, [products]);
  const restam1Count = useMemo(() => products.filter(p => p.stockQuantity === 1).length, [products]);

  return (
    <div className="space-y-6" id="products-config-container">
      {/* Cabeçalho */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            Controle de Mercadorias e Estoque
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre seus produtos e acompanhe em tempo real o estoque. Itens críticos (estoque = 1) são destacados.
          </p>
        </div>

        <button
          onClick={generateExcelReport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer self-start md:self-auto"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Gerar Relatório Excel (Acabando / Zerados)
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="inventory-stats-cards">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Cadastrado</span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">{products.length} itens</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Restam 1 no Estoque</span>
            <span className={`text-lg font-bold block mt-0.5 ${restam1Count > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}>
              {restam1Count} itens
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estoque Acabou</span>
            <span className={`text-lg font-bold block mt-0.5 ${zeradosCount > 0 ? 'text-red-600 font-extrabold' : 'text-slate-900'}`}>
              {zeradosCount} itens
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formulário Cadastro */}
        <div className="xl:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit" id="new-product-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-emerald-600" />
              Nova Mercadoria
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="prod-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Nome da Mercadoria *
              </label>
              <input
                id="prod-name"
                type="text"
                required
                placeholder="Ex: Conector de Carga Moto G9"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="prod-price" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Preço de Venda (R$) *
                </label>
                <input
                  id="prod-price"
                  type="text"
                  required
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white font-mono"
                />
              </div>

              <div>
                <label htmlFor="prod-stock" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Qtd em Estoque *
                </label>
                <input
                  id="prod-stock"
                  type="number"
                  required
                  min="0"
                  placeholder="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Cadastrar Mercadoria
            </button>
          </form>
        </div>

        {/* Lista de Mercadorias */}
        <div className="xl:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" id="products-list-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-4 w-4 text-emerald-600" />
              Mercadorias Cadastradas
            </h3>

            {/* Filtro e Busca */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar mercadoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white focus:border-emerald-500 w-full sm:w-48"
                />
              </div>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as any)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Filtro: Todos</option>
                <option value="running-out">Filtro: Restam 1</option>
                <option value="out-of-stock">Filtro: Estoque Acabou</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhuma mercadoria encontrada com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="px-4 py-3">Mercadoria</th>
                    <th scope="col" className="px-4 py-3 text-center">Qtd Estoque</th>
                    <th scope="col" className="px-4 py-3 text-right">Preço Unitário</th>
                    <th scope="col" className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isEditing = editingId === p.id;
                    const isCritical = p.stockQuantity === 1;
                    const isZero = p.stockQuantity === 0;

                    return (
                      <tr 
                        key={p.id} 
                        className={`transition-colors hover:bg-slate-50/40 ${
                          isCritical ? 'bg-red-50/30' : isZero ? 'bg-slate-50/80 text-slate-400' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-200 rounded bg-white w-full max-w-[200px]"
                            />
                          ) : (
                            <span className={isCritical ? 'text-red-600 font-bold' : ''}>
                              {p.name}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editStock}
                              onChange={(e) => setEditStock(Number(e.target.value))}
                              className="px-2 py-1 text-xs border border-slate-200 rounded bg-white w-20 text-center font-mono"
                            />
                          ) : (
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              isCritical 
                                ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                                : isZero 
                                ? 'bg-slate-100 text-slate-500 border-slate-200' 
                                : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            }`}>
                              {p.stockQuantity}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-mono">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-200 rounded bg-white w-24 text-right font-mono"
                            />
                          ) : (
                            <span className={isCritical ? 'text-red-600 font-bold' : 'font-semibold text-slate-900'}>
                              {formatCurrency(p.price)}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(p.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                  title="Salvar"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(p)}
                                  className="p-1 text-slate-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                  title="Editar"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Deseja realmente remover a mercadoria "${p.name}"?`)) {
                                      triggerClick();
                                      onDeleteProduct(p.id);
                                    }
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
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
      </div>
    </div>
  );
}
