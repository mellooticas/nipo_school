import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { professoresService } from '../services/professoresService';

const FileUpload = ({
  onFileUploaded,
  onError,
  acceptedTypes = 'image/*,.pdf,.doc,.docx,.txt,.mp3,.mp4',
  maxSize = 50, // MB
  multiple = false,
  uploadType = 'arquivo', // 'arquivo', 'imagem', 'video', 'audio'
  showPreview = true,
  className = '',
  placeholder = 'Clique para selecionar ou arraste arquivos aqui'
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  // Configurações por tipo de upload
  const uploadConfigs = {
    arquivo: {
      accept: '.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx,.zip,.rar',
      maxSize: 50,
      bucket: 'professores-arquivos',
      icon: '📄',
      description: 'PDFs, documentos, planilhas'
    },
    imagem: {
      accept: 'image/*',
      maxSize: 10,
      bucket: 'professores-imagens',
      icon: '🖼️',
      description: 'JPG, PNG, GIF, WebP'
    },
    video: {
      accept: 'video/*',
      maxSize: 200,
      bucket: 'professores-videos',
      icon: '🎥',
      description: 'MP4, MOV, AVI, WebM'
    },
    audio: {
      accept: 'audio/*',
      maxSize: 50,
      bucket: 'professores-audios',
      icon: '🎵',
      description: 'MP3, WAV, M4A'
    }
  };

  const config = uploadConfigs[uploadType] || uploadConfigs.arquivo;

  // Validar arquivo
  const validateFile = (file) => {
    const errors = [];
    
    // Verificar tamanho
    const maxSizeBytes = (maxSize || config.maxSize) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`Arquivo muito grande. Máximo: ${maxSize || config.maxSize}MB`);
    }

    // Verificar tipo
    const acceptedTypesArray = (acceptedTypes || config.accept).split(',').map(t => t.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    const isValidType = acceptedTypesArray.some(type => {
      if (type.includes('*')) {
        return fileType.startsWith(type.replace('*', ''));
      }
      return type === fileExtension || type === fileType;
    });

    if (!isValidType) {
      errors.push(`Tipo de arquivo não suportado. Aceitos: ${config.description}`);
    }

    return errors;
  };

  // Processar arquivos selecionados
  const processFiles = useCallback(async (files) => {
    const fileList = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    // Validar cada arquivo
    fileList.forEach((file, index) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(`${file.name}: ${fileErrors.join(', ')}`);
      } else {
        validFiles.push({ file, id: `${Date.now()}-${index}` });
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      onError && onError(newErrors);
      return;
    }

    setErrors([]);
    
    // Se não for múltiplo, manter apenas o último arquivo
    if (!multiple && validFiles.length > 1) {
      validFiles.splice(0, validFiles.length - 1);
    }

    // Fazer upload dos arquivos válidos
    await uploadFiles(validFiles);
  }, [acceptedTypes, maxSize, multiple, uploadType, onError]);

  // Upload para Supabase Storage
  const uploadFiles = async (filesToUpload) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = filesToUpload.map(async ({ file, id }) => {
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;

        try {
          // Upload para Supabase Storage
          const result = await professoresService.uploadFile(file, fileName, config.bucket);
          
          if (result.success) {
            return {
              id,
              name: file.name,
              originalName: file.name,
              fileName: fileName,
              url: result.url,
              publicUrl: result.publicUrl,
              size: file.size,
              type: file.type,
              uploadedAt: new Date().toISOString()
            };
          } else {
            throw new Error(result.error || 'Erro no upload');
          }
        } catch (error) {
          console.error(`Erro no upload do arquivo ${file.name}:`, error);
          throw error;
        }
      });

      const results = await Promise.all(uploadPromises);
      
      setUploadedFiles(prev => multiple ? [...prev, ...results] : results);
      setUploadProgress(100);
      
      // Callback com os arquivos enviados
      if (onFileUploaded) {
        onFileUploaded(multiple ? results : results[0]);
      }

    } catch (error) {
      const errorMessage = `Erro no upload: ${error.message}`;
      setErrors([errorMessage]);
      onError && onError([errorMessage]);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  // Handlers de drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Handler para input file
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  // Remover arquivo da lista
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Abrir seletor de arquivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Área de Upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          isDragOver
            ? 'border-red-500 bg-red-50'
            : uploading
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes || config.accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-center">
          <div className="text-4xl mb-3">
            {uploading ? '⏳' : config.icon}
          </div>
          
          <div className="text-lg font-medium text-gray-900 mb-2">
            {uploading ? 'Enviando arquivos...' : placeholder}
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            <div>Formatos aceitos: {config.description}</div>
            <div>Tamanho máximo: {maxSize || config.maxSize}MB {multiple ? '(cada arquivo)' : ''}</div>
            {multiple && <div>📎 Múltiplos arquivos permitidos</div>}
          </div>

          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <button
            type="button"
            disabled={uploading}
            className={`px-4 py-2 border border-gray-300 rounded-lg font-medium transition-colors ${
              uploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {uploading ? 'Enviando...' : '📁 Selecionar Arquivos'}
          </button>
        </div>
      </div>

      {/* Erros */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-red-600 text-lg mr-3">⚠️</div>
            <div className="flex-1">
              <h4 className="text-red-800 font-medium mb-2">Erro(s) no upload:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setErrors([])}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Lista de Arquivos Enviados */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">
            📎 Arquivos enviados ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center flex-1">
                  <div className="text-2xl mr-3">
                    {file.type.startsWith('image/') ? '🖼️' :
                     file.type.startsWith('video/') ? '🎥' :
                     file.type.startsWith('audio/') ? '🎵' :
                     file.type.includes('pdf') ? '📕' :
                     file.type.includes('document') || file.type.includes('msword') ? '📘' :
                     file.type.includes('sheet') || file.type.includes('excel') ? '📊' :
                     file.type.includes('presentation') || file.type.includes('powerpoint') ? '📋' :
                     '📄'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {file.originalName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • Enviado em {new Date(file.uploadedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {file.publicUrl && (
                    <a
                      href={file.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar arquivo"
                    >
                      🔗
                    </a>
                  )}
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover arquivo"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview para imagens */}
      {showPreview && uploadedFiles.some(f => f.type.startsWith('image/')) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">🖼️ Preview das imagens</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadedFiles
              .filter(f => f.type.startsWith('image/'))
              .map((file) => (
                <div key={file.id} className="relative group">
                  <img
                    src={file.publicUrl}
                    alt={file.originalName}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => removeFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 bg-red-600 text-white rounded-full text-sm transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;