/**
 * Simple Emotion Analysis Service
 * In a production app, this would use a more sophisticated NLP model 
 * or an API like Hume AI / Google Natural Language.
 */

function analyzeEmotion(text) {
  const angryKeywords = ['سيء', 'تأخرت', 'مش عاجبني', 'بدي أشتكي', 'وين الطلب', 'تأخرتوا', 'شو هاد'];
  const happyKeywords = ['شكراً', 'حبيبي', 'يسلمو', 'ممتاز', 'رائع', 'طيب كثير', 'بجنن'];
  
  const textLower = text.toLowerCase();
  
  if (angryKeywords.some(keyword => textLower.includes(keyword))) {
    return 'angry';
  }
  
  if (happyKeywords.some(keyword => textLower.includes(keyword))) {
    return 'happy';
  }
  
  return 'neutral';
}

module.exports = { analyzeEmotion };
