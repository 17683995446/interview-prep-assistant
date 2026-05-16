import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import { Backup } from '@/services/dataService';
import { exportToJSON, exportToCSV, downloadFile } from '@/services/exportService';
import { importFromJSON, validateImportFile } from '@/services/importService';
import { createBackup, listBackups, restoreBackup, deleteBackup, deleteAllBackups } from '@/services/backupService';

export default function DataManagement() {
  const { progress, favorites, achievements } = useAppStore();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setBackups(listBackups());
  }, []);
  
  const handleExportJSON = async () => {
    try {
      const blob = await exportToJSON();
      const date = new Date().toISOString().split('T')[0];
      downloadFile(blob, `interview-progress-${date}.json`);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };
  
  const handleExportCSV = async () => {
    try {
      const blob = await exportToCSV();
      const date = new Date().toISOString().split('T')[0];
      downloadFile(blob, `interview-progress-${date}.csv`);
    } catch (error) {
      console.error('导出失败:', error);
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = await validateImportFile(file);
    if (!validation.valid) {
      setImportResult({ success: false, message: validation.error || '文件验证失败' });
      return;
    }
    
    const result = await importFromJSON(file);
    if (result.success) {
      setImportResult({ 
        success: true, 
        message: `成功导入 ${result.imported} 条数据${result.skipped > 0 ? `，跳过 ${result.skipped} 条` : ''}` 
      });
      if (result.errors.length > 0) {
        console.warn('导入警告:', result.errors);
      }
    } else {
      setImportResult({ success: false, message: result.errors.join(', ') });
    }
    
    setShowImportModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCreateBackup = async () => {
    try {
      await createBackup();
      setBackups(listBackups());
      setImportResult({ success: true, message: '备份创建成功！' });
    } catch (error) {
      setImportResult({ success: false, message: '备份创建失败' });
    }
  };
  
  const handleRestoreBackup = (backupId: string) => {
    if (confirm('确定要恢复此备份吗？当前数据将被覆盖。')) {
      if (restoreBackup(backupId)) {
        setImportResult({ success: true, message: '备份恢复成功！页面将重新加载。' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setImportResult({ success: false, message: '备份恢复失败' });
      }
    }
  };
  
  const handleDeleteBackup = (backupId: string) => {
    if (confirm('确定要删除此备份吗？')) {
      if (deleteBackup(backupId)) {
        setBackups(listBackups());
        setImportResult({ success: true, message: '备份已删除' });
      }
    }
  };
  
  const handleClearAllBackups = () => {
    if (confirm('确定要删除所有备份吗？此操作不可恢复。')) {
      deleteAllBackups();
      setBackups([]);
      setImportResult({ success: true, message: '所有备份已删除' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">数据管理</h1>
        <p className="text-base-content/60">管理您的学习数据、备份和导入导出</p>
      </div>

      {importResult && (
        <div className={`alert mb-6 ${importResult.success ? 'alert-success' : 'alert-error'}`}>
          <span>{importResult.message}</span>
          <button 
            className="btn btn-sm btn-ghost"
            onClick={() => setImportResult(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <span className="text-3xl">📤</span> 导出数据
            </h2>
            <p className="text-base-content/60 mb-4">
              将您的学习进度导出为文件，支持JSON和CSV格式
            </p>
            <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
              <div className="stat">
                <div className="stat-title">已完成题目</div>
                <div className="stat-value text-primary">{Object.values(progress).filter(p => p.completed).length}</div>
                <div className="stat-desc">共 {Object.keys(progress).length} 条记录</div>
              </div>
              <div className="stat">
                <div className="stat-title">收藏题目</div>
                <div className="stat-value text-secondary">{favorites.length}</div>
                <div className="stat-desc">收藏夹</div>
              </div>
              <div className="stat">
                <div className="stat-title">获得成就</div>
                <div className="stat-value text-accent">{achievements.length}</div>
                <div className="stat-desc">已解锁</div>
              </div>
            </div>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={handleExportJSON}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                导出JSON
              </button>
              <button className="btn btn-secondary" onClick={handleExportCSV}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出CSV
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <span className="text-3xl">📥</span> 导入数据
            </h2>
            <p className="text-base-content/60 mb-4">
              从JSON文件导入学习进度，支持之前导出的数据文件
            </p>
            <div className="alert alert-info mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>导入数据将与现有数据合并，重复数据将被跳过</span>
            </div>
            <div className="card-actions justify-end">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setShowImportModal(true);
                  fileInputRef.current?.click();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                选择文件导入
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl mt-6">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title text-2xl">
              <span className="text-3xl">💾</span> 备份管理
            </h2>
            <div className="flex gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleCreateBackup}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建备份
              </button>
              {backups.length > 0 && (
                <button className="btn btn-error btn-sm" onClick={handleClearAllBackups}>
                  清空所有
                </button>
              )}
            </div>
          </div>
          <p className="text-base-content/60 mb-4">
            自动备份当前数据，最多保存10个备份
          </p>
          
          {backups.length === 0 ? (
            <div className="alert">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <span>暂无备份记录，点击"创建备份"开始备份</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>备份时间</th>
                    <th>大小</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr key={backup.id}>
                      <td>{new Date(backup.date).toLocaleString('zh-CN')}</td>
                      <td>{(backup.size / 1024).toFixed(2)} KB</td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-success btn-xs"
                            onClick={() => handleRestoreBackup(backup.id)}
                          >
                            恢复
                          </button>
                          <button 
                            className="btn btn-error btn-xs"
                            onClick={() => handleDeleteBackup(backup.id)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            <span className="text-3xl">⚠️</span> 数据安全提示
          </h2>
          <ul className="list-disc list-inside space-y-2 text-base-content/80">
            <li>建议定期导出重要数据作为长期备份</li>
            <li>本地备份存储在浏览器中，清除浏览器数据会导致备份丢失</li>
            <li>导入文件大小限制为10MB</li>
            <li>导入数据时会与现有数据合并，重复数据将被跳过</li>
            <li>恢复备份会覆盖当前数据，请谨慎操作</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
