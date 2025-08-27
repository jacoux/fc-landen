#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to automatically update the blog-management.service.ts file
 * with current file listings from the blog directories
 * Run this whenever you add new markdown files to blog categories
 */

const BLOG_PATH = path.join(__dirname, '../src/assets/blog');
const SERVICE_PATH = path.join(__dirname, '../src/app/services/blog-management.service.ts');

function getMarkdownFiles(dirPath) {
  try {
    return fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md'))
      .sort();
  } catch (error) {
    console.warn(`Could not read directory ${dirPath}:`, error.message);
    return [];
  }
}

function generateFilesByCategory() {
  const categories = fs.readdirSync(BLOG_PATH)
    .filter(item => fs.statSync(path.join(BLOG_PATH, item)).isDirectory())
    .filter(category => !category.startsWith('.')); // Ignore hidden directories

  const filesByCategory = {};
  
  categories.forEach(category => {
    const markdownFiles = getMarkdownFiles(path.join(BLOG_PATH, category));
    if (markdownFiles.length > 0) {
      filesByCategory[category] = markdownFiles;
    }
  });

  return filesByCategory;
}

function updateServiceFile(filesByCategory) {
  let serviceContent = fs.readFileSync(SERVICE_PATH, 'utf8');
  
  // Generate the new filesByCategory object as a string
  const filesByCategoryStr = JSON.stringify(filesByCategory, null, 6)
    .replace(/"/g, "'"); // Use single quotes for TypeScript

  // Find and replace the filesByCategory object in the service
  const regex = /const filesByCategory: \{ \[key: string\]: string\[\] \} = \{[\s\S]*?\};/;
  const replacement = `const filesByCategory: { [key: string]: string[] } = ${filesByCategoryStr};`;
  
  if (regex.test(serviceContent)) {
    serviceContent = serviceContent.replace(regex, replacement);
    fs.writeFileSync(SERVICE_PATH, serviceContent);
    console.log('✅ Updated blog-management.service.ts with current file listings');
    return true;
  } else {
    console.warn('⚠️  Could not find filesByCategory pattern in service file');
    return false;
  }
}

function main() {
  console.log('🔄 Updating blog management service...');
  
  try {
    const filesByCategory = generateFilesByCategory();
    
    console.log('\n📁 Found categories:');
    Object.entries(filesByCategory).forEach(([category, files]) => {
      console.log(`  ${category}: ${files.length} files`);
    });
    
    if (updateServiceFile(filesByCategory)) {
      console.log('\n✅ Blog management service updated successfully!');
      console.log('\n💡 Your dashboard should now show all current files.');
    } else {
      console.error('\n❌ Failed to update service file');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error updating blog service:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getMarkdownFiles, generateFilesByCategory, updateServiceFile };