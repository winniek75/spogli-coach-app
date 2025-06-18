import csv from 'csvtojson';
import fs from 'fs';

const inputFile = 'src/assets/rhyming-words.csv'; // CSVファイル名
const outputFile = 'src/assets/rhyming-questions.json';

(async () => {
  try {
    console.log('CSVファイルを読み込み中...');
    const words = await csv().fromFile(inputFile);
    
    console.log(`${words.length}個の単語を読み込みました`);

    // 問題データ生成
    const questions = words.map(item => {
      return {
        word: item.word,
        rhyming: item.rhyming,
        nonRhyming: [item.nonRhyming1, item.nonRhyming2, item.nonRhyming3]
      };
    });

    // 重複を除去（同じwordがある場合）
    const uniqueQuestions = [];
    const wordSet = new Set();
    
    questions.forEach(question => {
      if (!wordSet.has(question.word)) {
        wordSet.add(question.word);
        uniqueQuestions.push(question);
      }
    });

    console.log(`${uniqueQuestions.length}個のユニークな問題を生成しました`);

    // JSONファイルに書き出し
    fs.writeFileSync(outputFile, JSON.stringify(uniqueQuestions, null, 2), 'utf-8');
    
    console.log('変換完了:', outputFile);
    console.log('サンプル問題:');
    console.log(JSON.stringify(uniqueQuestions.slice(0, 3), null, 2));
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
})();