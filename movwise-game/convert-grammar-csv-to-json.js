import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// CSV to JSON conversion function
function convertCsvToJson(csvPath, jsonPath) {
  try {
    console.log(`Converting ${csvPath} to ${jsonPath}...`);
    
    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Process records based on file type
    const processedRecords = records.map(record => {
      // Convert numeric fields
      if (record.id) record.id = parseInt(record.id);
      if (record.set_id) record.set_id = parseInt(record.set_id);
      if (record.difficulty_score) record.difficulty_score = parseInt(record.difficulty_score);
      
      // Parse words_pool JSON string if it exists
      if (record.words_pool) {
        try {
          record.words_pool = JSON.parse(record.words_pool);
        } catch (e) {
          console.warn(`Failed to parse words_pool for record ${record.set_id}: ${e.message}`);
          record.words_pool = [];
        }
      }
      
      return record;
    });

    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(processedRecords, null, 2));
    console.log(`✅ Successfully converted ${csvPath} to ${jsonPath}`);
    console.log(`   Generated ${processedRecords.length} records`);
    
    return processedRecords;
  } catch (error) {
    console.error(`❌ Error converting ${csvPath}:`, error.message);
    throw error;
  }
}

// Main conversion process
async function convertAllFiles() {
  const publicDataPath = path.join(__dirname, 'public', 'data', 'csv');
  
  try {
    // Convert grammar_content_fixed.csv
    const grammarContentCsv = path.join(publicDataPath, 'grammar_content_fixed.csv');
    const grammarContentJson = path.join(publicDataPath, 'grammar_content.json');
    const grammarContent = convertCsvToJson(grammarContentCsv, grammarContentJson);
    
    // Convert problem_sets_fixed.csv
    const problemSetsCsv = path.join(publicDataPath, 'problem_sets_fixed.csv');
    const problemSetsJson = path.join(publicDataPath, 'problem_sets.json');
    const problemSets = convertCsvToJson(problemSetsCsv, problemSetsJson);
    
    // Generate statistics
    console.log('\n📊 Conversion Statistics:');
    console.log(`Grammar Content: ${grammarContent.length} records`);
    console.log(`Problem Sets: ${problemSets.length} records`);
    
    // Level distribution
    const levelStats = {
      beginner: { eiken5: 0, eiken4: 0 },
      intermediate: { eiken4: 0, eiken3: 0 },
      advanced: { eiken3: 0, eiken2: 0 }
    };
    
    problemSets.forEach(record => {
      if (record.level && record.eiken_level) {
        if (record.level === 'beginner' && record.eiken_level === '5') {
          levelStats.beginner.eiken5++;
        } else if (record.level === 'intermediate' && record.eiken_level === '4') {
          levelStats.intermediate.eiken4++;
        } else if (record.level === 'advanced' && record.eiken_level === '3') {
          levelStats.advanced.eiken3++;
        }
      }
    });
    
    console.log('\n📈 Level Distribution:');
    console.log(`英検5級 (Beginner): ${levelStats.beginner.eiken5} problems`);
    console.log(`英検4級 (Intermediate): ${levelStats.intermediate.eiken4} problems`);
    console.log(`英検3級 (Advanced): ${levelStats.advanced.eiken3} problems`);
    
    // Category distribution
    const categoryStats = {};
    problemSets.forEach(record => {
      const category = record.category;
      if (category) {
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      }
    });
    
    console.log('\n📂 Category Distribution:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`${category}: ${count} problems`);
    });
    
    console.log('\n✅ All files converted successfully!');
    console.log('📁 Generated files:');
    console.log(`   - ${grammarContentJson}`);
    console.log(`   - ${problemSetsJson}`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Run conversion
convertAllFiles();