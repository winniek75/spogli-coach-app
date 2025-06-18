import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs';
import path from 'path';

// CSVファイルのパス
const CSV_PATHS = {
  cvc: 'src/data/csv/cvc_words.csv',
  rhyming: 'src/data/csv/rhyming_words.csv',
  blending: 'src/data/csv/blending_words.csv',
  sight: 'src/data/csv/sight_words.csv'
};

// CSVデータを読み込む関数
export const loadCSVData = (gameType) => {
  try {
    const filePath = CSV_PATHS[gameType];
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
  } catch (error) {
    console.error(`Error loading CSV data for ${gameType}:`, error);
    return [];
  }
};

// レベル別にデータを取得する関数
export const getDataByLevel = (gameType, level) => {
  const data = loadCSVData(gameType);
  return data.filter(item => parseInt(item.level) === level);
};

// データをCSVに保存する関数
export const saveCSVData = (gameType, data) => {
  try {
    const filePath = CSV_PATHS[gameType];
    const csvContent = stringify(data, {
      header: true,
      columns: Object.keys(data[0])
    });
    fs.writeFileSync(filePath, csvContent);
    return true;
  } catch (error) {
    console.error(`Error saving CSV data for ${gameType}:`, error);
    return false;
  }
};

// 新しいデータを追加する関数
export const addData = (gameType, newData) => {
  const currentData = loadCSVData(gameType);
  currentData.push(newData);
  return saveCSVData(gameType, currentData);
};

// データを更新する関数
export const updateData = (gameType, level, word, updatedData) => {
  const currentData = loadCSVData(gameType);
  const index = currentData.findIndex(item =>
    parseInt(item.level) === level && item.word === word
  );

  if (index !== -1) {
    currentData[index] = { ...currentData[index], ...updatedData };
    return saveCSVData(gameType, currentData);
  }
  return false;
};

// データを削除する関数
export const deleteData = (gameType, level, word) => {
  const currentData = loadCSVData(gameType);
  const filteredData = currentData.filter(item =>
    !(parseInt(item.level) === level && item.word === word)
  );
  return saveCSVData(gameType, filteredData);
};

// ゲームタイプごとのデータ構造を取得する関数
export const getDataStructure = (gameType) => {
  const data = loadCSVData(gameType);
  if (data.length === 0) return null;
  return Object.keys(data[0]);
}; 