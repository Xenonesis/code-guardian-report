export const validateZipFile = async (file: File): Promise<{isValid: boolean, message: string}> => {
  // Check for valid file type and extension
  const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
  const isValidType = allowedTypes.includes(file.type);
  const isValidExtension = file.name.toLowerCase().endsWith('.zip');

  if (!isValidType && !isValidExtension) {
    return {isValid: false, message: 'Invalid file format. Please upload a .zip file.'};
  }
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);
    
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.php', '.rb', '.go', '.cs', '.cpp', '.c', '.h', '.rs', '.vue', '.html', '.css'];
    const files = Object.keys(zipData.files).filter(name => !zipData.files[name].dir);
    
    if (files.length === 0) {
      return {isValid: false, message: 'This ZIP file is empty. Please upload a ZIP containing source code files.'};
    }
    
    const codeFiles = files.filter(filename => 
      codeExtensions.some(ext => filename.toLowerCase().endsWith(ext))
    );
    
    if (codeFiles.length === 0) {
      const foundExtensions = [...new Set(files.map(f => f.split('.').pop()?.toLowerCase()).filter(Boolean))];
      return {
        isValid: false, 
        message: `This ZIP contains ${files.length} files but no source code. Found: ${foundExtensions.map(ext => '.' + ext).join(', ')}. Please upload a ZIP with code files (.js, .py, .java, .ts, etc.)`
      };
    }
    
    return {isValid: true, message: ''};
  } catch {
    return {isValid: false, message: 'Failed to read ZIP file. Please ensure it\'s a valid ZIP archive.'};
  }
};