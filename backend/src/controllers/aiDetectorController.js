import axios from 'axios';

export const detectAiText = async (req, res) => {
    const { text } = req.body;
  
    if (!text) {
      return res.status(400).json({ error: 'Texto requerido' });
    }
  
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/Hello-SimpleAI/chatgpt-detector-roberta',
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
        }
      );
  
      console.log('📦 Respuesta cruda de Hugging Face:', JSON.stringify(response.data, null, 2));
  
      const resultArray = response.data?.[0];
  
      if (!Array.isArray(resultArray)) {
        return res.status(500).json({ error: 'Respuesta inesperada del modelo IA' });
      }
  
      const aiScore = resultArray.find(r => r.label === 'ChatGPT')?.score || 0;
      const humanScore = resultArray.find(r => r.label === 'Human')?.score || 0;
      const isAI = aiScore > humanScore;
  
      res.json({
        result: isAI ? 'Texto generado por IA' : 'Texto humano',
        confidence: `${(Math.max(aiScore, humanScore) * 100).toFixed(2)}%`
      });
      
    } catch (error) {
      console.error('❌ Error detectando texto IA:', error.message);
      res.status(500).json({ error: 'No se pudo analizar el texto' });
    }
  };
  