import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function analyzeBundle() {
  const distPath = path.join(projectRoot, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build directory not found. Run "npm run build" first.');
    return null;
  }

  console.log('\n📊 Bundle Size Analysis');
  console.log('='.repeat(50));

  let totalSize = 0;
  const files = [];

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        const relativePath = path.relative(distPath, fullPath);
        const size = stats.size;
        totalSize += size;
        
        files.push({
          path: relativePath,
          size,
          sizeFormatted: formatBytes(size)
        });
      }
    }
  }

  walkDir(distPath);

  files.sort((a, b) => b.size - a.size);

  console.log('\nTop 20 Largest Files:');
  console.log('-'.repeat(80));
  
  files.slice(0, 20).forEach((file, index) => {
    const bar = '█'.repeat(Math.min(Math.floor(file.size / 50000), 40));
    console.log(`${(index + 1).toString().padStart(2)}. ${file.path.padEnd(50)} ${file.sizeFormatted.padStart(10)}`);
  });

  console.log('-'.repeat(80));
  console.log(`Total Bundle Size: ${formatBytes(totalSize)}`);

  const jsFiles = files.filter(f => f.path.endsWith('.js'));
  const cssFiles = files.filter(f => f.path.endsWith('.css'));
  const jsTotal = jsFiles.reduce((acc, f) => acc + f.size, 0);
  const cssTotal = cssFiles.reduce((acc, f) => acc + f.size, 0);

  console.log(`\nBreakdown:`);
  console.log(`  JavaScript: ${formatBytes(jsTotal)} (${jsFiles.length} files)`);
  console.log(`  CSS: ${formatBytes(cssTotal)} (${cssFiles.length} files)`);

  return {
    totalSize,
    jsTotal,
    cssTotal,
    files: files.slice(0, 50)
  };
}

function analyzeDependencies() {
  console.log('\n\n📦 Dependency Analysis');
  console.log('='.repeat(50));

  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const significantDeps = [
      'react', 'react-dom', 'react-router-dom',
      'framer-motion', 'recharts', 'lucide-react',
      'react-syntax-highlighter', 'zustand'
    ];

    console.log('\nKey Dependencies:');
    significantDeps.forEach(dep => {
      const version = dependencies[dep];
      if (version) {
        console.log(`  ✓ ${dep}: ${version}`);
      }
    });

    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;

    console.log(`\nTotal Dependencies: ${depCount} production, ${devDepCount} dev`);

    return dependencies;
  } catch (error) {
    console.error('Error reading package.json:', error.message);
    return null;
  }
}

function analyzeCodePatterns() {
  console.log('\n\n🔍 Code Pattern Analysis');
  console.log('='.repeat(50));

  const srcPath = path.join(projectRoot, 'src');
  const patterns = {
    memo: 0,
    useMemo: 0,
    useCallback: 0,
    lazy: 0,
    Suspense: 0,
    useEffect: 0,
    useState: 0
  };

  function scanFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.includes('node_modules') && !entry.name.startsWith('.')) {
        scanFiles(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        patterns.memo += (content.match(/React\.memo|/g) || []).length;
        patterns.memo += (content.match(/\.memo\b/g) || []).length;
        patterns.useMemo += (content.match(/useMemo/g) || []).length;
        patterns.useCallback += (content.match(/useCallback/g) || []).length;
        patterns.lazy += (content.match(/lazy\(/g) || []).length;
        patterns.Suspense += (content.match(/Suspense/g) || []).length;
        patterns.useEffect += (content.match(/useEffect/g) || []).length;
        patterns.useState += (content.match(/useState/g) || []).length;
      }
    }
  }

  if (fs.existsSync(srcPath)) {
    scanFiles(srcPath);
  }

  console.log('\nOptimization Patterns:');
  console.log(`  React.memo: ${patterns.memo} usages`);
  console.log(`  useMemo: ${patterns.useMemo} usages`);
  console.log(`  useCallback: ${patterns.useCallback} usages`);
  console.log(`  React.lazy: ${patterns.lazy} usages`);
  console.log(`  Suspense: ${patterns.Suspense} usages`);
  console.log(`  useEffect: ${patterns.useEffect} usages`);
  console.log(`  useState: ${patterns.useState} usages`);

  const optimizationScore = (
    patterns.memo * 2 +
    patterns.useMemo * 2 +
    patterns.useCallback * 2 +
    patterns.lazy * 3 +
    patterns.Suspense * 3
  );

  console.log(`\nOptimization Score: ${optimizationScore}/100`);
  
  if (optimizationScore < 20) {
    console.log('⚠️  Low optimization - Consider adding more memoization and lazy loading');
  } else if (optimizationScore < 50) {
    console.log('⚡ Moderate optimization - Room for improvement');
  } else {
    console.log('✅ Good optimization level');
  }

  return patterns;
}

function analyzeAssets() {
  console.log('\n\n🖼️  Asset Analysis');
  console.log('='.repeat(50));

  const publicPath = path.join(projectRoot, 'public');
  const srcAssetsPath = path.join(projectRoot, 'src', 'assets');

  let assetCount = 0;
  let totalAssetSize = 0;

  function scanAssets(dir, label) {
    if (!fs.existsSync(dir)) {
      console.log(`\n${label}: Directory not found`);
      return;
    }

    const files = [];
    
    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          walk(fullPath);
        } else {
          const stats = fs.statSync(fullPath);
          files.push({
            name: entry.name,
            size: stats.size,
            path: fullPath
          });
          totalAssetSize += stats.size;
        }
      }
    }

    walk(dir);
    assetCount += files.length;

    console.log(`\n${label} (${files.length} files):`);
    files.forEach(file => {
      console.log(`  ${file.name.padEnd(30)} ${formatBytes(file.size)}`);
    });
  }

  scanAssets(publicPath, 'Public Directory');
  scanAssets(srcAssetsPath, 'Src Assets');

  console.log(`\nTotal Assets: ${assetCount}, ${formatBytes(totalAssetSize)}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateReport() {
  console.log('\n\n📈 Performance Audit Report');
  console.log('='.repeat(50));
  
  const bundleData = analyzeBundle();
  analyzeDependencies();
  analyzeCodePatterns();
  analyzeAssets();

  console.log('\n\n💡 Recommendations');
  console.log('='.repeat(50));
  
  if (bundleData && bundleData.totalSize > 5 * 1024 * 1024) {
    console.log('⚠️  Bundle size is large (>5MB). Consider:');
    console.log('   - Further code splitting');
    console.log('   - Dynamic imports for routes');
    console.log('   - Removing unused dependencies');
    console.log('   - Using lighter alternatives');
  }

  console.log('\n📋 Next Steps:');
  console.log('   1. Run "npm run build" to create production build');
  console.log('   2. Use Lighthouse to measure actual performance');
  console.log('   3. Test in Chrome DevTools Performance tab');
  console.log('   4. Monitor Core Web Vitals in production');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport();
}

export { analyzeBundle, analyzeDependencies, analyzeCodePatterns, analyzeAssets, generateReport };
