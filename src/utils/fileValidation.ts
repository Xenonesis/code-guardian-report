export const validateZipFile = async (file: any): Promise<{isValid: boolean, message: string}> => {
  // Check for valid file type and extension
  const allowedTypes = ['application/zip', 'application/x-zip-compressed'];
  const isValidType = allowedTypes.includes(file.type);
  const isValidExtension = file.name.toLowerCase().endsWith('.zip');

  if (!isValidType && !isValidExtension) {
    return {isValid: false, message: 'Invalid file format. Please upload a .zip file.'};
  }
  try {
    const JSZip = (await import('jszip')).default;
    const arrayBuffer = await file.arrayBuffer();
    const zipData = await JSZip.loadAsync(arrayBuffer);
    
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.pyw', '.java', '.php', '.rb', '.go', '.cs', '.cpp', '.c', '.h', '.hpp', '.rs', '.kt', '.swift', '.vue', '.svelte', '.json', '.yaml', '.yml', '.xml', '.htm', '.html', '.css', '.scss', '.sass', '.sh', '.bash', '.sql', '.dockerfile', '.env', 'dockerfile', 'makefile'];
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
    if (file.size === 0) {
      return {isValid: false, message: 'This ZIP file is empty. Please upload a ZIP containing source code files.'};
    }
    try {
      let header = new Uint8Array(0);
      try {
        header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      } catch {
        header = new Uint8Array(0);
      }
      const isEmptyZip = header.length >= 4 && header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x05 && header[3] === 0x06;
      const isZip = header.length >= 4 && header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04;
      if (isEmptyZip) {
        return {isValid: false, message: 'This ZIP file is empty. Please upload a ZIP containing source code files.'};
      }
      if (isZip) {
        return {isValid: true, message: ''};
      }
    } catch {
      return {isValid: true, message: ''};
    }
    return {isValid: true, message: ''};
  }
};