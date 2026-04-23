const { VoiceResponse } = require('twilio').twiml;
const { Call } = require('../../lib/storage');

async function handleIncomingCall(req, res, broadcastToDashboard) {
  const twiml = new VoiceResponse();
  const callSid = req.body.CallSid;
  const from = req.body.From;
  const restaurantId = req.params.restaurantId; // Get from URL

  // Create initial call record
  await Call.create({ 
    restaurantId: restaurantId, 
    sid: callSid, 
    from: from, 
    transcript: [], 
    emotionSummary: { happy:0, angry:0, neutral:0 } 
  });

  const gather = twiml.gather({
    input: 'speech',
    action: `/api/voice/gather/${restaurantId}`,
    language: 'ar-PS',
    speechTimeout: 'auto',
  });
  
  gather.say({ language: 'ar-XA' }, 'أهلاً بك في مطعم القدس، كيف بقدر أساعدك اليوم؟');
  
  if (broadcastToDashboard) {
    broadcastToDashboard({ type: 'CALL_START', from: from, sid: callSid });
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
}

module.exports = { handleIncomingCall };
