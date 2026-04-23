const { VoiceResponse } = require('twilio').twiml;
const { getChatResponse } = require('../../lib/claude');
const { Call, Order } = require('../../lib/storage');

async function handleGather(req, res, broadcastToDashboard) {
  const speechResult = req.body.SpeechResult;
  const callSid = req.body.CallSid;
  const restaurantId = req.params.restaurantId;
  const twiml = new VoiceResponse();

  if (speechResult) {
    console.log('Customer said:', speechResult);
    if (broadcastToDashboard) {
      broadcastToDashboard({ type: 'TRANSCRIPTION', text: speechResult, sid: callSid });
    }

    // Emotion logic
    let emotion = 'neutral';
    if (speechResult.includes('شو هاي') || speechResult.includes('تأخرتوا')) {
      emotion = 'angry';
    } else if (speechResult.includes('شكراً') || speechResult.includes('حبيبي')) {
      emotion = 'happy';
    }
    
    if (broadcastToDashboard) {
      broadcastToDashboard({ type: 'EMOTION', level: emotion, sid: callSid });
    }

    // Update Call Log
    await Call.findOneAndUpdate(
      { sid: callSid },
      { 
        $push: { transcript: { role: 'customer', text: speechResult } },
        $inc: { [`emotionSummary.${emotion}`]: 1 }
      }
    );

    // Get AI response
    const aiResponse = await getChatResponse(speechResult, [], emotion);
    
    if (broadcastToDashboard) {
      broadcastToDashboard({ type: 'AI_RESPONSE', text: aiResponse, sid: callSid });
    }

    // Save AI response to log
    await Call.findOneAndUpdate(
      { sid: callSid },
      { $push: { transcript: { role: 'ai', text: aiResponse } } }
    );

    twiml.say({ language: 'ar-XA' }, aiResponse);
    
    // Check for order completion
    if (aiResponse.includes('تم تثبيت طلبك') || aiResponse.includes('صحتين وعافية')) {
      await Order.create({
        restaurantId: restaurantId,
        customerPhone: req.body.From,
        items: [{ name: 'Voice Order', quantity: 1, price: 0 }],
        totalPrice: 0,
        status: 'pending',
        emotion: emotion
      });
      if (broadcastToDashboard) {
        broadcastToDashboard({ type: 'NEW_ORDER', from: req.body.From });
      }
    }

    // Listen again
    twiml.gather({
      input: 'speech',
      action: `/api/voice/gather/${restaurantId}`,
      language: 'ar-PS',
      speechTimeout: 'auto',
    });
  } else {
    twiml.say({ language: 'ar-XA' }, 'عذراً، لم أسمعك جيداً. هل يمكنك التكرار؟');
    twiml.gather({
      input: 'speech',
      action: `/api/voice/gather/${restaurantId}`,
      language: 'ar-PS',
      speechTimeout: 'auto',
    });
  }

  res.type('text/xml');
  res.send(twiml.toString());
}

module.exports = { handleGather };
